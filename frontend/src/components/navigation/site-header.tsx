import Link from "next/link";
import type { Session } from "next-auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";

type SiteHeaderProps = {
  session: Session | null;
};

const navLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/files", label: "Files" },
  { href: "/dashboard/documents", label: "Documents" },
  { href: "/dashboard/chat", label: "Chat" },
  { href: "/dashboard/embed", label: "Embed" },
  { href: "/dashboard/logs", label: "Logs" },
  { href: "/dashboard/usage", label: "Usage" },
];

export function SiteHeader({ session }: SiteHeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-neutral-900"
        >
          YBM Chatbot
        </Link>

        {session?.user && (
          <nav className="hidden items-center gap-4 text-xs font-medium text-neutral-600 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <div className="hidden text-sm text-neutral-600 md:block">
                <p className="font-medium truncate max-w-[180px]">
                  {session.user.name ?? session.user.email}
                </p>
                <p className="text-xs text-neutral-500">
                  {session.user.tenantId ?? "No tenant set"}
                </p>
              </div>
              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  );
}

