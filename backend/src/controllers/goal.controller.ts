import { Request, Response, NextFunction } from 'express';
import { goalService } from '../services/goal.service.js';
function getUserId(req: Request): string {
  return req.user!.id;
}

export async function getGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const goals = await goalService.getGoals(userId);
    res.status(200).json({ data: goals });
  } catch (error) {
    next(error);
  }
}

export async function getGoalById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const goal = await goalService.getGoalById(req.params.id, userId);
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.status(200).json({ data: goal });
  } catch (error) {
    next(error);
  }
}

export async function createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const goal = await goalService.createGoal(userId, req.body);
    res.status(201).json({ data: goal });
  } catch (error) {
    next(error);
  }
}

export async function updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const goal = await goalService.updateGoal(req.params.id, userId, req.body);
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.status(200).json({ data: goal });
  } catch (error) {
    next(error);
  }
}

export async function contributeGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const amountMinor = req.body.amountMinor;
    const goal = await goalService.contribute(req.params.id, userId, amountMinor);
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.status(200).json({ data: goal });
  } catch (error) {
    next(error);
  }
}

export async function deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const deleted = await goalService.deleteGoal(req.params.id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
