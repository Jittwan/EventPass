import { describe, it, expect } from "vitest";
import { registrationSchema, flattenZodError } from "@/lib/validation";

const valid = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1 555 1234",
  organization: "Analytical Engine Co.",
  position: "Mathematician",
  dietaryRequirement: "none",
  password: "supersecret",
  confirmPassword: "supersecret",
};

describe("registrationSchema", () => {
  it("accepts a well-formed registration", () => {
    const r = registrationSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("rejects invalid emails", () => {
    const r = registrationSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = flattenZodError(r.error);
      expect(fields.email).toBeDefined();
    }
  });

  it("rejects missing required fields", () => {
    const r = registrationSchema.safeParse({ ...valid, fullName: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(flattenZodError(r.error).fullName).toBeDefined();

    const r2 = registrationSchema.safeParse({ ...valid, phone: "" });
    expect(r2.success).toBe(false);

    const r3 = registrationSchema.safeParse({ ...valid, organization: "" });
    expect(r3.success).toBe(false);
  });

  it("rejects when passwords do not match", () => {
    const r = registrationSchema.safeParse({ ...valid, confirmPassword: "different" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = flattenZodError(r.error);
      expect(fields.confirmPassword).toBeDefined();
    }
  });

  it("rejects short passwords", () => {
    const r = registrationSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" });
    expect(r.success).toBe(false);
  });
});
