import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const user = await authService.getMe(userId);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  // Stateless JWT tokens are cleared on the client side
  res.status(200).json({ data: { message: 'Logged out successfully' } });
}
