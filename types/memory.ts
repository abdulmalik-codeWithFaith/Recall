/** Shape returned by /api/memories — the API flattens Appwrite's `metadata` for the UI. */
export interface Memory {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  problem: string;
  solution: string;
  code: string;
  language: string;
  tags: string[];
  sourceUrl: string | null;
  isFavorite: boolean;
}

export interface Stats {
  totalMemories: number;
  favorites: number;
  searches: number;
  technologies: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

/** One semantic-search hit. `score` is null unless the API can derive a reliable 0–1 similarity. */
export interface SearchResult {
  memory: Memory;
  score: number | null;
}