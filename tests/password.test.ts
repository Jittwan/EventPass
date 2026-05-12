import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

describe("password hashing", () => {
  it("produces a hash that is not the plain text", async () => {
    const password = "supersecret";
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    expect(hash).not.toContain(password);
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("verifies the original password against the hash", async () => {
    const password = "supersecret";
    const hash = await bcrypt.hash(password, 10);
    await expect(bcrypt.compare(password, hash)).resolves.toBe(true);
    await expect(bcrypt.compare("wrong", hash)).resolves.toBe(false);
  });

  it("yields a different hash each time (salted)", async () => {
    const password = "supersecret";
    const a = await bcrypt.hash(password, 10);
    const b = await bcrypt.hash(password, 10);
    expect(a).not.toBe(b);
  });
});
