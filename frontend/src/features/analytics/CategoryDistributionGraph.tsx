import React, { useState, useMemo } from 'react';
import { PieChart, TrendingUp, Tag, ArrowUpRight } from 'lucide-react';
import { CategorySummaryItem } from '../../types/index.js';
import { CategoryIcon } from '../../components/common/CategoryIcon.js';
import { formatCurrency } from '../../lib/utils.js';

interface CategoryDistributionGraphProps {
  categories: CategorySummaryItem[];
  isLoading?: boolean;
  currencyCode?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryDistributionGraph: React.FC<CategoryDistributionGraphProps> = ({
  categories,
  isLoading = false,
  currencyCode = 'BDT',
  onSelectCategory,
}) => {
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  const grandTotal = useMemo(
    () => categories.reduce((sum, c) => sum + c.totalMinor, 0),
    [categories]
  );

  const totalTransactions = useMemo(
    () => categories.reduce((sum, c) => sum + c.count, 0),
    [categories]
  );

  const activeCategory = useMemo(() => {
    if (!hoveredCatId) return null;
    return categories.find((c) => c.categoryId === hoveredCatId) || null;
  }, [hoveredCatId, categories]);

  // Donut geometry constants
  const size = 260;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2 - 4; // ~110
  const circumference = 2 * Math.PI * radius; // ~691.15

  // Compute donut segments with cumulative offsets
  const segments = useMemo(() => {
    if (grandTotal === 0) return [];
    let accumulatedAngle = 0;

    return categories
      .filter((c) => c.totalMinor > 0)
      .map((cat) => {
        const ratio = cat.totalMinor / grandTotal;
        const strokeDasharray = `${ratio * circumference} ${circumference}`;
        const strokeDashoffset = -accumulatedAngle * circumference;
        accumulatedAngle += ratio;

        return {
          ...cat,
          ratio,
          strokeDasharray,
          strokeDashoffset,
        };
      });
  }, [categories, grandTotal, circumference]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-card animate-pulse space-y-4">
        <div className="w-48 h-6 rounded bg-surface-elevated" />
        <div className="h-64 rounded-xl bg-surface-elevated" />
      </div>
    );
  }

  if (categories.length === 0 || grandTotal === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-surface border border-border shadow-card flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
          <PieChart className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-ink mb-1">No Category Data</h4>
        <p className="text-xs text-ink-muted max-w-xs">
          Record spending entries with categories to see your distribution breakdown graph.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">Category Distribution</h3>
            <p className="text-xs text-ink-muted">
              Share of wallet across spending categories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-surface-elevated px-3 py-1.5 rounded-xl border border-border text-xs">
          <span className="text-ink-muted">Total Spent:</span>
          <span className="font-bold font-mono text-ink tabular-nums">
            {formatCurrency(grandTotal, currencyCode)}
          </span>
        </div>
      </div>

      {/* Main Graph Content: Interactive Donut + Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: SVG Donut Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-[260px] h-[260px] flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90 drop-shadow-sm"
              aria-label="Category spending donut chart"
            >
              {/* Background circle track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                className="text-surface-elevated"
                strokeWidth={strokeWidth}
              />

              {/* Segment arcs */}
              {segments.map((seg) => {
                const isHovered = hoveredCatId === seg.categoryId;
                return (
                  <circle
                    key={seg.categoryId}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={seg.colorKey || '#0D9488'}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer hover:opacity-95"
                    style={{
                      transformOrigin: '50% 50%',
                    }}
                    onMouseEnter={() => setHoveredCatId(seg.categoryId)}
                    onMouseLeave={() => setHoveredCatId(null)}
                    onClick={() => onSelectCategory && onSelectCategory(seg.categoryId)}
                  />
                );
              })}
            </svg>

            {/* Center Label (Displays Total or Hovered Details) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeCategory ? (
                <div className="animate-in fade-in duration-200 space-y-0.5">
                  <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                    {activeCategory.categoryName}
                  </span>
                  <div className="text-lg font-bold font-mono text-ink tabular-nums">
                    {formatCurrency(activeCategory.totalMinor, currencyCode)}
                  </div>
                  <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300">
                    {activeCategory.percentage}% • {activeCategory.count} txns
                  </span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block">
                    Total Spending
                  </span>
                  <div className="text-lg font-bold font-mono text-ink tabular-nums">
                    {formatCurrency(grandTotal, currencyCode)}
                  </div>
                  <span className="text-[11px] text-ink-muted block">
                    {totalTransactions} total records
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="text-[11px] text-ink-muted text-center mt-2">
            Hover or tap any arc to inspect category breakdown
          </p>
        </div>

        {/* Right: Detailed Category Cards & Progress Legend */}
        <div className="lg:col-span-7 space-y-3">
          {categories.map((cat) => {
            const isHovered = hoveredCatId === cat.categoryId;
            return (
              <div
                key={cat.categoryId}
                onMouseEnter={() => setHoveredCatId(cat.categoryId)}
                onMouseLeave={() => setHoveredCatId(null)}
                onClick={() => onSelectCategory && onSelectCategory(cat.categoryId)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-surface-elevated border-teal-500/50 shadow-sm scale-[1.01]'
                    : 'bg-surface-elevated/40 border-border hover:bg-surface-elevated'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white/20"
                      style={{ backgroundColor: cat.colorKey || '#0D9488' }}
                    />
                    <CategoryIcon
                      iconKey={cat.iconKey}
                      colorKey={cat.colorKey}
                      size={14}
                      className="p-1 rounded-md"
                    />
                    <div>
                      <span className="font-semibold text-ink">{cat.categoryName}</span>
                      <span className="text-[11px] text-ink-muted ml-1.5">
                        ({cat.count} {cat.count === 1 ? 'txn' : 'txns'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-ink tabular-nums">
                      {formatCurrency(cat.totalMinor, currencyCode)}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${cat.colorKey}15` || '#0D948815',
                        color: cat.colorKey || '#0D9488',
                      }}
                    >
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress proportion bar */}
                <div className="w-full h-1.5 rounded-full bg-surface-subtle overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(cat.percentage, 100)}%`,
                      backgroundColor: cat.colorKey || '#0D9488',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
