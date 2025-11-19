import Link from "next/link";
import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function Home() {
  const session = await auth();

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-10 rounded-3xl bg-white px-8 py-14 shadow-sm ring-1 ring-black/5">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">
          YBM Chatbot
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
          Launch a tenant-ready RAG assistant in minutes.
        </h1>
        <p className="text-lg text-neutral-600">
          Upload knowledge, manage embeds, and monitor usage from a single
          secure dashboard. Sign in with Google to access your tenant space.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {session?.user ? (
          <>
            <Link
              href="/dashboard"
              className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Go to dashboard
            </Link>
            <SignOutButton label="Sign out" />
          </>
        ) : (
          <SignInButton />
        )}
      </div>

      <div className="grid gap-6 border-t border-neutral-100 pt-6 sm:grid-cols-3">
        {[
          "Google SSO + multi-tenant RBAC",
          "Doc ingestion + pgvector search",
          "Embeddable chat widgets",
        ].map((item) => (
          <div key={item} className="space-y-2">
            <p className="text-sm font-semibold text-neutral-900">{item}</p>
            <p className="text-sm text-neutral-500">
              Built with Next.js, NextAuth, and the YBM backend service.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
