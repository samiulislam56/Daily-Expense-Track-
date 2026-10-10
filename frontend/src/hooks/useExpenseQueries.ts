import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { ExpenseFilters } from '../types/index.js';

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

export function useExpenseMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  };

  const createMutation = useMutation({
    mutationFn: api.createExpense,
    onSuccess: () => {
      invalidateAll();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateExpense(id, payload),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteExpense(id),
    onSuccess: () => {
      invalidateAll();
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
