import React from 'react';
import { PieChart, Layers } from 'lucide-react';
import { CategorySummaryItem } from '../../types/index.js';
import { CategoryIcon } from '../../components/common/CategoryIcon.js';
import { formatCurrency } from '../../lib/utils.js';

interface CategoryAnalyticsProps {
  categories: CategorySummaryItem[];
  isLoading: boolean;
  currencyCode?: string;
}

export const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({
  categories,
  isLoading,
  currencyCode = 'BDT',
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-card animate-pulse">
        <div className="w-32 h-5 rounded bg-surface-elevated mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded bg-surface-elevated" />
          ))}
        </div>
      </div>
    );
  }

  const grandTotal = categories.reduce((sum, c) => sum + c.totalMinor, 0);

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-surface border border-border shadow-card flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
          <PieChart className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-ink mb-1">No Category Data</h4>
        <p className="text-xs text-ink-muted max-w-xs">
          Record spending entries to see category breakdown and distribution trends.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Category Breakdown</h3>
            <p className="text-xs text-ink-muted">Spending distribution by category</p>
          </div>
        </div>
        <span className="text-xs font-semibold font-mono text-ink tabular-nums">
          Total: {formatCurrency(grandTotal, currencyCode)}
        </span>
      </div>

      {/* Accessible visual bar graph with textual labels */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.categoryId} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CategoryIcon
                  iconKey={cat.iconKey}
                  colorKey={cat.colorKey}
                  size={14}
                  className="p-1 rounded-md"
                />
                <span className="font-semibold text-ink">{cat.categoryName}</span>
                <span className="text-[11px] text-ink-muted">({cat.count} {cat.count === 1 ? 'txn' : 'txns'})</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-ink tabular-nums">
                  {formatCurrency(cat.totalMinor, currencyCode)}
                </span>
                <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded">
                  {cat.percentage}%
                </span>
              </div>
            </div>

            {/* Progress bar container */}
            <div
              className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden"
              role="progressbar"
              aria-valuenow={cat.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${cat.categoryName}: ${cat.percentage}%`}
            >
              <div
                className="h-full rounded-full bg-teal-600 dark:bg-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(cat.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
