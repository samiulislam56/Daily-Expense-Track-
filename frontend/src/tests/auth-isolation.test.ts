import { describe, it, expect, beforeEach } from 'vitest';
import { mockStorage } from '../services/mockStorage.js';

describe('Frontend Multi-User Authentication & Data Isolation Tests', () => {
  beforeEach(() => {
    mockStorage.logout();
  });

  it('New user registers and begins with balance = null and empty financial records', () => {
    const username = `alice_${Date.now()}`;
    const authRes = mockStorage.register({
      username,
      password: 'password123',
      displayName: 'Alice Cooper',
    });

    expect(authRes.token).toBeDefined();
    expect(authRes.user.username).toBe(username);
    expect(authRes.user.displayName).toBe('Alice Cooper');

    // Verify balance starts strictly as null
    const balance = mockStorage.getBalance();
    expect(balance.availableBalanceMinor).toBeNull();
    expect(balance.remainingBalanceMinor).toBeNull();
    expect(balance.isConfigured).toBe(false);

    // Verify expenses start completely empty
    const expenses = mockStorage.getExpenses();
    expect(expenses.data).toEqual([]);
    expect(expenses.meta.totalCount).toBe(0);

    // Verify accounts start empty
    const accounts = mockStorage.getAccounts();
    expect(accounts).toEqual([]);
  });

  it('Duplicate usernames are strictly prevented during registration', () => {
    const username = `duplicate_${Date.now()}`;
    mockStorage.register({
      username,
      password: 'password123',
    });

    // Attempt registering with same username (case-insensitive)
    expect(() => {
      mockStorage.register({
        username: username.toUpperCase(),
        password: 'anotherpassword',
      });
    }).toThrow(/already exists/i);
  });

  it('Independent User A and User B maintain completely isolated balances and data', () => {
    const userA = `user_a_${Date.now()}`;
    const userB = `user_b_${Date.now()}`;

    // Step 1: User A registers
    const authA = mockStorage.register({
      username: userA,
      password: 'passwordA123',
    });
    expect(mockStorage.getBalance().availableBalanceMinor).toBeNull();

    // User A sets balance to ৳5,000 (500000 minor units)
    mockStorage.updateBalance({
      amountMinor: 500000,
      currencyCode: 'BDT',
      referenceDate: '2026-10-01',
    });
    expect(mockStorage.getBalance().availableBalanceMinor).toBe(500000);
    expect(mockStorage.getBalance().isConfigured).toBe(true);

    // User A adds an expense of ৳1,200
    mockStorage.createExpense({
      amountMinor: 120000,
      categoryId: '11111111-1111-1111-1111-111111111101',
      expenseDate: '2026-10-05',
      note: 'User A Groceries',
    });
    expect(mockStorage.getExpenses().data.length).toBe(1);

    // Step 2: User B registers
    const authB = mockStorage.register({
      username: userB,
      password: 'passwordB456',
    });

    // User B MUST NOT see User A's balance (must be null!)
    const balanceB = mockStorage.getBalance();
    expect(balanceB.availableBalanceMinor).toBeNull();
    expect(balanceB.isConfigured).toBe(false);

    // User B MUST NOT see User A's expenses
    const expensesB = mockStorage.getExpenses();
    expect(expensesB.data.length).toBe(0);

    // User B sets their own balance to ৳12,000 (1200000 minor)
    mockStorage.updateBalance({
      amountMinor: 1200000,
      currencyCode: 'BDT',
      referenceDate: '2026-10-01',
    });
    expect(mockStorage.getBalance().availableBalanceMinor).toBe(1200000);

    // Step 3: User A logs back in
    mockStorage.login({
      username: userA,
      password: 'passwordA123',
    });

    // User A's balance MUST be 500000, NOT overwritten by User B's 1200000
    const restoredBalanceA = mockStorage.getBalance();
    expect(restoredBalanceA.availableBalanceMinor).toBe(500000);
    expect(restoredBalanceA.isConfigured).toBe(true);

    // User A still has their 1 expense
    const restoredExpensesA = mockStorage.getExpenses();
    expect(restoredExpensesA.data.length).toBe(1);
    expect(restoredExpensesA.data[0].note).toBe('User A Groceries');

    // Step 4: User B logs back in
    mockStorage.login({
      username: userB,
      password: 'passwordB456',
    });

    // User B's balance MUST be 1200000
    const restoredBalanceB = mockStorage.getBalance();
    expect(restoredBalanceB.availableBalanceMinor).toBe(1200000);
    expect(restoredBalanceB.isConfigured).toBe(true);
    expect(mockStorage.getExpenses().data.length).toBe(0);
  });

  it('Logout clears the active session and prevents data leakage', () => {
    const user = `logout_test_${Date.now()}`;
    mockStorage.register({
      username: user,
      password: 'securePass123',
    });

    expect(mockStorage.getCurrentUserId()).not.toBe('00000000-0000-0000-0000-000000000001');

    mockStorage.logout();
    expect(mockStorage.getCurrentUserId()).toBe('00000000-0000-0000-0000-000000000001');
  });
});
