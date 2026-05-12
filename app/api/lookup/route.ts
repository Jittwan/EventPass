import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setUserSession } from "@/lib/session";
import { lookupSchema, flattenZodError } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", fields: flattenZodError(parsed.error) },
      { status: 400 },
    );
  }

  const referenceCode = parsed.data.referenceCode.trim().toUpperCase();
  const registration = await prisma.registration.findUnique({
    where: { referenceCode },
    select: { id: true, referenceCode: true, passwordHash: true },
  });

  if (!registration) {
    return Response.json({ error: "Invalid reference code or password" }, { status: 401 });
  }

  const ok = await bcrypt.compare(parsed.data.password, registration.passwordHash);
  if (!ok) {
    return Response.json({ error: "Invalid reference code or password" }, { status: 401 });
  }

  await setUserSession(registration.referenceCode);
  return Response.json({ referenceCode: registration.referenceCode });
}
