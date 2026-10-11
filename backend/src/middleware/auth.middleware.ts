import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/crypto.js';

export interface AuthenticatedUser {
  id: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session expired or invalid token. Please log in again.',
        },
      });
      return;
    }

    req.user = {
      id: payload.sub,
      username: payload.username,
    };
    return next();
  }

  // Backward compatibility fallback strictly for automated integration test suites running in NODE_ENV === 'test'
  if (process.env.NODE_ENV === 'test' && req.headers['x-user-id']) {
    const rawHeader = req.headers['x-user-id'];
    const userId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    req.user = {
      id: userId,
      username: 'test_user',
    };
    return next();
  }

  res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in.',
    },
  });
}
