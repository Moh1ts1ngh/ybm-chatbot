import jwt from "jsonwebtoken";
import { env } from "./env";

export type EmbedTokenPayload = {
  tenantId: string;
  embedId: string;
  domains?: string[];
  sessionId?: string;
  iat?: number;
  exp?: number;
};

export function signEmbedToken(
  payload: Omit<EmbedTokenPayload, "iat" | "exp">,
  ttlSeconds = 120,
) {
  return jwt.sign(payload, env.EMBED_JWT_SECRET, {
    expiresIn: ttlSeconds,
  });
}

export function verifyEmbedToken(token: string): EmbedTokenPayload {
  return jwt.verify(token, env.EMBED_JWT_SECRET) as EmbedTokenPayload;
}

