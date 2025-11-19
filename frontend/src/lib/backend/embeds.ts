'use server';

import { serverEnv } from "@/env/server";

type EmbedRecord = {
  id: string;
  name: string | null;
  config: Record<string, unknown>;
  createdAt: string;
};

type EmbedsResponse = {
  embeds?: EmbedRecord[];
};

export async function fetchEmbedsForTenant(tenantId: string) {
  try {
    const res = await fetch(`${serverEnv.BACKEND_API_URL}/embed`, {
      headers: {
        "x-tenant-id": tenantId,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`);
    }
    const json = (await res.json()) as EmbedsResponse;
    return json.embeds ?? [];
  } catch (error) {
    console.warn("Failed to load embeds from backend", error);
    return [];
  }
}

export async function createEmbedForTenant(tenantId: string, name: string) {
  const res = await fetch(`${serverEnv.BACKEND_API_URL}/embed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create embed: ${res.status}`);
  }
  const json = (await res.json()) as { embed: EmbedRecord };
  return json.embed;
}

export async function issueEmbedTokenForTenant(
  tenantId: string,
  embedId: string,
  domains: string[],
) {
  const res = await fetch(`${serverEnv.BACKEND_API_URL}/embed/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
    },
    body: JSON.stringify({ embedId, domains, ttlSeconds: 300 }),
  });
  if (!res.ok) {
    throw new Error(`Failed to issue embed token: ${res.status}`);
  }
  return (await res.json()) as { token: string; expiresIn: number };
}

export async function deleteEmbedForTenant(tenantId: string, embedId: string) {
  const res = await fetch(`${serverEnv.BACKEND_API_URL}/embed/${embedId}`, {
    method: "DELETE",
    headers: {
      "x-tenant-id": tenantId,
    },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete embed: ${res.status}`);
  }
}


