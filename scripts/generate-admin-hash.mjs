/**
 * Script to generate the hashed password for admin seeding
 * Run this locally to get the hash, then use it in the SQL insert
 */

// Using Web Crypto API (same as in the app)
const ITERATIONS = 100000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const saltBase64 = arrayBufferToBase64(salt.buffer);
  const hashBase64 = arrayBufferToBase64(derivedBits);

  return `${saltBase64}:${hashBase64}`;
}

// Generate hash for welcome@123
hashPassword("welcome@123").then(hash => {
  console.log("Hashed password for 'welcome@123':");
  console.log(hash);
  console.log("\nUse this in your SQL INSERT statement.");
});
