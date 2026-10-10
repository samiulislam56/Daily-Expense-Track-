import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    if (config.logLevel !== 'silent') {
      console.log(JSON.stringify(logData));
    }
  });

  next();
}
