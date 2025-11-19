import type { Request, Response } from "express";
import { addDocuments, getAllDocuments, getDocumentById } from "../services/retrieverService";

type IncomingDoc = {
  text: string;
  metadata?: Record<string, unknown>;
  title?: string;
  language?: string;
};

export async function indexDocuments(req: Request, res: Response) {
  if (!req.tenantId) {
    return res.status(400).json({ error: { message: "Missing tenant context" } });
  }
  const docs = (req.body?.documents || []) as IncomingDoc[];
  if (!Array.isArray(docs) || docs.length === 0) {
    return res
      .status(400)
      .json({ error: { message: "Body must include non-empty 'documents' array" } });
  }
  const count = await addDocuments(
    req.tenantId,
    docs.map((doc) => ({
      text: doc.text,
      metadata: doc.metadata ?? {},
      title: doc.title,
      language: doc.language,
    })),
  );
  return res.json({ indexed: count });
}

export async function listDocuments(req: Request, res: Response) {
  if (!req.tenantId) {
    return res.status(400).json({ error: { message: "Missing tenant context" } });
  }
  const docs = await getAllDocuments(req.tenantId);
  return res.json({ documents: docs });
}

export async function getDocument(req: Request, res: Response) {
  if (!req.tenantId) {
    return res.status(400).json({ error: { message: "Missing tenant context" } });
  }
  const docId = req.params.docId;
  const doc = await getDocumentById(req.tenantId, docId);
  if (!doc) {
    return res.status(404).json({ error: { message: "Document not found" } });
  }
  return res.json(doc);
}


