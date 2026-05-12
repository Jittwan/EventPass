import { randomBytes } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export type StoredFile = {
  fileName: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  size: number;
};

function sanitizeBase(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "file";
  return base.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "file";
}

export async function saveUpload(file: File, registrationId: string): Promise<StoredFile> {
  if (file.size === 0) throw new Error("Empty file");
  if (file.size > MAX_FILE_BYTES) throw new Error("File too large (max 10 MB)");
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    throw new Error(`File type not allowed: ${file.type}`);
  }

  const dir = path.join(UPLOAD_DIR, registrationId);
  await mkdir(dir, { recursive: true });

  const stored = `${Date.now()}-${randomBytes(6).toString("hex")}-${sanitizeBase(file.name)}`;
  const abs = path.join(dir, stored);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, bytes);

  return {
    fileName: stored,
    originalName: file.name,
    filePath: `/uploads/${registrationId}/${stored}`,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function deleteUpload(publicPath: string): Promise<void> {
  if (!publicPath.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", publicPath.replace(/^\/+/, ""));
  try {
    await unlink(abs);
  } catch {
    // missing file is fine — DB row removal is the source of truth
  }
}
