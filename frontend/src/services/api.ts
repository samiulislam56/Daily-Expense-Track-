import {
  Category,
  Expense,
  ExpenseFilters,
  PaginatedExpensesResponse,
  DailySummary,
  MonthlySummary,
  CategorySummaryItem,
  UserBalance,
} from '../types/index.js';
import { mockStorage } from './mockStorage.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

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
  // Always use local mock storage on GitHub Pages
  if (window.location.hostname.includes('github.io')) return true;
  if (localStorage.getItem('dailyflow_force_mock') === 'true') return true;
  return false;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
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
  // Categories
  async getCategories(): Promise<Category[]> {
    if (isStandaloneDemo()) {
      return mockStorage.getCategories();
    }
    try {
      const res = await request<{ data: Category[] }>('/api/v1/categories');
      return res.data;
    } catch (err) {
      console.warn('API unavailable, falling back to local demo storage:', err);
      return mockStorage.getCategories();
    }
  },

  // Expenses
  async getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedExpensesResponse> {
    if (isStandaloneDemo()) {
      return mockStorage.getExpenses(filters);
    }
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.q) params.append('q', filters.q);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await request<PaginatedExpensesResponse>(`/api/v1/expenses${queryString}`);
    } catch (err) {
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
      return mockStorage.getExpenseById(id);
    }
  },

  async createExpense(payload: {
    amountMinor: number;
    currencyCode?: string;
    categoryId: string;
    expenseDate: string;
    note?: string;
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
      return mockStorage.updateBalance(payload);
    }
  },
};
