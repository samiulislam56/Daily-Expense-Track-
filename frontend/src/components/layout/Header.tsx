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
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { ThemeMode } from '../../types/index.js';
import { formatDateReadable, getTodayDateString } from '../../lib/utils.js';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenAddModal: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  canInstall?: boolean;
  isInstalled?: boolean;
  onInstallClick?: () => void;
  syncStatus?: {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    manualSync?: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  onOpenAddModal,
  theme,
  onThemeChange,
  canInstall = false,
  isInstalled = false,
  onInstallClick,
  syncStatus,
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
    <header className="sticky top-0 z-30 w-full bg-surface/85 backdrop-blur-md border-b border-border transition-colors pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/30 shrink-0">
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-ink flex items-center gap-1.5">
              DailyFlow
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300">
                PWA
              </span>
            </span>
            <p className="text-xs text-ink-muted hidden md:block">
              Calm, precise personal spending tracker
            </p>
          </div>
        </div>

        {/* Date Selector Strip (Quick Day Navigation) */}
        <div className="hidden sm:flex items-center gap-1 bg-surface-elevated/70 border border-border rounded-xl p-1 shadow-subtle">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors"
            title="Previous day"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2 py-1">
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

        {/* Actions: Sync Status, Install PWA, Theme & Add Expense CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Sync / Connectivity status indicator */}
          {syncStatus && (
            <button
              type="button"
              onClick={syncStatus.manualSync}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                !syncStatus.isOnline
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : syncStatus.pendingCount > 0
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              }`}
              title={
                !syncStatus.isOnline
                  ? `Offline • ${syncStatus.pendingCount} pending syncs`
                  : syncStatus.isSyncing
                  ? 'Syncing changes with server...'
                  : 'Online & synchronized'
              }
              aria-label="Sync status"
            >
              {!syncStatus.isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden xs:inline">
                    Offline {syncStatus.pendingCount > 0 && `(${syncStatus.pendingCount})`}
                  </span>
                </>
              ) : syncStatus.isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span className="hidden xs:inline">Syncing...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
            </button>
          )}

          {/* PWA Install Button */}
          {canInstall && !isInstalled && onInstallClick && (
            <button
              type="button"
              onClick={onInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-semibold shadow-subtle transition-all active:scale-95"
              title="Install DailyFlow as a native app on your device"
              aria-label="Install DailyFlow App"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Theme cycle button */}
          <button
            onClick={cycleTheme}
            className="p-2 sm:p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-ink-muted hover:text-ink transition-colors shadow-subtle min-h-[38px] min-w-[38px] flex items-center justify-center"
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

          {/* Primary Add Expense CTA (Hidden on small mobile since bottom bar has prominent center button) */}
          <button
            id="primary-add-expense-button"
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm shadow-sm shadow-teal-600/30 transition-all hover:shadow-md hover:shadow-teal-600/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
};
