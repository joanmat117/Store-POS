import { demoService } from '../services/demoService.js';

export const demoController = {
  async seedDemo(req, res) {
    const result = await demoService.seedDemoData();
    res.json(result);
  },
};
