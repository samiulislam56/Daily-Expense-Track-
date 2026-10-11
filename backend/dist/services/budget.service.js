import { budgetRepository } from '../repositories/budget.repository.js';
export class BudgetService {
    async getBudgets(userId, month) {
        const targetMonth = month || new Date().toISOString().slice(0, 7);
        return budgetRepository.findByMonth(userId, targetMonth);
    }
    async upsertBudget(userId, data) {
        return budgetRepository.upsert(userId, data);
    }
    async deleteBudget(id, userId) {
        return budgetRepository.delete(id, userId);
    }
}
export const budgetService = new BudgetService();
