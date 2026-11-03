import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.coerce.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().int().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  img: z.string().optional(),
  remove: z.string().optional(),
});

export const productUpdateSchema = productSchema.extend({
  id: z.coerce.number().int().positive().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;