import { settingsRepo } from '../models/settingsRepo.js';
import type { SettingsDTO, SettingsFormData } from '../types/index.js';

export const settingsService = {
  async getSettings(): Promise<SettingsDTO | null> {
    return settingsRepo.find();
  },
  async updateSettings(data: SettingsFormData): Promise<SettingsDTO | null> {
    return settingsRepo.update(data);
  },
};