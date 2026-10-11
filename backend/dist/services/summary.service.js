import { summaryRepository, } from '../repositories/summary.repository.js';
export class SummaryService {
    async getDailySummary(date, userId) {
        return summaryRepository.getDailySummary(date, userId);
    }
    async getMonthlySummary(month, userId) {
        return summaryRepository.getMonthlySummary(month, userId);
    }
    async getCategorySummary(userId, from, to) {
        return summaryRepository.getCategoryBreakdown(userId, from, to);
    }
}
export const summaryService = new SummaryService();
