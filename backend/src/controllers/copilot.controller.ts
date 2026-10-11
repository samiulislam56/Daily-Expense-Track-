import { Request, Response, NextFunction } from 'express';
import { copilotService } from '../services/copilot.service.js';
function getUserId(req: Request): string {
  return req.user!.id;
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
