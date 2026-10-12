export interface Category {
  id: string;
  name: string;
  iconKey: string;
  colorKey: string;
  isDefault: boolean;
  createdAt: string;
}

export type TransactionType = 'expense' | 'income' | 'adjustment';
export type AccountType = 'cash' | 'bank' | 'mobile_wallet' | 'other';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balanceMinor: number;
  currencyCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
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
  accountId?: string | null;
  account?: {
    id: string;
    name: string;
    type: string;
  };
  amountMinor: number;
  currencyCode: string;
  expenseDate: string; // YYYY-MM-DD
  note: string | null;
  type?: TransactionType;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  type?: TransactionType;
  accountId?: string;
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
  averageMinor: number;
  incomeMinor?: number;
  incomeCount?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserBalance {
  availableBalanceMinor: number | null;
  currencyCode: string;
  referenceDate: string | null;
  totalExpensesMinor: number;
  totalIncomeMinor?: number;
  remainingBalanceMinor: number | null;
  isConfigured: boolean;
  updatedAt: string | null;
}

export interface MonthlySummary {
  month: string;
  totalMinor: number;
  count: number;
  incomeTotalMinor?: number;
  incomeCount?: number;
  netSavingsMinor?: number;
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

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  categoryId: string | null;
  categoryName?: string | null;
  amountMinor: number;
  spentMinor: number;
  remainingMinor: number;
  percentageUsed: number;
  warningThresholdPercent: number;
  isExceeded: boolean;
  isWarning: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  remainingMinor: number;
  progressPercent: number;
  targetDate: string;
  categoryId: string | null;
  categoryName?: string | null;
  notes: string | null;
  isCompleted: boolean;
  suggestedMonthlyContributionMinor: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  type: 'expense' | 'income';
  amountMinor: number;
  categoryId: string;
  categoryName?: string;
  accountId: string | null;
  accountName?: string | null;
  frequency: 'weekly' | 'monthly';
  nextDueDate: string;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CopilotDraftTransaction {
  type: 'expense' | 'income';
  amountMinor: number;
  amountFormatted: string;
  categoryId: string;
  categoryName: string;
  accountId?: string;
  accountName?: string;
  date: string;
  note: string;
}

export interface CopilotResponse {
  answer: string;
  source: 'gemini' | 'deterministic_copilot';
  draftTransaction?: CopilotDraftTransaction | null;
  suggestedPrompts?: string[];
  metricsSnapshot?: {
    todayExpenseMinor: number;
    monthExpenseMinor: number;
    availableBalanceMinor: number | null;
    remainingBudgetMinor?: number;
  };
}

export interface CopilotChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'gemini' | 'deterministic_copilot';
  draftTransaction?: CopilotDraftTransaction | null;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveTab = 'overview' | 'history' | 'analytics' | 'budgets' | 'goals' | 'forecast' | 'simulator' | 'copilot' | 'calculator' | 'settings';
