import type { Request, Response } from "express";
import { verifyEmbedToken } from "../lib/jwt";
import { generateAnswer } from "../services/ragService";

type ChatBody = {
  message?: string;
  sessionId?: string;
  embedToken?: string;
};

export async function handleChat(req: Request, res: Response) {
  const { message, sessionId, embedToken } = req.body as ChatBody;
  let tenantId = req.tenantId;
  let embedId: string | undefined;

  if (embedToken) {
    try {
      const payload = verifyEmbedToken(embedToken);
      tenantId = payload.tenantId;
      embedId = payload.embedId;
    } catch (error) {
      return res
        .status(401)
        .json({ error: { message: "Invalid embed token" } });
    }
  }

  if (!tenantId) {
    return res
      .status(400)
      .json({ error: { message: "Missing tenant context" } });
  }

  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .json({ error: { message: "Field 'message' is required" } });
  }

  const result = await generateAnswer({
    tenantId,
    query: message,
    sessionId,
    embedId,
    userId: req.userId,
  });

  return res.json(result);
}
