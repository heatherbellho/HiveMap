/*
 * ------------------------------------------------------------
 *  © 2026 Heather Bell Honey Bees Ltd. All rights reserved.
 *
 *  This file is part of the HiveMap© software system.
 *  Unauthorized copying, modification, distribution, or use
 *  of this file, via any medium, is strictly prohibited.
 *
 *  Proprietary and confidential.
 * ------------------------------------------------------------
 */ 

// HM2 subscription logic — FIXED EXPIRY MODEL

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
 * Validate an HM2 code and return edition + expiry.
 * Format: HM2-<EDITION>-<EXPIRY_YYYYMMDD>-<SIGNATURE>
 */
// Format: HM2-<EDITION>-<EXPIRY_YYYYMMDD>-<SIG+NONCE>
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
  const sigWithNonce = parts[3];

  if (!["CORE", "PLUS"].includes(edition)) {
    return { valid: false, error: "Invalid edition." };
  }

  if (!/^\d{8}$/.test(expiryRaw)) {
    return { valid: false, error: "Invalid expiry format." };
  }

  const year = parseInt(expiryRaw.slice(0, 4), 10);
  const month = parseInt(expiryRaw.slice(4, 6), 10);
  const day = parseInt(expiryRaw.slice(6, 8), 10);

  const expiryDate = new Date(year, month - 1, day);
  if (isNaN(expiryDate.getTime())) {
    return { valid: false, error: "Invalid expiry date." };
  }

  if (sigWithNonce.length <= 10) {
    return { valid: false, error: "Invalid signature/nonce." };
  }

  const shortSig = sigWithNonce.slice(0, 10);
  const nonce = sigWithNonce.slice(10);

  const message = `${edition}-${expiryRaw}-${nonce}`;
  const fullSig = await hm2HmacSHA256(message, HM2_PUBLIC_SECRET);
  const expectedShort = fullSig.slice(0, 10);

  if (expectedShort !== shortSig) {
    return { valid: false, error: "Invalid signature." };
  }

  const expiryIso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return {
    valid: true,
    edition,
    expiry: expiryIso,
    raw: code
  };
}


/**
 * Apply a validated HM2 code:
 * - Always use the expiry encoded in the code
 * - Never add time, never stack, never extend
 */
async function applyHM2Code(rawCode) {
  const result = await validateHM2Code(rawCode);
  if (!result.valid) {
    return result;
  }

  localStorage.setItem("hivemap_license_expiry", result.expiry);
  localStorage.setItem("hivemap_license_code", result.raw);
  localStorage.setItem("hivemap_license_edition", result.edition);

  return {
    valid: true,
    edition: result.edition,
    expiry: result.expiry
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
