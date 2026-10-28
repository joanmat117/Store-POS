import { getDb } from '../config/db.js';
import type { SettingsRow, SettingsDTO, SettingsFormData } from '../types/index.js';
import { mapSettings } from '../config/db.js';

export const settingsRepo = {
  find(): SettingsDTO | null {
    const row = getDb().prepare('SELECT * FROM settings WHERE id = 1').get() as SettingsRow | undefined;
    return mapSettings(row);
  },
  update(settingsData: SettingsFormData): SettingsDTO | null {
    const dbInstance = getDb();
    const fields: string[] = [];
    const values: unknown[] = [];
    const allowed = ['app', 'store', 'address_one', 'address_two', 'contact', 'tax', 'symbol', 'percentage', 'charge_tax', 'footer', 'img', 'till', 'server_ip', 'pexels_api_key'];
    for (const key of allowed) {
      if (settingsData[key as keyof SettingsFormData] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(settingsData[key as keyof SettingsFormData]);
      }
    }
    if (!fields.length) return this.find();
    values.push(1);
    dbInstance.prepare(`UPDATE settings SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.find();
  },
  mapSettings,
};