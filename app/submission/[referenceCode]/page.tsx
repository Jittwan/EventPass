import { notFound, redirect } from "next/navigation";
import { TopBar } from "../../_components/TopBar";
import { prisma } from "@/lib/db";
import { getUserSession } from "@/lib/session";
import { SubmissionEditor } from "./SubmissionEditor";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ referenceCode: string }>;
}) {
  const { referenceCode } = await params;
  const session = await getUserSession();
  if (!session || session.referenceCode !== referenceCode) {
    redirect(`/lookup?next=/submission/${referenceCode}`);
  }

  const registration = await prisma.registration.findUnique({
    where: { referenceCode },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });
  if (!registration) notFound();

  const safe = {
    referenceCode: registration.referenceCode,
    fullName: registration.fullName,
    email: registration.email,
    phone: registration.phone,
    documents: registration.documents.map((d) => ({
      id: d.id,
      originalName: d.originalName,
      filePath: d.filePath,
      size: d.size,
    })),
  };

  return (
    <>
      <TopBar title="Your registration" />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <SubmissionEditor initial={safe} />
      </main>
    </>
  );
}
