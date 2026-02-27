import crypto from "crypto";

import { env } from "../env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits — recommended for GCM
const AUTH_TAG_LENGTH = 16; // bytes

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * Returns a hex string in the format: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = Buffer.from(env.ENCRYPTION_SECRET, "utf8").subarray(0, 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypts a hex string previously produced by `encrypt`.
 * Throws if the ciphertext has been tampered with (GCM auth tag mismatch).
 */
export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid ciphertext format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = Buffer.from(env.ENCRYPTION_SECRET, "utf8").subarray(0, 32);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encryptedBuffer = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
