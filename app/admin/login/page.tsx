import { redirect } from "next/navigation";
import { TopBar } from "../../_components/TopBar";
import { getAdminSession } from "@/lib/session";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin/registrations");

  return (
    <>
      <TopBar title="Admin" />
      <main className="mx-auto w-full max-w-md px-6 py-12">
        <h2 className="text-2xl font-semibold">Admin sign in</h2>
        <p className="mt-1 text-sm text-slate-600">Use the credentials configured for this deployment.</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </main>
    </>
  );
}
