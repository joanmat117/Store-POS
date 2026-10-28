import { Request, Response } from 'express';
import { settingsService } from '../services/settingsService.js';
import type { SettingsDTO } from '../types/index.js';

export const settingsController = {
  async getSettings(req: Request, res: Response): Promise<void> {
    const settings = await settingsService.getSettings();
    res.json(settings);
  },
  async updateSettings(req: Request, res: Response): Promise<void> {
    const settings = await settingsService.updateSettings(req.body);
    res.json(settings);
  },
};