import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, ArrowDownRight, ArrowUpRight, Wallet, Tag } from 'lucide-react';
import { Category, Expense, Account, TransactionType } from '../../types/index.js';
import {
  parseAmountToMinor,
  formatMinorToDecimalString,
  getTodayDateString,
  formatBDT,
} from '../../lib/utils.js';
import { CategoryIcon } from '../../components/common/CategoryIcon.js';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  accounts?: Account[];
  initialExpense?: Expense | null;
  initialAmount?: string | null;
  defaultDate?: string;
  defaultType?: TransactionType;
  onSave: (payload: {
    amountMinor: number;
    categoryId: string;
    expenseDate: string;
    note?: string;
    currencyCode?: string;
    type?: TransactionType;
    accountId?: string | null;
    tags?: string;
  }) => Promise<void>;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  accounts = [],
  initialExpense,
  initialAmount,
  defaultDate,
  defaultType = 'expense',
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [currencyCode, setCurrencyCode] = useState<string>('BDT');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (initialExpense) {
        setType(initialExpense.type || 'expense');
        setAmountStr(formatMinorToDecimalString(initialExpense.amountMinor));
        setCategoryId(initialExpense.categoryId);
        setAccountId(initialExpense.accountId || (accounts.find((a) => a.isDefault)?.id || ''));
        setExpenseDate(initialExpense.expenseDate);
        setNote(initialExpense.note || '');
        setTags(initialExpense.tags || '');
        setCurrencyCode(initialExpense.currencyCode || 'BDT');
      } else {
        setType(defaultType);
        setAmountStr(initialAmount || '');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
        setAccountId(defaultAcc ? defaultAcc.id : '');
        setExpenseDate(defaultDate || getTodayDateString());
        setNote('');
        setTags('');
        setCurrencyCode('BDT');
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialExpense, initialAmount, defaultDate, defaultType, categories, accounts]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const minor = parseAmountToMinor(amountStr);
    if (!amountStr || minor <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!categoryId) {
      newErrors.category = 'Please select a category';
    }

    if (!expenseDate) {
      newErrors.expenseDate = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const minor = parseAmountToMinor(amountStr);
      await onSave({
        amountMinor: minor,
        categoryId,
        expenseDate,
        note: note.trim() || undefined,
        currencyCode,
        type,
        accountId: accountId || null,
        tags: tags.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save transaction' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + val).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-[var(--text-ink)]">
                {initialExpense ? 'Edit Transaction' : 'Quick Add Transaction'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {type === 'income' ? 'Record incoming cash or deposit' : 'Record an expense outflow'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--surface-elevated)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {errors.form && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">
              {errors.form}
            </div>
          )}

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Expense Outflow</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Income Inflow</span>
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Amount ({currencyCode}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--text-muted)]">
                ৳
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className={`w-full pl-9 pr-4 py-2.5 bg-[var(--surface-elevated)] border rounded-xl text-lg font-semibold tabular-nums text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all ${
                  errors.amount ? 'border-red-500' : 'border-[var(--border)]'
                }`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}

            {/* Quick Presets */}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[11px] text-[var(--text-faint)]">Add:</span>
              {[100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddPreset(val)}
                  className="px-2 py-0.5 text-[11px] font-medium bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] rounded-md text-[var(--text-muted)] transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Account Selector */}
          {accounts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Account / Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {accounts.map((acc) => {
                  const isSelected = accountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccountId(acc.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5 ring-1 ring-[var(--accent)]'
                          : 'border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--text-faint)]'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <Wallet className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span className="text-xs font-semibold truncate text-[var(--text-ink)]">{acc.name}</span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                        {formatBDT(acc.balanceMinor)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-[var(--border)] rounded-xl bg-[var(--surface-elevated)]">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center space-x-2 p-2 rounded-lg text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-[var(--surface)] text-[var(--accent)] font-semibold shadow-sm border border-[var(--accent)]'
                        : 'text-[var(--text-ink)] hover:bg-[var(--surface-subtle)]'
                    }`}
                  >
                    <CategoryIcon iconKey={cat.iconKey} colorKey={cat.colorKey} className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>

          {/* Date & Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className={`w-full px-3 py-2 bg-[var(--surface-elevated)] border rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all ${
                  errors.expenseDate ? 'border-red-500' : 'border-[var(--border)]'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Tags (comma separated)
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="e.g. food, client, trip"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Description / Note (optional)
            </label>
            <textarea
              rows={2}
              placeholder="What was this transaction for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-end space-x-3 bg-[var(--surface-elevated)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50 ${
              type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{initialExpense ? 'Update' : type === 'income' ? 'Save Income' : 'Save Expense'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
