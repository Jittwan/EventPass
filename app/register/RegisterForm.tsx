"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";
const labelClass = "block text-sm font-medium text-slate-700";

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/register", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Submission failed");
        setFieldErrors(body.fields ?? {});
        setSubmitting(false);
        return;
      }
      router.push(`/register/success/${body.referenceCode}`);
    } catch (err) {
      console.error(err);
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  function err(name: string) {
    return fieldErrors[name] ? (
      <p className="mt-1 text-xs text-rose-600">{fieldErrors[name]}</p>
    ) : null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="fullName">Full name</label>
        <input id="fullName" name="fullName" required className={fieldClass} autoComplete="name" />
        {err("fullName")}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className={fieldClass} autoComplete="email" />
          {err("email")}
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" required className={fieldClass} autoComplete="tel" />
          {err("phone")}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} className={fieldClass} />
          {err("password")}
        </div>
        <div>
          <label className={labelClass} htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className={fieldClass}
          />
          {err("confirmPassword")}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="documents">Documents (optional, multiple)</label>
        <input
          id="documents"
          name="documents"
          type="file"
          multiple
          className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
        />
        <p className="mt-1 text-xs text-slate-500">Max 10 MB per file. PDF, images, Word, or text.</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit registration"}
      </button>
    </form>
  );
}
