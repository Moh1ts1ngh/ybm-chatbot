import { serverEnv } from "@/env/server";

type ResolveTenantParams = {
  email: string;
  name?: string | null;
};

type ResolveTenantResponse = {
  tenant?: {
    id: string;
    name: string;
    domain: string | null;
    plan: string;
  };
};

/**
 * Resolve (or create) a tenant in the backend for the given user email.
 * Tenants are currently grouped by email domain: first user from a domain
 * creates the tenant, others re-use it.
 */
export async function resolveTenantForEmail({
  email,
  name,
}: ResolveTenantParams): Promise<string | null> {
  if (!email) {
    return null;
  }

  try {
    const res = await fetch(`${serverEnv.BACKEND_API_URL}/tenants/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Failed to resolve tenant for email", email, res.status);
      return null;
    }

    const json = (await res.json()) as ResolveTenantResponse;
    return json.tenant?.id ?? null;
  } catch (error) {
    console.warn("Unable to resolve tenant for email", email, error);
    return null;
  }
}

