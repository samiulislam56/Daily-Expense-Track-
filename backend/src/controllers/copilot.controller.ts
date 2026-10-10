import { Request, Response, NextFunction } from 'express';
import { copilotService } from '../services/copilot.service.js';
import { config } from '../config/env.js';

function getUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'];
  return (Array.isArray(headerUserId) ? headerUserId[0] : headerUserId) || config.defaultUserId;
}

export async function askCopilot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const result = await copilotService.processQuery(userId, query.trim());
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}
