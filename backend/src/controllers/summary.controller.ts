import { Request, Response, NextFunction } from 'express';
import { summaryService } from '../services/summary.service.js';
import { config } from '../config/env.js';

function getUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'];
  return (Array.isArray(headerUserId) ? headerUserId[0] : headerUserId) || config.defaultUserId;
}

export async function getDailySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const date = req.query.date as string;
    const summary = await summaryService.getDailySummary(date, userId);
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
}

export async function getMonthlySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const month = req.query.month as string;
    const summary = await summaryService.getMonthlySummary(month, userId);
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
}

export async function getCategorySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const categories = await summaryService.getCategorySummary(userId, from, to);
    res.status(200).json({ data: categories });
  } catch (error) {
    next(error);
  }
}
