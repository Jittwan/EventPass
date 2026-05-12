import Link from "next/link";

export function TopBar({ title }: { title: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text font-semibold tracking-tight text-transparent"
        >
          EventPass
        </Link>
        <h1 className="text-sm font-medium text-slate-600">{title}</h1>
      </div>
    </header>
  );
}
