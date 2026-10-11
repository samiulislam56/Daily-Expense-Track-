import { z } from 'zod';
import { isValidCalendarDate } from './expense.schema.js';
export const updateBalanceSchema = z.object({
    amountMinor: z
        .number({
        required_error: 'Balance amount is required',
        invalid_type_error: 'Amount must be an integer number of minor units',
    })
        .int('Amount must be a whole integer in minor units')
        .min(0, 'Balance must be zero or a positive amount')
        .max(999_999_999_999, 'Amount exceeds maximum supported limit'),
    currencyCode: z
        .string()
        .trim()
        .regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter ISO code')
        .default('BDT'),
    referenceDate: z
        .string()
        .refine(isValidCalendarDate, {
        message: 'Reference date must be a valid calendar date in YYYY-MM-DD format',
    })
        .optional(),
});
