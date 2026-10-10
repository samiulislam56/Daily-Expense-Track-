import { Request, Response, NextFunction } from 'express';
import { recurringService } from '../services/recurring.service.js';
import { config } from '../config/env.js';

function getUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'];
  return (Array.isArray(headerUserId) ? headerUserId[0] : headerUserId) || config.defaultUserId;
}

export async function getRecurring(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const recurring = await recurringService.getRecurring(userId);
    res.status(200).json({ data: recurring });
  } catch (error) {
    next(error);
  }
}

export async function getRecurringById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const item = await recurringService.getRecurringById(req.params.id, userId);
    if (!item) {
      res.status(404).json({ error: 'Recurring payment not found' });
      return;
    }
    res.status(200).json({ data: item });
  } catch (error) {
    next(error);
  }
}

export async function createRecurring(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const item = await recurringService.createRecurring(userId, req.body);
    res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
}

export async function updateRecurring(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const item = await recurringService.updateRecurring(req.params.id, userId, req.body);
    if (!item) {
      res.status(404).json({ error: 'Recurring payment not found' });
      return;
    }
    res.status(200).json({ data: item });
  } catch (error) {
    next(error);
  }
}

export async function processPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const result = await recurringService.processPayment(req.params.id, userId);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteRecurring(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const deleted = await recurringService.deleteRecurring(req.params.id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Recurring payment not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
