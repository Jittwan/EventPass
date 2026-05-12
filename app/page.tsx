import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">EventPass</h1>
      <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
        Register for the event, manage your submission, or sign in as an organizer.
      </p>
      <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/register"
          className="rounded-xl bg-slate-900 px-5 py-4 text-base font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          Register
        </Link>
        <Link
          href="/lookup"
          className="rounded-xl border border-slate-300 bg-white px-5 py-4 text-base font-medium text-slate-900 shadow-sm transition hover:bg-slate-100"
        >
          View / Edit Registration
        </Link>
        <Link
          href="/admin/login"
          className="rounded-xl border border-slate-300 bg-white px-5 py-4 text-base font-medium text-slate-900 shadow-sm transition hover:bg-slate-100"
        >
          Admin Login
        </Link>
      </div>
    </main>
  );
}
