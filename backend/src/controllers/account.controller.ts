import { Request, Response, NextFunction } from 'express';
import { accountService } from '../services/account.service.js';
import { config } from '../config/env.js';

function getUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'];
  return (Array.isArray(headerUserId) ? headerUserId[0] : headerUserId) || config.defaultUserId;
}

export async function getAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const accounts = await accountService.getAccounts(userId);
    res.status(200).json({ data: accounts });
  } catch (error) {
    next(error);
  }
}

export async function getAccountById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const account = await accountService.getAccountById(req.params.id, userId);
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.status(200).json({ data: account });
  } catch (error) {
    next(error);
  }
}

export async function createAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const account = await accountService.createAccount(userId, req.body);
    res.status(201).json({ data: account });
  } catch (error) {
    next(error);
  }
}

export async function updateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const account = await accountService.updateAccount(req.params.id, userId, req.body);
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.status(200).json({ data: account });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = getUserId(req);
    const deleted = await accountService.deleteAccount(req.params.id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
