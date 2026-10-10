import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { runSeed, DEFAULT_CATEGORIES } from '../src/migrations/seed.js';

describe('DailyFlow API Integration Tests (SRS 9 & 13.1)', () => {
  beforeAll(async () => {
    await runSeed();
  });

  it('GET /health returns 200 { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/v1/categories returns list of seeded categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(8);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('iconKey');
  });

  let createdExpenseId: string;

  it('POST /api/v1/expenses creates a valid expense', async () => {
    const newExpense = {
      amountMinor: 25000,
      currencyCode: 'BDT',
      categoryId: DEFAULT_CATEGORIES[0].id,
      expenseDate: '2026-10-10',
      note: 'Grocery supermarket haul',
    };

    const res = await request(app)
      .post('/api/v1/expenses')
      .send(newExpense);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.amountMinor).toBe(25000);
    expect(res.body.data.expenseDate).toBe('2026-10-10');
    expect(res.body.data.note).toBe('Grocery supermarket haul');

    createdExpenseId = res.body.data.id;
  });

  it('POST /api/v1/expenses rejects invalid payload with structured errors', async () => {
    const invalidExpense = {
      amountMinor: -100, // Invalid negative
      categoryId: 'not-a-uuid',
      expenseDate: 'invalid-date',
    };

    const res = await request(app)
      .post('/api/v1/expenses')
      .send(invalidExpense);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeInstanceOf(Array);
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/v1/expenses returns paginated list with meta', async () => {
    const res = await request(app)
      .get('/api/v1/expenses')
      .query({ page: 1, pageSize: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta).toHaveProperty('totalCount');
    expect(res.body.meta).toHaveProperty('totalPages');
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.pageSize).toBe(10);
  });

  it('GET /api/v1/expenses/:id returns single expense', async () => {
    const res = await request(app).get(`/api/v1/expenses/${createdExpenseId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdExpenseId);
    expect(res.body.data.amountMinor).toBe(25000);
  });

  it('PATCH /api/v1/expenses/:id updates expense fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/expenses/${createdExpenseId}`)
      .send({ amountMinor: 28000, note: 'Updated grocery haul' });

    expect(res.status).toBe(200);
    expect(res.body.data.amountMinor).toBe(28000);
    expect(res.body.data.note).toBe('Updated grocery haul');
  });

  it('GET /api/v1/summary/daily returns correct day total and count', async () => {
    const res = await request(app)
      .get('/api/v1/summary/daily')
      .query({ date: '2026-10-10' });

    expect(res.status).toBe(200);
    expect(res.body.data.date).toBe('2026-10-10');
    expect(res.body.data.totalMinor).toBeGreaterThanOrEqual(28000);
    expect(res.body.data.count).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/summary/monthly returns correct month total and count', async () => {
    const res = await request(app)
      .get('/api/v1/summary/monthly')
      .query({ month: '2026-10' });

    expect(res.status).toBe(200);
    expect(res.body.data.month).toBe('2026-10');
    expect(res.body.data.totalMinor).toBeGreaterThanOrEqual(28000);
    expect(res.body.data.count).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/summary/categories returns category breakdown with percentages', async () => {
    const res = await request(app).get('/api/v1/summary/categories');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty('categoryId');
      expect(res.body.data[0]).toHaveProperty('categoryName');
      expect(res.body.data[0]).toHaveProperty('totalMinor');
      expect(res.body.data[0]).toHaveProperty('percentage');
    }
  });

  it('DELETE /api/v1/expenses/:id deletes expense and returns 204', async () => {
    const res = await request(app).delete(`/api/v1/expenses/${createdExpenseId}`);
    expect(res.status).toBe(204);

    // Verify it is no longer found
    const getRes = await request(app).get(`/api/v1/expenses/${createdExpenseId}`);
    expect(getRes.status).toBe(404);
  });
});
