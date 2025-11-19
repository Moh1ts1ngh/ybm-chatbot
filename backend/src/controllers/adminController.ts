import type { Request, Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { usageLogs } from "../db/schema";

export async function getUsage(req: Request, res: Response) {
  if (!req.tenantId) {
    return res.status(400).json({ error: { message: "Missing tenant context" } });
  }
  const logs = await db
    .select({
      id: usageLogs.id,
      eventType: usageLogs.eventType,
      cost: usageLogs.cost,
      details: usageLogs.details,
      createdAt: usageLogs.createdAt,
    })
    .from(usageLogs)
    .where(eq(usageLogs.tenantId, req.tenantId))
    .orderBy(desc(usageLogs.createdAt))
    .limit(200);

  return res.json({ usage: logs });
}

