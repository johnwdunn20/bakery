import { z } from "zod";

/**
 * Shared Zod validation schemas
 */

// Example schema - extend as needed
export const emailSchema = z.string().email();

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export const bakedGoodSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
});

export const iterationSchema = z.object({
  recipeContent: z.string().min(1, "Recipe content is required"),
  difficulty: z.enum(DIFFICULTIES, { message: "Select a difficulty" }),
  totalTime: z.coerce.number().int().min(1, "Total time must be at least 1 minute"),
  bakeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  sourceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
