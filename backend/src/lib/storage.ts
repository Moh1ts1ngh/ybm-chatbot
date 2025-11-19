import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "node:stream";
import { env } from "./env";

type PresignOptions = {
  key: string;
  contentType?: string;
  expiresInSeconds?: number;
};

let cachedClient: S3Client | null = null;

function assertS3Config() {
  if (!env.S3_BUCKET || !env.S3_REGION || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    throw new Error(
      "S3 configuration is incomplete. Ensure S3_BUCKET, S3_REGION, S3_ACCESS_KEY, and S3_SECRET_KEY are set.",
    );
  }
}

function getClient(): S3Client {
  if (cachedClient) {
    return cachedClient;
  }

  assertS3Config();
  cachedClient = new S3Client({
    region: env.S3_REGION!,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: Boolean(env.S3_ENDPOINT),
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY!,
      secretAccessKey: env.S3_SECRET_KEY!,
    },
  });
  return cachedClient;
}

export async function createPresignedUploadUrl(options: PresignOptions): Promise<string> {
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET!,
    Key: options.key,
    ContentType: options.contentType,
  });
  return getSignedUrl(client, command, { expiresIn: options.expiresInSeconds ?? 900 });
}

export async function createPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 900,
): Promise<string> {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET!,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function getObjectAsString(key: string): Promise<string> {
  const client = getClient();
  const result = await client.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET!,
      Key: key,
    }),
  );
  if (!result.Body) {
    throw new Error(`Object ${key} has no body`);
  }
  if (typeof (result.Body as any).transformToString === "function") {
    return (result.Body as Readable & { transformToString(encoding?: string): Promise<string> }).transformToString(
      "utf-8",
    );
  }
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    (result.Body as Readable)
      .on("data", (chunk) => chunks.push(Buffer.from(chunk)))
      .once("error", reject)
      .once("end", resolve);
  });
  return Buffer.concat(chunks).toString("utf-8");
}

export async function deleteObject(key: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET!,
      Key: key,
    }),
  );
}

