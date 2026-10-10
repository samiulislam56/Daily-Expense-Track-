import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Expense } from '../../types/index.js';
import { formatCurrency, getTodayDateString } from '../../lib/utils.js';

export type TrendPeriod = 'daily' | 'monthly' | 'yearly';

interface ExpenseTrendGraphProps {
  expenses: Expense[];
  currencyCode?: string;
  defaultPeriod?: TrendPeriod;
}

interface TrendPoint {
  key: string;
  label: string;
  fullLabel: string;
  amountMinor: number;
  count: number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ExpenseTrendGraph: React.FC<ExpenseTrendGraphProps> = ({
  expenses,
  currencyCode = 'BDT',
  defaultPeriod = 'daily',
}) => {
  const [period, setPeriod] = useState<TrendPeriod>(defaultPeriod);
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);

  // Compute trend data points based on period
  const trendData = useMemo(() => {
    const today = new Date();
    const dataPoints: TrendPoint[] = [];

    if (period === 'daily') {
      // Last 14 days
      const daysCount = 14;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        const dayNum = d.getDate();
        const monthShort = MONTH_NAMES[d.getMonth()];
        const label = `${dayNum} ${monthShort}`;
        const fullLabel = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        const dayExpenses = expenses.filter((e) => e.expenseDate === iso);
        const amountMinor = dayExpenses.reduce((sum, e) => sum + e.amountMinor, 0);
        const count = dayExpenses.length;

        dataPoints.push({
          key: iso,
          label,
          fullLabel,
          amountMinor,
          count,
        });
      }
    } else if (period === 'monthly') {
      // 12 months of current year
      const currentYear = today.getFullYear();
      for (let m = 0; m < 12; m++) {
        const monthKey = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
        const label = MONTH_NAMES[m];
        const fullLabel = `${FULL_MONTH_NAMES[m]} ${currentYear}`;

        const monthExpenses = expenses.filter((e) =>
          e.expenseDate.startsWith(monthKey)
        );
        const amountMinor = monthExpenses.reduce((sum, e) => sum + e.amountMinor, 0);
        const count = monthExpenses.length;

        dataPoints.push({
          key: monthKey,
          label,
          fullLabel,
          amountMinor,
          count,
        });
      }
    } else {
      // Yearly: last 4 years up to current year
      const currentYear = today.getFullYear();
      for (let y = currentYear - 3; y <= currentYear; y++) {
        const yearKey = String(y);
        const yearExpenses = expenses.filter((e) =>
          e.expenseDate.startsWith(yearKey)
        );
        const amountMinor = yearExpenses.reduce((sum, e) => sum + e.amountMinor, 0);
        const count = yearExpenses.length;

        dataPoints.push({
          key: yearKey,
          label: yearKey,
          fullLabel: `Year ${yearKey}`,
          amountMinor,
          count,
        });
      }
    }

    const total = dataPoints.reduce((sum, p) => sum + p.amountMinor, 0);
    const activePointsCount = dataPoints.filter((p) => p.amountMinor > 0).length || 1;
    const avg = Math.round(total / (period === 'daily' ? dataPoints.length : activePointsCount));

    let peak: TrendPoint | null = null;
    for (const p of dataPoints) {
      if (!peak || p.amountMinor > peak.amountMinor) {
        peak = p;
      }
    }

    return {
      points: dataPoints,
      totalMinor: total,
      averageMinor: avg,
      peakPoint: peak,
    };
  }, [expenses, period]);

  const { points, totalMinor, averageMinor, peakPoint } = trendData;

  const maxAmount = useMemo(() => {
    const maxVal = Math.max(...points.map((p) => p.amountMinor), 0);
    return maxVal === 0 ? 10000 : maxVal;
  }, [points]);

  // Chart SVG layout metrics
  const chartHeight = 190;
  const chartWidth = 720;
  const paddingBottom = 32;
  const paddingTop = 20;
  const usableHeight = chartHeight - paddingBottom - paddingTop;
  const barCount = points.length;
  const barSlotWidth = chartWidth / barCount;
  const barWidth = Math.min(Math.max(12, barSlotWidth * 0.55), 36);

  // Average line Y coordinate
  const avgY =
    maxAmount > 0
      ? paddingTop + usableHeight - (averageMinor / maxAmount) * usableHeight
      : chartHeight - paddingBottom;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-card space-y-6">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">Expense Trend Graph</h3>
            <p className="text-xs text-ink-muted">
              Spending trajectory over Daily, Monthly, and Yearly intervals
            </p>
          </div>
        </div>

        {/* Timeframe selector segmented control */}
        <div className="flex items-center bg-surface-elevated p-1 rounded-xl border border-border shrink-0 self-start sm:self-auto">
          {(['daily', 'monthly', 'yearly'] as TrendPeriod[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setPeriod(tab);
                setHoveredPoint(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                period === tab
                  ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
                  : 'text-ink-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
            {period === 'daily'
              ? 'Last 14 Days Total'
              : period === 'monthly'
              ? 'Annual Spending'
              : 'Multi-Year Total'}
          </span>
          <div className="text-lg font-bold font-mono text-ink mt-0.5 tabular-nums">
            {formatCurrency(totalMinor, currencyCode)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
            {period === 'daily'
              ? 'Daily Average'
              : period === 'monthly'
              ? 'Monthly Average'
              : 'Yearly Average'}
          </span>
          <div className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400 mt-0.5 tabular-nums">
            {formatCurrency(averageMinor, currencyCode)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-elevated/50 border border-border">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
            Peak Period
          </span>
          <div className="text-lg font-bold font-mono text-ink mt-0.5 tabular-nums flex items-baseline justify-between">
            <span>
              {peakPoint && peakPoint.amountMinor > 0
                ? formatCurrency(peakPoint.amountMinor, currencyCode)
                : '৳0.00'}
            </span>
            <span className="text-xs text-ink-muted font-normal font-sans">
              {peakPoint && peakPoint.amountMinor > 0 ? peakPoint.label : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Bar Graph Canvas */}
      <div className="relative w-full overflow-x-auto pt-2">
        <div className="min-w-[580px] w-full">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-56 sm:h-64 overflow-visible"
            aria-label={`${period} spending bar chart`}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D9488" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.45" />
              </linearGradient>
              <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14B8A6" stopOpacity="1" />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid guidelines (0%, 50%, 100%) */}
            <line
              x1="0"
              y1={paddingTop}
              x2={chartWidth}
              y2={paddingTop}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-border"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1={paddingTop + usableHeight / 2}
              x2={chartWidth}
              y2={paddingTop + usableHeight / 2}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-border"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1={chartHeight - paddingBottom}
              x2={chartWidth}
              y2={chartHeight - paddingBottom}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
            />

            {/* Average Indicator Guideline */}
            {averageMinor > 0 && avgY > paddingTop && avgY < chartHeight - paddingBottom && (
              <g className="opacity-75">
                <line
                  x1="0"
                  y1={avgY}
                  x2={chartWidth}
                  y2={avgY}
                  stroke="#0D9488"
                  strokeDasharray="6 4"
                  strokeWidth="1.5"
                />
                <text
                  x={chartWidth - 8}
                  y={avgY - 4}
                  textAnchor="end"
                  fill="#0D9488"
                  className="text-[9px] font-mono font-bold"
                >
                  AVG: {formatCurrency(averageMinor, currencyCode)}
                </text>
              </g>
            )}

            {/* Bars */}
            {points.map((pt, idx) => {
              const xCenter = idx * barSlotWidth + barSlotWidth / 2;
              const barX = xCenter - barWidth / 2;
              const barH =
                maxAmount > 0
                  ? (pt.amountMinor / maxAmount) * usableHeight
                  : 0;
              const barY = chartHeight - paddingBottom - barH;
              const isHovered = hoveredPoint?.key === pt.key;

              return (
                <g
                  key={pt.key}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setHoveredPoint(pt)}
                >
                  {/* Invisible broad hit box for mobile touch targets */}
                  <rect
                    x={idx * barSlotWidth}
                    y={paddingTop}
                    width={barSlotWidth}
                    height={usableHeight + paddingBottom}
                    fill="transparent"
                  />

                  {/* The visual Bar */}
                  {barH > 0 ? (
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barH}
                      rx="4"
                      fill={isHovered ? 'url(#barGradientActive)' : 'url(#barGradient)'}
                      className={`transition-all duration-200 ${
                        isHovered ? 'filter drop-shadow(0 4px 6px rgba(13,148,136,0.35))' : ''
                      }`}
                    />
                  ) : (
                    // Subtle placeholder dot for zero days
                    <circle
                      cx={xCenter}
                      cy={chartHeight - paddingBottom - 3}
                      r="2"
                      fill="currentColor"
                      className="text-border"
                    />
                  )}

                  {/* X-axis Label */}
                  <text
                    x={xCenter}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fill="currentColor"
                    className={`text-[10px] font-medium transition-colors ${
                      isHovered
                        ? 'text-teal-600 dark:text-teal-400 font-bold'
                        : 'text-ink-muted'
                    }`}
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating / Selected Point Details Footer */}
      <div className="p-3.5 rounded-xl bg-surface-elevated border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {hoveredPoint ? (
          <div className="flex flex-wrap items-center justify-between w-full gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="font-bold text-ink">{hoveredPoint.fullLabel}:</span>
              <span className="text-ink-muted">
                {hoveredPoint.count} {hoveredPoint.count === 1 ? 'expense' : 'expenses'}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="font-bold text-sm text-ink tabular-nums">
                {formatCurrency(hoveredPoint.amountMinor, currencyCode)}
              </span>
              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full">
                {totalMinor > 0
                  ? `${((hoveredPoint.amountMinor / totalMinor) * 100).toFixed(1)}% of total`
                  : '0%'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-ink-muted text-xs">
            <span>Hover or tap any bar in the graph to inspect exact details.</span>
            <span className="font-mono text-ink">
              {barCount} {period} intervals plotted
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
