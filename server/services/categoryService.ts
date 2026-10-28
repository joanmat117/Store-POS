import { categoryRepo } from '../models/categoryRepo.js';
import type { CategoryDTO, CategoryFormData } from '../types/index.js';

export const categoryService = {
  async getAllCategories(): Promise<CategoryDTO[]> {
    return categoryRepo.findAll();
  },
  async getCategoryById(id: number): Promise<CategoryDTO | null> {
    return categoryRepo.findById(id);
  },
  async createCategory(name: string): Promise<CategoryDTO> {
    return categoryRepo.create(name);
  },
  async updateCategory(id: number, name: string): Promise<CategoryDTO | null> {
    return categoryRepo.update(id, name);
  },
  async deleteCategory(id: number): Promise<{ changes: number }> {
    return categoryRepo.delete(id);
  },
};