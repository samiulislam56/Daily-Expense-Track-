import { categoryRepository, CategoryDTO } from '../repositories/category.repository.js';

export class CategoryService {
  async getAllCategories(): Promise<CategoryDTO[]> {
    return categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<CategoryDTO | null> {
    return categoryRepository.findById(id);
  }
}

export const categoryService = new CategoryService();
