import { categoryService } from '../services/category.service.js';
export async function listCategories(req, res, next) {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json({ data: categories });
    }
    catch (error) {
        next(error);
    }
}
