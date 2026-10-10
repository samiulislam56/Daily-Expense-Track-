import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import healthRoutes from './routes/health.routes.js';
import apiRouter from './routes/index.js';
import { runSeed } from './migrations/seed.js';

export const app = express();

// Security and CORS
const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not permitted by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-User-Id'],
  })
);

// Standard body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Tracking & Logging Middleware
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Health Endpoint
app.use(healthRoutes);

// API v1 Endpoints
app.use('/api/v1', apiRouter);

// Central Error Handling
app.use(errorHandler);

// Server startup helper
export async function startServer(): Promise<void> {
  try {
    // Run migrations & deterministic seeds
    await runSeed();

    app.listen(config.port, () => {
      console.log(`=========================================`);
      console.log(` DailyFlow API running on port ${config.port}`);
      console.log(` Environment: ${config.nodeEnv}`);
      console.log(` Database: ${config.databaseUrl}`);
      console.log(` Health check: http://localhost:${config.port}/health`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
}

// Start if executed directly
if (process.argv[1] && /server\.(ts|js)$/.test(process.argv[1])) {
  startServer();
}
