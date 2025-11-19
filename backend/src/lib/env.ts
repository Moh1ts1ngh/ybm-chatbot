import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  PORT: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  EMBED_JWT_SECRET: z.string().default("local-dev-embed-secret"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  INGESTION_QUEUE_NAME: z.string().default("ingestion-jobs"),
  CHUNK_MAX_TOKENS: z.coerce.number().default(800),
  CHUNK_OVERLAP_TOKENS: z.coerce.number().default(120),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);


