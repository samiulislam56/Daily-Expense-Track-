import React from 'react';
import {
  Wallet,
  PiggyBank,
  TrendingDown,
  Receipt,
  Edit2,
  AlertCircle,
  TrendingUp,
  Target,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { formatCurrency, formatDateReadable, formatBDT } from '../../lib/utils.js';
import { Budget } from '../../types/index.js';

interface DashboardMetricsProps {
  // Card 1: Total Available Balance
  availableBalanceMinor: number | null;
  isBalanceConfigured: boolean;
  balanceReferenceDate?: string | null;
  totalIncomeMinor?: number;
  totalExpensesAgainstBalanceMinor: number;
  remainingBalanceMinor: number | null;
  onEditBalance: () => void;

  // Card 2: Today's Total Spending
  todayTotalMinor: number;
  todayCount: number;

  // Card 3: Today's Average Expense
  todayAverageMinor: number;

  // Card 4: Month Summary & Budget
  currentMonthName: string;
  monthTotalExpensesMinor: number;
  monthTotalIncomeMinor?: number;
  overallBudget?: Budget | null;

  currencyCode?: string;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  availableBalanceMinor,
  isBalanceConfigured,
  balanceReferenceDate,
  totalIncomeMinor = 0,
  totalExpensesAgainstBalanceMinor,
  remainingBalanceMinor,
  onEditBalance,
  todayTotalMinor,
  todayCount,
  todayAverageMinor,
  currentMonthName,
  monthTotalExpensesMinor,
  monthTotalIncomeMinor = 0,
  overallBudget,
  currencyCode = 'BDT',
}) => {
  const isRemainingNegative = isBalanceConfigured && remainingBalanceMinor !== null && remainingBalanceMinor < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* CARD 1: TOTAL AVAILABLE BALANCE */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between transition-all hover:border-[var(--accent)] hover:shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Total Available Balance
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEditBalance}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
              title={isBalanceConfigured ? 'Edit Opening Balance' : 'Set Opening Balance'}
              aria-label="Edit available balance"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
        </div>

        {!isBalanceConfigured || availableBalanceMinor === null ? (
          <div className="py-1">
            <div className="text-base sm:text-lg font-bold text-[var(--text-ink)] mb-0.5">
              No balance added yet
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mb-2.5 leading-snug">
              Set your opening balance to start tracking available funds.
            </p>
            <button
              type="button"
              onClick={onEditBalance}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Balance</span>
            </button>
          </div>
        ) : (
          <div>
            <div
              className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums flex items-baseline gap-2 ${
                isRemainingNegative ? 'text-rose-500' : 'text-[var(--text-ink)]'
              }`}
            >
              <span>{formatCurrency(remainingBalanceMinor ?? 0, currencyCode)}</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--text-muted)]">
              <span>
                {`Opening: ${formatBDT(availableBalanceMinor)} • Since ${balanceReferenceDate || 'today'}`}
              </span>
            </div>
            {totalIncomeMinor > 0 && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>+{formatBDT(totalIncomeMinor)} recorded income</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CARD 2: TODAY'S TOTAL SPENDING */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between transition-all hover:border-rose-500/30 hover:shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Today's Spending
          </span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--text-ink)] tabular-nums">
            {formatCurrency(todayTotalMinor, currencyCode)}
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-muted)] truncate">
            {todayCount === 0
              ? 'No expense transactions today'
              : `${todayCount} ${todayCount === 1 ? 'transaction' : 'transactions'} recorded today`}
          </div>
        </div>
      </div>

      {/* CARD 3: TODAY'S AVERAGE EXPENSE */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between transition-all hover:border-blue-500/30 hover:shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Today's Average Expense
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--text-ink)] tabular-nums">
            {formatCurrency(todayAverageMinor, currencyCode)}
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-muted)] truncate">
            {todayCount === 0
              ? '৳0.00 / 0 transactions'
              : `Total ৳${(todayTotalMinor / 100).toFixed(2)} ÷ ${todayCount} entries`}
          </div>
        </div>
      </div>

      {/* CARD 4: MONTHLY SPENDING & BUDGET */}
      <div
        className={`p-4 rounded-2xl bg-[var(--surface)] border shadow-sm flex flex-col justify-between transition-all ${
          overallBudget && overallBudget.isExceeded
            ? 'border-rose-500/40 bg-rose-500/[0.02]'
            : 'border-[var(--border)] hover:border-[var(--accent)] hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
            {currentMonthName} Cashflow
            {overallBudget && overallBudget.isExceeded && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1 rounded">
                Exceeded
              </span>
            )}
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--text-ink)] tabular-nums">
            {formatCurrency(monthTotalExpensesMinor, currencyCode)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            {overallBudget ? (
              <span className={overallBudget.isExceeded ? 'text-rose-500 font-semibold' : ''}>
                Budget: {formatBDT(overallBudget.amountMinor)} ({overallBudget.percentageUsed}% used)
              </span>
            ) : monthTotalIncomeMinor > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                Income: {formatBDT(monthTotalIncomeMinor)}
              </span>
            ) : (
              <span>Monthly expense total</span>
            )}
          </div>

          {overallBudget && (
            <div className="w-full bg-[var(--surface-subtle)] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallBudget.isExceeded
                    ? 'bg-rose-500'
                    : overallBudget.isWarning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, overallBudget.percentageUsed)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
