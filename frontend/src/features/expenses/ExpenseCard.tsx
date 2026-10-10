import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
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
  return (
    <div className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-surface border border-border hover:border-teal-500/40 hover:shadow-card transition-all">
      {/* Category Icon and Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <CategoryIcon
          iconKey={expense.category?.iconKey}
          colorKey={expense.category?.colorKey}
          size={18}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-ink truncate">
              {expense.category?.name || 'Uncategorized'}
            </span>
          </div>
          {expense.note ? (
            <p className="text-xs text-ink-muted truncate mt-0.5 max-w-[200px] sm:max-w-md">
              {expense.note}
            </p>
          ) : (
            <p className="text-[11px] text-ink-faint italic mt-0.5">
              No note provided
            </p>
          )}
        </div>
      </div>

      {/* Amount and Action Buttons */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <div className="text-right">
          <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-ink tabular-nums">
            {formatCurrency(expense.amountMinor, expense.currencyCode)}
          </span>
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
            className="p-2 rounded-lg text-ink-muted hover:text-teal-600 hover:bg-teal-500/10 active:scale-95 transition-all"
            title="Edit expense"
            aria-label="Edit expense"
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
            className="p-2 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-500/10 active:scale-95 transition-all"
            title="Delete expense"
            aria-label="Delete expense"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
