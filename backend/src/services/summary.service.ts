import {
  summaryRepository,
  DailySummaryResult,
  MonthlySummaryResult,
  CategorySummaryItem,
} from '../repositories/summary.repository.js';

export class SummaryService {
  async getDailySummary(date: string, userId: string): Promise<DailySummaryResult> {
    return summaryRepository.getDailySummary(date, userId);
  }

  async getMonthlySummary(month: string, userId: string): Promise<MonthlySummaryResult> {
    return summaryRepository.getMonthlySummary(month, userId);
  }

  async getCategorySummary(userId: string, from?: string, to?: string): Promise<CategorySummaryItem[]> {
    return summaryRepository.getCategoryBreakdown(userId, from, to);
  }
}

export const summaryService = new SummaryService();
