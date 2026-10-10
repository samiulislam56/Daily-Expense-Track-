import React, { useState } from 'react';
import { Target, Plus, AlertTriangle, CheckCircle, Info, Trash2, X, AlertCircle } from 'lucide-react';
import { Budget, Category } from '../../types/index.js';
import { formatBDT } from '../../lib/utils.js';
import { CategoryIcon } from '../../components/common/CategoryIcon.js';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  currentMonth: string;
  onSetBudget: (data: { month: string; categoryId?: string | null; amountMinor: number; warningThresholdPercent?: number }) => Promise<any>;
  onDeleteBudget: (id: string) => Promise<any>;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  currentMonth,
  onSetBudget,
  onDeleteBudget,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string>('overall');
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const overallBudget = budgets.find((b) => b.categoryId === null);
  const categoryBudgets = budgets.filter((b) => b.categoryId !== null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const minor = Math.round((parseFloat(budgetAmount) || 0) * 100);
    if (minor <= 0) return;

    try {
      setIsSubmitting(true);
      await onSetBudget({
        month: currentMonth,
        categoryId: targetCategory === 'overall' ? null : targetCategory,
        amountMinor: minor,
        warningThresholdPercent: warningThreshold,
      });
      setIsModalOpen(false);
      setBudgetAmount('');
      setTargetCategory('overall');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[var(--text-ink)]">Monthly Budgets</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--surface-elevated)] text-[var(--accent)] border border-[var(--border)]">
              {currentMonth}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Set spending guardrails to protect your savings and receive automatic threshold alerts
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Educational Notice: Available Balance vs Budget */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--text-muted)] leading-relaxed">
          <strong className="text-[var(--text-ink)] font-semibold">Available Balance vs Remaining Budget: </strong>
          Your <span className="font-semibold text-emerald-600 dark:text-emerald-400">Available Balance</span> is your real liquid cash in your accounts. Your <span className="font-semibold text-indigo-600 dark:text-indigo-400">Remaining Budget</span> is your self-imposed monthly spending limit. Exceeding your budget reduces monthly net savings even if you still have positive cash in your bank.
        </div>
      </div>

      {/* Overall Month Budget Card */}
      {overallBudget ? (
        <div
          className={`p-6 rounded-2xl bg-[var(--surface)] border shadow-sm transition-all ${
            overallBudget.isExceeded
              ? 'border-rose-500/40 bg-rose-500/[0.02]'
              : overallBudget.isWarning
              ? 'border-amber-500/40'
              : 'border-[var(--border)]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-ink)]">Overall Monthly Spending Limit</h3>
                <span className="text-xs text-[var(--text-muted)]">All expense categories combined</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {overallBudget.isExceeded ? (
                <span className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" /> Exceeded by {formatBDT(overallBudget.spentMinor - overallBudget.amountMinor)}
                </span>
              ) : overallBudget.isWarning ? (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" /> Warning Threshold ({overallBudget.percentageUsed}%)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" /> On Track
                </span>
              )}
              <button
                onClick={() => onDeleteBudget(overallBudget.id)}
                className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-colors"
                title="Remove overall budget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-[var(--text-muted)] font-medium">
                Spent: <strong className="text-[var(--text-ink)] font-mono">{formatBDT(overallBudget.spentMinor)}</strong> of {formatBDT(overallBudget.amountMinor)}
              </span>
              <span className="font-mono font-bold text-xs">
                {overallBudget.remainingMinor >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">{formatBDT(overallBudget.remainingMinor)} remaining</span>
                ) : (
                  <span className="text-rose-500">-{formatBDT(Math.abs(overallBudget.remainingMinor))} over</span>
                )}
              </span>
            </div>

            <div className="w-full bg-[var(--surface-subtle)] h-3 rounded-full overflow-hidden">
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

            <div className="flex justify-between text-[11px] text-[var(--text-faint)]">
              <span>0%</span>
              <span>Warning threshold at {overallBudget.warningThresholdPercent}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border)] text-center">
          <Target className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-[var(--text-ink)]">No Overall Budget Configured</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Set an overall monthly spending ceiling to track your cashflow discipline across the entire month.
          </p>
          <button
            onClick={() => {
              setTargetCategory('overall');
              setIsModalOpen(true);
            }}
            className="mt-3 px-4 py-1.5 bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] text-xs font-semibold rounded-xl text-[var(--text-ink)]"
          >
            Configure Overall Budget
          </button>
        </div>
      )}

      {/* Category Specific Budgets */}
      <div>
        <h3 className="text-sm font-bold text-[var(--text-ink)] mb-3">Category Budgets</h3>
        {categoryBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryBudgets.map((b) => {
              const cat = categories.find((c) => c.id === b.categoryId);

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl bg-[var(--surface)] border shadow-sm flex flex-col justify-between transition-all ${
                    b.isExceeded
                      ? 'border-rose-500/40 bg-rose-500/[0.02]'
                      : b.isWarning
                      ? 'border-amber-500/40'
                      : 'border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CategoryIcon iconKey={cat?.iconKey} colorKey={cat?.colorKey} size={16} />
                      <span className="text-xs font-bold text-[var(--text-ink)]">{b.categoryName || 'Category'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {b.isExceeded ? (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                          Exceeded
                        </span>
                      ) : b.isWarning ? (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {b.percentageUsed}% used
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {b.percentageUsed}%
                        </span>
                      )}
                      <button
                        onClick={() => onDeleteBudget(b.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-rose-500 rounded"
                        title="Delete category budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">
                        {formatBDT(b.spentMinor)} of {formatBDT(b.amountMinor)}
                      </span>
                      <span className="font-mono font-semibold">
                        {b.remainingMinor >= 0 ? `${formatBDT(b.remainingMinor)} left` : `-${formatBDT(Math.abs(b.remainingMinor))} over`}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--surface-subtle)] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          b.isExceeded ? 'bg-rose-500' : b.isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
            No category-specific budgets set for {currentMonth}. Click "Set Budget" to add limits for Food, Transport, etc.
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-ink)]">Set Monthly Budget ({currentMonth})</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-ink)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Target Scope</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="overall">Overall Monthly Budget (All Categories)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} Category
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Budget Amount (BDT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">৳</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 25000"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    required
                    autoFocus
                    className="w-full pl-8 pr-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-sm font-mono font-bold text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Alert Warning Threshold: {warningThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
                <span className="text-[11px] text-[var(--text-faint)]">
                  You will see an early alert once spending reaches {warningThreshold}% of this budget.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
