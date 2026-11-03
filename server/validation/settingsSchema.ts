import { z } from 'zod';

export const settingsSchema = z.object({
  app: z.string().optional(),
  store: z.string().optional(),
  address_one: z.string().optional(),
  address_two: z.string().optional(),
  contact: z.string().optional(),
  tax: z.string().optional(),
  symbol: z.string().optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  charge_tax: z.union([z.boolean(), z.coerce.number().int().min(0).max(1)]).optional(),
  footer: z.string().optional(),
  img: z.string().optional(),
  till: z.coerce.number().int().min(1).optional(),
  server_ip: z.string().optional(),
  pexels_api_key: z.string().optional(),
});

export const settingsUpdateSchema = settingsSchema;

export type SettingsInput = z.infer<typeof settingsSchema>;
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;