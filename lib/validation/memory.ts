import { z } from "zod";

export const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "PHP", "C#", "C++", "Go", "Rust", "SQL", "Other"] as const;

export const memorySchema = z.object({
  title: z.string().trim().min(3, "Give it a short title.").max(120),
  problem: z.string().trim().min(10, "Describe the problem in a sentence or two.").max(4000),
  solution: z.string().trim().min(10, "Explain how you solved it.").max(8000),
  code: z.string().max(20000),
  language: z.enum(LANGUAGES),
  tags: z.array(z.string().trim().min(1).max(30)).max(10, "Use up to 10 tags."),
  sourceUrl: z.union([z.literal(""), z.string().trim().url("Enter a valid URL.")]),
  isFavorite: z.boolean(),
});

export type MemoryValues = z.infer<typeof memorySchema>;