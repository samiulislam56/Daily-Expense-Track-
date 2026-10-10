import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Expense } from '../../types/index.js';
import { formatCurrency, formatDateReadable } from '../../lib/utils.js';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  expense: Expense | null;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  expense,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !expense) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-6 transition-all">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="text-base font-bold text-ink">
              Delete Expense
            </h3>
            <p id="delete-dialog-desc" className="text-xs text-ink-muted">
              Are you sure you want to permanently delete this expense?
            </p>
          </div>
        </div>

        {/* Expense Summary Box */}
        <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-ink-muted">
              {expense.category?.name || 'Expense'}
            </span>
            <span className="text-sm font-bold font-mono text-ink">
              {formatCurrency(expense.amountMinor, expense.currencyCode)}
            </span>
          </div>
          <div className="text-xs text-ink-muted flex justify-between">
            <span>{formatDateReadable(expense.expenseDate)}</span>
            {expense.note && <span className="italic truncate max-w-[160px]">"{expense.note}"</span>}
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs mb-4">
            <span className="font-semibold block mb-0.5">Deletion failed:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions (Cancel is default focused action for safety) */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-ink hover:bg-surface-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Deleting...' : errorMessage ? 'Retry Deletion' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
