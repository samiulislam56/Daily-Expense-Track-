import { ZodError } from 'zod';
import { config } from '../config/env.js';
export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}
export class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
export class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT');
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required. Please log in.') {
        super(message, 401, 'UNAUTHORIZED');
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to access this resource.') {
        super(message, 403, 'FORBIDDEN');
    }
}
export function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please check the submitted fields.',
                details,
            },
        });
        return;
    }
    // Handle known AppError
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                ...(err.details ? { details: err.details } : {}),
            },
        });
        return;
    }
    // Handle Postgres unique constraint violation
    if (err?.code === '23505') {
        res.status(409).json({
            error: {
                code: 'CONFLICT',
                message: 'A record with these details already exists.',
            },
        });
        return;
    }
    // Unexpected errors
    if (config.nodeEnv !== 'test') {
        console.error('Unhandled server error:', err);
    }
    res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected internal error occurred. Please try again later.',
        },
    });
}
