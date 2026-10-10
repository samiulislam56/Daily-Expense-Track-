import React, { useState } from 'react';
import { Wallet, Building2, Smartphone, Plus, Trash2, Edit3, Check, X, ShieldAlert } from 'lucide-react';
import { Account, AccountType } from '../../types/index.js';
import { formatBDT } from '../../lib/utils.js';

interface AccountsViewProps {
  accounts: Account[];
  onCreateAccount: (data: { name: string; type: AccountType; balanceMinor: number; isDefault: boolean }) => Promise<any>;
  onUpdateAccount: (id: string, data: Partial<Account>) => Promise<any>;
  onDeleteAccount: (id: string) => Promise<any>;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onCreateAccount,
  onUpdateAccount,
  onDeleteAccount,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');

  // Form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>('bank');
  const [newBalance, setNewBalance] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'mobile_wallet':
        return <Smartphone className="w-5 h-5 text-pink-500" />;
      default:
        return <Wallet className="w-5 h-5 text-emerald-500" />;
    }
  };

  const totalLiquidity = accounts.reduce((acc, a) => acc + a.balanceMinor, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setIsSubmitting(true);
      const minor = Math.round((parseFloat(newBalance) || 0) * 100);
      await onCreateAccount({
        name: newName.trim(),
        type: newType,
        balanceMinor: minor,
        isDefault: newIsDefault,
      });
      setIsCreateOpen(false);
      setNewName('');
      setNewBalance('');
      setNewIsDefault(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (acc: Account) => {
    setEditingId(acc.id);
    setEditName(acc.name);
    setEditBalance((acc.balanceMinor / 100).toFixed(2));
  };

  const saveEdit = async (id: string) => {
    const minor = Math.round((parseFloat(editBalance) || 0) * 100);
    await onUpdateAccount(id, { name: editName.trim(), balanceMinor: minor });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-ink)]">Accounts & Wallets</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage your liquid cash, bank balances, and mobile financial services (bKash, Nagad)
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-medium">Total Balance</span>
            <span className="text-lg font-bold font-mono text-[var(--text-ink)]">{formatBDT(totalLiquidity)}</span>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isEditing = editingId === acc.id;

          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 text-xs border rounded bg-[var(--surface-elevated)] text-[var(--text-ink)] font-semibold"
                        />
                      ) : (
                        <h3 className="text-sm font-bold text-[var(--text-ink)] flex items-center gap-1.5">
                          {acc.name}
                          {acc.isDefault && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                              Default
                            </span>
                          )}
                        </h3>
                      )}
                      <span className="text-[11px] text-[var(--text-muted)] capitalize">{acc.type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(acc.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(acc)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--surface-elevated)] rounded-lg transition-colors"
                          title="Edit Account"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {accounts.length > 1 && (
                          <button
                            onClick={() => onDeleteAccount(acc.id)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-[11px] text-[var(--text-muted)] block">Available Amount</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm font-bold text-[var(--text-muted)]">৳</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editBalance}
                        onChange={(e) => setEditBalance(e.target.value)}
                        className="px-2 py-1 text-sm font-mono border rounded bg-[var(--surface-elevated)] text-[var(--text-ink)] font-bold w-full"
                      />
                    </div>
                  ) : (
                    <span className="text-xl font-bold font-mono text-[var(--text-ink)] tabular-nums block">
                      {formatBDT(acc.balanceMinor)}
                    </span>
                  )}
                </div>
              </div>

              {!acc.isDefault && !isEditing && (
                <button
                  onClick={() => onUpdateAccount(acc.id, { isDefault: true })}
                  className="mt-4 text-[11px] font-semibold text-[var(--accent)] hover:underline text-left self-start"
                >
                  Set as default account
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add Account */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-ink)]">Add Financial Account</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-ink)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. Brac Bank, Nagad Personal"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Account Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="cash">Cash in Hand</option>
                  <option value="bank">Bank Account</option>
                  <option value="mobile_wallet">Mobile Wallet (bKash/Nagad/Rocket)</option>
                  <option value="other">Other / Prepaid Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Current Balance (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-xs font-mono font-bold text-[var(--text-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                  className="rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <label htmlFor="defaultCheck" className="text-xs text-[var(--text-muted)]">
                  Make this my default payment account
                </label>
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
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
