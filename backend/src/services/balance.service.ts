import { balanceRepository } from '../repositories/balance.repository.js';
import { UpdateBalanceInput } from '../schemas/balance.schema.js';

export interface BalanceSummaryDTO {
  availableBalanceMinor: number | null;
  currencyCode: string;
  referenceDate: string | null;
  totalExpensesMinor: number;
  totalIncomeMinor: number;
  remainingBalanceMinor: number | null;
  isConfigured: boolean;
  updatedAt: string | null;
}

export class BalanceService {
  async getBalanceSummary(userId: string): Promise<BalanceSummaryDTO> {
    const balance = await balanceRepository.findByUserId(userId);

    if (!balance) {
      const cashflow = await balanceRepository.getCashflowSince(userId, '1970-01-01');
      return {
        availableBalanceMinor: null,
        currencyCode: 'BDT',
        referenceDate: null,
        totalExpensesMinor: cashflow.expensesMinor,
        totalIncomeMinor: cashflow.incomeMinor,
        remainingBalanceMinor: null,
        isConfigured: false,
        updatedAt: null,
      };
    }

    const cashflow = await balanceRepository.getCashflowSince(userId, balance.referenceDate);
    const remaining = balance.amountMinor + cashflow.incomeMinor - cashflow.expensesMinor;

    return {
      availableBalanceMinor: balance.amountMinor,
      currencyCode: balance.currencyCode,
      referenceDate: balance.referenceDate,
      totalExpensesMinor: cashflow.expensesMinor,
      totalIncomeMinor: cashflow.incomeMinor,
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

    const cashflow = await balanceRepository.getCashflowSince(userId, updated.referenceDate);
    const remaining = updated.amountMinor + cashflow.incomeMinor - cashflow.expensesMinor;

    return {
      availableBalanceMinor: updated.amountMinor,
      currencyCode: updated.currencyCode,
      referenceDate: updated.referenceDate,
      totalExpensesMinor: cashflow.expensesMinor,
      totalIncomeMinor: cashflow.incomeMinor,
      remainingBalanceMinor: remaining,
      isConfigured: true,
      updatedAt: updated.updatedAt,
    };
  }
}

export const balanceService = new BalanceService();
