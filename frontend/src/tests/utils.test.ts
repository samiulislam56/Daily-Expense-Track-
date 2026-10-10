import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseAmountToMinor,
  formatMinorToDecimalString,
  getTodayDateString,
  isValidCalendarDateHelper,
} from './testHelpers.js';

describe('Frontend Financial & Formatting Utilities (SRS 4.1 & 11)', () => {
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
});
