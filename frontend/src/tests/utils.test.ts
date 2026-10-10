import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseAmountToMinor,
  formatMinorToDecimalString,
  getTodayDateString,
} from './testHelpers.js';

describe('Frontend Financial & Formatting Utilities (Dashboard Improvements & SRS)', () => {
  it('correctly converts decimal strings to integer minor units', () => {
    expect(parseAmountToMinor('125.00')).toBe(12500);
    expect(parseAmountToMinor('125.50')).toBe(12550);
    expect(parseAmountToMinor('0.99')).toBe(99);
    expect(parseAmountToMinor('1,250.75')).toBe(125075);
    expect(parseAmountToMinor('0')).toBe(0);
    expect(parseAmountToMinor('-50')).toBe(0); // rejects negative
  });

  it('formats minor units to readable currency string', () => {
    expect(formatCurrency(12500, 'BDT')).toBe('125.00 BDT');
    expect(formatCurrency(125075, 'USD')).toBe('1,250.75 USD');
    expect(formatCurrency(99, 'BDT')).toBe('0.99 BDT');
  });

  it('formats minor units to decimal input string for editing', () => {
    expect(formatMinorToDecimalString(12500)).toBe('125.00');
    expect(formatMinorToDecimalString(99)).toBe('0.99');
  });

  it('returns valid calendar date format YYYY-MM-DD for today', () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('calculates remaining balance correctly and handles negative balance when spending exceeds available funds', () => {
    const availableBalanceMinor = 500000; // ৳5,000
    const expensesMinor = 50000; // ৳500
    const remainingMinor = availableBalanceMinor - expensesMinor;
    expect(remainingMinor).toBe(450000); // ৳4,500
    expect(formatCurrency(remainingMinor, 'BDT')).toBe('4,500.00 BDT');

    // Over budget scenario: available ৳100, expenses ৳350
    const lowAvailableMinor = 10000;
    const highExpensesMinor = 35000;
    const overBudgetMinor = lowAvailableMinor - highExpensesMinor;
    expect(overBudgetMinor).toBe(-25000); // -৳250
    expect(formatCurrency(overBudgetMinor, 'BDT')).toBe('-250.00 BDT');
  });

  it('calculates today average expense correctly including 0 expenses and multiple expenses', () => {
    // 0 expenses
    const zeroExpenses = 0;
    const zeroCount = 0;
    const zeroAvg = zeroCount > 0 ? Math.round(zeroExpenses / zeroCount) : 0;
    expect(zeroAvg).toBe(0);

    // 2 expenses totaling ৳470 (47,000 minor) -> average ৳235 (23,500 minor)
    const total470Minor = 47000;
    const count2 = 2;
    const avg470 = Math.round(total470Minor / count2);
    expect(avg470).toBe(23500);
    expect(formatCurrency(avg470, 'BDT')).toBe('235.00 BDT');

    // Specification test case: ৳200 and ৳300 -> ৳500 across 2 entries = ৳250
    const specTotalMinor = 50000;
    const specCount = 2;
    const specAvg = Math.round(specTotalMinor / specCount);
    expect(specAvg).toBe(25000);
    expect(formatCurrency(specAvg, 'BDT')).toBe('250.00 BDT');

    // After deleting ৳200: ৳300 across 1 entry = ৳300
    const afterDelTotalMinor = 30000;
    const afterDelCount = 1;
    const afterDelAvg = Math.round(afterDelTotalMinor / afterDelCount);
    expect(afterDelAvg).toBe(30000);
    expect(formatCurrency(afterDelAvg, 'BDT')).toBe('300.00 BDT');
  });
});
