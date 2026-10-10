import React, { useState } from 'react';
import { PiggyBank, Plus, Calendar, CheckCircle2, TrendingUp, Sparkles, Trash2, X, AlertCircle } from 'lucide-react';
import { SavingsGoal } from '../../types/index.js';
import { formatBDT } from '../../lib/utils.js';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  onCreateGoal: (data: {
    title: string;
    targetAmountMinor: number;
    currentAmountMinor?: number;
    targetDate: string;
    notes?: string | null;
  }) => Promise<any>;
  onContributeGoal: (id: string, amountMinor: number) => Promise<any>;
  onDeleteGoal: (id: string) => Promise<any>;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  onCreateGoal,
  onContributeGoal,
  onDeleteGoal,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  // Create Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSaved, setInitialSaved] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetMinor = Math.round((parseFloat(targetAmount) || 0) * 100);
    const savedMinor = Math.round((parseFloat(initialSaved) || 0) * 100);
    if (!title.trim() || targetMinor <= 0 || !targetDate) return;

    try {
      setIsSubmitting(true);
      await onCreateGoal({
        title: title.trim(),
        targetAmountMinor: targetMinor,
        currentAmountMinor: savedMinor,
        targetDate,
        notes: notes.trim() || null,
      });
      setIsCreateOpen(false);
      setTitle('');
      setTargetAmount('');
      setInitialSaved('');
      setTargetDate('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId) return;
    const minor = Math.round((parseFloat(contributeAmount) || 0) * 100);
    if (minor <= 0) return;

    try {
      setIsSubmitting(true);
      await onContributeGoal(contributeGoalId, minor);
      setContributeGoalId(null);
      setContributeAmount('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmountMinor, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmountMinor, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-ink)]">Savings Goals</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Track planned savings targets with deterministic monthly milestones
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-medium">Total Saved</span>
            <span className="text-lg font-bold font-mono text-[var(--accent)]">{formatBDT(totalSaved)}</span>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Educational Notice */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-[var(--text-muted)] flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <span>
          <strong>Accounting Principle:</strong> Goals represent virtual milestone allocations of your existing liquid funds. They track your progress toward long-term targets without falsely double-counting or treating a goal as a separate bank balance.
        </span>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => {
          const isDone = g.isCompleted || g.currentAmountMinor >= g.targetAmountMinor;

          return (
            <div
              key={g.id}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl ${isDone ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-ink)]">{g.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Target: {g.targetDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isDone ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reached!
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-[var(--accent)]">
                        {g.progressPercent}%
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteGoal(g.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {g.notes && (
                  <p className="text-xs text-[var(--text-muted)] italic mb-3">"{g.notes}"</p>
                )}

                {/* Progress Bar */}
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">
                      Saved: <strong className="text-[var(--text-ink)] font-mono">{formatBDT(g.currentAmountMinor)}</strong> of {formatBDT(g.targetAmountMinor)}
                    </span>
                    <span className="font-mono text-[var(--text-muted)]">
                      {formatBDT(g.remainingMinor)} remaining
                    </span>
                  </div>

                  <div className="w-full bg-[var(--surface-subtle)] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? 'bg-emerald-500' : 'bg-[var(--accent)]'
                      }`}
                      style={{ width: `${Math.min(100, g.progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Suggested Monthly Contribution */}
                {!isDone && g.suggestedMonthlyContributionMinor > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Suggested milestone:
                    </span>
                    <strong className="font-mono text-[var(--text-ink)]">
                      {formatBDT(g.suggestedMonthlyContributionMinor)} / month
                    </strong>
                  </div>
                )}
              </div>

              {!isDone && (
                <button
                  onClick={() => setContributeGoalId(g.id)}
                  className="mt-4 w-full py-2 bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] border border-[var(--border)] text-xs font-semibold rounded-xl text-[var(--accent)] transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Contribution</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: New Goal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-ink)]">Create Savings Goal</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-ink)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Cash Buffer, New Laptop, Holiday Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Target Amount (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs font-mono font-bold text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Already Saved (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={initialSaved}
                    onChange={(e) => setInitialSaved(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs font-mono font-bold text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Target Achievement Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Notes / Motivation</label>
                <textarea
                  rows={2}
                  placeholder="Why is this goal important to you?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
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
                  {isSubmitting ? 'Creating...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Contribute to Goal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-ink)]">Add Contribution</h3>
              <button onClick={() => setContributeGoalId(null)} className="text-[var(--text-muted)] hover:text-[var(--text-ink)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContribute} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Contribution Amount (BDT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">৳</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 5000"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    required
                    autoFocus
                    className="w-full pl-8 pr-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-sm font-mono font-bold text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Add Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
