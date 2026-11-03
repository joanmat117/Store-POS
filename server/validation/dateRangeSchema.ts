import { z } from 'zod';

export const dateRangeQuerySchema = z.object({
  start: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }),
  end: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date format' }),
  status: z.coerce.number().int().min(0).optional(),
  user: z.coerce.number().int().min(0).optional(),
  till: z.coerce.number().int().min(0).optional(),
});

export type DateRangeQueryInput = z.infer<typeof dateRangeQuerySchema>;