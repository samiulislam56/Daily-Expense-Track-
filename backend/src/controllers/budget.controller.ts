import { Request, Response, NextFunction } from 'express';
import { budgetService } from '../services/budget.service.js';
import { config } from '../config/env.js';

function getUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'];
  return (Array.isArray(headerUserId) ? headerUserId[0] : headerUserId) || config.defaultUserId;
}

export async function getBudgets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const month = typeof req.query.month === 'string' ? req.query.month : undefined;
    const budgets = await budgetService.getBudgets(userId, month);
    res.status(200).json({ data: budgets });
  } catch (error) {
    next(error);
  }
}

export async function setBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const budget = await budgetService.upsertBudget(userId, req.body);
    res.status(200).json({ data: budget });
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const deleted = await budgetService.deleteBudget(req.params.id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
