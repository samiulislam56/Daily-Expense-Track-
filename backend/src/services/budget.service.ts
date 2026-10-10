import { budgetRepository, BudgetDTO } from '../repositories/budget.repository.js';

export class BudgetService {
  async getBudgets(userId: string, month?: string): Promise<BudgetDTO[]> {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    return budgetRepository.findByMonth(userId, targetMonth);
  }

  async upsertBudget(
    userId: string,
    data: {
      month: string;
      categoryId?: string | null;
      amountMinor: number;
      warningThresholdPercent?: number;
    }
  ): Promise<BudgetDTO> {
    return budgetRepository.upsert(userId, data);
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    return budgetRepository.delete(id, userId);
  }
}

export const budgetService = new BudgetService();
