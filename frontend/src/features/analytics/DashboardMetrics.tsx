import React from 'react';
import { Wallet, Calendar, Hash, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDateReadable } from '../../lib/utils.js';

interface DashboardMetricsProps {
  selectedDate: string;
  dailyTotalMinor: number;
  dailyCount: number;
  monthlyTotalMinor: number;
  monthlyCount: number;
  currencyCode?: string;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  selectedDate,
  dailyTotalMinor,
  dailyCount,
  monthlyTotalMinor,
  monthlyCount,
  currencyCode = 'BDT',
}) => {
  const avgDailyTransactionMinor =
    dailyCount > 0 ? Math.round(dailyTotalMinor / dailyCount) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* 1. Selected Day Total */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Selected Day Total
          </span>
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-ink tabular-nums">
            {formatCurrency(dailyTotalMinor, currencyCode)}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5 truncate">
            {formatDateReadable(selectedDate)}
          </p>
        </div>
      </div>

      {/* 2. Month-to-Date Total */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Month Total
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-ink tabular-nums">
            {formatCurrency(monthlyTotalMinor, currencyCode)}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            {monthlyCount} total this month
          </p>
        </div>
      </div>

      {/* 3. Daily Transactions Count */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Day Transactions
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Hash className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-ink tabular-nums">
            {dailyCount}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            {dailyCount === 1 ? '1 entry recorded' : `${dailyCount} entries recorded`}
          </p>
        </div>
      </div>

      {/* 4. Average per Entry */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Avg Per Entry
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-ink tabular-nums">
            {formatCurrency(avgDailyTransactionMinor, currencyCode)}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            Average on {selectedDate}
          </p>
        </div>
      </div>
    </div>
  );
};
