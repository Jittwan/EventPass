import { redirect } from "next/navigation";
import { TopBar } from "../../_components/TopBar";
import { getAdminSession } from "@/lib/session";
import { AdminRegistrationsList } from "./AdminRegistrationsList";

export default async function AdminRegistrationsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <TopBar title={`Admin · ${session.username}`} />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <AdminRegistrationsList />
      </main>
    </>
  );
}
