import { Queue, Worker, type JobsOptions, type Processor } from "bullmq";
import IORedis from "ioredis";
import { env } from "./env";

export type IngestionJobData = {
  tenantId: string;
  fileId: string;
  fileKey: string;
  mimeType?: string | null;
  uploadedBy?: string | null;
};

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Avoid unhandled 'error' events from ioredis crashing the process (e.g. ECONNRESET).
connection.on("error", (error) => {
  console.error("Redis connection error", error);
});

export const ingestionQueue = new Queue<IngestionJobData>(
  env.INGESTION_QUEUE_NAME,
  {
    connection,
  },
);

export function registerIngestionWorker(
  processor: Processor<IngestionJobData, void>,
): Worker<IngestionJobData, void> {
  return new Worker<IngestionJobData>(env.INGESTION_QUEUE_NAME, processor, {
    connection,
  });
}

export async function enqueueIngestionJob(
  payload: IngestionJobData,
  options: JobsOptions = {},
) {
  await ingestionQueue.add("ingest-file", payload, {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    ...options,
  });
}

