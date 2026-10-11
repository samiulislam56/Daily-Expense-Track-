import React, { useState } from 'react';
import { BellRing, PlusCircle, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface DailyExpenseReminderProps {
  todayExpenseCount: number;
  onOpenAddExpense: () => void;
}

export const DailyExpenseReminder: React.FC<DailyExpenseReminderProps> = ({
  todayExpenseCount,
  onOpenAddExpense,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const today = new Date().toISOString().slice(0, 10);
    return sessionStorage.getItem(`dailyflow_dismiss_reminder_${today}`) === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    const today = new Date().toISOString().slice(0, 10);
    sessionStorage.setItem(`dailyflow_dismiss_reminder_${today}`, 'true');
  };

  // If the user already recorded an expense today or dismissed it, do not show
  if (todayExpenseCount > 0 || isDismissed) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Daily expense reminder"
      className="relative overflow-hidden mb-5 p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm backdrop-blur-sm transition-all"
    >
      {/* Decorative aura */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20 animate-bounce duration-1000">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[var(--text-ink)]">
                Daily Expense Reminder
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <Sparkles className="w-3 h-3" />
                <span>Today's Log Pending</span>
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
              You haven't recorded any expenses for today yet. Don't forget to log your daily spending to keep your balance and budget accurate!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--surface-subtle)] transition-colors text-xs font-semibold"
            title="Dismiss reminder for today"
            aria-label="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Log Today's Expense</span>
          </button>
        </div>
      </div>
    </div>
  );
};
