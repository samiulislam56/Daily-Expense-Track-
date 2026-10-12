import {
  Category,
  Expense,
  ExpenseFilters,
  PaginatedExpensesResponse,
  DailySummary,
  MonthlySummary,
  CategorySummaryItem,
  UserBalance,
  Account,
  Budget,
  SavingsGoal,
  RecurringTransaction,
  CopilotResponse,
  CopilotDraftTransaction,
  UserProfile,
  AuthResponse,
} from '../types/index.js';

const STORAGE_KEYS = {
  CATEGORIES: 'dailyflow_demo_categories_v2',
  EXPENSES: 'dailyflow_demo_expenses_v2',
  BALANCE: 'dailyflow_demo_balance_v2',
  ACCOUNTS: 'dailyflow_demo_accounts_v2',
  BUDGETS: 'dailyflow_demo_budgets_v2',
  GOALS: 'dailyflow_demo_goals_v2',
  RECURRING: 'dailyflow_demo_recurring_v2',
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Food & Groceries',
    iconKey: 'Utensils',
    colorKey: '#10B981',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Transport',
    iconKey: 'Bus',
    colorKey: '#3B82F6',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'Bills & Utilities',
    iconKey: 'Zap',
    colorKey: '#F59E0B',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Healthcare',
    iconKey: 'HeartPulse',
    colorKey: '#EF4444',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Entertainment',
    iconKey: 'Film',
    colorKey: '#8B5CF6',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'Income & Salary',
    iconKey: 'Wallet',
    colorKey: '#059669',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    name: 'Shopping',
    iconKey: 'ShoppingBag',
    colorKey: '#EC4899',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    name: 'Miscellaneous',
    iconKey: 'Tag',
    colorKey: '#64748B',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-1111-1111-1111-1111',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Cash in Hand',
    type: 'cash',
    balanceMinor: 850000, // ৳8,500
    currencyCode: 'BDT',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-2222-2222-2222-2222',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'City Bank Savings',
    type: 'bank',
    balanceMinor: 4800000, // ৳48,000
    currencyCode: 'BDT',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-3333-3333-3333-3333',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'bKash Personal',
    type: 'mobile_wallet',
    balanceMinor: 1250000, // ৳12,500
    currencyCode: 'BDT',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getFirstDayOfMonth(dateStr: string): string {
  return `${dateStr.slice(0, 7)}-01`;
}

function generateInitialExpenses(): Expense[] {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const nowIso = new Date().toISOString();

  return [
    {
      id: 'e1111111-2222-3333-4444-555555555501',
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: '11111111-1111-1111-1111-111111111101',
      accountId: 'acc-1111-1111-1111-1111',
      type: 'expense',
      amountMinor: 65000, // ৳650.00
      currencyCode: 'BDT',
      expenseDate: today,
      note: 'Grocery store essentials & fresh fruits',
      tags: 'groceries,food',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'e1111111-2222-3333-4444-555555555502',
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: '11111111-1111-1111-1111-111111111102',
      accountId: 'acc-3333-3333-3333-3333',
      type: 'expense',
      amountMinor: 22000, // ৳220.00
      currencyCode: 'BDT',
      expenseDate: today,
      note: 'Metro commute & rickshaw fare',
      tags: 'transport,commute',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'e1111111-2222-3333-4444-555555555503',
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: '11111111-1111-1111-1111-111111111106',
      accountId: 'acc-2222-2222-2222-2222',
      type: 'income',
      amountMinor: 6500000, // ৳65,000.00
      currencyCode: 'BDT',
      expenseDate: getFirstDayOfMonth(today),
      note: 'Monthly salary credit',
      tags: 'salary,income',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'e1111111-2222-3333-4444-555555555504',
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: '11111111-1111-1111-1111-111111111103',
      accountId: 'acc-2222-2222-2222-2222',
      type: 'expense',
      amountMinor: 285000, // ৳2,850.00
      currencyCode: 'BDT',
      expenseDate: yesterday,
      note: 'High-speed home fiber internet',
      tags: 'bills,internet',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'e1111111-2222-3333-4444-555555555505',
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: '11111111-1111-1111-1111-111111111104',
      accountId: 'acc-1111-1111-1111-1111',
      type: 'expense',
      amountMinor: 48000, // ৳480.00
      currencyCode: 'BDT',
      expenseDate: yesterday,
      note: 'Monthly vitamins & pharmacy prescription',
      tags: 'health',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

class MockStorageService {
  private memoryStore: Record<string, any> = {};

  public getCurrentUserId(): string {
    const stored = this.getStorageItem<string | null>('dailyflow_active_user_id', null);
    return stored || '00000000-0000-0000-0000-000000000001';
  }

  public setCurrentUserId(userId: string | null): void {
    this.setStorageItem('dailyflow_active_user_id', userId);
  }

  public setActiveSession(user: UserProfile): void {
    this.setCurrentUserId(user.id);
  }

  private getUserKey(prefix: string): string {
    const uid = this.getCurrentUserId();
    return `dailyflow_u_${uid}_${prefix}`;
  }

  public register(payload: { username: string; password: string; confirmPassword?: string; displayName?: string }): AuthResponse {
    const cleanUsername = payload.username.trim().toLowerCase();
    const users = this.getStorageItem<Array<{ id: string; username: string; password: string; displayName: string; createdAt: string }>>(
      'dailyflow_users_list',
      []
    );

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      throw new Error('A user with this username already exists. Please choose a different username.');
    }

    const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const user = {
      id: userId,
      username: payload.username.trim(),
      displayName: payload.displayName?.trim() || payload.username.trim(),
      password: payload.password,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    this.setStorageItem('dailyflow_users_list', users);
    this.setCurrentUserId(userId);

    // Initial state: all balance values start as null or empty!
    // No predefined amount should appear automatically.
    this.setStorageItem(this.getUserKey('balance'), null);
    this.setStorageItem(this.getUserKey('expenses'), []);
    this.setStorageItem(this.getUserKey('accounts'), []);
    this.setStorageItem(this.getUserKey('budgets'), []);
    this.setStorageItem(this.getUserKey('goals'), []);
    this.setStorageItem(this.getUserKey('recurring'), []);

    return {
      token: `demo_token_${userId}`,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
    };
  }

  public importUser(user: { id: string; username: string; password: string; displayName: string; createdAt: string }): void {
    const users = this.getStorageItem<Array<{ id: string; username: string; password: string; displayName: string; createdAt: string }>>(
      'dailyflow_users_list',
      []
    );
    const cleanUsername = user.username.trim().toLowerCase();
    const existingIndex = users.findIndex((u) => u.username.toLowerCase() === cleanUsername);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    this.setStorageItem('dailyflow_users_list', users);
  }

  public getAllUserData(userId: string): any {
    return {
      balance: this.getStorageItem(`dailyflow_u_${userId}_balance`, null),
      expenses: this.getStorageItem(`dailyflow_u_${userId}_expenses`, []),
      accounts: this.getStorageItem(`dailyflow_u_${userId}_accounts`, []),
      budgets: this.getStorageItem(`dailyflow_u_${userId}_budgets`, []),
      goals: this.getStorageItem(`dailyflow_u_${userId}_goals`, []),
      recurring: this.getStorageItem(`dailyflow_u_${userId}_recurring`, []),
    };
  }

  public restoreAllUserData(userId: string, data: any): void {
    if (!data) return;
    if (data.balance !== undefined) this.setStorageItem(`dailyflow_u_${userId}_balance`, data.balance);
    if (Array.isArray(data.expenses)) this.setStorageItem(`dailyflow_u_${userId}_expenses`, data.expenses);
    if (Array.isArray(data.accounts)) this.setStorageItem(`dailyflow_u_${userId}_accounts`, data.accounts);
    if (Array.isArray(data.budgets)) this.setStorageItem(`dailyflow_u_${userId}_budgets`, data.budgets);
    if (Array.isArray(data.goals)) this.setStorageItem(`dailyflow_u_${userId}_goals`, data.goals);
    if (Array.isArray(data.recurring)) this.setStorageItem(`dailyflow_u_${userId}_recurring`, data.recurring);
  }

  public login(payload: { username: string; password: string }): AuthResponse {
    const cleanUsername = payload.username.trim().toLowerCase();

    // 1. Built-in system profiles (demo_user, sami, samiul)
    const SYSTEM_USERS = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'demo_user',
        displayName: 'Demo User',
        password: 'password123',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'u-sami-default-root',
        username: 'sami',
        displayName: 'Samiul Islam',
        password: 'sami1234',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'u-samiul-default-root',
        username: 'samiul',
        displayName: 'Samiul Islam',
        password: 'sami1234',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const matchedSystem = SYSTEM_USERS.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.password === payload.password
    );

    if (matchedSystem) {
      this.setCurrentUserId(matchedSystem.id);
      return {
        token: `demo_token_${matchedSystem.id}`,
        user: {
          id: matchedSystem.id,
          username: matchedSystem.username,
          displayName: matchedSystem.displayName,
          createdAt: matchedSystem.createdAt,
        },
      };
    }

    // 2. Local device registered users
    const users = this.getStorageItem<Array<{ id: string; username: string; password: string; displayName: string; createdAt: string }>>(
      'dailyflow_users_list',
      []
    );
    const found = users.find((u) => u.username.toLowerCase() === cleanUsername);

    if (!found || found.password !== payload.password) {
      throw new Error('Invalid username or password.');
    }

    this.setCurrentUserId(found.id);

    return {
      token: `demo_token_${found.id}`,
      user: {
        id: found.id,
        username: found.username,
        displayName: found.displayName,
        createdAt: found.createdAt,
      },
    };
  }

  public getMe(): UserProfile {
    const uid = this.getCurrentUserId();

    const SYSTEM_USERS = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'demo_user',
        displayName: 'Demo User',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'u-sami-default-root',
        username: 'sami',
        displayName: 'Samiul Islam',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'u-samiul-default-root',
        username: 'samiul',
        displayName: 'Samiul Islam',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const matchedSystem = SYSTEM_USERS.find((u) => u.id === uid);
    if (matchedSystem) {
      return {
        id: matchedSystem.id,
        username: matchedSystem.username,
        displayName: matchedSystem.displayName,
        createdAt: matchedSystem.createdAt,
      };
    }

    const users = this.getStorageItem<Array<{ id: string; username: string; password: string; displayName: string; createdAt: string }>>(
      'dailyflow_users_list',
      []
    );
    const found = users.find((u) => u.id === uid);
    if (found) {
      return {
        id: found.id,
        username: found.username,
        displayName: found.displayName,
        createdAt: found.createdAt,
      };
    }
    return {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'demo_user',
      displayName: 'Demo User',
      createdAt: new Date().toISOString(),
    };
  }

  public logout(): void {
    this.setCurrentUserId(null);
  }

  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return this.memoryStore[key] !== undefined ? (this.memoryStore[key] as T) : defaultValue;
      }
      const data = localStorage.getItem(key);
      if (!data) {
        return this.memoryStore[key] !== undefined ? (this.memoryStore[key] as T) : defaultValue;
      }
      return JSON.parse(data) as T;
    } catch {
      return this.memoryStore[key] !== undefined ? (this.memoryStore[key] as T) : defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    this.memoryStore[key] = value;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // safely stored in memoryStore
    }
  }

  // --- Categories ---
  public getCategories(): Category[] {
    let cats = this.getStorageItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    if (!cats || cats.length === 0) {
      cats = DEFAULT_CATEGORIES;
      this.setStorageItem(STORAGE_KEYS.CATEGORIES, cats);
    }
    return cats;
  }

  // --- Accounts ---
  public getAccounts(): Account[] {
    const isDemo = this.getCurrentUserId() === '00000000-0000-0000-0000-000000000001';
    let accs = this.getStorageItem<Account[] | null>(this.getUserKey('accounts'), null);
    if (accs === null) {
      accs = isDemo ? DEFAULT_ACCOUNTS : [];
      this.setStorageItem(this.getUserKey('accounts'), accs);
    }
    return accs;
  }

  public createAccount(payload: { name: string; type: any; balanceMinor?: number; currencyCode?: string; isDefault?: boolean }): Account {
    const list = this.getAccounts();
    const id = `acc-${Date.now()}`;
    const newAcc: Account = {
      id,
      userId: this.getCurrentUserId(),
      name: payload.name,
      type: payload.type || 'cash',
      balanceMinor: payload.balanceMinor || 0,
      currencyCode: payload.currencyCode || 'BDT',
      isDefault: Boolean(payload.isDefault),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (newAcc.isDefault) {
      list.forEach((a) => (a.isDefault = false));
    }
    list.push(newAcc);
    this.setStorageItem(this.getUserKey('accounts'), list);
    return newAcc;
  }

  public updateAccount(id: string, payload: Partial<Account>): Account {
    const list = this.getAccounts();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Account not found');
    if (payload.isDefault) {
      list.forEach((a) => (a.isDefault = false));
    }
    const updated = { ...list[idx], ...payload, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    this.setStorageItem(this.getUserKey('accounts'), list);
    return updated;
  }

  public deleteAccount(id: string): void {
    const list = this.getAccounts().filter((a) => a.id !== id);
    this.setStorageItem(this.getUserKey('accounts'), list);
  }

  // --- Expenses & Income Transactions ---
  public getExpensesRaw(): Expense[] {
    const isDemo = this.getCurrentUserId() === '00000000-0000-0000-0000-000000000001';
    let exps = this.getStorageItem<Expense[] | null>(this.getUserKey('expenses'), null);
    if (exps === null) {
      exps = isDemo ? generateInitialExpenses() : [];
      this.setStorageItem(this.getUserKey('expenses'), exps);
    }
    return exps;
  }

  private populateRelations(exp: Expense): Expense {
    const categories = this.getCategories();
    const accounts = this.getAccounts();
    const cat = categories.find((c) => c.id === exp.categoryId);
    const acc = accounts.find((a) => a.id === exp.accountId);

    return {
      ...exp,
      type: exp.type || 'expense',
      category: cat ? { id: cat.id, name: cat.name, iconKey: cat.iconKey, colorKey: cat.colorKey } : undefined,
      account: acc ? { id: acc.id, name: acc.name, type: acc.type } : undefined,
    };
  }

  public getExpenses(filters: ExpenseFilters = {}): PaginatedExpensesResponse {
    let list = this.getExpensesRaw();

    if (filters.from) list = list.filter((e) => e.expenseDate >= filters.from!);
    if (filters.to) list = list.filter((e) => e.expenseDate <= filters.to!);
    if (filters.categoryId) list = list.filter((e) => e.categoryId === filters.categoryId);
    if (filters.type) list = list.filter((e) => (e.type || 'expense') === filters.type);
    if (filters.accountId) list = list.filter((e) => e.accountId === filters.accountId);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter((e) => (e.note && e.note.toLowerCase().includes(q)) || (e.tags && e.tags.toLowerCase().includes(q)));
    }

    list.sort((a, b) => b.expenseDate.localeCompare(a.expenseDate) || b.createdAt.localeCompare(a.createdAt));

    const totalCount = list.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const paginated = list.slice((page - 1) * pageSize, page * pageSize).map((e) => this.populateRelations(e));

    return {
      data: paginated,
      meta: { page, pageSize, totalCount, totalPages },
    };
  }

  public getExpenseById(id: string): Expense {
    const found = this.getExpensesRaw().find((e) => e.id === id);
    if (!found) throw new Error('Transaction not found');
    return this.populateRelations(found);
  }

  public createExpense(payload: {
    amountMinor: number;
    currencyCode?: string;
    categoryId: string;
    expenseDate: string;
    note?: string;
    type?: any;
    accountId?: string | null;
    tags?: string;
  }): Expense {
    const list = this.getExpensesRaw();
    const id = `exp-${Date.now()}`;
    const newExp: Expense = {
      id,
      userId: this.getCurrentUserId(),
      categoryId: payload.categoryId,
      accountId: payload.accountId || null,
      type: payload.type || 'expense',
      amountMinor: payload.amountMinor,
      currencyCode: payload.currencyCode || 'BDT',
      expenseDate: payload.expenseDate,
      note: payload.note || null,
      tags: payload.tags || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newExp);
    this.setStorageItem(this.getUserKey('expenses'), list);
    return this.populateRelations(newExp);
  }

  public updateExpense(id: string, payload: Partial<Expense>): Expense {
    const list = this.getExpensesRaw();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Transaction not found');
    const updated = { ...list[idx], ...payload, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    this.setStorageItem(this.getUserKey('expenses'), list);
    return this.populateRelations(updated);
  }

  public deleteExpense(id: string): void {
    const list = this.getExpensesRaw().filter((e) => e.id !== id);
    this.setStorageItem(this.getUserKey('expenses'), list);
  }

  // --- Summaries ---
  public getDailySummary(date: string): DailySummary {
    const list = this.getExpensesRaw().filter((e) => e.expenseDate === date);
    const expenses = list.filter((e) => (e.type || 'expense') === 'expense');
    const income = list.filter((e) => e.type === 'income');

    const totalMinor = expenses.reduce((sum, e) => sum + e.amountMinor, 0);
    const count = expenses.length;
    const averageMinor = count > 0 ? Math.round(totalMinor / count) : 0;
    const incomeMinor = income.reduce((sum, e) => sum + e.amountMinor, 0);
    const incomeCount = income.length;

    return {
      date,
      totalMinor,
      count,
      averageMinor,
      incomeMinor,
      incomeCount,
    };
  }

  public getMonthlySummary(month: string): MonthlySummary {
    const list = this.getExpensesRaw().filter((e) => e.expenseDate.startsWith(month));
    const expenses = list.filter((e) => (e.type || 'expense') === 'expense');
    const income = list.filter((e) => e.type === 'income');

    const totalMinor = expenses.reduce((sum, e) => sum + e.amountMinor, 0);
    const incomeTotalMinor = income.reduce((sum, e) => sum + e.amountMinor, 0);

    return {
      month,
      totalMinor,
      count: expenses.length,
      incomeTotalMinor,
      incomeCount: income.length,
      netSavingsMinor: incomeTotalMinor - totalMinor,
    };
  }

  public getCategorySummary(from?: string, to?: string): CategorySummaryItem[] {
    const categories = this.getCategories();
    let list = this.getExpensesRaw().filter((e) => (e.type || 'expense') === 'expense');
    if (from) list = list.filter((e) => e.expenseDate >= from);
    if (to) list = list.filter((e) => e.expenseDate <= to);

    const grandTotal = list.reduce((sum, e) => sum + e.amountMinor, 0);

    return categories
      .map((cat) => {
        const catExpenses = list.filter((e) => e.categoryId === cat.id);
        const totalMinor = catExpenses.reduce((sum, e) => sum + e.amountMinor, 0);
        const count = catExpenses.length;
        const percentage = grandTotal > 0 ? Number(((totalMinor / grandTotal) * 100).toFixed(1)) : 0;
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          iconKey: cat.iconKey,
          colorKey: cat.colorKey,
          totalMinor,
          count,
          percentage,
        };
      })
      .filter((c) => c.totalMinor > 0)
      .sort((a, b) => b.totalMinor - a.totalMinor);
  }

  // --- Balance ---
  public getBalance(): UserBalance {
    const raw = this.getStorageItem<any>(this.getUserKey('balance'), null);
    const isDemo = this.getCurrentUserId() === '00000000-0000-0000-0000-000000000001';

    if (!raw && !isDemo) {
      const transactions = this.getExpensesRaw();
      const totalExpensesMinor = transactions
        .filter((e) => (e.type || 'expense') === 'expense')
        .reduce((sum, e) => sum + e.amountMinor, 0);
      const totalIncomeMinor = transactions
        .filter((e) => e.type === 'income')
        .reduce((sum, e) => sum + e.amountMinor, 0);

      return {
        availableBalanceMinor: null,
        currencyCode: 'BDT',
        referenceDate: null,
        totalExpensesMinor,
        totalIncomeMinor,
        remainingBalanceMinor: null,
        isConfigured: false,
        updatedAt: null,
      };
    }

    const availableBalanceMinor = raw?.availableBalanceMinor ?? (isDemo ? 2500000 : null);
    const currencyCode = raw?.currencyCode || 'BDT';
    const referenceDate = raw?.referenceDate || (isDemo ? getFirstDayOfMonth(getTodayString()) : null);
    const isConfigured = raw?.isConfigured ?? (isDemo ? true : false);
    const updatedAt = raw?.updatedAt || null;

    if (availableBalanceMinor === null) {
      return {
        availableBalanceMinor: null,
        currencyCode,
        referenceDate: null,
        totalExpensesMinor: 0,
        totalIncomeMinor: 0,
        remainingBalanceMinor: null,
        isConfigured: false,
        updatedAt: null,
      };
    }

    const transactions = this.getExpensesRaw().filter((e) => referenceDate ? e.expenseDate >= referenceDate : true);
    const totalExpensesMinor = transactions
      .filter((e) => (e.type || 'expense') === 'expense')
      .reduce((sum, e) => sum + e.amountMinor, 0);
    const totalIncomeMinor = transactions
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amountMinor, 0);

    const remainingBalanceMinor = availableBalanceMinor + totalIncomeMinor - totalExpensesMinor;

    return {
      availableBalanceMinor,
      currencyCode,
      referenceDate,
      totalExpensesMinor,
      totalIncomeMinor,
      remainingBalanceMinor,
      isConfigured,
      updatedAt,
    };
  }

  public updateBalance(payload: { amountMinor: number; currencyCode?: string; referenceDate?: string }): UserBalance {
    const existing = this.getBalance();
    const referenceDate = payload.referenceDate || existing.referenceDate || getFirstDayOfMonth(getTodayString());
    const availableBalanceMinor = payload.amountMinor;
    const currencyCode = payload.currencyCode || existing.currencyCode || 'BDT';
    const updatedAt = new Date().toISOString();

    const storedData = {
      availableBalanceMinor,
      currencyCode,
      referenceDate,
      isConfigured: true,
      updatedAt,
    };

    this.setStorageItem(this.getUserKey('balance'), storedData);
    return this.getBalance();
  }

  // --- Budgets ---
  public getBudgets(month?: string): Budget[] {
    const targetMonth = month || getTodayString().slice(0, 7);
    const isDemo = this.getCurrentUserId() === '00000000-0000-0000-0000-000000000001';
    let stored = this.getStorageItem<Budget[] | null>(this.getUserKey('budgets'), null);
    if (stored === null) {
      stored = isDemo
        ? [
            {
              id: 'b-default-1',
              userId: this.getCurrentUserId(),
              month: targetMonth,
              categoryId: null,
              categoryName: null,
              amountMinor: 3500000, // ৳35,000 overall
              spentMinor: 0,
              remainingMinor: 3500000,
              percentageUsed: 0,
              warningThresholdPercent: 80,
              isExceeded: false,
              isWarning: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'b-default-2',
              userId: this.getCurrentUserId(),
              month: targetMonth,
              categoryId: '11111111-1111-1111-1111-111111111101',
              categoryName: 'Food & Groceries',
              amountMinor: 1200000, // ৳12,000
              spentMinor: 0,
              remainingMinor: 1200000,
              percentageUsed: 0,
              warningThresholdPercent: 80,
              isExceeded: false,
              isWarning: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]
        : [];
      this.setStorageItem(this.getUserKey('budgets'), stored);
    }

    const monthExpenses = this.getExpensesRaw().filter(
      (e) => (e.type || 'expense') === 'expense' && e.expenseDate.startsWith(targetMonth)
    );

    return stored
      .filter((b) => b.month === targetMonth)
      .map((b) => {
        let spent = 0;
        if (b.categoryId) {
          spent = monthExpenses.filter((e) => e.categoryId === b.categoryId).reduce((sum, e) => sum + e.amountMinor, 0);
        } else {
          spent = monthExpenses.reduce((sum, e) => sum + e.amountMinor, 0);
        }
        const remaining = b.amountMinor - spent;
        const pct = b.amountMinor > 0 ? Math.round((spent / b.amountMinor) * 100) : 0;
        return {
          ...b,
          spentMinor: spent,
          remainingMinor: remaining,
          percentageUsed: pct,
          isExceeded: spent > b.amountMinor,
          isWarning: pct >= (b.warningThresholdPercent || 80) && spent <= b.amountMinor,
        };
      });
  }

  public setBudget(payload: { month: string; categoryId?: string | null; amountMinor: number; warningThresholdPercent?: number }): Budget {
    const list = this.getStorageItem<Budget[]>(this.getUserKey('budgets'), []);
    const catId = payload.categoryId || null;
    const categories = this.getCategories();
    const cat = catId ? categories.find((c) => c.id === catId) : null;

    const existingIdx = list.findIndex((b) => b.month === payload.month && (b.categoryId || null) === catId);
    let budgetItem: Budget;

    if (existingIdx >= 0) {
      budgetItem = {
        ...list[existingIdx],
        amountMinor: payload.amountMinor,
        warningThresholdPercent: payload.warningThresholdPercent || 80,
        updatedAt: new Date().toISOString(),
      };
      list[existingIdx] = budgetItem;
    } else {
      budgetItem = {
        id: `budget-${Date.now()}`,
        userId: this.getCurrentUserId(),
        month: payload.month,
        categoryId: catId,
        categoryName: cat?.name || null,
        amountMinor: payload.amountMinor,
        spentMinor: 0,
        remainingMinor: payload.amountMinor,
        percentageUsed: 0,
        warningThresholdPercent: payload.warningThresholdPercent || 80,
        isExceeded: false,
        isWarning: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(budgetItem);
    }

    this.setStorageItem(this.getUserKey('budgets'), list);
    const updatedList = this.getBudgets(payload.month);
    return updatedList.find((b) => b.id === budgetItem.id) || budgetItem;
  }

  public deleteBudget(id: string): void {
    const list = this.getStorageItem<Budget[]>(this.getUserKey('budgets'), []).filter((b) => b.id !== id);
    this.setStorageItem(this.getUserKey('budgets'), list);
  }

  // --- Savings Goals ---
  public getGoals(): SavingsGoal[] {
    const isDemo = this.getCurrentUserId() === '00000000-0000-0000-0000-000000000001';
    let goals = this.getStorageItem<SavingsGoal[] | null>(this.getUserKey('goals'), null);
    if (goals === null) {
      goals = isDemo
        ? [
            {
              id: 'goal-1',
              userId: this.getCurrentUserId(),
              title: 'Emergency Cash Reserve',
              targetAmountMinor: 10000000, // ৳100,000
              currentAmountMinor: 3500000, // ৳35,000
              remainingMinor: 6500000,
              progressPercent: 35,
              targetDate: '2026-12-31',
              categoryId: null,
              categoryName: null,
              notes: '3 months basic cost of living buffer',
              isCompleted: false,
              suggestedMonthlyContributionMinor: 750000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'goal-2',
              userId: this.getCurrentUserId(),
              title: 'MacBook M3 Upgrade',
              targetAmountMinor: 18000000, // ৳180,000
              currentAmountMinor: 7200000, // ৳72,000
              remainingMinor: 10800000,
              progressPercent: 40,
              targetDate: '2027-04-30',
              categoryId: null,
              categoryName: null,
              notes: 'Next gen workstation fund',
              isCompleted: false,
              suggestedMonthlyContributionMinor: 900000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]
        : [];
      this.setStorageItem(this.getUserKey('goals'), goals);
    }

    return goals.map((g) => {
      const remaining = Math.max(0, g.targetAmountMinor - g.currentAmountMinor);
      const pct = g.targetAmountMinor > 0 ? Math.min(100, Math.round((g.currentAmountMinor / g.targetAmountMinor) * 100)) : 0;
      return {
        ...g,
        remainingMinor: remaining,
        progressPercent: pct,
        isCompleted: g.currentAmountMinor >= g.targetAmountMinor,
      };
    });
  }

  public createGoal(payload: {
    title: string;
    targetAmountMinor: number;
    currentAmountMinor?: number;
    targetDate: string;
    categoryId?: string | null;
    notes?: string | null;
  }): SavingsGoal {
    const list = this.getGoals();
    const id = `goal-${Date.now()}`;
    const newGoal: SavingsGoal = {
      id,
      userId: this.getCurrentUserId(),
      title: payload.title,
      targetAmountMinor: payload.targetAmountMinor,
      currentAmountMinor: payload.currentAmountMinor || 0,
      remainingMinor: Math.max(0, payload.targetAmountMinor - (payload.currentAmountMinor || 0)),
      progressPercent: Math.min(100, Math.round(((payload.currentAmountMinor || 0) / payload.targetAmountMinor) * 100)),
      targetDate: payload.targetDate,
      categoryId: payload.categoryId || null,
      notes: payload.notes || null,
      isCompleted: (payload.currentAmountMinor || 0) >= payload.targetAmountMinor,
      suggestedMonthlyContributionMinor: Math.ceil(payload.targetAmountMinor / 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newGoal);
    this.setStorageItem(this.getUserKey('goals'), list);
    return newGoal;
  }

  public contributeGoal(id: string, amountMinor: number): SavingsGoal {
    const list = this.getGoals();
    const idx = list.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Goal not found');
    list[idx].currentAmountMinor += amountMinor;
    list[idx].updatedAt = new Date().toISOString();
    this.setStorageItem(this.getUserKey('goals'), list);
    return list[idx];
  }

  public deleteGoal(id: string): void {
    const list = this.getGoals().filter((g) => g.id !== id);
    this.setStorageItem(this.getUserKey('goals'), list);
  }

  // --- Recurring Transactions ---
  public getRecurring(): RecurringTransaction[] {
    const isDemo = this.getCurrentUserId() === '00000000-0000-0000-0000-000000000001';
    let recs = this.getStorageItem<RecurringTransaction[] | null>(this.getUserKey('recurring'), null);
    if (recs === null) {
      recs = isDemo
        ? [
            {
              id: 'rec-1',
              userId: this.getCurrentUserId(),
              type: 'expense',
              amountMinor: 285000, // ৳2,850
              categoryId: '11111111-1111-1111-1111-111111111103',
              categoryName: 'Bills & Utilities',
              accountId: 'acc-2222-2222-2222-2222',
              accountName: 'City Bank Savings',
              frequency: 'monthly',
              nextDueDate: '2026-10-15',
              note: 'Fiber Broadband Internet Bill',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'rec-2',
              userId: this.getCurrentUserId(),
              type: 'expense',
              amountMinor: 120000, // ৳1,200
              categoryId: '11111111-1111-1111-1111-111111111105',
              categoryName: 'Entertainment',
              accountId: 'acc-3333-3333-3333-3333',
              accountName: 'bKash Personal',
              frequency: 'monthly',
              nextDueDate: '2026-10-25',
              note: 'Spotify Family Subscription',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]
        : [];
      this.setStorageItem(this.getUserKey('recurring'), recs);
    }
    return recs;
  }

  public createRecurring(payload: {
    type: 'expense' | 'income';
    amountMinor: number;
    categoryId: string;
    accountId?: string | null;
    frequency: 'weekly' | 'monthly';
    nextDueDate: string;
    note?: string | null;
  }): RecurringTransaction {
    const list = this.getRecurring();
    const categories = this.getCategories();
    const accounts = this.getAccounts();
    const cat = categories.find((c) => c.id === payload.categoryId);
    const acc = accounts.find((a) => a.id === payload.accountId);

    const newRec: RecurringTransaction = {
      id: `rec-${Date.now()}`,
      userId: this.getCurrentUserId(),
      type: payload.type,
      amountMinor: payload.amountMinor,
      categoryId: payload.categoryId,
      categoryName: cat?.name,
      accountId: payload.accountId || null,
      accountName: acc?.name,
      frequency: payload.frequency,
      nextDueDate: payload.nextDueDate,
      note: payload.note || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newRec);
    this.setStorageItem(this.getUserKey('recurring'), list);
    return newRec;
  }

  public processRecurringPayment(id: string): { recurring: RecurringTransaction; transactionId: string } {
    const list = this.getRecurring();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Recurring rule not found');

    const rec = list[idx];
    const today = getTodayString();

    // 1. Create real expense
    const createdExp = this.createExpense({
      amountMinor: rec.amountMinor,
      categoryId: rec.categoryId,
      accountId: rec.accountId,
      type: rec.type,
      expenseDate: today,
      note: rec.note || 'Recurring payment',
      tags: 'recurring',
    });

    // 2. Advance due date
    const d = new Date(rec.nextDueDate);
    if (rec.frequency === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    const nextDueDate = d.toISOString().split('T')[0];

    rec.nextDueDate = nextDueDate;
    rec.updatedAt = new Date().toISOString();
    list[idx] = rec;
    this.setStorageItem(this.getUserKey('recurring'), list);

    return { recurring: rec, transactionId: createdExp.id };
  }

  public deleteRecurring(id: string): void {
    const list = this.getRecurring().filter((r) => r.id !== id);
    this.setStorageItem(this.getUserKey('recurring'), list);
  }

  // --- AI Finance Copilot Simulation (Deterministic Grounding) ---
  public askCopilot(query: string): CopilotResponse {
    const q = query.toLowerCase().trim();
    const today = getTodayString();
    const currentMonth = today.slice(0, 7);
    const balance = this.getBalance();
    const todaySummary = this.getDailySummary(today);
    const monthSummary = this.getMonthlySummary(currentMonth);
    const breakdown = this.getCategorySummary(`${currentMonth}-01`, today);
    const budgets = this.getBudgets(currentMonth);
    const goals = this.getGoals();
    const categories = this.getCategories();
    const accounts = this.getAccounts();

    const formatBDT = (minor: number) => `৳${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let answer = '';
    let draftTransaction: CopilotDraftTransaction | null = null;
    const suggestedPrompts = [
      'How much did I spend today?',
      'What are my biggest spending categories this month?',
      'How much budget remains?',
      'Compare my spending with last month',
      'Suggest a realistic savings plan for my goal',
    ];

    // Transaction Draft Parser
    const numberMatches = q.match(/(?:spent|paid|cost|bought|add|record|received|deposit|income)\D*?(\d+(?:\.\d{1,2})?)/i) || q.match(/(\d+(?:\.\d{1,2})?)\s*(?:tk|bdt|taka)?\s*(?:for|on|in)/i);
    const isIncome = /income|received|salary|deposit|earned/i.test(q);
    const isExpenseIntent = /spent|paid|bought|cost|expense|lunch|groceries|coffee|bus|rickshaw/i.test(q);

    if (numberMatches && (isIncome || isExpenseIntent)) {
      const parsedAmount = parseFloat(numberMatches[1]);
      const amountMinor = Math.round(parsedAmount * 100);
      const type: 'expense' | 'income' = isIncome ? 'income' : 'expense';

      let matchedCat = categories[0];
      for (const c of categories) {
        if (q.includes(c.name.toLowerCase())) {
          matchedCat = c;
          break;
        }
      }
      if (q.includes('food') || q.includes('lunch') || q.includes('dinner') || q.includes('coffee')) {
        matchedCat = categories.find((c) => /food/i.test(c.name)) || matchedCat;
      } else if (q.includes('transport') || q.includes('uber') || q.includes('bus') || q.includes('rickshaw')) {
        matchedCat = categories.find((c) => /transport/i.test(c.name)) || matchedCat;
      }

      const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];

      draftTransaction = {
        type,
        amountMinor,
        amountFormatted: formatBDT(amountMinor),
        categoryId: matchedCat.id,
        categoryName: matchedCat.name,
        accountId: defaultAcc?.id,
        accountName: defaultAcc?.name,
        date: today,
        note: `Via Copilot: ${query.slice(0, 80)}`,
      };

      answer = `I have generated a draft **${type.toUpperCase()}** for **${formatBDT(amountMinor)}** under **${matchedCat.name}** (${defaultAcc?.name || 'Default Account'}). Please review the card below and confirm to record it in your live database.`;

      return {
        answer,
        source: 'deterministic_copilot',
        draftTransaction,
        suggestedPrompts,
        metricsSnapshot: {
          todayExpenseMinor: todaySummary.totalMinor,
          monthExpenseMinor: monthSummary.totalMinor,
          availableBalanceMinor: balance.remainingBalanceMinor,
        },
      };
    }

    if (q.includes('today')) {
      const balStr = balance.remainingBalanceMinor !== null ? formatBDT(balance.remainingBalanceMinor) : 'Not set yet (tap Edit Balance to set)';
      answer = `Today's verified spending is **${formatBDT(todaySummary.totalMinor)}** across **${todaySummary.count}** expense transaction${todaySummary.count === 1 ? '' : 's'}.\n\n` +
        `• **Average Expense per Transaction:** ${formatBDT(todaySummary.averageMinor)}\n` +
        `• **Current Total Available Balance:** ${balStr}`;
    } else if (q.includes('biggest') || q.includes('top') || q.includes('category') || q.includes('categories')) {
      if (breakdown.length === 0) {
        answer = `No categorized expenses logged yet for this month (${currentMonth}).`;
      } else {
        const top = breakdown.slice(0, 4);
        answer = `Your top spending categories this month are:\n\n` +
          top.map((c, i) => `${i + 1}. **${c.categoryName}**: ${formatBDT(c.totalMinor)} (${c.percentage}%)`).join('\n') +
          `\n\nTotal monthly spending: **${formatBDT(monthSummary.totalMinor)}**.`;
      }
    } else if (q.includes('budget') || q.includes('remain')) {
      const overall = budgets.find((b) => b.categoryId === null);
      if (overall) {
        answer = `Monthly Budget Status (**${currentMonth}**):\n\n` +
          `• **Total Budget:** ${formatBDT(overall.amountMinor)}\n` +
          `• **Spent:** ${formatBDT(overall.spentMinor)} (${overall.percentageUsed}%)\n` +
          `• **Remaining Budget:** **${formatBDT(overall.remainingMinor)}** ${overall.isExceeded ? '⚠️ **(Exceeded)**' : '✅'}`;
      } else {
        answer = `You don't have an overall monthly budget set for **${currentMonth}**.`;
      }
    } else if (q.includes('compare') || q.includes('last month')) {
      answer = `In **${currentMonth}**, you have spent **${formatBDT(monthSummary.totalMinor)}** with total income of **${formatBDT(monthSummary.incomeTotalMinor || 0)}**. Net savings this month is **${formatBDT(monthSummary.netSavingsMinor || 0)}**.`;
    } else if (q.includes('goal') || q.includes('saving')) {
      const gList = goals.map((g) => `• **${g.title}**: Saved ${formatBDT(g.currentAmountMinor)} of ${formatBDT(g.targetAmountMinor)} (${g.progressPercent}%). Target: **${g.targetDate}**. Suggested: **${formatBDT(g.suggestedMonthlyContributionMinor)}/mo**`).join('\n');
      answer = `Here is your savings goal roadmap:\n\n${gList}`;
    } else {
      const balStr = balance.remainingBalanceMinor !== null ? formatBDT(balance.remainingBalanceMinor) : 'Not configured yet';
      answer = `Hello! I am your **DailyFlow Finance Copilot**.\n\n` +
        `• **Available Balance:** ${balStr}\n` +
        `• **Today's Expenses:** ${formatBDT(todaySummary.totalMinor)}\n` +
        `• **This Month Total:** ${formatBDT(monthSummary.totalMinor)}\n\n` +
        `Ask me: *"How much did I spend today?"*, *"How much budget remains?"*, or type: *"Spent 450 on Lunch"* to draft a transaction!`;
    }

    return {
      answer,
      source: 'deterministic_copilot',
      draftTransaction,
      suggestedPrompts,
      metricsSnapshot: {
        todayExpenseMinor: todaySummary.totalMinor,
        monthExpenseMinor: monthSummary.totalMinor,
        availableBalanceMinor: balance.remainingBalanceMinor,
      },
    };
  }
}

export const mockStorage = new MockStorageService();
