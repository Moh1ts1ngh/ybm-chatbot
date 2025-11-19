'use client';

import { signIn } from "next-auth/react";

type SignInButtonProps = {
  provider?: "google";
  label?: string;
  callbackUrl?: string;
};

export function SignInButton({
  provider = "google",
  label = "Continue with Google",
  callbackUrl = "/dashboard",
}: SignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn(provider, { callbackUrl })}
      className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
    >
      {label}
    </button>
  );
}

