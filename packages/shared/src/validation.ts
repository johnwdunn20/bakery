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

// Add more validation schemas as needed
