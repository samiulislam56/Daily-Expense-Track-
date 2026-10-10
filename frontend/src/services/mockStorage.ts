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

const STORAGE_KEYS = {
  CATEGORIES: 'dailyflow_demo_categories_v1',
  EXPENSES: 'dailyflow_demo_expenses_v1',
  BALANCE: 'dailyflow_demo_balance_v1',
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
    name: 'Miscellaneous',
    iconKey: 'Tag',
    colorKey: '#64748B',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getMonthString(dateStr: string): string {
  return dateStr.slice(0, 7);
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
      amountMinor: 65000, // ৳650.00
      currencyCode: 'BDT',
      expenseDate: today,
      note: 'Grocery store essentials & fruits',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'e1111111-2222-3333-4444-555555555502',
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: '11111111-1111-1111-1111-111111111102',
      amountMinor: 22000, // ৳220.00
      currencyCode: 'BDT',
      expenseDate: today,
      note: 'Metro commute & rickshaw fare',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'e1111111-2222-3333-4444-555555555503',
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: '11111111-1111-1111-1111-111111111103',
      amountMinor: 285000, // ৳2,850.00
      currencyCode: 'BDT',
      expenseDate: yesterday,
      note: 'High-speed home fiber internet',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'e1111111-2222-3333-4444-555555555504',
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: '11111111-1111-1111-1111-111111111104',
      amountMinor: 48000, // ৳480.00
      currencyCode: 'BDT',
      expenseDate: yesterday,
      note: 'Monthly vitamins & pharmacy prescription',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'e1111111-2222-3333-4444-555555555505',
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: '11111111-1111-1111-1111-111111111105',
      amountMinor: 80000, // ৳800.00
      currencyCode: 'BDT',
      expenseDate: getFirstDayOfMonth(today),
      note: 'Movie tickets & weekend dining',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

class MockStorageService {
  private getCategoriesRaw(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }

  private getExpensesRaw(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const initial = generateInitialExpenses();
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initial));
    return initial;
  }

  private saveExpenses(expenses: Expense[]) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  private populateCategory(expense: Expense, categories: Category[]): Expense {
    const cat = categories.find((c) => c.id === expense.categoryId);
    return {
      ...expense,
      category: cat
        ? {
            id: cat.id,
            name: cat.name,
            iconKey: cat.iconKey,
            colorKey: cat.colorKey,
          }
        : undefined,
    };
  }

  public getCategories(): Category[] {
    return this.getCategoriesRaw();
  }

  public getExpenses(filters: ExpenseFilters = {}): PaginatedExpensesResponse {
    const categories = this.getCategoriesRaw();
    let list = this.getExpensesRaw().map((e) => this.populateCategory(e, categories));

    if (filters.from) {
      list = list.filter((e) => e.expenseDate >= filters.from!);
    }
    if (filters.to) {
      list = list.filter((e) => e.expenseDate <= filters.to!);
    }
    if (filters.categoryId) {
      list = list.filter((e) => e.categoryId === filters.categoryId);
    }
    if (filters.q && filters.q.trim()) {
      const q = filters.q.toLowerCase().trim();
      list = list.filter((e) => (e.note || '').toLowerCase().includes(q));
    }

    // Sort descending by date, then createdAt
    list.sort((a, b) => {
      if (a.expenseDate !== b.expenseDate) {
        return b.expenseDate.localeCompare(a.expenseDate);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.max(1, filters.pageSize || 20);
    const totalCount = list.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const data = list.slice(startIndex, startIndex + pageSize);

    return {
      data,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }

  public getExpenseById(id: string): Expense {
    const categories = this.getCategoriesRaw();
    const exp = this.getExpensesRaw().find((e) => e.id === id);
    if (!exp) {
      throw new Error(`Expense with ID ${id} not found`);
    }
    return this.populateCategory(exp, categories);
  }

  public createExpense(payload: {
    amountMinor: number;
    currencyCode?: string;
    categoryId: string;
    expenseDate: string;
    note?: string;
  }): Expense {
    const list = this.getExpensesRaw();
    const categories = this.getCategoriesRaw();
    const nowIso = new Date().toISOString();
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `exp-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const newExpense: Expense = {
      id: newId,
      userId: '00000000-0000-0000-0000-000000000001',
      categoryId: payload.categoryId,
      amountMinor: payload.amountMinor,
      currencyCode: payload.currencyCode || 'BDT',
      expenseDate: payload.expenseDate,
      note: payload.note || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    list.unshift(newExpense);
    this.saveExpenses(list);
    return this.populateCategory(newExpense, categories);
  }

  public updateExpense(
    id: string,
    payload: {
      amountMinor?: number;
      currencyCode?: string;
      categoryId?: string;
      expenseDate?: string;
      note?: string | null;
    }
  ): Expense {
    const list = this.getExpensesRaw();
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Expense with ID ${id} not found`);
    }

    const current = list[index];
    const updated: Expense = {
      ...current,
      amountMinor: payload.amountMinor !== undefined ? payload.amountMinor : current.amountMinor,
      currencyCode: payload.currencyCode !== undefined ? payload.currencyCode : current.currencyCode,
      categoryId: payload.categoryId !== undefined ? payload.categoryId : current.categoryId,
      expenseDate: payload.expenseDate !== undefined ? payload.expenseDate : current.expenseDate,
      note: payload.note !== undefined ? payload.note : current.note,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveExpenses(list);
    const categories = this.getCategoriesRaw();
    return this.populateCategory(updated, categories);
  }

  public deleteExpense(id: string): void {
    const list = this.getExpensesRaw();
    const filtered = list.filter((e) => e.id !== id);
    this.saveExpenses(filtered);
  }

  public getDailySummary(date: string): DailySummary {
    const list = this.getExpensesRaw().filter((e) => e.expenseDate === date);
    const count = list.length;
    const totalMinor = list.reduce((sum, e) => sum + e.amountMinor, 0);
    const averageMinor = count > 0 ? Math.round(totalMinor / count) : 0;

    return {
      date,
      totalMinor,
      count,
      averageMinor,
    };
  }

  public getMonthlySummary(month: string): MonthlySummary {
    const list = this.getExpensesRaw().filter((e) => e.expenseDate.startsWith(month));
    const count = list.length;
    const totalMinor = list.reduce((sum, e) => sum + e.amountMinor, 0);

    return {
      month,
      totalMinor,
      count,
    };
  }

  public getCategorySummary(from?: string, to?: string): CategorySummaryItem[] {
    const categories = this.getCategoriesRaw();
    let list = this.getExpensesRaw();
    if (from) list = list.filter((e) => e.expenseDate >= from);
    if (to) list = list.filter((e) => e.expenseDate <= to);

    const grandTotal = list.reduce((sum, e) => sum + e.amountMinor, 0);

    return categories.map((cat) => {
      const catExpenses = list.filter((e) => e.categoryId === cat.id);
      const totalMinor = catExpenses.reduce((sum, e) => sum + e.amountMinor, 0);
      const count = catExpenses.length;
      const percentage = grandTotal > 0 ? Number(((totalMinor / grandTotal) * 100).toFixed(2)) : 0;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        iconKey: cat.iconKey,
        colorKey: cat.colorKey,
        totalMinor,
        count,
        percentage,
      };
    });
  }

  public getBalance(): UserBalance {
    let raw: any = null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BALANCE);
      if (data) raw = JSON.parse(data);
    } catch {
      // fallback
    }

    const availableBalanceMinor = raw?.availableBalanceMinor ?? 2500000; // Default ৳25,000.00
    const currencyCode = raw?.currencyCode || 'BDT';
    const referenceDate = raw?.referenceDate || getFirstDayOfMonth(getTodayString());
    const isConfigured = raw?.isConfigured ?? true;
    const updatedAt = raw?.updatedAt || new Date().toISOString();

    // Compute expenses since referenceDate
    const expenses = this.getExpensesRaw().filter((e) => e.expenseDate >= referenceDate);
    const totalExpensesMinor = expenses.reduce((sum, e) => sum + e.amountMinor, 0);
    const remainingBalanceMinor = availableBalanceMinor - totalExpensesMinor;

    return {
      availableBalanceMinor,
      currencyCode,
      referenceDate,
      totalExpensesMinor,
      remainingBalanceMinor,
      isConfigured,
      updatedAt,
    };
  }

  public updateBalance(payload: {
    amountMinor: number;
    currencyCode?: string;
    referenceDate?: string;
  }): UserBalance {
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

    localStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(storedData));

    // Recompute
    const expenses = this.getExpensesRaw().filter((e) => e.expenseDate >= referenceDate);
    const totalExpensesMinor = expenses.reduce((sum, e) => sum + e.amountMinor, 0);
    const remainingBalanceMinor = availableBalanceMinor - totalExpensesMinor;

    return {
      availableBalanceMinor,
      currencyCode,
      referenceDate,
      totalExpensesMinor,
      remainingBalanceMinor,
      isConfigured: true,
      updatedAt,
    };
  }
}

export const mockStorage = new MockStorageService();
