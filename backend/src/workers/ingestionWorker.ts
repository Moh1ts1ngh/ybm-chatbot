import { registerIngestionWorker } from "../lib/queue";
import { processIngestionJob } from "../services/ingestionService";

const worker = registerIngestionWorker(async (job) => {
  await processIngestionJob(job.data);
});

worker.on("completed", (job) => {
  console.log(`Ingestion job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Ingestion job ${job?.id} failed`, err);
});

