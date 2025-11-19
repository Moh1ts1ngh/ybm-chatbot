import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { serverEnv } from "@/env/server";
import { resolveTenantForEmail } from "@/lib/auth/sync-tenant";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [
    Google({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: serverEnv.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email ?? token.email ?? "";
        token.name = profile.name ?? token.name ?? "";
        token.picture =
          (profile as Record<string, string | undefined>).picture ??
          token.picture;
        token.provider = account.provider;
      }
      if (!token.tenantId && token.email) {
        const tenantId = await resolveTenantForEmail({
          email: token.email,
          name: token.name,
        });
        token.tenantId = tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.tenantId =
          (token.tenantId as string | null | undefined) ?? null;
        session.user.provider =
          typeof token.provider === "string" ? token.provider : undefined;
      }
      return session;
    },
  },
};
