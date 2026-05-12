import Link from "next/link";
import { TopBar } from "../../../_components/TopBar";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ referenceCode: string }>;
}) {
  const { referenceCode } = await params;
  return (
    <>
      <TopBar title="Registered" />
      <main className="mx-auto w-full max-w-xl px-6 py-16 text-center">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
          <h2 className="text-2xl font-semibold text-emerald-800">You&apos;re registered!</h2>
          <p className="mt-2 text-sm text-emerald-700">Save this reference code. You&apos;ll use it to sign back in.</p>
          <p className="mt-6 select-all font-mono text-3xl font-bold tracking-wider text-slate-900">
            {referenceCode}
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            href="/lookup"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            View / Edit
          </Link>
        </div>
      </main>
    </>
  );
}
