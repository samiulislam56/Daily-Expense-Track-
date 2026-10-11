import { goalRepository } from '../repositories/goal.repository.js';
export class GoalService {
    async getGoals(userId) {
        return goalRepository.findMany(userId);
    }
    async getGoalById(id, userId) {
        return goalRepository.findById(id, userId);
    }
    async createGoal(userId, data) {
        return goalRepository.create({
            userId,
            title: data.title,
            targetAmountMinor: data.targetAmountMinor,
            currentAmountMinor: data.currentAmountMinor ?? 0,
            targetDate: data.targetDate,
            categoryId: data.categoryId,
            notes: data.notes,
        });
    }
    async updateGoal(id, userId, data) {
        return goalRepository.update(id, userId, data);
    }
    async contribute(id, userId, amountMinor) {
        return goalRepository.contribute(id, userId, amountMinor);
    }
    async deleteGoal(id, userId) {
        return goalRepository.delete(id, userId);
    }
}
export const goalService = new GoalService();
