import { goalRepository, SavingsGoalDTO } from '../repositories/goal.repository.js';

export class GoalService {
  async getGoals(userId: string): Promise<SavingsGoalDTO[]> {
    return goalRepository.findMany(userId);
  }

  async getGoalById(id: string, userId: string): Promise<SavingsGoalDTO | null> {
    return goalRepository.findById(id, userId);
  }

  async createGoal(
    userId: string,
    data: {
      title: string;
      targetAmountMinor: number;
      currentAmountMinor?: number;
      targetDate: string;
      categoryId?: string | null;
      notes?: string | null;
    }
  ): Promise<SavingsGoalDTO> {
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

  async updateGoal(
    id: string,
    userId: string,
    data: {
      title?: string;
      targetAmountMinor?: number;
      currentAmountMinor?: number;
      targetDate?: string;
      categoryId?: string | null;
      notes?: string | null;
    }
  ): Promise<SavingsGoalDTO | null> {
    return goalRepository.update(id, userId, data);
  }

  async contribute(id: string, userId: string, amountMinor: number): Promise<SavingsGoalDTO | null> {
    return goalRepository.contribute(id, userId, amountMinor);
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    return goalRepository.delete(id, userId);
  }
}

export const goalService = new GoalService();
