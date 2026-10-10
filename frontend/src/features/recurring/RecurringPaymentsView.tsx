import React, { useState } from 'react';
import { RefreshCw, Plus, Calendar, CheckCircle2, Clock, Trash2, X, AlertCircle, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { RecurringTransaction, Category, Account } from '../../types/index.js';
import { formatBDT } from '../../lib/utils.js';
import { CategoryIcon } from '../../components/common/CategoryIcon.js';

interface RecurringPaymentsViewProps {
  recurring: RecurringTransaction[];
  categories: Category[];
  accounts: Account[];
  onCreateRecurring: (data: {
    type: 'expense' | 'income';
    amountMinor: number;
    categoryId: string;
    accountId?: string | null;
    frequency: 'weekly' | 'monthly';
    nextDueDate: string;
    note?: string | null;
  }) => Promise<any>;
  onProcessPayment: (id: string) => Promise<any>;
  onDeleteRecurring: (id: string) => Promise<any>;
}

export const RecurringPaymentsView: React.FC<RecurringPaymentsViewProps> = ({
  recurring,
  categories,
  accounts,
  onCreateRecurring,
  onProcessPayment,
  onDeleteRecurring,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || '');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const minor = Math.round((parseFloat(amount) || 0) * 100);
    if (minor <= 0 || !categoryId || !nextDueDate) return;

    try {
      setIsSubmitting(true);
      await onCreateRecurring({
        type,
        amountMinor: minor,
        categoryId,
        accountId: accountId || null,
        frequency,
        nextDueDate,
        note: note.trim() || null,
      });
      setIsCreateOpen(false);
      setAmount('');
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcess = async (id: string) => {
    try {
      setProcessingId(id);
      await onProcessPayment(id);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-ink)]">Recurring Payments & Bills</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Automate tracking for broadband, utilities, subscriptions, and recurring income
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Recurring Item</span>
        </button>
      </div>

      {/* Info notice about notifications */}
      <div className="p-4 rounded-xl bg-slate-500/5 border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-start gap-2.5">
        <Clock className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
        <span>
          <strong>Payment Schedule:</strong> Click <em>"Record Payment Now"</em> on any item when paid to automatically log the transaction in your database and advance the next due date forward by one cycle. Note: Native push notifications require background push worker permissions which vary by OS.
        </span>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurring.map((item) => {
          const isProcessing = processingId === item.id;
          const isExpense = item.type === 'expense';
          const cat = categories.find((c) => c.id === item.categoryId);
          const acc = accounts.find((a) => a.id === item.accountId);

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon iconKey={cat?.iconKey} colorKey={cat?.colorKey} size={18} />
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-ink)] flex items-center gap-1.5">
                        {item.note || cat?.name || 'Recurring Payment'}
                        <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.2 rounded capitalize">
                          {item.frequency}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[var(--text-faint)]" /> Next due: <strong>{item.nextDueDate}</strong>
                        </span>
                        {acc && (
                          <span className="flex items-center gap-1">
                            <Wallet className="w-3 h-3 text-[var(--text-faint)]" /> {acc.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-bold font-mono tabular-nums ${
                        isExpense ? 'text-[var(--text-ink)]' : 'text-emerald-600'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{formatBDT(item.amountMinor)}
                    </span>
                    <button
                      onClick={() => onDeleteRecurring(item.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-colors ml-1"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-muted)]">
                  Frequency: <strong>Every {item.frequency === 'weekly' ? 'week' : 'month'}</strong>
                </span>
                <button
                  onClick={() => handleProcess(item.id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Recording...' : 'Record Payment Now'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Recurring */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-ink)]">Add Recurring Payment</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-ink)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 ${
                    type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 ${
                    type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Income</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Fiber Broadband, Apartment Rent, Gym"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Amount (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs font-mono font-bold text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Next Due Date</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
