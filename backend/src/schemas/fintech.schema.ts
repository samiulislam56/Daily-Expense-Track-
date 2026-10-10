import { z } from 'zod';
import { uuidSchema, isValidCalendarDate } from './expense.schema.js';

// Account Schemas
export const createAccountSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required').max(100),
  type: z.enum(['cash', 'bank', 'mobile_wallet', 'other']).default('cash'),
  balanceMinor: z.number().int().default(0),
  currencyCode: z.string().trim().regex(/^[A-Z]{3}$/).default('BDT'),
  isDefault: z.boolean().default(false),
});

export const updateAccountSchema = createAccountSchema.partial();

// Budget Schemas
export const setBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'),
  categoryId: uuidSchema.optional().nullable(),
  amountMinor: z.number().int().positive('Budget amount must be greater than zero'),
  warningThresholdPercent: z.number().int().min(1).max(100).default(80),
});

// Savings Goal Schemas
export const createGoalSchema = z.object({
  title: z.string().trim().min(1, 'Goal title is required').max(255),
  targetAmountMinor: z.number().int().positive('Target amount must be greater than zero'),
  currentAmountMinor: z.number().int().min(0).default(0),
  targetDate: z.string().refine(isValidCalendarDate, 'Target date must be valid YYYY-MM-DD'),
  categoryId: uuidSchema.optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const contributeGoalSchema = z.object({
  amountMinor: z.number().int().positive('Contribution must be greater than zero'),
});

// Recurring Transaction Schemas
export const createRecurringSchema = z.object({
  type: z.enum(['expense', 'income']).default('expense'),
  amountMinor: z.number().int().positive('Amount must be greater than zero'),
  categoryId: uuidSchema,
  accountId: uuidSchema.optional().nullable(),
  frequency: z.enum(['weekly', 'monthly']).default('monthly'),
  nextDueDate: z.string().refine(isValidCalendarDate, 'Next due date must be valid YYYY-MM-DD'),
  note: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateRecurringSchema = createRecurringSchema.partial();
