import { pool } from "./client";

export async function initDb() {
  // Rely on migrations for table creation; bootstrap core extensions here.
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`).catch(() =>
    undefined,
  );
  await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`).catch(() => undefined);
}


