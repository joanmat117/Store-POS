import { categoryRepo } from '../models/categoryRepo.js';

export const categoryService = {
  async getAllCategories() {
    return categoryRepo.findAll();
  },
  async getCategoryById(id) {
    return categoryRepo.findById(id);
  },
  async createCategory(name) {
    return categoryRepo.create(name);
  },
  async updateCategory(id, name) {
    return categoryRepo.update(id, name);
  },
  async deleteCategory(id) {
    return categoryRepo.delete(id);
  },
};
