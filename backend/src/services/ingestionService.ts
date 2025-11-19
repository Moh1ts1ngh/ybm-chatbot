import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { documentChunks, documents, embeddings, files } from "../db/schema";
import { db } from "../db/client";
import type { IngestionJobData } from "../lib/queue";
import { enqueueIngestionJob } from "../lib/queue";
import { chunkText } from "../lib/chunking";
import { getEmbedding } from "./embeddingService";
import { getObjectAsString, createPresignedUploadUrl } from "../lib/storage";
import { env } from "../lib/env";

const MAX_EMBED_BATCH = 20;

type UploadRequest = {
  tenantId: string;
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy?: string;
};

type TextIngestionPayload = {
  tenantId: string;
  text: string;
  title?: string;
  language?: string;
  metadata?: Record<string, unknown>;
};

export async function requestUploadUrl(payload: UploadRequest) {
  const s3Key = `${payload.tenantId}/${randomUUID()}-${payload.filename}`;
  const [fileRecord] = await db
    .insert(files)
    .values({
      tenantId: payload.tenantId,
      filename: payload.filename,
      s3Key,
      mimeType: payload.mimeType,
      sizeBytes: payload.sizeBytes,
      uploadedBy: payload.uploadedBy,
      status: "uploaded",
    })
    .returning({
      id: files.id,
      s3Key: files.s3Key,
    });

  if (!fileRecord) {
    throw new Error("Unable to create file record");
  }

  const uploadUrl = await createPresignedUploadUrl({
    key: fileRecord.s3Key,
    contentType: payload.mimeType,
  });

  return { fileId: fileRecord.id, uploadUrl, s3Key: fileRecord.s3Key };
}

export async function triggerFileIngestion(fileId: string, tenantId: string) {
  const [file] = await db
    .update(files)
    .set({ status: "processing" })
    .where(and(eq(files.id, fileId), eq(files.tenantId, tenantId)))
    .returning({
      id: files.id,
      s3Key: files.s3Key,
      mimeType: files.mimeType,
    });

  if (!file) {
    throw new Error("File not found or tenant mismatch");
  }

  await enqueueIngestionJob({
    tenantId,
    fileId,
    fileKey: file.s3Key,
    mimeType: file.mimeType,
  });
}

export async function ingestTextDocument(payload: TextIngestionPayload) {
  const [doc] = await db
    .insert(documents)
    .values({
      tenantId: payload.tenantId,
      title: payload.title,
      language: payload.language,
      status: "processing",
      metadata: payload.metadata ?? {},
    })
    .returning({ id: documents.id });

  if (!doc) {
    throw new Error("Failed to create document");
  }

  await processTextIntoChunks(payload.tenantId, doc.id, payload.text);

  await db
    .update(documents)
    .set({ status: "ready", processedAt: sql`now()` })
    .where(eq(documents.id, doc.id));

  return doc.id;
}

async function processTextIntoChunks(tenantId: string, documentId: string, text: string) {
  const chunks = chunkText(text);
  if (chunks.length === 0) {
    throw new Error("Unable to chunk text");
  }

  const insertedChunks = await db
    .insert(documentChunks)
    .values(
      chunks.map((chunk) => ({
        tenantId,
        documentId,
        chunkIndex: chunk.index,
        text: chunk.text,
        textPlain: chunk.textPlain,
        metadata: chunk.metadata,
      })),
    )
    .returning({
      id: documentChunks.id,
      text: documentChunks.text,
    });

  await upsertEmbeddings(tenantId, insertedChunks);
}

async function upsertEmbeddings(
  tenantId: string,
  chunks: Array<{ id: string; text: string }>,
) {
  for (let i = 0; i < chunks.length; i += MAX_EMBED_BATCH) {
    const slice = chunks.slice(i, i + MAX_EMBED_BATCH);
    const vectors = await Promise.all(slice.map((chunk) => getEmbedding(chunk.text)));
    await db
      .insert(embeddings)
      .values(
        slice.map((chunk, idx) => ({
          tenantId,
          chunkId: chunk.id,
          model: env.OPENAI_EMBEDDING_MODEL,
          vector: vectors[idx],
        })),
      )
      .onConflictDoUpdate({
        target: embeddings.chunkId,
        set: {
          vector: sql`excluded.vector`,
          model: sql`excluded.model`,
        },
      });
  }
}

async function extractTextFromFile(key: string, mimeType?: string | null) {
  const raw = await getObjectAsString(key);
  if (!raw.trim()) {
    throw new Error(`No textual content extracted for ${key}`);
  }
  if (mimeType?.startsWith("application/json")) {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    } catch {
      return raw;
    }
  }
  return raw;
}

export async function processIngestionJob(job: IngestionJobData) {
  const file = await db.query.files.findFirst({
    where: and(eq(files.id, job.fileId), eq(files.tenantId, job.tenantId)),
  });
  if (!file) {
    throw new Error("File record missing");
  }

  const text = await extractTextFromFile(job.fileKey, file.mimeType);

  const [doc] = await db
    .insert(documents)
    .values({
      tenantId: file.tenantId,
      fileId: file.id,
      title: file.filename,
      language: file.metadata?.language as string | undefined,
      status: "processing",
      metadata: file.metadata ?? {},
    })
    .returning({ id: documents.id });

  if (!doc) {
    throw new Error("Failed to create document from file");
  }

  await processTextIntoChunks(file.tenantId, doc.id, text);

  await Promise.all([
    db
      .update(files)
      .set({ status: "processed", updatedAt: sql`now()` })
      .where(eq(files.id, file.id)),
    db
      .update(documents)
      .set({ status: "ready", processedAt: sql`now()` })
      .where(eq(documents.id, doc.id)),
  ]);
}

