"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-slate-700";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function RegisterForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    if (incoming.length === 0) return;
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}|${f.size}|${f.lastModified}`));
      const next = [...prev];
      for (const f of incoming) {
        const key = `${f.name}|${f.size}|${f.lastModified}`;
        if (!seen.has(key)) {
          seen.add(key);
          next.push(f);
        }
      }
      return next;
    });
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setFiles((f) => f.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.delete("documents");
    for (const f of files) formData.append("documents", f);

    try {
      const res = await fetch("/api/register", { method: "POST", body: formData });
      const text = await res.text();
      let body: { error?: string; fields?: Record<string, string>; referenceCode?: string } = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = {};
      }
      if (!res.ok) {
        const detail = body.error ?? (text ? text.slice(0, 200) : "no body");
        setError(`Submission failed (HTTP ${res.status}): ${detail}`);
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
          ref={fileInputRef}
          id="documents"
          name="documents"
          type="file"
          multiple
          onChange={onFileChange}
          className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
        />
        <p className="mt-1 text-xs text-slate-500">Max 10 MB per file. PDF, images, Word, or text. You can pick more than once — files stack up.</p>

        {files.length > 0 && (
          <ul className="mt-3 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
            {files.map((f, i) => (
              <li key={`${f.name}-${f.lastModified}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-900">{f.name}</p>
                  <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="rounded-md border border-rose-300 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit registration"}
      </button>
    </form>
  );
}
