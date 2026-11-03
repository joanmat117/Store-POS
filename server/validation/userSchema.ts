import { z } from 'zod';

const permissionValue = z.union([z.literal(0), z.literal(1), z.coerce.number().int().min(0).max(1)]);

export const userCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullname: z.string().optional(),
  perm_products: permissionValue.optional(),
  perm_categories: permissionValue.optional(),
  perm_transactions: permissionValue.optional(),
  perm_users: permissionValue.optional(),
  perm_settings: permissionValue.optional(),
  status: z.string().optional(),
});

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;