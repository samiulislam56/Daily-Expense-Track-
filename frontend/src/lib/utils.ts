import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Expense } from '../types/index.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer minor units (e.g. 12500) into formatted major currency representation (125.00 BDT)
 */
export function formatCurrency(amountMinor: number, currencyCode: string = 'BDT'): string {
  const major = amountMinor / 100;
  const formatted = major.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currencyCode}`;
}

/**
 * Format integer minor units with BDT symbol (৳1,250.00)
 */
export function formatBDT(amountMinor: number): string {
  const major = amountMinor / 100;
  const formatted = major.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `৳${formatted}`;
}

/**
 * Convert user decimal input string (e.g., "125.50") into integer minor units (12550) safely
 */
export function parseAmountToMinor(input: string | number): number {
  if (typeof input === 'number') {
    return Math.round(input * 100);
  }
  const clean = input.trim().replace(/,/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

/**
 * Format integer minor units to standard decimal string for input fields (e.g. 12500 -> "125.00")
 */
export function formatMinorToDecimalString(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

/**
 * Format YYYY-MM-DD to friendly human readable date
 */
export function formatDateReadable(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Get current system calendar date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current month string in YYYY-MM format
 */
export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Export expenses to CSV (FR-12)
 */
export function exportExpensesToCSV(expenses: Expense[], filenamePrefix: string = 'dailyflow-expenses'): void {
  if (!expenses || expenses.length === 0) {
    alert('No expenses to export.');
    return;
  }

  const headers = ['ID', 'Date', 'Category', 'Amount (Minor)', 'Amount (Formatted)', 'Currency', 'Note', 'Created At'];
  const rows = expenses.map((exp) => [
    `"${exp.id}"`,
    `"${exp.expenseDate}"`,
    `"${exp.category?.name || 'Uncategorized'}"`,
    exp.amountMinor,
    `"${(exp.amountMinor / 100).toFixed(2)}"`,
    `"${exp.currencyCode}"`,
    `"${(exp.note || '').replace(/"/g, '""')}"`,
    `"${exp.createdAt}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filenamePrefix}-${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
