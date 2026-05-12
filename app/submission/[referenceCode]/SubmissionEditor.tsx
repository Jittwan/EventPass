"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DocumentSummary = {
  id: string;
  originalName: string;
  filePath: string;
  size: number;
};

type Initial = {
  referenceCode: string;
  fullName: string;
  email: string;
  phone: string;
  documents: DocumentSummary[];
};

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-slate-700";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function SubmissionEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: initial.fullName,
    email: initial.email,
    phone: initial.phone,
  });
  const [docs, setDocs] = useState<DocumentSummary[]>(initial.documents);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/submission/${initial.referenceCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: "err", text: body.error ?? "Save failed" });
      } else {
        setMessage({ kind: "ok", text: "Saved" });
        router.refresh();
      }
    } catch {
      setMessage({ kind: "err", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("documents", f);
    try {
      const res = await fetch(`/api/submission/${initial.referenceCode}/documents`, {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: "err", text: body.error ?? "Upload failed" });
      } else {
        const added = (body.documents as DocumentSummary[]) ?? [];
        setDocs((d) => [...added, ...d]);
        setMessage({ kind: "ok", text: `Uploaded ${added.length} file(s)` });
        router.refresh();
      }
    } catch {
      setMessage({ kind: "err", text: "Network error" });
    } finally {
      setUploading(false);
    }
  }

  async function removeDoc(id: string) {
    if (!confirm("Remove this document?")) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage({ kind: "err", text: body.error ?? "Delete failed" });
        return;
      }
      setDocs((d) => d.filter((x) => x.id !== id));
      router.refresh();
    } catch {
      setMessage({ kind: "err", text: "Network error" });
    }
  }

  async function replaceDoc(id: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setReplacing(id);
    setMessage(null);
    try {
      const delRes = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!delRes.ok) {
        const body = await delRes.json().catch(() => ({}));
        setMessage({ kind: "err", text: body.error ?? "Replace failed" });
        setReplacing(null);
        return;
      }
      const fd = new FormData();
      fd.append("documents", files[0]);
      const addRes = await fetch(`/api/submission/${initial.referenceCode}/documents`, {
        method: "POST",
        body: fd,
      });
      const body = await addRes.json().catch(() => ({}));
      if (!addRes.ok) {
        setMessage({ kind: "err", text: body.error ?? "Replace upload failed" });
        setDocs((d) => d.filter((x) => x.id !== id));
      } else {
        const added = (body.documents as DocumentSummary[]) ?? [];
        setDocs((d) => [...added, ...d.filter((x) => x.id !== id)]);
        setMessage({ kind: "ok", text: "Replaced" });
        router.refresh();
      }
    } catch {
      setMessage({ kind: "err", text: "Network error" });
    } finally {
      setReplacing(null);
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Details</h2>
          <span className="font-mono text-sm text-slate-500">{initial.referenceCode}</span>
        </div>

        {message && (
          <div
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              message.kind === "ok"
                ? "border border-pink-200 bg-pink-50 text-pink-800"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={saveDetails} className="mt-5 space-y-4" noValidate>
          <div>
            <label className={labelClass} htmlFor="fullName">Full name</label>
            <input id="fullName" required className={fieldClass} value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="email">Email</label>
              <input id="email" type="email" required className={fieldClass} value={form.email}
                onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">Phone</label>
              <input id="phone" required className={fieldClass} value={form.phone}
                onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="mt-1 text-sm text-slate-600">Add, replace, or remove your uploaded documents.</p>

        <label className="mt-4 block">
          <span className={labelClass}>Add documents</span>
          <input
            type="file"
            multiple
            disabled={uploading}
            onChange={(e) => uploadFiles(e.target.files)}
            className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 disabled:opacity-60"
          />
          {uploading && <p className="mt-1 text-xs text-slate-500">Uploading…</p>}
        </label>

        <ul className="mt-6 divide-y divide-slate-200 rounded-md border border-slate-200">
          {docs.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">No documents yet.</li>
          )}
          {docs.map((d) => (
            <li key={d.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <a
                  href={d.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm font-medium text-slate-900 hover:underline"
                >
                  {d.originalName}
                </a>
                <p className="text-xs text-slate-500">{formatBytes(d.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50">
                  {replacing === d.id ? "Replacing…" : "Replace"}
                  <input
                    type="file"
                    className="hidden"
                    disabled={replacing === d.id}
                    onChange={(e) => replaceDoc(d.id, e.target.files)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeDoc(d.id)}
                  className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
