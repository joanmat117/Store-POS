import { z } from 'zod';

export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'At least one product ID is required'),
});

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;