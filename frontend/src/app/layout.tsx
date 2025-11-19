import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { SessionProvider } from "@/components/providers/session-provider";
import { SiteHeader } from "@/components/navigation/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YBM Chatbot Dashboard",
  description:
    "Manage tenants, knowledge ingestion, and embeds for the YBM AI assistant.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-neutral-50 text-neutral-900 antialiased`}
      >
        <SessionProvider session={session}>
          <SiteHeader session={session} />
          <main className="min-h-[calc(100vh-64px)] bg-neutral-50 px-4 py-10 sm:px-6">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
