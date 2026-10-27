import { settingsService } from '../services/settingsService.js';

export const settingsController = {
  async getSettings(req, res) {
    const settings = await settingsService.getSettings();
    res.json(settings);
  },
  async updateSettings(req, res) {
    const settings = await settingsService.updateSettings(req.body);
    res.json(settings);
  },
};
