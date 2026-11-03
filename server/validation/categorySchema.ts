import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
});

export const categoryUpdateSchema = categorySchema;

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;