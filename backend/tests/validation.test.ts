import { describe, it, expect } from 'vitest';
import {
  createExpenseSchema,
  isValidCalendarDate,
  expenseQuerySchema,
} from '../src/schemas/expense.schema.js';

describe('Expense Validation Rules (SRS 4.1)', () => {
  it('validates correct calendar dates and rejects invalid leap years / month boundaries', () => {
    expect(isValidCalendarDate('2026-10-10')).toBe(true);
    expect(isValidCalendarDate('2024-02-29')).toBe(true); // Valid leap year
    expect(isValidCalendarDate('2023-02-29')).toBe(false); // Invalid leap year
    expect(isValidCalendarDate('2026-04-31')).toBe(false); // April has 30 days
    expect(isValidCalendarDate('2026-13-01')).toBe(false); // Month 13
    expect(isValidCalendarDate('invalid-date')).toBe(false);
  });

  it('accepts valid expense inputs', () => {
    const validData = {
      amountMinor: 12500,
      currencyCode: 'BDT',
      categoryId: '11111111-1111-1111-1111-111111111101',
      expenseDate: '2026-10-10',
      note: 'Lunch at Cafe',
    };
    const parsed = createExpenseSchema.parse(validData);
    expect(parsed.amountMinor).toBe(12500);
    expect(parsed.currencyCode).toBe('BDT');
    expect(parsed.note).toBe('Lunch at Cafe');
  });

  it('rejects zero, negative, floating point, and NaN amounts', () => {
    const base = {
      categoryId: '11111111-1111-1111-1111-111111111101',
      expenseDate: '2026-10-10',
    };

    expect(() => createExpenseSchema.parse({ ...base, amountMinor: 0 })).toThrow();
    expect(() => createExpenseSchema.parse({ ...base, amountMinor: -500 })).toThrow();
    expect(() => createExpenseSchema.parse({ ...base, amountMinor: 12.5 })).toThrow();
    expect(() => createExpenseSchema.parse({ ...base, amountMinor: NaN })).toThrow();
  });

  it('enforces maximum note length of 500 characters', () => {
    const longNote = 'a'.repeat(501);
    const validData = {
      amountMinor: 1000,
      categoryId: '11111111-1111-1111-1111-111111111101',
      expenseDate: '2026-10-10',
      note: longNote,
    };
    expect(() => createExpenseSchema.parse(validData)).toThrow(/500 characters/);
  });

  it('validates query filter pagination limits', () => {
    const parsed = expenseQuerySchema.parse({ page: '2', pageSize: '50' });
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(50);

    expect(() => expenseQuerySchema.parse({ page: '0' })).toThrow();
    expect(() => expenseQuerySchema.parse({ pageSize: '200' })).toThrow();
  });
});
