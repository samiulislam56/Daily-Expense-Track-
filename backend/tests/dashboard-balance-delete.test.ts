import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { runSeed, DEFAULT_CATEGORIES } from '../src/migrations/seed.js';

describe('DailyFlow Dashboard Improvements, Balance Management & Delete (Requirements 1-6)', () => {
  beforeAll(async () => {
    await runSeed();
  });

  const today = new Date().toISOString().split('T')[0];
  const testUserId = '00000000-0000-0000-0000-000000000001';

  it('1. Persists user-defined available balance and returns isConfigured: true', async () => {
    // Set starting balance to ৳5,000 (500,000 minor units)
    const setRes = await request(app)
      .put('/api/v1/balance')
      .set('x-user-id', testUserId)
      .send({
        amountMinor: 500000,
        currencyCode: 'BDT',
        referenceDate: today,
      });

    expect(setRes.status).toBe(200);
    expect(setRes.body.data.availableBalanceMinor).toBe(500000);
    expect(setRes.body.data.isConfigured).toBe(true);
    expect(setRes.body.data.currencyCode).toBe('BDT');

    // Retrieve via GET /api/v1/balance
    const getRes = await request(app)
      .get('/api/v1/balance')
      .set('x-user-id', testUserId);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.availableBalanceMinor).toBe(500000);
    expect(getRes.body.data.isConfigured).toBe(true);
  });

  it('2. Rejects invalid or negative balance input', async () => {
    const resNegative = await request(app)
      .put('/api/v1/balance')
      .set('x-user-id', testUserId)
      .send({ amountMinor: -5000 });

    expect(resNegative.status).toBe(400);
    expect(resNegative.body.error.code).toBe('VALIDATION_ERROR');

    const resNonInt = await request(app)
      .put('/api/v1/balance')
      .set('x-user-id', testUserId)
      .send({ amountMinor: 'five-thousand' });

    expect(resNonInt.status).toBe(400);
  });

  it('3. Runs the exact specification scenario with expenses, remaining balance, average, and real deletion', async () => {
    // A fresh reference date for isolation
    const scenarioDate = '2026-11-01';

    // Set starting balance of ৳5,000
    await request(app)
      .put('/api/v1/balance')
      .set('x-user-id', testUserId)
      .send({
        amountMinor: 500000,
        currencyCode: 'BDT',
        referenceDate: scenarioDate,
      });

    // Add expense 1: ৳200 (20,000 minor units)
    const exp1Res = await request(app)
      .post('/api/v1/expenses')
      .set('x-user-id', testUserId)
      .send({
        amountMinor: 20000,
        currencyCode: 'BDT',
        categoryId: DEFAULT_CATEGORIES[0].id,
        expenseDate: scenarioDate,
        note: 'Scenario Lunch ৳200',
      });
    expect(exp1Res.status).toBe(201);
    const exp1Id = exp1Res.body.data.id;

    // Add expense 2: ৳300 (30,000 minor units)
    const exp2Res = await request(app)
      .post('/api/v1/expenses')
      .set('x-user-id', testUserId)
      .send({
        amountMinor: 30000,
        currencyCode: 'BDT',
        categoryId: DEFAULT_CATEGORIES[1].id,
        expenseDate: scenarioDate,
        note: 'Scenario Transport ৳300',
      });
    expect(exp2Res.status).toBe(201);
    const exp2Id = exp2Res.body.data.id;

    // Verify Remaining Balance = ৳5,000 - ৳500 = ৳4,500 (450,000 minor units)
    const balCheck1 = await request(app)
      .get('/api/v1/balance')
      .set('x-user-id', testUserId);
    expect(balCheck1.status).toBe(200);
    expect(balCheck1.body.data.availableBalanceMinor).toBe(500000);
    expect(balCheck1.body.data.totalExpensesMinor).toBe(50000);
    expect(balCheck1.body.data.remainingBalanceMinor).toBe(450000);

    // Verify Day Summary for scenarioDate:
    // Total Spending: ৳500 (50,000 minor)
    // Transaction count: 2
    // Average expense: ৳250 (25,000 minor)
    const dayCheck1 = await request(app)
      .get('/api/v1/summary/daily')
      .set('x-user-id', testUserId)
      .query({ date: scenarioDate });
    expect(dayCheck1.status).toBe(200);
    expect(dayCheck1.body.data.totalMinor).toBe(50000);
    expect(dayCheck1.body.data.count).toBe(2);
    expect(dayCheck1.body.data.averageMinor).toBe(25000);

    // Now DELETE the ৳200 expense (exp1Id)
    const delRes = await request(app)
      .delete(`/api/v1/expenses/${exp1Id}`)
      .set('x-user-id', testUserId);
    expect(delRes.status).toBe(204);

    // Verify record is truly deleted from DB (404)
    const checkDeleted = await request(app)
      .get(`/api/v1/expenses/${exp1Id}`)
      .set('x-user-id', testUserId);
    expect(checkDeleted.status).toBe(404);

    // After deleting ৳200:
    // Remaining balance must be: ৳4,700 (470,000 minor)
    const balCheck2 = await request(app)
      .get('/api/v1/balance')
      .set('x-user-id', testUserId);
    expect(balCheck2.status).toBe(200);
    expect(balCheck2.body.data.totalExpensesMinor).toBe(30000);
    expect(balCheck2.body.data.remainingBalanceMinor).toBe(470000);

    // Day Summary:
    // Total spending: ৳300 (30,000 minor)
    // Transaction count: 1
    // Average expense: ৳300 (30,000 minor)
    const dayCheck2 = await request(app)
      .get('/api/v1/summary/daily')
      .set('x-user-id', testUserId)
      .query({ date: scenarioDate });
    expect(dayCheck2.status).toBe(200);
    expect(dayCheck2.body.data.totalMinor).toBe(30000);
    expect(dayCheck2.body.data.count).toBe(1);
    expect(dayCheck2.body.data.averageMinor).toBe(30000);

    // Cleanup scenario expense 2
    await request(app).delete(`/api/v1/expenses/${exp2Id}`).set('x-user-id', testUserId);
  });

  it('4. Handles negative remaining balance when spending exceeds available balance', async () => {
    const testDate = '2026-11-05';
    // Starting balance ৳100 (10,000 minor)
    await request(app)
      .put('/api/v1/balance')
      .set('x-user-id', testUserId)
      .send({
        amountMinor: 10000,
        currencyCode: 'BDT',
        referenceDate: testDate,
      });

    // Record expense of ৳350 (35,000 minor)
    const expRes = await request(app)
      .post('/api/v1/expenses')
      .set('x-user-id', testUserId)
      .send({
        amountMinor: 35000,
        currencyCode: 'BDT',
        categoryId: DEFAULT_CATEGORIES[0].id,
        expenseDate: testDate,
        note: 'Big dinner exceeding budget',
      });
    expect(expRes.status).toBe(201);
    const expId = expRes.body.data.id;

    // Remaining balance should be: 10,000 - 35,000 = -25,000 (-৳250)
    const balRes = await request(app)
      .get('/api/v1/balance')
      .set('x-user-id', testUserId);
    expect(balRes.status).toBe(200);
    expect(balRes.body.data.remainingBalanceMinor).toBe(-25000);

    // Cleanup
    await request(app).delete(`/api/v1/expenses/${expId}`).set('x-user-id', testUserId);
  });

  it('5. Handles zero expenses for a day with ৳0.00 average and 0 count', async () => {
    const emptyDate = '2026-12-31';
    const res = await request(app)
      .get('/api/v1/summary/daily')
      .set('x-user-id', testUserId)
      .query({ date: emptyDate });

    expect(res.status).toBe(200);
    expect(res.body.data.totalMinor).toBe(0);
    expect(res.body.data.count).toBe(0);
    expect(res.body.data.averageMinor).toBe(0);
  });

  it('6. Successfully deletes custom-UUID or seeded expenses without regex rejection', async () => {
    // Create an expense with standard UUID
    const exp = await request(app)
      .post('/api/v1/expenses')
      .set('x-user-id', testUserId)
      .send({
        amountMinor: 5500,
        currencyCode: 'BDT',
        categoryId: DEFAULT_CATEGORIES[2].id,
        expenseDate: today,
        note: 'Book purchase',
      });
    expect(exp.status).toBe(201);

    const deleteRes = await request(app)
      .delete(`/api/v1/expenses/${exp.body.data.id}`)
      .set('x-user-id', testUserId);
    expect(deleteRes.status).toBe(204);

    // Deleting again returns 404
    const deleteAgainRes = await request(app)
      .delete(`/api/v1/expenses/${exp.body.data.id}`)
      .set('x-user-id', testUserId);
    expect(deleteAgainRes.status).toBe(404);
  });
});
