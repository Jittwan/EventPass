import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TopBar } from "../../../_components/TopBar";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/session";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });
  if (!registration) notFound();

  return (
    <>
      <TopBar title={`Admin · ${session.username}`} />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <Link href="/admin/registrations" className="text-sm text-slate-500 hover:underline">
          ← Back to list
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{registration.fullName}</h2>
            <p className="font-mono text-sm text-slate-500">{registration.referenceCode}</p>
          </div>
          <a
            href={`/api/admin/registrations/${registration.id}/badge`}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Download name tag PDF
          </a>
        </div>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Details</h3>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Row label="Email" value={registration.email} />
            <Row label="Phone" value={registration.phone} />
            <Row label="Registered" value={new Date(registration.createdAt).toLocaleString()} />
            <Row label="Last updated" value={new Date(registration.updatedAt).toLocaleString()} />
          </dl>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Documents</h3>
          {registration.documents.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No documents uploaded.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200">
              {registration.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{d.originalName}</p>
                    <p className="text-xs text-slate-500">
                      {d.mimeType} · {formatBytes(d.size)}
                    </p>
                  </div>
                  <a
                    href={d.filePath}
                    target="_blank"
                    rel="noreferrer"
                    download={d.originalName}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{value}</dd>
    </div>
  );
}
