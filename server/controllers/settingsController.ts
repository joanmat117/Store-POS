import { Request, Response } from 'express';
import { settingsService } from '../services/settingsService.js';
import type { SettingsDTO, SettingsInput } from '../types/index.js';

export const settingsController = {
  async getSettings(req: Request, res: Response): Promise<void> {
    const settings = await settingsService.getSettings();
    res.json(settings);
  },
  async updateSettings(req: Request, res: Response): Promise<void> {
    const settingsData = req.validated as SettingsInput;
    const settings = await settingsService.updateSettings(settingsData);
    res.json(settings);
  },
};