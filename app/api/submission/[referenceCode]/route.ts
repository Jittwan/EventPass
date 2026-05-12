import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { updateRegistrationSchema, flattenZodError } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ referenceCode: string }> },
) {
  const { referenceCode } = await ctx.params;
  const session = await getUserSession();
  if (!session || session.referenceCode !== referenceCode) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registration = await prisma.registration.findUnique({
    where: { referenceCode },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });
  if (!registration) return Response.json({ error: "Not found" }, { status: 404 });

  const { passwordHash: _ph, ...safe } = registration;
  void _ph;
  return Response.json({ registration: safe });
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ referenceCode: string }> },
) {
  const { referenceCode } = await ctx.params;
  const session = await getUserSession();
  if (!session || session.referenceCode !== referenceCode) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", fields: flattenZodError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.registration.update({
      where: { referenceCode },
      data: parsed.data,
      select: {
        referenceCode: true,
        fullName: true,
        email: true,
        phone: true,
        organization: true,
        position: true,
        dietaryRequirement: true,
        updatedAt: true,
      },
    });
    return Response.json(updated);
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
