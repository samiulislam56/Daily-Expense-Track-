import React from 'react';
import { Edit2, Trash2, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { Expense } from '../../types/index.js';
import { CategoryIcon } from '../../components/common/CategoryIcon.js';
import { formatCurrency } from '../../lib/utils.js';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onEdit,
  onDelete,
}) => {
  const isIncome = expense.type === 'income';

  return (
    <div className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-md transition-all">
      {/* Category Icon and Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <CategoryIcon
          iconKey={expense.category?.iconKey}
          colorKey={expense.category?.colorKey}
          size={18}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-[var(--text-ink)] truncate">
              {expense.category?.name || 'Uncategorized'}
            </span>

            {/* Income Badge */}
            {isIncome && (
              <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 rounded-md">
                Income
              </span>
            )}

            {/* Account Badge */}
            {expense.account && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-medium text-[var(--text-muted)] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-md">
                <Wallet className="w-2.5 h-2.5 text-[var(--accent)]" />
                <span className="truncate max-w-[80px]">{expense.account.name}</span>
              </span>
            )}

            {/* Tags */}
            {expense.tags && (
              <div className="hidden sm:flex items-center gap-1">
                {expense.tags.split(',').slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10px] text-[var(--text-faint)] bg-[var(--surface-subtle)] px-1.5 py-0.2 rounded">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {expense.note ? (
            <p className="text-xs text-[var(--text-muted)] truncate mt-0.5 max-w-[200px] sm:max-w-md">
              {expense.note}
            </p>
          ) : (
            <p className="text-[11px] text-[var(--text-faint)] italic mt-0.5">
              No note provided
            </p>
          )}
        </div>
      </div>

      {/* Amount and Action Buttons */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <div className="text-right">
          <span
            className={`text-base sm:text-lg font-bold font-mono tracking-tight tabular-nums ${
              isIncome ? 'text-emerald-500' : 'text-[var(--text-ink)]'
            }`}
          >
            {isIncome ? '+' : '-'}{formatCurrency(expense.amountMinor, expense.currencyCode)}
          </span>
          <p className="text-[10px] text-[var(--text-faint)] font-mono">{expense.expenseDate}</p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-100 sm:opacity-80 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(expense);
            }}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 active:scale-95 transition-all"
            title="Edit transaction"
            aria-label="Edit transaction"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(expense);
            }}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 active:scale-95 transition-all"
            title="Delete transaction"
            aria-label="Delete transaction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
