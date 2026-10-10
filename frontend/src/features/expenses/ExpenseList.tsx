import React from 'react';
import { Plus, ReceiptText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense } from '../../types/index.js';
import { ExpenseCard } from './ExpenseCard.js';
import { formatDateReadable, formatCurrency, getTodayDateString } from '../../lib/utils.js';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onOpenAddModal: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  isLoading,
  onEdit,
  onDelete,
  onOpenAddModal,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface border border-border animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-elevated" />
              <div className="space-y-2">
                <div className="w-28 h-4 rounded bg-surface-elevated" />
                <div className="w-40 h-3 rounded bg-surface-elevated" />
              </div>
            </div>
            <div className="w-20 h-5 rounded bg-surface-elevated" />
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-surface border border-border shadow-subtle flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
          <ReceiptText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-ink mb-1">No expenses found</h3>
        <p className="text-xs text-ink-muted max-w-sm mb-5 leading-relaxed">
          There are no expense records for the selected date or search filter. Add your first spending entry to start tracking!
        </p>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add First Expense</span>
        </button>
      </div>
    );
  }

  // Group expenses by date (YYYY-MM-DD)
  const groupedByDate: Record<string, Expense[]> = {};
  expenses.forEach((exp) => {
    if (!groupedByDate[exp.expenseDate]) {
      groupedByDate[exp.expenseDate] = [];
    }
    groupedByDate[exp.expenseDate].push(exp);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));
  const todayStr = getTodayDateString();

  return (
    <div className="space-y-6">
      {sortedDates.map((dateStr) => {
        const dateExpenses = groupedByDate[dateStr];
        const daySubtotal = dateExpenses.reduce((sum, e) => sum + e.amountMinor, 0);
        const isToday = dateStr === todayStr;

        return (
          <div key={dateStr} className="space-y-2.5">
            {/* Date Group Heading & Day Subtotal */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  {isToday ? 'Today' : formatDateReadable(dateStr)}
                </span>
                {isToday && (
                  <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full">
                    {formatDateReadable(dateStr)}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold font-mono text-ink-muted tabular-nums">
                Day total: {formatCurrency(daySubtotal, dateExpenses[0]?.currencyCode || 'BDT')}
              </span>
            </div>

            {/* List of expenses for this date */}
            <div className="space-y-2">
              {dateExpenses.map((exp) => (
                <ExpenseCard
                  key={exp.id}
                  expense={exp}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-ink hover:bg-surface-elevated transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <span className="text-xs text-ink-muted font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-ink hover:bg-surface-elevated transition-colors disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
