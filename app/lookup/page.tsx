import { TopBar } from "../_components/TopBar";
import { LookupForm } from "./LookupForm";

export default function LookupPage() {
  return (
    <>
      <TopBar title="View / Edit Registration" />
      <main className="mx-auto w-full max-w-md px-6 py-12">
        <h2 className="text-2xl font-semibold">Sign in</h2>
        <p className="mt-1 text-sm text-slate-600">Enter your reference code and password.</p>
        <div className="mt-6">
          <LookupForm />
        </div>
      </main>
    </>
  );
}
