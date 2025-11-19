import type { Request, Response } from "express";
import { triggerFileIngestion } from "../services/ingestionService";

export async function ingestFile(req: Request, res: Response) {
  if (!req.tenantId) {
    return res.status(400).json({ error: { message: "Missing tenant context" } });
  }
  const fileId = req.params.fileId;
  if (!fileId) {
    return res.status(400).json({ error: { message: "fileId parameter is required" } });
  }

  await triggerFileIngestion(fileId, req.tenantId);
  return res.json({ status: "queued" });
}

