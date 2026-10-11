import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { runSeed, DEFAULT_CATEGORIES } from '../src/migrations/seed.js';
import { generateToken } from '../src/utils/crypto.js';
import { config } from '../src/config/env.js';

describe('DailyFlow Fintech Upgrade & AI Copilot Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    await runSeed();
    authToken = generateToken({ sub: config.defaultUserId, username: 'demo_user' });
  });

  let createdAccountId: string;

  it('GET /api/v1/accounts returns default seeded accounts', async () => {
    const res = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    const bkash = res.body.data.find((a: any) => a.type === 'mobile_wallet');
    expect(bkash).toBeDefined();
    expect(bkash.name).toContain('bKash');
  });

  it('POST /api/v1/accounts creates a custom bank account', async () => {
    const res = await request(app)
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'City Bank Amex',
        type: 'bank',
        balanceMinor: 5000000,
        currencyCode: 'BDT',
        isDefault: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('City Bank Amex');
    createdAccountId = res.body.data.id;
  });

  it('POST /api/v1/expenses with type=income increases remaining balance correctly', async () => {
    const testDate = '2029-01-01';

    // Establish opening balance of ৳10,000 (1,000,000 minor)
    await request(app)
      .put('/api/v1/balance')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amountMinor: 1000000,
        referenceDate: testDate,
        currencyCode: 'BDT',
      });

    // Record income of ৳50,000 (5,000,000 minor)
    const incRes = await request(app)
      .post('/api/v1/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amountMinor: 5000000,
        currencyCode: 'BDT',
        categoryId: DEFAULT_CATEGORIES[0].id,
        expenseDate: testDate,
        type: 'income',
        note: 'Monthly Freelance Retainer',
        accountId: createdAccountId,
        tags: 'income,client',
      });

    expect(incRes.status).toBe(201);
    expect(incRes.body.data.type).toBe('income');

    // Record expense of ৳2,000 (200,000 minor)
    await request(app)
      .post('/api/v1/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amountMinor: 200000,
        currencyCode: 'BDT',
        categoryId: DEFAULT_CATEGORIES[0].id,
        expenseDate: testDate,
        type: 'expense',
        note: 'Groceries',
        accountId: createdAccountId,
      });

    // Verify balance summary
    const balRes = await request(app)
      .get('/api/v1/balance')
      .set('Authorization', `Bearer ${authToken}`);

    expect(balRes.status).toBe(200);
    // Opening: 1,000,000 + Income: 5,000,000 - Expense: 200,000 = 5,800,000
    expect(balRes.body.data.availableBalanceMinor).toBe(1000000);
    expect(balRes.body.data.totalIncomeMinor).toBe(5000000);
    expect(balRes.body.data.totalExpensesMinor).toBe(200000);
    expect(balRes.body.data.remainingBalanceMinor).toBe(5800000);
  });

  it('POST /api/v1/budgets sets an overall and category budget and computes spent correctly', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Set overall month budget: ৳30,000 (3,000,000 minor)
    const bRes = await request(app)
      .post('/api/v1/budgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        month: currentMonth,
        amountMinor: 3000000,
        warningThresholdPercent: 80,
      });

    expect(bRes.status).toBe(200);
    expect(bRes.body.data.month).toBe(currentMonth);
    expect(bRes.body.data.amountMinor).toBe(3000000);
    expect(bRes.body.data.spentMinor).toBeGreaterThanOrEqual(200000);

    // List budgets
    const listRes = await request(app)
      .get(`/api/v1/budgets?month=${currentMonth}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });

  let goalId: string;
  it('POST /api/v1/goals creates a savings goal and handles contributions', async () => {
    const res = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Emergency Medical Buffer',
        targetAmountMinor: 10000000, // ৳100,000
        currentAmountMinor: 2000000, // ৳20,000
        targetDate: '2026-12-31',
        notes: 'Strict emergency reserves',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Emergency Medical Buffer');
    expect(res.body.data.progressPercent).toBe(20);
    expect(res.body.data.suggestedMonthlyContributionMinor).toBeGreaterThan(0);
    goalId = res.body.data.id;

    // Contribute ৳10,000 (1,000,000 minor)
    const contRes = await request(app)
      .post(`/api/v1/goals/${goalId}/contribute`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amountMinor: 1000000 });

    expect(contRes.status).toBe(200);
    expect(contRes.body.data.currentAmountMinor).toBe(3000000);
    expect(contRes.body.data.progressPercent).toBe(30);
  });

  it('POST /api/v1/recurring creates a recurring rule and processes payment', async () => {
    const recRes = await request(app)
      .post('/api/v1/recurring')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'expense',
        amountMinor: 150000, // ৳1,500 broadband internet
        categoryId: DEFAULT_CATEGORIES[0].id,
        accountId: createdAccountId,
        frequency: 'monthly',
        nextDueDate: '2026-10-15',
        note: 'Fiber Broadband Bill',
      });

    expect(recRes.status).toBe(201);
    const recId = recRes.body.data.id;

    // Pay now
    const payRes = await request(app)
      .post(`/api/v1/recurring/${recId}/pay`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(payRes.status).toBe(200);
    expect(payRes.body.data.transactionId).toBeDefined();
    // Next due date moved forward 1 month
    expect(payRes.body.data.recurring.nextDueDate).toBe('2026-11-15');
  });

  it('POST /api/v1/copilot/query generates grounded answers and draft transactions', async () => {
    // 1. Query today's spending
    const q1 = await request(app)
      .post('/api/v1/copilot/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: 'How much did I spend today?' });

    expect(q1.status).toBe(200);
    expect(q1.body.data.answer).toContain('৳');
    expect(q1.body.data.metricsSnapshot).toBeDefined();

    // 2. Natural language draft transaction
    const q2 = await request(app)
      .post('/api/v1/copilot/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: 'Spent 450 BDT on Food today' });

    expect(q2.status).toBe(200);
    expect(q2.body.data.draftTransaction).toBeDefined();
    expect(q2.body.data.draftTransaction.amountMinor).toBe(45000);
    expect(q2.body.data.draftTransaction.type).toBe('expense');
  });
});
