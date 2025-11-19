import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user?.tenantId) {
    redirect("/dashboard");
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl bg-white px-8 py-10 shadow-sm ring-1 ring-black/5">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">
          Access Portal
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Sign in to manage your tenant
        </h1>
        <p className="text-base text-neutral-600">
          Use Google SSO to access the dashboard. We&apos;ll automatically
          provision your profile and connect it to your tenant data.
        </p>
      </div>
      <div className="flex justify-center">
        <SignInButton label="Continue with Google" />
      </div>
      <p className="text-center text-xs text-neutral-500">
        By continuing you agree to the acceptable use policy and data handling
        guidelines for the YBM AI assistant.
      </p>
    </section>
  );
}
