import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, Coins, Calendar } from 'lucide-react';
import { parseAmountToMinor, formatMinorToDecimalString, getTodayDateString } from '../../lib/utils.js';

interface EditBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalanceMinor: number | null;
  currentReferenceDate?: string | null;
  currencyCode?: string;
  onSave: (payload: { amountMinor: number; currencyCode: string; referenceDate: string }) => Promise<void>;
}

export const EditBalanceModal: React.FC<EditBalanceModalProps> = ({
  isOpen,
  onClose,
  currentBalanceMinor,
  currentReferenceDate,
  currencyCode = 'BDT',
  onSave,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [referenceDate, setReferenceDate] = useState<string>(getTodayDateString());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setAmountStr(
        currentBalanceMinor !== null && currentBalanceMinor !== undefined && currentBalanceMinor > 0
          ? formatMinorToDecimalString(currentBalanceMinor)
          : ''
      );
      setReferenceDate(currentReferenceDate || getTodayDateString());
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, currentBalanceMinor, currentReferenceDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = amountStr.trim().replace(/,/g, '');
    const num = parseFloat(cleanInput);

    if (isNaN(num) || num < 0) {
      setError('Please enter a valid non-negative amount (0 or greater).');
      return;
    }

    const amountMinor = parseAmountToMinor(amountStr);
    setIsSubmitting(true);

    try {
      await onSave({
        amountMinor,
        currencyCode,
        referenceDate,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save balance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-balance-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 id="edit-balance-title" className="text-base font-bold text-ink">
                Total Available Balance
              </h2>
              <p className="text-xs text-ink-muted">
                Configure your available funds in {currencyCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="available-balance-amount" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Available Balance ({currencyCode}) *
            </label>
            <div className="relative flex rounded-xl border border-border focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 bg-surface-elevated/50">
              <input
                id="available-balance-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 bg-transparent text-lg font-bold font-mono tabular-nums text-ink focus:outline-none"
                required
              />
              <div className="flex items-center pr-4 font-semibold text-xs text-ink-muted">
                {currencyCode}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="balance-reference-date" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Balance Reference Date</span>
            </label>
            <input
              id="balance-reference-date"
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium text-ink focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
              required
            />
            <p className="mt-1.5 text-[11px] text-ink-muted leading-relaxed">
              Expenses recorded on or after this date will be deducted from your available balance.
            </p>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-ink hover:bg-surface-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Balance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
