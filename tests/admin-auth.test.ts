import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { verifyAdminCredentials } from "@/lib/admin-auth";

describe("admin credentials come from env", () => {
  const originalUser = process.env.ADMIN_USERNAME;
  const originalPass = process.env.ADMIN_PASSWORD;

  beforeEach(() => {
    process.env.ADMIN_USERNAME = "configured-admin";
    process.env.ADMIN_PASSWORD = "configured-password";
  });

  afterEach(() => {
    process.env.ADMIN_USERNAME = originalUser;
    process.env.ADMIN_PASSWORD = originalPass;
  });

  it("accepts the env-configured username and password", () => {
    expect(verifyAdminCredentials("configured-admin", "configured-password")).toBe(true);
  });

  it("rejects the wrong username", () => {
    expect(verifyAdminCredentials("attacker", "configured-password")).toBe(false);
  });

  it("rejects the wrong password", () => {
    expect(verifyAdminCredentials("configured-admin", "wrong")).toBe(false);
  });

  it("changing the env changes the accepted credentials", () => {
    process.env.ADMIN_USERNAME = "different";
    process.env.ADMIN_PASSWORD = "different-pass";
    expect(verifyAdminCredentials("configured-admin", "configured-password")).toBe(false);
    expect(verifyAdminCredentials("different", "different-pass")).toBe(true);
  });

  it("throws if env vars are missing", () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    expect(() => verifyAdminCredentials("any", "any")).toThrow();
  });
});
