import { env } from "../lib/env";

export const EMBEDDING_DIMENSION = 1536;

export async function getEmbedding(
  text: string,
  model = env.OPENAI_EMBEDDING_MODEL
): Promise<number[]> {
  const apiKey = env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI embeddings failed with status ${response.status}`
        );
      }

      const json = (await response.json()) as {
        data?: Array<{ embedding: number[] }>;
      };

      const vector = json?.data?.[0]?.embedding;
      if (Array.isArray(vector) && vector.length > 0) {
        return vector;
      }
    } catch (error) {
      console.warn("Falling back to deterministic embedding stub", error);
    }
  }

  // Deterministic fallback embedding for local/dev usage.
  const vector = new Array<number>(EMBEDDING_DIMENSION).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    const idx = hash % EMBEDDING_DIMENSION;
    vector[idx] += 1;
  }
  return vector;
}
