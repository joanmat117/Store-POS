import { settingsRepo } from '../models/settingsRepo.js';

export const settingsService = {
  async getSettings() {
    return settingsRepo.find();
  },
  async updateSettings(data) {
    return settingsRepo.update(data);
  },
};
