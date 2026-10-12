import React, { useMemo } from 'react';
import {
  CalendarDays,
  TrendingDown,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { formatBDT } from '../../lib/utils.js';
import { generateWeeklyMoneyCheckin } from '../../lib/fintech.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Expense, Budget, SavingsGoal, RecurringTransaction } from '../../types/index.js';

interface WeeklyMoneyCheckinProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  budgets: Budget[];
  goals: SavingsGoal[];
  recurring: RecurringTransaction[];
}

export const WeeklyMoneyCheckin: React.FC<WeeklyMoneyCheckinProps> = ({
  isOpen,
  onClose,
  expenses,
  budgets,
  goals,
  recurring,
}) => {
  const { lang } = useLanguage();

  const checkinData = useMemo(() => {
    // Filter expenses from last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const dateLimit = sevenDaysAgo.toISOString().split('T')[0];

    const weekExpenses = expenses.filter((e) => e.expenseDate >= dateLimit);
    const weekIncome = weekExpenses
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amountMinor, 0);

    const overallBudget = budgets.find((b) => b.categoryId === null);

    const upcomingBills = recurring
      .filter((r) => r.type === 'expense' && r.isActive)
      .map((r) => ({ amountMinor: r.amountMinor, title: r.categoryName || 'Recurring Bill' }));

    return generateWeeklyMoneyCheckin({
      expensesThisWeek: weekExpenses.map((e) => ({
        amountMinor: e.amountMinor,
        categoryName: e.category?.name,
        type: e.type,
      })),
      totalIncomeThisWeekMinor: weekIncome,
      monthlyBudgetOverall: overallBudget
        ? { amountMinor: overallBudget.amountMinor, spentMinor: overallBudget.spentMinor }
        : undefined,
      upcomingBillsNext7Days: upcomingBills,
    });
  }, [expenses, budgets, recurring]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Weekly Money Check-in"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">
                {lang === 'bn' ? 'সাপ্তাহিক আর্থিক পর্যালোচনা' : 'Weekly Money Check-in'}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {checkinData.weekStartDate} — {checkinData.weekEndDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Weekly Flow Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
              {lang === 'bn' ? 'মোট ব্যয়' : 'Spent This Week'}
            </span>
            <div className="text-lg font-bold text-rose-500 font-mono">
              {formatBDT(checkinData.totalExpenseMinor)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-0.5">
              {lang === 'bn' ? 'মোট আয়' : 'Income This Week'}
            </span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatBDT(checkinData.totalIncomeMinor)}
            </div>
          </div>
        </div>

        {/* 2. Top Category & Budget Usage */}
        <div className="p-4 rounded-xl bg-surface-subtle/50 border border-border space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted font-medium">
              {lang === 'bn' ? 'শীর্ষ ব্যয়ের খাত:' : 'Top Category:'}
            </span>
            <span className="font-bold text-ink">
              {checkinData.topCategoryName} ({formatBDT(checkinData.topCategoryAmountMinor)})
            </span>
          </div>

          {checkinData.budgetPercentUsed > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink-muted">{lang === 'bn' ? 'মাসিক বাজেট ব্যবহার' : 'Monthly Budget Pacing'}</span>
                <span className="font-mono font-bold text-ink">{checkinData.budgetPercentUsed}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    checkinData.budgetPercentUsed > 100
                      ? 'bg-rose-500'
                      : checkinData.budgetPercentUsed > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, checkinData.budgetPercentUsed)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-ink-muted">
              {lang === 'bn' ? 'আগামী ৭ দিনের নির্ধারিত বিল:' : 'Upcoming Bills (Next 7d):'}
            </span>
            <span className="font-bold font-mono text-ink">
              {formatBDT(checkinData.upcomingBillsTotalMinor)} ({checkinData.upcomingBillsCount}টি)
            </span>
          </div>
        </div>

        {/* 3. Actionable Tip */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-ink leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium">
            {lang === 'bn' ? checkinData.actionableTipBn : checkinData.actionableTipEn}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
