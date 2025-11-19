'use server';

import { serverEnv } from "@/env/server";

type ChatSession = {
  id: string;
  createdAt: string;
  embedId: string | null;
  createdBy: string | null;
};

type ChatMessage = {
  id: string;
  sender: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export async function fetchChatSessions(tenantId: string) {
  const res = await fetch(`${serverEnv.BACKEND_API_URL}/chat/sessions`, {
    headers: {
      "x-tenant-id": tenantId,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load chat sessions (${res.status})`);
  }
  const json = (await res.json()) as { sessions?: ChatSession[] };
  return json.sessions ?? [];
}

export async function fetchChatSessionDetail(
  tenantId: string,
  sessionId: string,
) {
  const res = await fetch(
    `${serverEnv.BACKEND_API_URL}/chat/sessions/${sessionId}`,
    {
      headers: {
        "x-tenant-id": tenantId,
      },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to load chat session (${res.status})`);
  }
  const json = (await res.json()) as {
    session: ChatSession;
    messages: ChatMessage[];
  };
  return json;
}


