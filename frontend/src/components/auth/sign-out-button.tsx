'use client';

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  label?: string;
};

export function SignOutButton({ label = "Sign out" }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
    >
      {label}
    </button>
  );
}

