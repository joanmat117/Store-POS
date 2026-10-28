import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService.js';
import type { CategoryDTO } from '../types/index.js';

function getCategoryIdParam(req: Request): number {
  return parseInt(String(req.params.categoryId), 10);
}

export const categoriesController = {
  async getCategories(req: Request, res: Response): Promise<void> {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  },
  async getCategoryById(req: Request, res: Response): Promise<void> {
    const category = await categoryService.getCategoryById(getCategoryIdParam(req));
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(category);
  },
  async createCategory(req: Request, res: Response): Promise<void> {
    const category = await categoryService.createCategory(req.body.name);
    res.json(category);
  },
  async updateCategory(req: Request, res: Response): Promise<void> {
    const category = await categoryService.updateCategory(getCategoryIdParam(req), req.body.name);
    res.json(category);
  },
  async deleteCategory(req: Request, res: Response): Promise<void> {
    await categoryService.deleteCategory(getCategoryIdParam(req));
    res.sendStatus(200);
  },
};