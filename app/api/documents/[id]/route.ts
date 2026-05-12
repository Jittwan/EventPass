import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserSession, getAdminSession } from "@/lib/session";
import { deleteUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const doc = await prisma.document.findUnique({
    where: { id },
    select: { id: true, filePath: true, registration: { select: { referenceCode: true } } },
  });
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  const userSession = await getUserSession();
  const adminSession = await getAdminSession();
  const isOwner = userSession?.referenceCode === doc.registration.referenceCode;
  const isAdmin = adminSession !== null;
  if (!isOwner && !isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.document.delete({ where: { id } });
  await deleteUpload(doc.filePath);

  return Response.json({ ok: true });
}
