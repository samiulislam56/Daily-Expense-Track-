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
    const res = await request<{ data: Category[] }>('/api/v1/categories');
    return res.data;
  },

  // Expenses
  async getExpenses(filters: ExpenseFilters = {}): Promise<PaginatedExpensesResponse> {
    const params = new URLSearchParams();
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.q) params.append('q', filters.q);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<PaginatedExpensesResponse>(`/api/v1/expenses${queryString}`);
  },

  async getExpenseById(id: string): Promise<Expense> {
    const res = await request<{ data: Expense }>(`/api/v1/expenses/${id}`);
    return res.data;
  },

  async createExpense(payload: {
    amountMinor: number;
    currencyCode?: string;
    categoryId: string;
    expenseDate: string;
    note?: string;
  }): Promise<Expense> {
    const res = await request<{ data: Expense }>('/api/v1/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
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
    const res = await request<{ data: Expense }>(`/api/v1/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await request<void>(`/api/v1/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // Summaries
  async getDailySummary(date: string): Promise<DailySummary> {
    const res = await request<{ data: DailySummary }>(`/api/v1/summary/daily?date=${date}`);
    return res.data;
  },

  async getMonthlySummary(month: string): Promise<MonthlySummary> {
    const res = await request<{ data: MonthlySummary }>(`/api/v1/summary/monthly?month=${month}`);
    return res.data;
  },

  async getCategorySummary(from?: string, to?: string): Promise<CategorySummaryItem[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ data: CategorySummaryItem[] }>(`/api/v1/summary/categories${queryString}`);
    return res.data;
  },

  // Balance Management
  async getBalance(): Promise<UserBalance> {
    const res = await request<{ data: UserBalance }>('/api/v1/balance');
    return res.data;
  },

  async updateBalance(payload: {
    amountMinor: number;
    currencyCode?: string;
    referenceDate?: string;
  }): Promise<UserBalance> {
    const res = await request<{ data: UserBalance }>('/api/v1/balance', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
