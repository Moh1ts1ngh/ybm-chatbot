import type { Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { chatMessages, chatSessions } from "../db/schema";

export async function listChatSessions(req: Request, res: Response) {
  if (!req.tenantId) {
    return res
      .status(400)
      .json({ error: { message: "Missing tenant context" } });
  }

  const sessions = await db
    .select({
      id: chatSessions.id,
      createdAt: chatSessions.createdAt,
      embedId: chatSessions.embedId,
      createdBy: chatSessions.createdBy,
    })
    .from(chatSessions)
    .where(eq(chatSessions.tenantId, req.tenantId))
    .orderBy(desc(chatSessions.createdAt))
    .limit(200);

  return res.json({ sessions });
}

export async function getChatSession(req: Request, res: Response) {
  if (!req.tenantId) {
    return res
      .status(400)
      .json({ error: { message: "Missing tenant context" } });
  }
  const { sessionId } = req.params;
  if (!sessionId) {
    return res
      .status(400)
      .json({ error: { message: "sessionId param is required" } });
  }

  const session = await db.query.chatSessions.findFirst({
    where: and(
      eq(chatSessions.id, sessionId),
      eq(chatSessions.tenantId, req.tenantId),
    ),
  });

  if (!session) {
    return res.status(404).json({ error: { message: "Session not found" } });
  }

  const messages = await db
    .select({
      id: chatMessages.id,
      sender: chatMessages.sender,
      content: chatMessages.content,
      metadata: chatMessages.metadata,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(desc(chatMessages.createdAt));

  return res.json({ session, messages: messages.reverse() });
}


