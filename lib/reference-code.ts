import { randomBytes } from "node:crypto";

// Reference codes look like EP-XXXXXXXX where X is from an
// unambiguous alphabet (no 0/O, no 1/I/L). 8 chars over a 32-char
// alphabet gives ~40 bits of entropy — plenty for an event roster.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;

export function generateReferenceCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `EP-${out}`;
}

export const REFERENCE_CODE_PATTERN = /^EP-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/;

export function isValidReferenceCode(code: string): boolean {
  return REFERENCE_CODE_PATTERN.test(code);
}
