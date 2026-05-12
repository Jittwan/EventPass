import { TopBar } from "../_components/TopBar";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <TopBar title="Register" />
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <h2 className="text-2xl font-semibold text-slate-900">Create your registration</h2>
        <p className="mt-1 text-sm text-slate-600">
          You&apos;ll receive a reference code after submitting. Keep it safe — you&apos;ll need it to sign back in.
        </p>
        <div className="mt-8">
          <RegisterForm />
        </div>
      </main>
    </>
  );
}
