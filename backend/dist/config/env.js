import dotenv from 'dotenv';
// Load .env file
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    databaseUrl: process.env.DATABASE_URL || 'memory://dailyflow',
    logLevel: process.env.LOG_LEVEL || 'info',
    defaultUserId: '00000000-0000-0000-0000-000000000001',
};
