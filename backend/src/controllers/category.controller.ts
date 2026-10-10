import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service.js';

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ data: categories });
  } catch (error) {
    next(error);
  }
}
