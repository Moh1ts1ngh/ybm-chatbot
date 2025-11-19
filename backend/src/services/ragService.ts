import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { chatMessages, chatSessions, usageLogs } from "../db/schema";
import { env } from "../lib/env";
import { retrieveTopK } from "./retrieverService";

type RAGResult = {
  answer: string;
  sources: Array<{ id: string; documentId: string; chunkIndex?: number }>;
  sessionId: string;
};

type GenerateAnswerOptions = {
  tenantId: string;
  query: string;
  sessionId?: string;
  embedId?: string;
  userId?: string;
};

async function callChatModel(prompt: string, contexts: string[]): Promise<string> {
  if (!env.OPENAI_API_KEY) {
    return `Context summary:\n${contexts.join("\n\n")}\n\nQuestion: ${prompt}`;
  }

  const systemPrompt =
    "You are an enterprise knowledge base assistant. Use only the provided context to answer and include citations like [doc:<id> chunk:<index>]. If unsure, say you do not know.";
  const contextBlock = contexts.join("\n\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_CHAT_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Context:\n${contextBlock}\n\nQuestion: ${prompt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat model error: ${response.status}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return json.choices?.[0]?.message?.content ?? "No answer generated.";
}

async function ensureSession(options: GenerateAnswerOptions) {
  if (options.sessionId) {
    const session = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.id, options.sessionId),
        eq(chatSessions.tenantId, options.tenantId),
      ),
    });
    if (session) {
      return session.id;
    }
  }

  const [session] = await db
    .insert(chatSessions)
    .values({
      tenantId: options.tenantId,
      embedId: options.embedId,
      createdBy: options.userId,
    })
    .returning({ id: chatSessions.id });

  if (!session) {
    throw new Error("Failed to create chat session");
  }

  return session.id;
}

async function logMessage(
  sessionId: string,
  sender: "user" | "assistant",
  content: string,
) {
  await db.insert(chatMessages).values({
    sessionId,
    sender,
    content,
  });
}

async function logUsage(tenantId: string, tokens: number, eventType: string) {
  await db.insert(usageLogs).values({
    tenantId,
    eventType,
    details: { tokens },
  });
}

export async function generateAnswer(options: GenerateAnswerOptions): Promise<RAGResult> {
  const sessionId = await ensureSession(options);
  const contexts = await retrieveTopK({
    tenantId: options.tenantId,
    query: options.query,
    limit: 6,
  });
  const formattedContexts = contexts.map(
    (ctx, idx) => `Context #${idx + 1} [doc:${ctx.documentId} chunk:${ctx.metadata.chunkIndex}] -> ${ctx.text}`,
  );

  await logMessage(sessionId, "user", options.query);
  const answer = await callChatModel(options.query, formattedContexts);
  await logMessage(sessionId, "assistant", answer);

  await logUsage(options.tenantId, options.query.length + answer.length, "chat_completion");

  return {
    answer,
    sessionId,
    sources: contexts.map((ctx) => ({
      id: ctx.id,
      documentId: ctx.documentId,
      chunkIndex: ctx.metadata.chunkIndex as number | undefined,
    })),
  };
}


