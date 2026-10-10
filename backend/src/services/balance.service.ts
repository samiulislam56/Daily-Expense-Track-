import { balanceRepository } from '../repositories/balance.repository.js';
import { UpdateBalanceInput } from '../schemas/balance.schema.js';

export interface BalanceSummaryDTO {
  availableBalanceMinor: number;
  currencyCode: string;
  referenceDate: string;
  totalExpensesMinor: number;
  remainingBalanceMinor: number;
  isConfigured: boolean;
  updatedAt: string | null;
}

export class BalanceService {
  async getBalanceSummary(userId: string): Promise<BalanceSummaryDTO> {
    const balance = await balanceRepository.findByUserId(userId);
    const today = new Date().toISOString().split('T')[0];

    if (!balance) {
      return {
        availableBalanceMinor: 0,
        currencyCode: 'BDT',
        referenceDate: today,
        totalExpensesMinor: 0,
        remainingBalanceMinor: 0,
        isConfigured: false,
        updatedAt: null,
      };
    }

    const expensesSince = await balanceRepository.getTotalExpensesSince(userId, balance.referenceDate);
    const remaining = balance.amountMinor - expensesSince;

    return {
      availableBalanceMinor: balance.amountMinor,
      currencyCode: balance.currencyCode,
      referenceDate: balance.referenceDate,
      totalExpensesMinor: expensesSince,
      remainingBalanceMinor: remaining,
      isConfigured: true,
      updatedAt: balance.updatedAt,
    };
  }

  async setBalance(userId: string, input: UpdateBalanceInput): Promise<BalanceSummaryDTO> {
    const today = new Date().toISOString().split('T')[0];
    const referenceDate = input.referenceDate || today;

    const updated = await balanceRepository.upsert(userId, {
      amountMinor: input.amountMinor,
      currencyCode: input.currencyCode || 'BDT',
      referenceDate,
    });

    const expensesSince = await balanceRepository.getTotalExpensesSince(userId, updated.referenceDate);
    const remaining = updated.amountMinor - expensesSince;

    return {
      availableBalanceMinor: updated.amountMinor,
      currencyCode: updated.currencyCode,
      referenceDate: updated.referenceDate,
      totalExpensesMinor: expensesSince,
      remainingBalanceMinor: remaining,
      isConfigured: true,
      updatedAt: updated.updatedAt,
    };
  }
}

export const balanceService = new BalanceService();
