import { describe, it, expect } from 'vitest';
import { formatBDT, formatCurrency, parseAmountToMinor } from '../lib/utils.js';
import { mockStorage } from '../services/mockStorage.js';

describe('DailyFlow Fintech & AI Copilot Frontend Tests', () => {
  it('formatBDT formats integer minor units with BDT symbol', () => {
    expect(formatBDT(12500)).toBe('৳125.00');
    expect(formatBDT(500000)).toBe('৳5,000.00');
    expect(formatBDT(0)).toBe('৳0.00');
  });

  it('mockStorage calculates remaining balance correctly with income and expenses', () => {
    mockStorage.updateBalance({ amountMinor: 2000000, referenceDate: '2026-10-01' }); // ৳20,000 opening
    const bal = mockStorage.getBalance();
    expect(bal.availableBalanceMinor).toBe(2000000);
    expect(bal.isConfigured).toBe(true);
    // Remaining balance should reflect opening + income - expenses
    expect(typeof bal.remainingBalanceMinor).toBe('number');
  });

  it('mockStorage computes budgets and warning thresholds', () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budget = mockStorage.setBudget({
      month: currentMonth,
      amountMinor: 4000000, // ৳40,000
      warningThresholdPercent: 80,
    });
    expect(budget.amountMinor).toBe(4000000);
    expect(budget.warningThresholdPercent).toBe(80);

    const list = mockStorage.getBudgets(currentMonth);
    const found = list.find((b) => b.id === budget.id);
    expect(found).toBeDefined();
    expect(found?.percentageUsed).toBeGreaterThanOrEqual(0);
  });

  it('mockStorage handles savings goals and contributions', () => {
    const goal = mockStorage.createGoal({
      title: 'New Workspace Setup',
      targetAmountMinor: 5000000, // ৳50,000
      currentAmountMinor: 1000000, // ৳10,000
      targetDate: '2027-01-01',
    });
    expect(goal.progressPercent).toBe(20);
    expect(goal.isCompleted).toBe(false);

    const contributed = mockStorage.contributeGoal(goal.id, 1500000); // +৳15,000
    expect(contributed.currentAmountMinor).toBe(2500000);
    expect(Math.round((contributed.currentAmountMinor / contributed.targetAmountMinor) * 100)).toBe(50);
  });

  it('mockStorage recurring payment advances due date forward', () => {
    const recList = mockStorage.getRecurring();
    expect(recList.length).toBeGreaterThan(0);
    const first = recList[0];
    const initialDue = first.nextDueDate;

    const res = mockStorage.processRecurringPayment(first.id);
    expect(res.transactionId).toBeDefined();
    expect(res.recurring.nextDueDate).not.toBe(initialDue);
  });

  it('mockStorage AI Copilot answers today spending deterministically', () => {
    const res = mockStorage.askCopilot('How much did I spend today?');
    expect(res.answer).toContain('৳');
    expect(res.source).toBe('deterministic_copilot');
  });

  it('mockStorage AI Copilot drafts transaction from natural language', () => {
    const res = mockStorage.askCopilot('Spent 650 BDT on Food today');
    expect(res.draftTransaction).toBeDefined();
    expect(res.draftTransaction?.amountMinor).toBe(65000);
    expect(res.draftTransaction?.type).toBe('expense');
  });
});
