import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });
  if (!registration) return Response.json({ error: "Not found" }, { status: 404 });

  const { passwordHash: _ph, ...safe } = registration;
  void _ph;
  return Response.json({ registration: safe });
}
