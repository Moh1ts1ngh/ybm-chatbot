import { env } from "./env";

export type Chunk = {
  index: number;
  text: string;
  textPlain: string;
  metadata: Record<string, unknown>;
};

export type ChunkOptions = {
  maxTokens?: number;
  overlapTokens?: number;
};

const NON_ASCII_WHITESPACE = /\s+/;

function sanitize(text: string): string {
  return text.replace(/\u0000/g, "").trim();
}

function tokenize(text: string): string[] {
  return text.split(NON_ASCII_WHITESPACE).filter(Boolean);
}

function untokenize(tokens: string[]): string {
  return tokens.join(" ").trim();
}

export function chunkText(input: string, options: ChunkOptions = {}): Chunk[] {
  const maxTokens = options.maxTokens ?? env.CHUNK_MAX_TOKENS;
  const overlap = Math.min(options.overlapTokens ?? env.CHUNK_OVERLAP_TOKENS, maxTokens - 1);
  const tokens = tokenize(input);
  const chunks: Chunk[] = [];

  if (tokens.length === 0) {
    return [];
  }

  let index = 0;
  for (let start = 0; start < tokens.length; start += maxTokens - overlap) {
    const slice = tokens.slice(start, Math.min(tokens.length, start + maxTokens));
    const text = untokenize(slice);
    const textPlain = sanitize(text);
    if (!textPlain) {
      continue;
    }
    chunks.push({
      index,
      text,
      textPlain,
      metadata: {
        tokenRange: [start, start + slice.length],
      },
    });
    index += 1;
  }

  return chunks;
}

