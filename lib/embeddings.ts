import { Embeddings } from "node-appwrite";
import { adminClient, HttpError } from "./appwrite/server";

export const EMBEDDING_DIM = 768; // nomic-embed-text
export const EMBEDDING_MODEL = "nomic-embed-text";

/** Same model and same prefixes for saving and searching, so vectors are comparable. */
export const documentText = (m: { title: string; problem: string; solution: string; language?: string; tags: string[] }) =>
  `search_document: ${m.title}\nProblem: ${m.problem}\nSolution: ${m.solution}\nLanguage: ${m.language ?? ""}\nTags: ${m.tags.join(", ")}`.slice(0, 12000);
export const queryText = (q: string) => `search_query: ${q}`;

function normalize(v: number[]): Float32Array {
  const out = new Float32Array(v);
  let n = 0;
  for (const x of out) n += x * x;
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < out.length; i++) out[i] /= n;
  return out;
}

/** Calls Appwrite's Embeddings service. Throws HttpError(502) so callers never store a row without a vector. */
export async function embed(text: string): Promise<Float32Array> {
  try {
    const res = await new Embeddings(adminClient()).createTextEmbeddings({ texts: [text] });
    const e = res.embeddings[0];
    if (!e || e.error || e.embedding.length !== EMBEDDING_DIM) throw new Error(e?.error || "Unexpected embedding size");
    return normalize(e.embedding);
  } catch (err) {
    console.error("Embedding failed:", err);
    throw new HttpError(502, "Couldn't create the search embedding. Nothing was saved. Please try again.");
  }
}

/** Float32 → base64 (3,072 bytes → 4,096 chars) so a vector fits in one text column. */
export const encodeVector = (v: Float32Array) => Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString("base64");

export function decodeVector(s: string): Float32Array {
  const b = Buffer.from(s, "base64");
  const ab = new ArrayBuffer(b.length); // copy so the Float32Array is 4-byte aligned
  new Uint8Array(ab).set(b);
  return new Float32Array(ab);
}