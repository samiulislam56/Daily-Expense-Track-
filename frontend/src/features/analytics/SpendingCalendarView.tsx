import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Receipt, ArrowRight } from 'lucide-react';
import { Expense } from '../../types/index.js';
import { formatBDT } from '../../lib/utils.js';
import { CategoryIcon } from '../../components/common/CategoryIcon.js';

interface SpendingCalendarViewProps {
  expenses: Expense[];
  onSelectDate: (date: string) => void;
}

export const SpendingCalendarView: React.FC<SpendingCalendarViewProps> = ({
  expenses,
  onSelectDate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map expenses by YYYY-MM-DD
  const dailySpendMap = useMemo(() => {
    const map = new Map<string, { totalMinor: number; count: number; items: Expense[] }>();
    expenses.forEach((e) => {
      if ((e.type || 'expense') === 'expense') {
        const existing = map.get(e.expenseDate) || { totalMinor: 0, count: 0, items: [] };
        existing.totalMinor += e.amountMinor;
        existing.count += 1;
        existing.items.push(e);
        map.set(e.expenseDate, existing);
      }
    });
    return map;
  }, [expenses]);

  // Compute calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNumber: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Leading blanks
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: 0, dateStr: '', isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    return days;
  }, [year, month]);

  const selectedDayData = selectedDayStr ? dailySpendMap.get(selectedDayStr) : null;

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-base font-bold text-[var(--text-ink)]">{monthName}</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--surface-elevated)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--surface-elevated)]"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[var(--text-muted)] mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid Days */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cd, index) => {
            if (!cd.isCurrentMonth) {
              return <div key={`empty-${index}`} className="h-16 rounded-xl bg-transparent" />;
            }

            const isSelected = selectedDayStr === cd.dateStr;
            const spend = dailySpendMap.get(cd.dateStr);

            return (
              <button
                key={cd.dateStr}
                onClick={() => {
                  setSelectedDayStr(cd.dateStr);
                  onSelectDate(cd.dateStr);
                }}
                className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5 ring-1 ring-[var(--accent)]'
                    : 'border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--accent)]/50'
                }`}
              >
                <span className="text-xs font-semibold text-[var(--text-ink)]">{cd.dayNumber}</span>
                {spend ? (
                  <div className="text-right">
                    <span className="text-[10px] font-bold font-mono text-[var(--accent)] block truncate">
                      {formatBDT(spend.totalMinor)}
                    </span>
                    <span className="text-[9px] text-[var(--text-faint)]">{spend.count} item{spend.count > 1 ? 's' : ''}</span>
                  </div>
                ) : (
                  <span className="text-[9px] text-[var(--text-faint)] italic">৳0</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Card */}
      {selectedDayStr && (
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
            <h4 className="text-sm font-bold text-[var(--text-ink)]">
              Transactions for {selectedDayStr}
            </h4>
            <span className="text-xs font-mono font-bold text-[var(--accent)]">
              Total: {formatBDT(selectedDayData?.totalMinor || 0)}
            </span>
          </div>

          {selectedDayData && selectedDayData.items.length > 0 ? (
            <div className="space-y-2">
              {selectedDayData.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon iconKey={item.category?.iconKey} colorKey={item.category?.colorKey} size={16} />
                    <div>
                      <span className="font-semibold text-[var(--text-ink)]">{item.category?.name || 'Category'}</span>
                      {item.note && <p className="text-[11px] text-[var(--text-muted)] truncate">{item.note}</p>}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[var(--text-ink)]">
                    {formatBDT(item.amountMinor)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic text-center py-4">
              No expenses recorded on this date.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
