import { z } from "zod";

const serverSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  BACKEND_API_URL: z
    .string()
    .url("BACKEND_API_URL must be a valid URL")
    .default("http://localhost:3000/api/v1"),
});

export const serverEnv = serverSchema.parse({
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  BACKEND_API_URL:
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:3000/api/v1",
});
