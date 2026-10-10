import React from 'react';
import { Search, Filter, Download, RotateCcw, X } from 'lucide-react';
import { Category, Expense, ExpenseFilters as FilterType } from '../../types/index.js';
import { exportExpensesToCSV } from '../../lib/utils.js';

interface ExpenseFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  categories: Category[];
  currentExpenses: Expense[];
}

export const ExpenseFiltersBar: React.FC<ExpenseFiltersProps> = ({
  filters,
  onFilterChange,
  categories,
  currentExpenses,
}) => {
  const hasActiveFilters = Boolean(
    filters.q || filters.categoryId || filters.from || filters.to
  );

  const handleReset = () => {
    onFilterChange({
      page: 1,
      pageSize: filters.pageSize || 20,
    });
  };

  const handleExport = () => {
    exportExpensesToCSV(currentExpenses);
  };

  return (
    <div className="p-4 rounded-2xl bg-surface border border-border shadow-card mb-6 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search by note */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search note or description..."
            value={filters.q || ''}
            onChange={(e) =>
              onFilterChange({ ...filters, q: e.target.value || undefined, page: 1 })
            }
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-border bg-surface-elevated/40 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
          {filters.q && (
            <button
              onClick={() => onFilterChange({ ...filters, q: undefined, page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="w-full md:w-52">
          <select
            value={filters.categoryId || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                categoryId: e.target.value || undefined,
                page: 1,
              })
            }
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface-elevated/40 text-sm text-ink focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range & Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold text-ink shadow-subtle transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
