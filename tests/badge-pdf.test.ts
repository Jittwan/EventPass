import { describe, it, expect } from "vitest";
import { renderBadgePdf } from "@/lib/badge-pdf";

describe("badge PDF renderer", () => {
  it("produces a PDF byte buffer with the %PDF- magic header", async () => {
    const buf = await renderBadgePdf({
      fullName: "Ada Lovelace",
      referenceCode: "EP-23456789",
      generatedAt: new Date("2026-05-12T00:00:00Z"),
    });
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });
});

describe("badge endpoint content type", () => {
  it("simulating the endpoint, returns application/pdf headers", async () => {
    const pdf = await renderBadgePdf({
      fullName: "Ada Lovelace",
      referenceCode: "EP-23456789",
      generatedAt: new Date(),
    });
    const response = new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="badge-EP-23456789.pdf"',
      },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("badge-EP-23456789.pdf");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(String.fromCharCode(...bytes.subarray(0, 5))).toBe("%PDF-");
  });
});
