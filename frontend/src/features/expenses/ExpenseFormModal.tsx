import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { Category, Expense } from '../../types/index.js';
import {
  parseAmountToMinor,
  formatMinorToDecimalString,
  getTodayDateString,
} from '../../lib/utils.js';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialExpense?: Expense | null;
  initialAmount?: string | null;
  defaultDate?: string;
  onSave: (payload: {
    amountMinor: number;
    categoryId: string;
    expenseDate: string;
    note?: string;
    currencyCode?: string;
  }) => Promise<void>;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialExpense,
  initialAmount,
  defaultDate,
  onSave,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [currencyCode, setCurrencyCode] = useState<string>('BDT');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (initialExpense) {
        setAmountStr(formatMinorToDecimalString(initialExpense.amountMinor));
        setCategoryId(initialExpense.categoryId);
        setExpenseDate(initialExpense.expenseDate);
        setNote(initialExpense.note || '');
        setCurrencyCode(initialExpense.currencyCode || 'BDT');
      } else {
        setAmountStr(initialAmount || '');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        setExpenseDate(defaultDate || getTodayDateString());
        setNote('');
        setCurrencyCode('BDT');
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialExpense, initialAmount, defaultDate, categories]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const minor = parseAmountToMinor(amountStr);
    if (!amountStr || minor <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!categoryId) {
      newErrors.category = 'Please select an expense category';
    }

    if (!expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    }

    if (note && note.length > 500) {
      newErrors.note = 'Note cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const amountMinor = parseAmountToMinor(amountStr);
      await onSave({
        amountMinor,
        categoryId,
        expenseDate,
        note: note.trim() || undefined,
        currencyCode,
      });
      onClose();
    } catch (err: any) {
      if (err?.details && Array.isArray(err.details)) {
        const fieldErrors: Record<string, string> = {};
        err.details.forEach((d: any) => {
          if (d.field) fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ form: err.message || 'Failed to save expense' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-ink">
              {initialExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-xs text-ink-muted">
              {initialExpense ? 'Update expense details and amount' : 'Record a new daily transaction'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {errors.form}
            </div>
          )}

          {/* Amount and Currency */}
          <div>
            <label htmlFor="expense-amount" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Amount *
            </label>
            <div className="relative flex rounded-xl border border-border focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 bg-surface-elevated/50">
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 bg-transparent text-lg font-bold font-mono tabular-nums text-ink focus:outline-none"
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                required
              />
              <div className="flex items-center pr-3 font-semibold text-xs text-ink-muted">
                {currencyCode}
              </div>
            </div>
            {errors.amount && (
              <p id="amount-error" className="mt-1 text-xs text-rose-500">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="expense-category" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Category *
            </label>
            <select
              id="expense-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium text-ink focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.category}
              </p>
            )}
          </div>

          {/* Expense Date */}
          <div>
            <label htmlFor="expense-date" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Expense Date *
            </label>
            <input
              id="expense-date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium text-ink focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
              required
            />
            {errors.expenseDate && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.expenseDate}
              </p>
            )}
          </div>

          {/* Note (Optional) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="expense-note" className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Note (Optional)
              </label>
              <span className="text-[11px] text-ink-faint">
                {note.length}/500
              </span>
            </div>
            <textarea
              id="expense-note"
              rows={2}
              maxLength={500}
              placeholder="e.g. Lunch at Bistro, Grocery haul"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-sm text-ink focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none"
            />
            {errors.note && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.note}
              </p>
            )}
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
                  <span>Save Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
