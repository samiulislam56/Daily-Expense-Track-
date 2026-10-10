export interface Category {
  id: string;
  name: string;
  iconKey: string;
  colorKey: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    iconKey: string;
    colorKey: string;
  };
  amountMinor: number;
  currencyCode: string;
  expenseDate: string; // YYYY-MM-DD
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedExpensesResponse {
  data: Expense[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface DailySummary {
  date: string;
  totalMinor: number;
  count: number;
}

export interface MonthlySummary {
  month: string;
  totalMinor: number;
  count: number;
}

export interface CategorySummaryItem {
  categoryId: string;
  categoryName: string;
  iconKey: string;
  colorKey: string;
  totalMinor: number;
  count: number;
  percentage: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveTab = 'overview' | 'history' | 'analytics' | 'calculator' | 'settings';
