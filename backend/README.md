# Backend (Express + TypeScript + Drizzle)

Multi-tenant RAG backend with ingestion workers, pgvector search, and embeddable chat widget support.

## Architecture Highlights

- **Frameworks:** Express 5, TypeScript, Drizzle ORM, BullMQ workers.
- **Storage:** Postgres + pgvector, S3-compatible object storage, Redis for queues.
- **RAG:** Chunked documents with overlap, OpenAI embeddings (fallback hashing), chat completions with citation prompts.
- **Security:** Tenant-scoped tables, signed embed tokens, per-tenant rate/usage logging hooks.

## Core API Surface

| Method | Path                                   | Description                                     |
| ------ | -------------------------------------- | ----------------------------------------------- |
| `GET`  | `/api/v1/health`                       | Service health probe                            |
| `POST` | `/api/v1/tenants`                      | Create tenant (signup flow)                     |
| `POST` | `/api/v1/tenants/:tenantId/upload-url` | Generate presigned S3 upload URL                |
| `POST` | `/api/v1/files/:fileId/ingest`         | Queue ingestion job for uploaded file           |
| `POST` | `/api/v1/docs`                         | Ad-hoc JSON/text ingestion (tenant scoped)      |
| `GET`  | `/api/v1/docs`                         | List documents for tenant                       |
| `GET`  | `/api/v1/docs/:docId`                  | Document metadata + chunk list                  |
| `POST` | `/api/v1/chat`                         | Chat endpoint (supports session + embed tokens) |
| `POST` | `/api/v1/embed/token`                  | Issue short-lived widget token                  |
| `GET`  | `/api/v1/admin/usage`                  | Tenant usage / billing events                   |

All tenant-scoped routes expect `x-tenant-id` header unless an embed token supplies context.

## Local Setup

1. Copy `ENV.sample` to `.env` and fill in the required keys (Postgres, Redis, S3, OpenAI, JWT secret).
2. Install dependencies (Bun or npm).
3. Run database migrations: `bun run db:migrate`.
4. Start the API server: `bun run src/server.ts`.
5. Start the ingestion worker separately: `bun run src/workers/ingestionWorker.ts`.

## Ingestion Flow

1. Client requests `POST /tenants/:id/upload-url` to get a presigned URL and `fileId`.
2. Upload file directly to S3 with the given key.
3. Call `POST /files/:fileId/ingest` to enqueue a BullMQ job.
4. Worker downloads the file, extracts text (placeholder parser today), runs chunking (token-based overlap), batches embeddings, and updates document/file statuses.
5. Chat endpoint retrieves latest chunks via pgvector similarity and calls the LLM.

## Database

`src/db/schema.ts` defines tenant-aware tables for:

- `tenants`, `users`, `tenant_api_keys`
- `files`, `documents`, `document_chunks`, `embeddings`, `embeddings_index_meta`
- `chat_sessions`, `chat_messages`, `web_embeds`
- `usage_logs`, `audit_logs`

Migrations live in `drizzle/` and are generated via `bun run db:generate`.

## Environment

See `ENV.sample` for the full matrix (OpenAI models, Redis queue name, chunk sizes, S3 creds, JWT secret, etc.). Missing or placeholder values will disable certain features (e.g., real embeddings or S3 uploads).

## Development Notes

- Chunking is token-aware (word approximation) with configurable size/overlap via env vars.
- Embedding + chat calls fall back to deterministic mock outputs when `OPENAI_API_KEY` is absent.
- pgvector ANN queries are executed via raw SQL for ordering by `<=>`.
- Embed tokens are short-lived JWTs; rotate `EMBED_JWT_SECRET` per environment.
- Run `bun run db:studio` (or npm equivalent) to inspect schema/data via Drizzle Studio.
