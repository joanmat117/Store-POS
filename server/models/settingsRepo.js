import { getDb, mapSettings } from '../config/db.js';

export const settingsRepo = {
  find() {
    const row = getDb().prepare('SELECT * FROM settings WHERE id = 1').get();
    return mapSettings(row);
  },
  update(settingsData) {
    const db = getDb();
    const fields = [];
    const values = [];
    const allowed = [
      'app',
      'store',
      'address_one',
      'address_two',
      'contact',
      'tax',
      'symbol',
      'percentage',
      'charge_tax',
      'footer',
      'img',
      'till',
      'server_ip',
      'pexels_api_key',
    ];
    for (const key of allowed) {
      if (settingsData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(settingsData[key]);
      }
    }
    if (!fields.length) return this.find();
    values.push(1);
    db.prepare(`UPDATE settings SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.find();
  },
  mapSettings,
};
