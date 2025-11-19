'use server';

import { serverEnv } from "@/env/server";

type ChunkRecord = {
  id: string;
  chunkIndex: number;
  text: string;
  metadata: Record<string, unknown>;
};

type DocumentDetailResponse = {
  document: {
    id: string;
    title: string | null;
    metadata: Record<string, unknown>;
  };
  chunks: ChunkRecord[];
};

export async function fetchDocumentDetail(
  tenantId: string,
  documentId: string,
) {
  const res = await fetch(`${serverEnv.BACKEND_API_URL}/docs/${documentId}`, {
    headers: {
      "x-tenant-id": tenantId,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load document ${documentId} (${res.status})`);
  }
  return (await res.json()) as DocumentDetailResponse;
}


