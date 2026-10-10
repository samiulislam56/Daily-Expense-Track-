import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { mockStorage } from '../services/mockStorage.js';
import { offlineSync } from '../services/offlineSync.js';
import { ExpenseFilters, Expense } from '../types/index.js';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
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
      // Fetch larger batch for trend analysis
      const res = await api.getExpenses({ pageSize: 100 });
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
  };

  const createMutation = useMutation({
    mutationFn: async (payload: {
      amountMinor: number;
      categoryId: string;
      expenseDate: string;
      note?: string;
      currencyCode?: string;
    }) => {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (!isOnline) {
        // Enqueue offline mutation and apply to mockStorage immediately for optimistic UI
        offlineSync.enqueue('CREATE_EXPENSE', payload);
        const local = mockStorage.createExpense(payload);
        return local;
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

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    updateBalanceMutation,
  };
}
