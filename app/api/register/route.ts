import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateReferenceCode } from "@/lib/reference-code";
import { registrationSchema, flattenZodError } from "@/lib/validation";
import { saveUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();

  const parsed = registrationSchema.safeParse({
    fullName: form.get("fullName"),
    email: form.get("email"),
    phone: form.get("phone"),
    password: form.get("password"),
    confirmPassword: form.get("confirmPassword"),
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", fields: flattenZodError(parsed.error) },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const existing = await prisma.registration.findFirst({ where: { email: data.email } });
  if (existing) {
    return Response.json(
      { error: "An account with this email already exists", fields: { email: "Email already registered" } },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  let referenceCode = generateReferenceCode();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.registration.findUnique({ where: { referenceCode } });
    if (!clash) break;
    referenceCode = generateReferenceCode();
  }

  const created = await prisma.registration.create({
    data: {
      referenceCode,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash,
    },
  });

  const files = form.getAll("documents").filter((v): v is File => v instanceof File && v.size > 0);
  for (const file of files) {
    try {
      const stored = await saveUpload(file, created.id);
      await prisma.document.create({
        data: {
          registrationId: created.id,
          fileName: stored.fileName,
          originalName: stored.originalName,
          filePath: stored.filePath,
          mimeType: stored.mimeType,
          size: stored.size,
        },
      });
    } catch (err) {
      console.error("upload failed", err);
    }
  }

  return Response.json({ referenceCode: created.referenceCode }, { status: 201 });
}
