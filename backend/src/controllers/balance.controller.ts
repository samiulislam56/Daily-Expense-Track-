import { Request, Response, NextFunction } from 'express';
import { balanceService } from '../services/balance.service.js';
import { config } from '../config/env.js';

function getUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'];
  return (Array.isArray(headerUserId) ? headerUserId[0] : headerUserId) || config.defaultUserId;
}

export async function getBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const summary = await balanceService.getBalanceSummary(userId);
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
}

export async function updateBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const summary = await balanceService.setBalance(userId, req.body);
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
}
