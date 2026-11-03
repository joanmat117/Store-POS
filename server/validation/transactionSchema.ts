import { z } from 'zod';

export const cartItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().positive(),
  stock: z.number().int().min(0).optional(),
});

export const transactionSchema = z.object({
  ref_number: z.string().optional(),
  customer: z.union([z.string(), z.number()]).optional(),
  customer_name: z.string().optional(),
  status: z.number().int().min(0).max(2).optional(),
  user_id: z.number().int().min(0).optional(),
  user: z.string().optional(),
  user_name: z.string().optional(),
  till: z.number().int().min(1).optional(),
  discount: z.number().min(0).optional(),
  subtotal: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  paid: z.number().min(0).optional(),
  change: z.number().optional(),
  payment_type: z.number().int().min(1).max(3).optional(),
  items: z.array(cartItemSchema).optional(),
  date: z.string().optional(),
  _id: z.number().int().positive().optional(),
  id: z.number().int().positive().optional(),
});

export const transactionUpdateSchema = transactionSchema;

export const deleteTransactionSchema = z.object({
  orderId: z.number().int().positive('Order ID is required'),
  _id: z.number().int().positive().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;
export type DeleteTransactionInput = z.infer<typeof deleteTransactionSchema>;