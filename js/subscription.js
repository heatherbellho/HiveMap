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

async function validateHM2Code(code) {
  if (!code || !code.startsWith("HM2-")) {
    return { valid: false, error: "Invalid code format." };
  }

  const parts = code.split("-");
  if (parts.length !== 4) {
    return { valid: false, error: "Invalid code structure." };
  }

  const edition = parts[1];
  const expiryRaw = parts[2];
  const signature = parts[3];

  if (!/^\d{8}$/.test(expiryRaw)) {
    return { valid: false, error: "Invalid expiry date." };
  }

  const message = `${edition}-${expiryRaw}`;
  const fullSig = await hm2HmacSHA256(message, HM2_PUBLIC_SECRET);
  const shortSig = fullSig.slice(0, 10);

  if (shortSig !== signature) {
    return { valid: false, error: "Invalid signature." };
  }

  const expiryISO = `${expiryRaw.slice(0,4)}-${expiryRaw.slice(4,6)}-${expiryRaw.slice(6,8)}`;
  const expired = new Date() > new Date(expiryISO);

  return {
    valid: true,
    edition,
    expiry: expiryISO,
    expired,
    raw: code
  };
}
