import { z } from 'zod';
import { isValidCalendarDate } from './expense.schema.js';

const monthRegex = /^\d{4}-(?:0[1-9]|1[0-2])$/;

export const dailySummaryQuerySchema = z.object({
  date: z
    .string({ required_error: 'Date query parameter is required' })
    .refine(isValidCalendarDate, {
      message: 'Date must be a valid calendar date in YYYY-MM-DD format',
    }),
});

export const monthlySummaryQuerySchema = z.object({
  month: z
    .string({ required_error: 'Month query parameter is required' })
    .regex(monthRegex, 'Month must be in YYYY-MM format'),
});

export const categorySummaryQuerySchema = z.object({
  from: z
    .string()
    .refine(isValidCalendarDate, {
      message: 'From date must be a valid calendar date in YYYY-MM-DD format',
    })
    .optional(),
  to: z
    .string()
    .refine(isValidCalendarDate, {
      message: 'To date must be a valid calendar date in YYYY-MM-DD format',
    })
    .optional(),
});

export type DailySummaryQuery = z.infer<typeof dailySummaryQuerySchema>;
export type MonthlySummaryQuery = z.infer<typeof monthlySummaryQuerySchema>;
export type CategorySummaryQuery = z.infer<typeof categorySummaryQuerySchema>;
