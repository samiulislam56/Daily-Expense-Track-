import React from 'react';
import {
  Wallet,
  PiggyBank,
  TrendingDown,
  Receipt,
  Edit2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatDateReadable } from '../../lib/utils.js';

interface DashboardMetricsProps {
  // Card 1: Total Available Balance
  availableBalanceMinor: number;
  isBalanceConfigured: boolean;
  balanceReferenceDate?: string;
  onEditBalance: () => void;

  // Card 2: Remaining Balance
  remainingBalanceMinor: number;
  totalExpensesAgainstBalanceMinor: number;

  // Card 3: Today's Average Expense
  todayAverageMinor: number;
  todayCount: number;

  // Card 4: Total Expense (Selected Day Spending)
  selectedDate: string;
  selectedDayTotalMinor: number;
  selectedDayCount: number;

  currencyCode?: string;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  availableBalanceMinor,
  isBalanceConfigured,
  balanceReferenceDate,
  onEditBalance,
  remainingBalanceMinor,
  totalExpensesAgainstBalanceMinor,
  todayAverageMinor,
  todayCount,
  selectedDate,
  selectedDayTotalMinor,
  selectedDayCount,
  currencyCode = 'BDT',
}) => {
  const isRemainingNegative = isBalanceConfigured && remainingBalanceMinor < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* ──────────────────────────────────────────────────────────
          CARD 1: TOTAL AVAILABLE BALANCE
          ────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between transition-all hover:border-teal-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Total Available Balance
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEditBalance}
              className="p-1.5 rounded-lg text-ink-muted hover:text-teal-600 hover:bg-teal-500/10 transition-colors"
              title="Edit Available Balance"
              aria-label="Edit available balance"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-ink tabular-nums flex items-baseline gap-2">
            <span>{formatCurrency(availableBalanceMinor, currencyCode)}</span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-ink-muted">
            <span>
              {isBalanceConfigured
                ? `Starting balance • As of ${balanceReferenceDate || 'today'}`
                : 'Tap edit to set starting balance'}
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          CARD 2: REMAINING BALANCE
          ────────────────────────────────────────────────────────── */}
      <div
        className={`p-4 rounded-2xl bg-surface border shadow-card flex flex-col justify-between transition-all ${
          isRemainingNegative
            ? 'border-rose-500/40 bg-rose-500/[0.02]'
            : 'border-border hover:border-emerald-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            Remaining Balance
            {isRemainingNegative && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 px-1.5 py-0.2 rounded-full">
                <AlertCircle className="w-3 h-3" /> Over budget
              </span>
            )}
          </span>
          <div
            className={`p-2 rounded-xl ${
              isRemainingNegative
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums ${
              isRemainingNegative ? 'text-rose-600 dark:text-rose-400' : 'text-ink'
            }`}
          >
            {formatCurrency(remainingBalanceMinor, currencyCode)}
          </div>
          <div className="mt-1 text-[11px] text-ink-muted">
            {isRemainingNegative ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Exceeded available balance by {formatCurrency(Math.abs(remainingBalanceMinor), currencyCode)}
              </span>
            ) : isBalanceConfigured ? (
              <span>Deducted {formatCurrency(totalExpensesAgainstBalanceMinor, currencyCode)} spent</span>
            ) : (
              <span>Set available balance to track savings</span>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          CARD 3: TODAY'S AVERAGE EXPENSE
          ────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between transition-all hover:border-blue-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Today's Average Expense
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-ink tabular-nums">
            {formatCurrency(todayAverageMinor, currencyCode)}
          </div>
          <div className="mt-1 text-[11px] text-ink-muted truncate">
            {todayCount === 0
              ? 'No expenses recorded today'
              : `Across ${todayCount} ${todayCount === 1 ? 'entry' : 'entries'} today`}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          CARD 4: TOTAL EXPENSE (SELECTED DAY SPENDING)
          ────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between transition-all hover:border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Total Expense
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-ink tabular-nums">
            {formatCurrency(selectedDayTotalMinor, currencyCode)}
          </div>
          <div className="mt-1 text-[11px] text-ink-muted truncate">
            {selectedDayCount === 0
              ? `0 entries on ${formatDateReadable(selectedDate)}`
              : `${selectedDayCount} ${selectedDayCount === 1 ? 'entry' : 'entries'} on ${formatDateReadable(selectedDate)}`}
          </div>
        </div>
      </div>
    </div>
  );
};
