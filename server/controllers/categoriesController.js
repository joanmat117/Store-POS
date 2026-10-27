import { categoryService } from '../services/categoryService.js';

export const categoriesController = {
  async getCategories(req, res) {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  },
  async getCategoryById(req, res) {
    const category = await categoryService.getCategoryById(parseInt(req.params.categoryId, 10));
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  },
  async createCategory(req, res) {
    const category = await categoryService.createCategory(req.body.name);
    res.json(category);
  },
  async updateCategory(req, res) {
    const category = await categoryService.updateCategory(
      parseInt(req.params.categoryId, 10),
      req.body.name
    );
    res.json(category);
  },
  async deleteCategory(req, res) {
    await categoryService.deleteCategory(parseInt(req.params.categoryId, 10));
    res.sendStatus(200);
  },
};
