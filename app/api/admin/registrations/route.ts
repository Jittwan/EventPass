import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

  const where = q
    ? {
        OR: [
          { fullName: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
          { referenceCode: { contains: q.toUpperCase() } },
        ],
      }
    : {};

  const registrations = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      referenceCode: true,
      fullName: true,
      email: true,
      phone: true,
      organization: true,
      createdAt: true,
      _count: { select: { documents: true } },
    },
    take: 200,
  });

  return Response.json({ registrations });
}
