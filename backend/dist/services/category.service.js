import { categoryRepository } from '../repositories/category.repository.js';
export class CategoryService {
    async getAllCategories() {
        return categoryRepository.findAll();
    }
    async getCategoryById(id) {
        return categoryRepository.findById(id);
    }
}
export const categoryService = new CategoryService();
