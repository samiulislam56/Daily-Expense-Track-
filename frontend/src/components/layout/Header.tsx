import React from 'react';
import {
  Plus,
  Sun,
  Moon,
  Laptop,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { ThemeMode } from '../../types/index.js';
import { formatDateReadable, getTodayDateString } from '../../lib/utils.js';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenAddModal: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  onOpenAddModal,
  theme,
  onThemeChange,
}) => {
  const isToday = selectedDate === getTodayDateString();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleJumpToday = () => {
    onDateChange(getTodayDateString());
  };

  const cycleTheme = () => {
    if (theme === 'system') onThemeChange('light');
    else if (theme === 'light') onThemeChange('dark');
    else onThemeChange('system');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/85 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30">
            <TrendingDown className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-ink flex items-center gap-1.5">
              DailyFlow
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300">
                v1.0
              </span>
            </span>
            <p className="text-xs text-ink-muted hidden sm:block">
              Calm, precise personal spending tracker
            </p>
          </div>
        </div>

        {/* Date Selector Strip (Quick Day Navigation) */}
        <div className="hidden md:flex items-center gap-1.5 bg-surface-elevated/70 border border-border rounded-xl p-1 shadow-subtle">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors"
            title="Previous day"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2.5 py-1">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-ink focus:outline-none cursor-pointer"
              aria-label="Selected date"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors"
            title="Next day"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={handleJumpToday}
              className="ml-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/15 hover:bg-teal-500/25 px-2 py-1 rounded-md transition-colors"
            >
              Today
            </button>
          )}
        </div>

        {/* Actions: Theme Toggle & Add Expense CTA */}
        <div className="flex items-center gap-2.5">
          {/* Theme cycle button */}
          <button
            onClick={cycleTheme}
            className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink transition-colors shadow-subtle"
            aria-label={`Current theme: ${theme}. Click to switch theme.`}
            title={`Current theme: ${theme}. Switch theme`}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === 'dark' ? (
              <Moon className="w-4 h-4 text-teal-400" />
            ) : (
              <Laptop className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            )}
          </button>

          {/* Primary Add Expense CTA */}
          <button
            id="primary-add-expense-button"
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-sm shadow-teal-600/30 transition-all hover:shadow-md hover:shadow-teal-600/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
};
