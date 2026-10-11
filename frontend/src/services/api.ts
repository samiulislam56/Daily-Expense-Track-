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
  UserProfile,
  AuthResponse,
} from '../types/index.js';
import { mockStorage } from './mockStorage.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const TOKEN_KEY = 'dailyflow_auth_token';
const USER_KEY = 'dailyflow_auth_user';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getCachedUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCachedUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export class ApiError extends Error {
  public code: string;
  public details?: Array<{ field?: string; message: string }>;
  public status: number;

  constructor(message: string, status: number, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isStandaloneDemo(): boolean {
  if (typeof window === 'undefined') return false;
  // Always use local mock storage on GitHub Pages or if explicitly forced
  if (window.location.hostname.includes('github.io')) return true;
  if (localStorage.getItem('dailyflow_force_mock') === 'true') return true;
  return false;
}

function shouldRethrow(err: any): boolean {
  if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
    return true;
  }
  return false;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 204) {
    return null as unknown as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorObj = data?.error || {};
    throw new ApiError(
      errorObj.message || `Request failed with status ${response.status}`,
      response.status,
      errorObj.code || 'HTTP_ERROR',
      errorObj.details
    );
  }

  return data;
}

export const api = {
  // Authentication
  async register(payload: {
    username: string;
    password: string;
    confirmPassword?: string;
    displayName?: string;
  }): Promise<AuthResponse> {
    if (isStandaloneDemo()) {
      const res = mockStorage.register(payload);
      setAuthToken(res.token);
      setCachedUser(res.user);
      return res;
    }
    try {
      const res = await request<{ data: AuthResponse }>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAuthToken(res.data.token);
      setCachedUser(res.data.user);
      mockStorage.setActiveSession(res.data.user);
      return res.data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      // If server is unreachable and no API_BASE_URL is configured, fallback to mockStorage
      if (!API_BASE_URL) {
        const res = mockStorage.register(payload);
        setAuthToken(res.token);
        setCachedUser(res.user);
        return res;
      }
      throw err;
    }
  },

  async login(payload: { username: string; password: string }): Promise<AuthResponse> {
    if (isStandaloneDemo()) {
      const res = mockStorage.login(payload);
      setAuthToken(res.token);
      setCachedUser(res.user);
      return res;
    }
    try {
      const res = await request<{ data: AuthResponse }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAuthToken(res.data.token);
      setCachedUser(res.data.user);
      mockStorage.setActiveSession(res.data.user);
      return res.data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      if (!API_BASE_URL) {
        const res = mockStorage.login(payload);
        setAuthToken(res.token);
        setCachedUser(res.user);
        return res;
      }
      throw err;
    }
  },

  async getMe(): Promise<UserProfile> {
    if (isStandaloneDemo()) {
      const user = mockStorage.getMe();
      setCachedUser(user);
      return user;
    }
    try {
      const res = await request<{ data: { user: UserProfile } }>('/api/v1/auth/me');
      setCachedUser(res.data.user);
      mockStorage.setActiveSession(res.data.user);
      return res.data.user;
    } catch (err: any) {
      if (shouldRethrow(err)) {
        setAuthToken(null);
        setCachedUser(null);
        mockStorage.logout();
        throw err;
      }
      const cached = getCachedUser();
      if (cached) return cached;
      return mockStorage.getMe();
    }
  },

  async logout(): Promise<void> {
    try {
      if (!isStandaloneDemo()) {
        await request<void>('/api/v1/auth/logout', { method: 'POST' });
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      setAuthToken(null);
      setCachedUser(null);
      mockStorage.logout();
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    if (isStandaloneDemo()) {
      return mockStorage.getCategories();
    }
    try {
      const res = await request<{ data: Category[] }>('/api/v1/categories');
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      console.warn('API unavailable, falling back to local demo storage:', err);
      return mockStorage.getCategories();
    }
  },

  // Accounts
  async getAccounts(): Promise<Account[]> {
    if (isStandaloneDemo()) {
      return mockStorage.getAccounts();
    }
    try {
      const res = await request<{ data: Account[] }>('/api/v1/accounts');
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.getAccounts();
    }
  },

  async createAccount(payload: {
    name: string;
    type: 'cash' | 'bank' | 'mobile_wallet' | 'other';
    balanceMinor?: number;
    currencyCode?: string;
    isDefault?: boolean;
  }): Promise<Account> {
    if (isStandaloneDemo()) {
      return mockStorage.createAccount(payload);
    }
    try {
      const res = await request<{ data: Account }>('/api/v1/accounts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.createAccount(payload);
    }
  },

  async updateAccount(
    id: string,
    payload: {
      name?: string;
      type?: 'cash' | 'bank' | 'mobile_wallet' | 'other';
      balanceMinor?: number;
      currencyCode?: string;
      isDefault?: boolean;
    }
  ): Promise<Account> {
    if (isStandaloneDemo()) {
      return mockStorage.updateAccount(id, payload);
    }
    try {
      const res = await request<{ data: Account }>(`/api/v1/accounts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.updateAccount(id, payload);
    }
  },

  async deleteAccount(id: string): Promise<void> {
    if (isStandaloneDemo()) {
      mockStorage.deleteAccount(id);
      return;
    }
    try {
      await request<void>(`/api/v1/accounts/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      mockStorage.deleteAccount(id);
    }
  },

  // Expenses & Transactions
  async getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedExpensesResponse> {
    if (isStandaloneDemo()) {
      return mockStorage.getExpenses(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.type) params.append('type', filters.type);
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.q) params.append('q', filters.q);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await request<PaginatedExpensesResponse>(`/api/v1/expenses${queryString}`);
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      console.warn('API unavailable, falling back to local demo storage:', err);
      return mockStorage.getExpenses(filters);
    }
  },

  async getExpenseById(id: string): Promise<Expense> {
    if (isStandaloneDemo()) {
      return mockStorage.getExpenseById(id);
    }
    try {
      const res = await request<{ data: Expense }>(`/api/v1/expenses/${id}`);
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.getExpenseById(id);
    }
  },

  async createExpense(payload: {
    amountMinor: number;
    currencyCode?: string;
    categoryId: string;
    expenseDate: string;
    note?: string;
    type?: 'expense' | 'income' | 'adjustment';
    accountId?: string | null;
    tags?: string;
  }): Promise<Expense> {
    if (isStandaloneDemo()) {
      return mockStorage.createExpense(payload);
    }
    try {
      const res = await request<{ data: Expense }>('/api/v1/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.createExpense(payload);
    }
  },

  async updateExpense(
    id: string,
    payload: {
      amountMinor?: number;
      currencyCode?: string;
      categoryId?: string;
      expenseDate?: string;
      note?: string | null;
      type?: 'expense' | 'income' | 'adjustment';
      accountId?: string | null;
      tags?: string;
    }
  ): Promise<Expense> {
    if (isStandaloneDemo()) {
      return mockStorage.updateExpense(id, payload);
    }
    try {
      const res = await request<{ data: Expense }>(`/api/v1/expenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.updateExpense(id, payload);
    }
  },

  async deleteExpense(id: string): Promise<void> {
    if (isStandaloneDemo()) {
      mockStorage.deleteExpense(id);
      return;
    }
    try {
      await request<void>(`/api/v1/expenses/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      mockStorage.deleteExpense(id);
    }
  },

  // Summaries
  async getDailySummary(date: string): Promise<DailySummary> {
    if (isStandaloneDemo()) {
      return mockStorage.getDailySummary(date);
    }
    try {
      const res = await request<{ data: DailySummary }>(`/api/v1/summary/daily?date=${date}`);
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.getDailySummary(date);
    }
  },

  async getMonthlySummary(month: string): Promise<MonthlySummary> {
    if (isStandaloneDemo()) {
      return mockStorage.getMonthlySummary(month);
    }
    try {
      const res = await request<{ data: MonthlySummary }>(`/api/v1/summary/monthly?month=${month}`);
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.getMonthlySummary(month);
    }
  },

  async getCategorySummary(from?: string, to?: string): Promise<CategorySummaryItem[]> {
    if (isStandaloneDemo()) {
      return mockStorage.getCategorySummary(from, to);
    }
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await request<{ data: CategorySummaryItem[] }>(`/api/v1/summary/categories${queryString}`);
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.getCategorySummary(from, to);
    }
  },

  // Balance Management
  async getBalance(): Promise<UserBalance> {
    if (isStandaloneDemo()) {
      return mockStorage.getBalance();
    }
    try {
      const res = await request<{ data: UserBalance }>('/api/v1/balance');
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.getBalance();
    }
  },

  async updateBalance(payload: {
    amountMinor: number;
    currencyCode?: string;
    referenceDate?: string;
  }): Promise<UserBalance> {
    if (isStandaloneDemo()) {
      return mockStorage.updateBalance(payload);
    }
    try {
      const res = await request<{ data: UserBalance }>('/api/v1/balance', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.updateBalance(payload);
    }
  },

  // Budgets
  async getBudgets(month?: string): Promise<Budget[]> {
    if (isStandaloneDemo()) {
      return mockStorage.getBudgets(month);
    }
    try {
      const qs = month ? `?month=${month}` : '';
      const res = await request<{ data: Budget[] }>(`/api/v1/budgets${qs}`);
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.getBudgets(month);
    }
  },

  async setBudget(payload: {
    month: string;
    categoryId?: string | null;
    amountMinor: number;
    warningThresholdPercent?: number;
  }): Promise<Budget> {
    if (isStandaloneDemo()) {
      return mockStorage.setBudget(payload);
    }
    try {
      const res = await request<{ data: Budget }>('/api/v1/budgets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.setBudget(payload);
    }
  },

  async deleteBudget(id: string): Promise<void> {
    if (isStandaloneDemo()) {
      mockStorage.deleteBudget(id);
      return;
    }
    try {
      await request<void>(`/api/v1/budgets/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      mockStorage.deleteBudget(id);
    }
  },

  // Savings Goals
  async getGoals(): Promise<SavingsGoal[]> {
    if (isStandaloneDemo()) {
      return mockStorage.getGoals();
    }
    try {
      const res = await request<{ data: SavingsGoal[] }>('/api/v1/goals');
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.getGoals();
    }
  },

  async createGoal(payload: {
    title: string;
    targetAmountMinor: number;
    currentAmountMinor?: number;
    targetDate: string;
    categoryId?: string | null;
    notes?: string | null;
  }): Promise<SavingsGoal> {
    if (isStandaloneDemo()) {
      return mockStorage.createGoal(payload);
    }
    try {
      const res = await request<{ data: SavingsGoal }>('/api/v1/goals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.createGoal(payload);
    }
  },

  async contributeGoal(id: string, amountMinor: number): Promise<SavingsGoal> {
    if (isStandaloneDemo()) {
      return mockStorage.contributeGoal(id, amountMinor);
    }
    try {
      const res = await request<{ data: SavingsGoal }>(`/api/v1/goals/${id}/contribute`, {
        method: 'POST',
        body: JSON.stringify({ amountMinor }),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.contributeGoal(id, amountMinor);
    }
  },

  async deleteGoal(id: string): Promise<void> {
    if (isStandaloneDemo()) {
      mockStorage.deleteGoal(id);
      return;
    }
    try {
      await request<void>(`/api/v1/goals/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      mockStorage.deleteGoal(id);
    }
  },

  // Recurring Transactions
  async getRecurring(): Promise<RecurringTransaction[]> {
    if (isStandaloneDemo()) {
      return mockStorage.getRecurring();
    }
    try {
      const res = await request<{ data: RecurringTransaction[] }>('/api/v1/recurring');
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.getRecurring();
    }
  },

  async createRecurring(payload: {
    type: 'expense' | 'income';
    amountMinor: number;
    categoryId: string;
    accountId?: string | null;
    frequency: 'weekly' | 'monthly';
    nextDueDate: string;
    note?: string | null;
  }): Promise<RecurringTransaction> {
    if (isStandaloneDemo()) {
      return mockStorage.createRecurring(payload);
    }
    try {
      const res = await request<{ data: RecurringTransaction }>('/api/v1/recurring', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.createRecurring(payload);
    }
  },

  async processRecurringPayment(id: string): Promise<{ recurring: RecurringTransaction; transactionId: string }> {
    if (isStandaloneDemo()) {
      return mockStorage.processRecurringPayment(id);
    }
    try {
      const res = await request<{ data: { recurring: RecurringTransaction; transactionId: string } }>(
        `/api/v1/recurring/${id}/pay`,
        { method: 'POST' }
      );
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      return mockStorage.processRecurringPayment(id);
    }
  },

  async deleteRecurring(id: string): Promise<void> {
    if (isStandaloneDemo()) {
      mockStorage.deleteRecurring(id);
      return;
    }
    try {
      await request<void>(`/api/v1/recurring/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      mockStorage.deleteRecurring(id);
    }
  },

  // AI Finance Copilot
  async askCopilot(query: string): Promise<CopilotResponse> {
    if (isStandaloneDemo()) {
      return mockStorage.askCopilot(query);
    }
    try {
      const res = await request<{ data: CopilotResponse }>('/api/v1/copilot/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      return res.data;
    } catch (err) {
      if (shouldRethrow(err)) throw err;
      console.warn('Backend Copilot endpoint unreachable, using client deterministic analyzer:', err);
      return mockStorage.askCopilot(query);
    }
  },
};
