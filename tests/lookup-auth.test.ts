import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { generateReferenceCode } from "@/lib/reference-code";
import { lookupSchema } from "@/lib/validation";

// Simulates the auth check the /api/lookup route performs:
// given a registration record and credentials, do they match?
async function authenticate(
  record: { referenceCode: string; passwordHash: string } | null,
  inputCode: string,
  inputPassword: string,
): Promise<boolean> {
  const parsed = lookupSchema.safeParse({
    referenceCode: inputCode,
    password: inputPassword,
  });
  if (!parsed.success) return false;
  if (!record) return false;
  if (record.referenceCode !== parsed.data.referenceCode.trim().toUpperCase()) return false;
  return bcrypt.compare(parsed.data.password, record.passwordHash);
}

describe("returning user authentication", () => {
  it("accepts the correct reference code + password", async () => {
    const password = "secretpw1";
    const record = {
      referenceCode: generateReferenceCode(),
      passwordHash: await bcrypt.hash(password, 10),
    };
    await expect(authenticate(record, record.referenceCode, password)).resolves.toBe(true);
  });

  it("rejects the wrong password", async () => {
    const record = {
      referenceCode: generateReferenceCode(),
      passwordHash: await bcrypt.hash("rightpw11", 10),
    };
    await expect(authenticate(record, record.referenceCode, "wrongpw")).resolves.toBe(false);
  });

  it("rejects an unknown reference code", async () => {
    await expect(authenticate(null, "EP-23456789", "anything1")).resolves.toBe(false);
  });

  it("normalizes lowercase reference codes from input", async () => {
    const password = "secretpw1";
    const code = generateReferenceCode();
    const record = { referenceCode: code, passwordHash: await bcrypt.hash(password, 10) };
    await expect(authenticate(record, code.toLowerCase(), password)).resolves.toBe(true);
  });
});
