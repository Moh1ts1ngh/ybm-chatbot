import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_BACKEND_URL: z
    .string()
    .url("NEXT_PUBLIC_BACKEND_URL must be a valid URL"),
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
});
