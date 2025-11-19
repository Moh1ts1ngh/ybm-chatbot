import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { signEmbedToken } from "../lib/jwt";
import { createWebEmbed, getWebEmbedById } from "../services/tenantService";
import { db } from "../db/client";
import { webEmbeds } from "../db/schema";

export async function issueEmbedToken(req: Request, res: Response) {
  if (!req.tenantId) {
    return res
      .status(400)
      .json({ error: { message: "Missing tenant context" } });
  }
  const { embedId, domains, ttlSeconds } = req.body ?? {};
  if (!embedId) {
    return res
      .status(400)
      .json({ error: { message: "embedId is required" } });
  }
  const embed = await getWebEmbedById(req.tenantId, embedId);
  if (!embed) {
    return res.status(404).json({ error: { message: "Embed not found" } });
  }
  const token = signEmbedToken(
    {
      tenantId: req.tenantId,
      embedId,
      domains,
    },
    ttlSeconds ?? 120,
  );
  return res.json({ token, expiresIn: ttlSeconds ?? 120 });
}

export async function listEmbeds(req: Request, res: Response) {
  if (!req.tenantId) {
    return res
      .status(400)
      .json({ error: { message: "Missing tenant context" } });
  }
  const rows = await db.query.webEmbeds.findMany({
    where(fields, { eq }) {
      return eq(fields.tenantId, req.tenantId!);
    },
    columns: {
      id: true,
      name: true,
      config: true,
      createdAt: true,
      tenantId: false,
      embedSecret: false,
    },
  });

  return res.json({ embeds: rows });
}

export async function createEmbed(req: Request, res: Response) {
  if (!req.tenantId) {
    return res
      .status(400)
      .json({ error: { message: "Missing tenant context" } });
  }
  const { name, config } = req.body ?? {};
  const embed = await createWebEmbed({
    tenantId: req.tenantId,
    name,
    config: config ?? {},
  });
  return res.status(201).json({ embed });
}

export async function deleteEmbed(req: Request, res: Response) {
  if (!req.tenantId) {
    return res
      .status(400)
      .json({ error: { message: "Missing tenant context" } });
  }
  const { embedId } = req.params;
  if (!embedId) {
    return res
      .status(400)
      .json({ error: { message: "embedId param is required" } });
  }

  await db
    .delete(webEmbeds)
    .where(and(eq(webEmbeds.id, embedId), eq(webEmbeds.tenantId, req.tenantId)));

  return res.status(204).send();
}

