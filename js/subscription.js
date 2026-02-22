// HM2 subscription logic (duration-based, stacking)

// IMPORTANT: must match SECRET used in the generator
const HM2_PUBLIC_SECRET = "REPLACE_WITH_YOUR_PRIVATE_SECRET";

async function hm2HmacSHA256(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Validate an HM2 code and return its edition + duration (days).
 * Format: HM2-<EDITION>-<DURATION>-<SIGNATURE>
 */
async function validateHM2Code(code) {
  if (!code || !code.startsWith("HM2-")) {
    return { valid: false, error: "Invalid code format." };
  }

  const parts = code.split("-");
  if (parts.length !== 4) {
    return { valid: false, error: "Invalid code structure." };
  }

  const edition = parts[1];   // now CORE or PLUS
  const durationRaw = parts[2];
  const signature = parts[3];

  if (!/^\d+$/.test(durationRaw)) {
    return { valid: false, error: "Invalid duration." };
  }

  const durationDays = parseInt(durationRaw, 10);
  if (durationDays <= 0) {
    return { valid: false, error: "Duration must be positive." };
  }

  const message = `${edition}-${durationDays}`;
  const fullSig = await hm2HmacSHA256(message, HM2_PUBLIC_SECRET);
  const shortSig = fullSig.slice(0, 10);

  if (shortSig !== signature) {
    return { valid: false, error: "Invalid signature." };
  }

  return {
    valid: true,
    edition,          // CORE or PLUS
    duration: durationDays,
    raw: code
  };
}

/**
 * Apply a validated HM2 code:
 * - If no expiry or expiry in the past → start from today
 * - If expiry in the future → add duration on top of existing expiry
 */
async function applyHM2Code(rawCode) {
  const result = await validateHM2Code(rawCode);
  if (!result.valid) {
    return result;
  }

  const durationDays = result.duration;

  const existingStr = localStorage.getItem("hivemap_license_expiry");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let baseDate;
  if (existingStr) {
    const existing = new Date(existingStr);
    existing.setHours(0, 0, 0, 0);
    baseDate = existing > today ? existing : today;
  } else {
    baseDate = today;
  }

  baseDate.setDate(baseDate.getDate() + durationDays);

  const yyyy = baseDate.getFullYear();
  const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
  const dd = String(baseDate.getDate()).padStart(2, "0");
  const newExpiryStr = `${yyyy}-${mm}-${dd}`;

  localStorage.setItem("hivemap_license_expiry", newExpiryStr);
  localStorage.setItem("hivemap_license_code", result.raw);
  localStorage.setItem("hivemap_license_edition", result.edition); // CORE or PLUS

  return {
    valid: true,
    edition: result.edition,
    duration: durationDays,
    newExpiry: newExpiryStr
  };
}

/**
 * Helper: check if editing is allowed based on expiry.
 */
function isHM2Expired() {
  const expiryStr = localStorage.getItem("hivemap_license_expiry");
  if (!expiryStr) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryStr);
  expiry.setHours(0, 0, 0, 0);

  return expiry < today;
}
