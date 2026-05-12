import { clearAdminSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  await clearAdminSession();
  return Response.json({ ok: true });
}
