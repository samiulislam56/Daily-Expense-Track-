import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { runSeed, DEFAULT_CATEGORIES } from '../src/migrations/seed.js';

describe('Multi-User Authentication & Data Isolation Tests', () => {
  beforeAll(async () => {
    await runSeed();
  });

  const userA = {
    username: 'user_rahim',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    displayName: 'Rahim Khan',
  };

  const userB = {
    username: 'user_karim',
    password: 'SecurePass456!',
    confirmPassword: 'SecurePass456!',
    displayName: 'Karim Ahmed',
  };

  let tokenA: string;
  let tokenB: string;
  let userIdA: string;
  let userIdB: string;

  it('1. Registration rejects invalid input and password mismatch', async () => {
    // Password mismatch
    const mismatchRes = await request(app).post('/api/v1/auth/register').send({
      username: 'test_mismatch',
      password: 'password123',
      confirmPassword: 'password999',
    });
    expect(mismatchRes.status).toBe(400);
    expect(mismatchRes.body.error.code).toBe('VALIDATION_ERROR');

    // Username too short
    const shortUserRes = await request(app).post('/api/v1/auth/register').send({
      username: 'ab',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(shortUserRes.status).toBe(400);

    // Password too short
    const shortPassRes = await request(app).post('/api/v1/auth/register').send({
      username: 'valid_user',
      password: '123',
      confirmPassword: '123',
    });
    expect(shortPassRes.status).toBe(400);
  });

  it('2. Registers User A successfully and returns token & clean user profile', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(userA);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.username).toBe(userA.username);
    expect(res.body.data.user.displayName).toBe(userA.displayName);
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');

    tokenA = res.body.data.token;
    userIdA = res.body.data.user.id;
  });

  it('3. Prevents duplicate username registration (case-insensitive)', async () => {
    const dupRes = await request(app).post('/api/v1/auth/register').send({
      username: userA.username.toUpperCase(),
      password: 'newPassword123!',
      confirmPassword: 'newPassword123!',
    });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('CONFLICT');
  });

  it('4. User A can log in with username + password and retrieve session', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      username: userA.username,
      password: userA.password,
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data).toHaveProperty('token');
    expect(loginRes.body.data.user.id).toBe(userIdA);

    // Verify GET /api/v1/auth/me
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.data.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.id).toBe(userIdA);
    expect(meRes.body.data.username).toBe(userA.username);
  });

  it('5. Login rejects invalid password without leaking credential details', async () => {
    const badLoginRes = await request(app).post('/api/v1/auth/login').send({
      username: userA.username,
      password: 'wrong_password_999',
    });

    expect(badLoginRes.status).toBe(401);
    expect(badLoginRes.body.error.message).toContain('Invalid username or password');
  });

  it('6. New User A starts with balance = null and empty state (not 0, not 5000)', async () => {
    const balRes = await request(app)
      .get('/api/v1/balance')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(balRes.status).toBe(200);
    expect(balRes.body.data.availableBalanceMinor).toBeNull();
    expect(balRes.body.data.remainingBalanceMinor).toBeNull();
    expect(balRes.body.data.isConfigured).toBe(false);
  });

  it('7. User A sets balance to ৳5,000 (500,000 minor units)', async () => {
    const setRes = await request(app)
      .put('/api/v1/balance')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        amountMinor: 500000,
        currencyCode: 'BDT',
        referenceDate: '2026-10-01',
      });

    expect(setRes.status).toBe(200);
    expect(setRes.body.data.availableBalanceMinor).toBe(500000);
    expect(setRes.body.data.remainingBalanceMinor).toBe(500000);
    expect(setRes.body.data.isConfigured).toBe(true);
  });

  it('8. Registers User B; User B starts with balance = null (NEVER sees User A balance)', async () => {
    const regB = await request(app).post('/api/v1/auth/register').send(userB);
    expect(regB.status).toBe(201);
    tokenB = regB.body.data.token;
    userIdB = regB.body.data.user.id;

    // Check User B balance
    const balB = await request(app)
      .get('/api/v1/balance')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(balB.status).toBe(200);
    expect(balB.body.data.availableBalanceMinor).toBeNull();
    expect(balB.body.data.remainingBalanceMinor).toBeNull();
    expect(balB.body.data.isConfigured).toBe(false);
  });

  it('9. User B sets balance to ৳12,000; User A and User B maintain strict isolation', async () => {
    // User B sets 12,000 BDT
    const setB = await request(app)
      .put('/api/v1/balance')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        amountMinor: 1200000,
        currencyCode: 'BDT',
        referenceDate: '2026-10-01',
      });

    expect(setB.status).toBe(200);
    expect(setB.body.data.availableBalanceMinor).toBe(1200000);

    // Verify User A STILL has ৳5,000
    const checkA = await request(app)
      .get('/api/v1/balance')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(checkA.status).toBe(200);
    expect(checkA.body.data.availableBalanceMinor).toBe(500000);

    // Verify User B has ৳12,000
    const checkB = await request(app)
      .get('/api/v1/balance')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(checkB.status).toBe(200);
    expect(checkB.body.data.availableBalanceMinor).toBe(1200000);
  });

  it('10. Expenses created by User A are NEVER visible to User B', async () => {
    // User A records an expense
    const expA = await request(app)
      .post('/api/v1/expenses')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        amountMinor: 75000, // ৳750
        currencyCode: 'BDT',
        categoryId: DEFAULT_CATEGORIES[0].id,
        expenseDate: '2026-10-05',
        note: 'Rahim private grocery expense',
      });
    expect(expA.status).toBe(201);

    // User A sees this expense in their list
    const listA = await request(app)
      .get('/api/v1/expenses')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(listA.body.data.some((e: any) => e.note === 'Rahim private grocery expense')).toBe(true);

    // User B fetches their expenses list -> must NOT see User A's expense!
    const listB = await request(app)
      .get('/api/v1/expenses')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(listB.body.data.some((e: any) => e.note === 'Rahim private grocery expense')).toBe(false);

    // User A remaining balance decreased: 500,000 - 75,000 = 425,000
    const balAAfter = await request(app)
      .get('/api/v1/balance')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(balAAfter.body.data.remainingBalanceMinor).toBe(425000);

    // User B balance remains exactly 1,200,000
    const balBAfter = await request(app)
      .get('/api/v1/balance')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(balBAfter.body.data.remainingBalanceMinor).toBe(1200000);
  });

  it('11. Unauthenticated requests and invalid tokens are rejected with 401', async () => {
    // No token
    const noToken = await request(app).get('/api/v1/balance');
    expect(noToken.status).toBe(401);
    expect(noToken.body.error.code).toBe('UNAUTHORIZED');

    // Invalid token
    const badToken = await request(app)
      .get('/api/v1/balance')
      .set('Authorization', 'Bearer invalid.bogus.token');
    expect(badToken.status).toBe(401);
  });
});
