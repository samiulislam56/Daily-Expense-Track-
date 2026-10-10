import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { mockStorage } from '../services/mockStorage.js';
import { offlineSync } from '../services/offlineSync.js';
import { ExpenseFilters, Expense, Account, Budget, SavingsGoal, RecurringTransaction } from '../types/index.js';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.getAccounts(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBudgets(month?: string) {
  return useQuery({
    queryKey: ['budgets', month || 'current'],
    queryFn: () => api.getBudgets(month),
  });
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => api.getGoals(),
  });
}

export function useRecurring() {
  return useQuery({
    queryKey: ['recurring'],
    queryFn: () => api.getRecurring(),
  });
}

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => api.getExpenses(filters),
  });
}

export function useAllExpenses() {
  return useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: async () => {
      const res = await api.getExpenses({ pageSize: 150 });
      return res.data;
    },
    staleTime: 1000 * 15,
  });
}

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: ['summary', 'daily', date],
    queryFn: () => api.getDailySummary(date),
    enabled: Boolean(date),
  });
}

export function useMonthlySummary(month: string) {
  return useQuery({
    queryKey: ['summary', 'monthly', month],
    queryFn: () => api.getMonthlySummary(month),
    enabled: Boolean(month),
  });
}

export function useCategorySummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['summary', 'categories', from, to],
    queryFn: () => api.getCategorySummary(from, to),
  });
}

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: () => api.getBalance(),
  });
}

export function useExpenseMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
    queryClient.invalidateQueries({ queryKey: ['balance'] });
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
    queryClient.invalidateQueries({ queryKey: ['goals'] });
    queryClient.invalidateQueries({ queryKey: ['recurring'] });
  };

  const createMutation = useMutation({
    mutationFn: async (payload: {
      amountMinor: number;
      categoryId: string;
      expenseDate: string;
      note?: string;
      currencyCode?: string;
      type?: 'expense' | 'income' | 'adjustment';
      accountId?: string | null;
      tags?: string;
    }) => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (!isOnline) {
        offlineSync.enqueue('CREATE_EXPENSE', payload);
        return mockStorage.createExpense(payload);
      }
      return await api.createExpense(payload);
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (!isOnline) {
        offlineSync.enqueue('UPDATE_EXPENSE', payload, id);
        return mockStorage.updateExpense(id, payload);
      }
      return await api.updateExpense(id, payload);
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (!isOnline) {
        offlineSync.enqueue('DELETE_EXPENSE', null, id);
        mockStorage.deleteExpense(id);
        return;
      }
      await api.deleteExpense(id);
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async (payload: {
      amountMinor: number;
      currencyCode?: string;
      referenceDate?: string;
    }) => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (!isOnline) {
        offlineSync.enqueue('UPDATE_BALANCE', payload);
        return mockStorage.updateBalance(payload);
      }
      return await api.updateBalance(payload);
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  // Account Mutations
  const createAccountMutation = useMutation({
    mutationFn: (data: any) => api.createAccount(data),
    onSuccess: () => invalidateAll(),
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateAccount(id, data),
    onSuccess: () => invalidateAll(),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id: string) => api.deleteAccount(id),
    onSuccess: () => invalidateAll(),
  });

  // Budget Mutations
  const setBudgetMutation = useMutation({
    mutationFn: (data: any) => api.setBudget(data),
    onSuccess: () => invalidateAll(),
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: string) => api.deleteBudget(id),
    onSuccess: () => invalidateAll(),
  });

  // Goal Mutations
  const createGoalMutation = useMutation({
    mutationFn: (data: any) => api.createGoal(data),
    onSuccess: () => invalidateAll(),
  });

  const contributeGoalMutation = useMutation({
    mutationFn: ({ id, amountMinor }: { id: string; amountMinor: number }) => api.contributeGoal(id, amountMinor),
    onSuccess: () => invalidateAll(),
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => api.deleteGoal(id),
    onSuccess: () => invalidateAll(),
  });

  // Recurring Mutations
  const createRecurringMutation = useMutation({
    mutationFn: (data: any) => api.createRecurring(data),
    onSuccess: () => invalidateAll(),
  });

  const processRecurringMutation = useMutation({
    mutationFn: (id: string) => api.processRecurringPayment(id),
    onSuccess: () => invalidateAll(),
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: (id: string) => api.deleteRecurring(id),
    onSuccess: () => invalidateAll(),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    updateBalanceMutation,
    createAccountMutation,
    updateAccountMutation,
    deleteAccountMutation,
    setBudgetMutation,
    deleteBudgetMutation,
    createGoalMutation,
    contributeGoalMutation,
    deleteGoalMutation,
    createRecurringMutation,
    processRecurringMutation,
    deleteRecurringMutation,
  };
}
