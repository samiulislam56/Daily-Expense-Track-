import { describe, it, expect } from 'vitest';
import {
  calculateSafeToSpend,
  calculateCashFlowForecast,
  simulateWhatIfScenario,
  generateWeeklyMoneyCheckin,
} from '../lib/fintech.js';
import {
  parseBanglaDigits,
  parseNaturalLanguageTransaction,
} from '../lib/banglaParser.js';

describe('DailyFlow 2.0 — Safe-to-Spend Deterministic Engine', () => {
  it('calculates safe funds and daily limit with standard verified balance and commitments', () => {
    const res = calculateSafeToSpend({
      currentBalanceMinor: 2500000, // ৳25,000
      upcomingBillsMinor: 500000,    // ৳5,000
      savingsCommitmentsMinor: 300000,// ৳3,000
      emergencyBufferMinor: 300000,   // ৳3,000
      daysUntilIncome: 14,
    });

    // Committed: 5,000 + 3,000 + 3,000 = ৳11,000 (1,100,000 poisha)
    // Safe funds: 25,000 - 11,000 = ৳14,000 (1,400,000 poisha)
    // Daily safe: 14,000 / 14 = ৳1,000/day (100,000 poisha)
    expect(res.safeFundsMinor).toBe(1400000);
    expect(res.dailySafeToSpendMinor).toBe(100000);
    expect(res.status).toBe('comfortable');
    expect(res.explanationEn).toContain('1000');
    expect(res.explanationBn).toContain('1000');
  });

  it('clamps daily limit to 0 when commitments exceed verified balance (deficit)', () => {
    const res = calculateSafeToSpend({
      currentBalanceMinor: 500000,  // ৳5,000
      upcomingBillsMinor: 600000,   // ৳6,000
      savingsCommitmentsMinor: 200000,// ৳2,000
      emergencyBufferMinor: 200000, // ৳2,000
      daysUntilIncome: 10,
    });

    // Committed: ৳10,000
    // Safe funds: 5,000 - 10,000 = -৳5,000 (-500,000 poisha)
    expect(res.safeFundsMinor).toBe(-500000);
    expect(res.dailySafeToSpendMinor).toBe(0);
    expect(res.status).toBe('critical');
    expect(res.explanationEn).toContain('exceed current liquid funds');
    expect(res.explanationBn).toContain('অনাবশ্যক');
  });

  it('handles zero or negative days safely without division by zero', () => {
    const res = calculateSafeToSpend({
      currentBalanceMinor: 1000000,
      upcomingBillsMinor: 100000,
      savingsCommitmentsMinor: 100000,
      emergencyBufferMinor: 100000,
      daysUntilIncome: 0,
    });

    expect(res.safeFundsMinor).toBe(700000);
    expect(res.dailySafeToSpendMinor).toBe(700000); // Math.max(1, 0) => 1 day
  });
});

describe('DailyFlow 2.0 — Smart Money Forecast (Cash-flow Trajectory)', () => {
  it('generates a 7-day cash-flow forecast deducting daily discretionary burn', () => {
    const forecast = calculateCashFlowForecast({
      startBalanceMinor: 1000000, // ৳10,000
      startDate: '2026-10-15',
      daysCount: 7,
      dailyDiscretionaryBurnMinor: 50000, // ৳500/day
      scheduledEvents: [],
      emergencyBufferMinor: 200000, // ৳2,000
    });

    expect(forecast.points.length).toBe(7);
    // Day 1: 10,000 - 500 = ৳9,500
    expect(forecast.points[0].projectedBalanceMinor).toBe(950000);
    // Day 7: 10,000 - (7 * 500) = ৳6,500
    expect(forecast.endBalanceMinor).toBe(650000);
    expect(forecast.lowBalanceHazardDate).toBeNull();
  });

  it('integrates scheduled bills and detects low-balance hazard if dipping below cushion', () => {
    const forecast = calculateCashFlowForecast({
      startBalanceMinor: 500000, // ৳5,000
      startDate: '2026-10-15',
      daysCount: 7,
      dailyDiscretionaryBurnMinor: 40000, // ৳400/day
      scheduledEvents: [
        {
          date: '2026-10-17',
          amountMinor: 300000, // ৳3,000 rent or utility bill
          title: 'House Rent',
          type: 'expense',
        },
      ],
      emergencyBufferMinor: 200000, // ৳2,000 cushion
    });

    expect(forecast.lowBalanceHazardDate).toBe('2026-10-17');
    expect(forecast.minBalanceMinor).toBeLessThan(200000);
  });

  it('incorporates scheduled income inflows replenishing balance', () => {
    const forecast = calculateCashFlowForecast({
      startBalanceMinor: 200000, // ৳2,000
      startDate: '2026-10-15',
      daysCount: 7,
      dailyDiscretionaryBurnMinor: 20000, // ৳200/day
      scheduledEvents: [
        {
          date: '2026-10-18',
          amountMinor: 2500000, // +৳25,000 salary
          title: 'Salary Deposit',
          type: 'income',
        },
      ],
      emergencyBufferMinor: 100000,
    });

    expect(forecast.totalIncomeMinor).toBe(2500000);
    expect(forecast.endBalanceMinor).toBeGreaterThan(2000000);
  });
});

describe('DailyFlow 2.0 — What-If Simulator (Zero-Risk Sandbox)', () => {
  it('simulates discretionary spending reduction and outputs positive delta', () => {
    const result = simulateWhatIfScenario({
      currentBalanceMinor: 2000000, // ৳20,000
      daysUntilIncome: 30,
      dailyDiscretionaryBurnMinor: 60000, // ৳600/day
      upcomingBillsMinor: 400000,
      savingsCommitmentsMinor: 200000,
      emergencyBufferMinor: 300000,
      scenario: {
        type: 'reduce_discretionary',
        titleEn: 'Cut tea & snacks by ৳150/day',
        titleBn: 'প্রতিদিন নাশতা খরচ ৳১৫০ কমানো',
        dailyReductionMinor: 15000, // ৳150/day
      },
    });

    expect(result.deltaEndBalanceMinor).toBeGreaterThan(0);
    expect(result.impactVerdictEn).toContain('150');
    expect(result.impactVerdictBn).toContain('150');
  });

  it('simulates adding a monthly subscription and computes negative delta', () => {
    const result = simulateWhatIfScenario({
      currentBalanceMinor: 1500000,
      daysUntilIncome: 30,
      dailyDiscretionaryBurnMinor: 30000,
      upcomingBillsMinor: 200000,
      savingsCommitmentsMinor: 100000,
      emergencyBufferMinor: 200000,
      scenario: {
        type: 'add_subscription',
        titleEn: 'Netflix subscription',
        titleBn: 'নেটফ্লিক্স সাবস্ক্রিপশন',
        monthlySubscriptionMinor: 120000, // ৳1,200
      },
    });

    expect(result.deltaDailySafeMinor).toBeLessThan(0);
    expect(result.impactVerdictEn).toContain('1200');
  });
});

describe('DailyFlow 2.0 — Weekly Money Check-in Engine', () => {
  it('summarizes weekly finances with top category and compassionate tips', () => {
    const checkin = generateWeeklyMoneyCheckin({
      expensesThisWeek: [
        { amountMinor: 45000, categoryName: 'Food & Groceries', type: 'expense' },
        { amountMinor: 25000, categoryName: 'Transport', type: 'expense' },
        { amountMinor: 30000, categoryName: 'Food & Groceries', type: 'expense' },
      ],
      totalIncomeThisWeekMinor: 200000, // ৳2,000 income
      monthlyBudgetOverall: { amountMinor: 4000000, spentMinor: 2000000 },
      upcomingBillsNext7Days: [{ amountMinor: 150000, title: 'Electricity Bill' }],
    });

    expect(checkin.totalExpenseMinor).toBe(100000); // ৳1,000 total expense
    expect(checkin.totalIncomeMinor).toBe(200000);
    expect(checkin.netSavingsMinor).toBe(100000);
    expect(checkin.savingsRatePercent).toBe(50);
    expect(checkin.topCategoryName).toBe('Food & Groceries');
    expect(checkin.topCategoryAmountMinor).toBe(75000); // 450 + 300 = ৳750 (75%)
    expect(checkin.topCategoryPercent).toBe(75);
    expect(checkin.actionableTipEn).toBeTruthy();
    expect(checkin.actionableTipBn).toBeTruthy();
  });
});

describe('DailyFlow 2.0 — Bangla Digits & Natural Language Parser', () => {
  it('converts Bengali numerals (০-৯) to ASCII digits (0-9)', () => {
    expect(parseBanglaDigits('১২৫০')).toBe('1250');
    expect(parseBanglaDigits('৳৫,০০০')).toBe('৳5,000');
    expect(parseBanglaDigits('০১৭')).toBe('017');
    expect(parseBanglaDigits('Already English 123')).toBe('Already English 123');
  });

  it('parses natural language expense in Bangla (খাবার ও রেস্টুরেন্ট)', () => {
    const draft = parseNaturalLanguageTransaction('দুপুরের খাবার ১৫০ টাকা');
    expect(draft).not.toBeNull();
    expect(draft?.type).toBe('expense');
    expect(draft?.amountMinor).toBe(15000); // ৳150
    expect(draft?.categoryName).toContain('Food');
  });

  it('parses natural language expense with Bengali numerals (রিকশা ৫০)', () => {
    const draft = parseNaturalLanguageTransaction('রিকশা ভাড়া ৫০');
    expect(draft).not.toBeNull();
    expect(draft?.type).toBe('expense');
    expect(draft?.amountMinor).toBe(5000); // ৳50
    expect(draft?.categoryName).toContain('Transport');
  });

  it('parses utility bill natural language (বিদ্যুৎ বিল ১২০০ টাকা)', () => {
    const draft = parseNaturalLanguageTransaction('বিদ্যুৎ বিল ১২০০ টাকা');
    expect(draft).not.toBeNull();
    expect(draft?.type).toBe('expense');
    expect(draft?.amountMinor).toBe(120000); // ৳1,200
    expect(draft?.categoryName).toContain('Bills');
  });

  it('parses income inflow natural language (টিউশনি ফি ৫০০০)', () => {
    const draft = parseNaturalLanguageTransaction('টিউশনি ফি ৫০০০ টাকা পেলাম');
    expect(draft).not.toBeNull();
    expect(draft?.type).toBe('income');
    expect(draft?.amountMinor).toBe(500000); // ৳5,000
    expect(draft?.categoryName).toContain('Income');
  });
});
