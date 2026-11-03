import { z } from 'zod';

export const skuSchema = z.object({
  skuCode: z.string().min(1, 'SKU code is required'),
});

export type SkuInput = z.infer<typeof skuSchema>;