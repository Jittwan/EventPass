import { NextRequest } from "next/server";
import { verifyAdminCredentials } from "@/lib/admin-auth";
import { setAdminSession } from "@/lib/session";
import { adminLoginSchema, flattenZodError } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", fields: flattenZodError(parsed.error) },
      { status: 400 },
    );
  }

  if (!verifyAdminCredentials(parsed.data.username, parsed.data.password)) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setAdminSession(parsed.data.username);
  return Response.json({ ok: true });
}
