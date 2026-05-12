import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { renderBadgePdf } from "@/lib/badge-pdf";

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
    select: { fullName: true, organization: true, referenceCode: true },
  });
  if (!registration) return Response.json({ error: "Not found" }, { status: 404 });

  const pdf = await renderBadgePdf({
    fullName: registration.fullName,
    organization: registration.organization,
    referenceCode: registration.referenceCode,
    generatedAt: new Date(),
  });

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="badge-${registration.referenceCode}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
