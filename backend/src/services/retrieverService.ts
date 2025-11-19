import { and, asc, desc, eq } from "drizzle-orm";
import { db, pool } from "../db/client";
import { documentChunks, documents } from "../db/schema";
import { getEmbedding } from "./embeddingService";
import { ingestTextDocument } from "./ingestionService";

export type StoredDocument = {
  text: string;
  metadata?: Record<string, unknown>;
  title?: string;
  language?: string;
};

type RetrieveOptions = {
  tenantId: string;
  query: string;
  limit?: number;
};

export async function addDocuments(
  tenantId: string,
  incoming: Array<StoredDocument>,
): Promise<number> {
  let count = 0;
  for (const doc of incoming) {
    await ingestTextDocument({
      tenantId,
      text: doc.text,
      title: doc.title ?? (doc.metadata?.title as string | undefined),
      language: doc.language,
      metadata: doc.metadata,
    });
    count += 1;
  }
  return count;
}

export async function getAllDocuments(tenantId: string) {
  return db
    .select({
      id: documents.id,
      title: documents.title,
      status: documents.status,
      metadata: documents.metadata,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.tenantId, tenantId))
    .orderBy(desc(documents.createdAt));
}

export async function getDocumentById(tenantId: string, documentId: string) {
  const document = await db.query.documents.findFirst({
    where: and(eq(documents.id, documentId), eq(documents.tenantId, tenantId)),
  });
  if (!document) {
    return null;
  }
  const chunks = await db
    .select({
      id: documentChunks.id,
      chunkIndex: documentChunks.chunkIndex,
      text: documentChunks.text,
      metadata: documentChunks.metadata,
    })
    .from(documentChunks)
    .where(and(eq(documentChunks.documentId, documentId), eq(documentChunks.tenantId, tenantId)))
    .orderBy(asc(documentChunks.chunkIndex));

  return { document, chunks };
}

function toVectorLiteral(vec: number[]): string {
  const body = vec
    .map((v) => (Number.isFinite(v) ? Number(v).toFixed(6) : "0"))
    .join(",");
  // pgvector expects a string literal cast to vector, e.g. '[1,2,3]'::vector
  return `'[${body}]'::vector`;
}

export async function retrieveTopK(options: RetrieveOptions) {
  const embedding = await getEmbedding(options.query);
  const vectorLiteral = toVectorLiteral(embedding);
  const limit = options.limit ?? 6;
  const result = await pool.query(
    `
      SELECT
        dc.id as chunk_id,
        dc.text,
        dc.metadata,
        dc.chunk_index,
        d.id as document_id,
        d.title,
        d.metadata as document_metadata
      FROM embeddings e
      JOIN document_chunks dc ON dc.id = e.chunk_id
      JOIN documents d ON d.id = dc.document_id
      WHERE e.tenant_id = $1
      ORDER BY e.vector <=> ${vectorLiteral}
      LIMIT $2
    `,
    [options.tenantId, limit],
  );
  return result.rows.map((row) => ({
    id: String(row.chunk_id),
    documentId: String(row.document_id),
    text: row.text as string,
    metadata: {
      ...(row.metadata as Record<string, unknown>),
      document: row.document_metadata,
      chunkIndex: row.chunk_index,
      title: row.title,
    },
  }));
}


