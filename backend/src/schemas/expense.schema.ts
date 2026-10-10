import { z } from 'zod';

const dateRegex = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

export const isValidCalendarDate = (dateStr: string): boolean => {
  if (!dateRegex.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
};

const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
export const uuidSchema = z.string().regex(uuidPattern, 'Must be a valid UUID format');

export const createExpenseSchema = z.object({
  amountMinor: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be an integer number of minor units',
    })
    .int('Amount must be a whole integer in minor units')
    .positive('Amount must be greater than zero')
    .max(999_999_999_999, 'Amount exceeds maximum supported limit'),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter ISO code')
    .default('BDT'),
  categoryId: uuidSchema,
  expenseDate: z
    .string({ required_error: 'Expense date is required' })
    .refine(isValidCalendarDate, {
      message: 'Expense date must be a valid calendar date in YYYY-MM-DD format',
    }),
  note: z
    .string()
    .trim()
    .max(500, 'Note cannot exceed 500 characters')
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? undefined : val)),
  type: z.enum(['expense', 'income', 'adjustment']).default('expense'),
  accountId: uuidSchema.optional().nullable(),
  tags: z.string().trim().max(255).optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseQuerySchema = z.object({
  from: z
    .string()
    .refine(isValidCalendarDate, { message: 'From date must be a valid YYYY-MM-DD' })
    .optional(),
  to: z
    .string()
    .refine(isValidCalendarDate, { message: 'To date must be a valid YYYY-MM-DD' })
    .optional(),
  categoryId: uuidSchema.optional(),
  type: z.enum(['expense', 'income', 'adjustment']).optional(),
  accountId: uuidSchema.optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
