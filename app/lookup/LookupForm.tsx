"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

export function LookupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      referenceCode: String(form.get("referenceCode") ?? "").trim().toUpperCase(),
      password: String(form.get("password") ?? ""),
    };

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Sign-in failed");
        setSubmitting(false);
        return;
      }
      router.push(`/submission/${body.referenceCode}`);
    } catch (err) {
      console.error(err);
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="referenceCode">
          Reference code
        </label>
        <input
          id="referenceCode"
          name="referenceCode"
          required
          placeholder="EP-XXXXXXXX"
          className={`${fieldClass} font-mono uppercase tracking-wider`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" required className={fieldClass} />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
