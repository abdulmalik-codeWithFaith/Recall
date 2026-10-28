import { z } from "zod";

export const nameSchema = z.object({
  name: z.string().trim().min(2, "Enter your name (at least 2 characters).").max(80, "That name is too long."),
});
export type NameValues = z.infer<typeof nameSchema>;