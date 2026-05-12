import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { saveUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ referenceCode: string }> },
) {
  const { referenceCode } = await ctx.params;
  const session = await getUserSession();
  if (!session || session.referenceCode !== referenceCode) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registration = await prisma.registration.findUnique({
    where: { referenceCode },
    select: { id: true },
  });
  if (!registration) return Response.json({ error: "Not found" }, { status: 404 });

  const form = await request.formData();
  const files = form.getAll("documents").filter((v): v is File => v instanceof File && v.size > 0);
  if (files.length === 0) {
    return Response.json({ error: "No files provided" }, { status: 400 });
  }

  const created = [];
  for (const file of files) {
    try {
      const stored = await saveUpload(file, registration.id);
      const doc = await prisma.document.create({
        data: {
          registrationId: registration.id,
          fileName: stored.fileName,
          originalName: stored.originalName,
          filePath: stored.filePath,
          mimeType: stored.mimeType,
          size: stored.size,
        },
      });
      created.push(doc);
    } catch (err) {
      console.error("upload failed", err);
    }
  }

  return Response.json({ documents: created }, { status: 201 });
}
