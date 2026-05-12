import { describe, it, expect } from "vitest";
import {
  generateReferenceCode,
  isValidReferenceCode,
  REFERENCE_CODE_PATTERN,
} from "@/lib/reference-code";

describe("reference codes", () => {
  it("matches the EP-XXXXXXXX format", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateReferenceCode();
      expect(code).toMatch(REFERENCE_CODE_PATTERN);
      expect(code).toHaveLength(11);
      expect(code.startsWith("EP-")).toBe(true);
    }
  });

  it("uses an unambiguous alphabet (no 0/O/1/I/L)", () => {
    const forbidden = /[01OIL]/;
    for (let i = 0; i < 200; i++) {
      const code = generateReferenceCode();
      expect(code.slice(3)).not.toMatch(forbidden);
    }
  });

  it("produces unique values across many generations", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const code = generateReferenceCode();
      expect(seen.has(code)).toBe(false);
      seen.add(code);
    }
    expect(seen.size).toBe(1000);
  });

  it("validates well-formed codes", () => {
    expect(isValidReferenceCode("EP-23456789")).toBe(true);
    expect(isValidReferenceCode("EP-ABCDEFGH")).toBe(true);
    expect(isValidReferenceCode("ep-23456789")).toBe(false);
    expect(isValidReferenceCode("EP-12345678")).toBe(false); // contains 1
    expect(isValidReferenceCode("EP-0OIL2345")).toBe(false);
    expect(isValidReferenceCode("EP-ABC")).toBe(false);
    expect(isValidReferenceCode("nope")).toBe(false);
  });
});
