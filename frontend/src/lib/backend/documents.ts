'use server';

import { serverEnv } from "@/env/server";

type DocumentRecord = {
  id: string;
  title?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown>;
};

type DocumentsResponse = {
  documents?: DocumentRecord[];
};

export async function fetchDocumentsForTenant(tenantId: string) {
  const endpoint = `${serverEnv.BACKEND_API_URL}/docs`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        "x-tenant-id": tenantId,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`);
    }
    const json = (await res.json()) as DocumentsResponse;
    return json.documents ?? [];
  } catch (error) {
    console.warn("Failed to load documents from backend", error);
    return [];
  }
}

