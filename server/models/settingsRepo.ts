import { getDb } from '../db/index.js';
import { settings } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import type { SettingsRow, SettingsDTO, SettingsFormData } from '../types/index.js';

function mapSettings(row: SettingsRow | undefined): SettingsDTO | null {
  if (!row) return null;
  return {
    _id: 1,
    settings: {
      app: row.app,
      store: row.store,
      address_one: row.address_one,
      address_two: row.address_two,
      contact: row.contact,
      tax: row.tax,
      symbol: row.symbol,
      percentage: row.percentage,
      charge_tax: !!row.charge_tax,
      footer: row.footer,
      img: row.img,
      till: row.till,
      ip: row.server_ip,
      pexels_api_key: row.pexels_api_key || '',
    },
  };
}

const ALLOWED_SETTINGS_FIELDS = [
  'app', 'store', 'address_one', 'address_two', 'contact', 'tax', 'symbol',
  'percentage', 'charge_tax', 'footer', 'img', 'till', 'server_ip', 'pexels_api_key',
] as const;

export const settingsRepo = {
  async find(): Promise<SettingsDTO | null> {
    const result = await getDb().select().from(settings).where(eq(settings.id, 1)).limit(1);
    return mapSettings(result[0]);
  },
  async update(settingsData: SettingsFormData): Promise<SettingsDTO | null> {
    const updateData: Partial<SettingsRow> = {};
    for (const key of ALLOWED_SETTINGS_FIELDS) {
      const value = settingsData[key as keyof SettingsFormData];
      if (value !== undefined) {
        (updateData as Record<string, unknown>)[key] = value;
      }
    }
    if (Object.keys(updateData).length === 0) return this.find();
    await getDb().update(settings).set(updateData).where(eq(settings.id, 1));
    return this.find();
  },
  mapSettings,
};