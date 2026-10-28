import { Request, Response } from 'express';
import { demoService } from '../services/demoService.js';

export const demoController = {
  async seedDemo(req: Request, res: Response): Promise<void> {
    const result = await demoService.seedDemoData();
    res.json(result);
  },
};