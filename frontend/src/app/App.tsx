import React, { useState, useMemo } from 'react';
import { Header } from '../components/layout/Header.js';
import { MagnificationDock } from '../components/layout/MagnificationDock.js';
import { MobileBottomNav } from '../components/layout/MobileBottomNav.js';
import { ScrollJourneyLine } from '../components/layout/ScrollJourneyLine.js';
import { ToastContainer, ToastMessage } from '../components/common/Toast.js';
import { PWAUpdateToast } from '../components/common/PWAUpdateToast.js';
import { InstallAppModal } from '../components/common/InstallAppModal.js';
import { DashboardMetrics } from '../features/analytics/DashboardMetrics.js';
import { CategoryAnalytics } from '../features/analytics/CategoryAnalytics.js';
import { ExpenseTrendGraph } from '../features/analytics/ExpenseTrendGraph.js';
import { CategoryDistributionGraph } from '../features/analytics/CategoryDistributionGraph.js';
import { SpendingCalendarView } from '../features/analytics/SpendingCalendarView.js';
import { ExpenseList } from '../features/expenses/ExpenseList.js';
import { ExpenseFiltersBar } from '../features/expenses/ExpenseFilters.js';
import { ExpenseFormModal } from '../features/expenses/ExpenseFormModal.js';
import { DeleteConfirmModal } from '../features/expenses/DeleteConfirmModal.js';
import { DailyExpenseReminder } from '../features/expenses/DailyExpenseReminder.js';
import { EditBalanceModal } from '../features/balance/EditBalanceModal.js';
import { InAppCalculator } from '../features/calculator/InAppCalculator.js';
import { SettingsView } from '../features/settings/SettingsView.js';
import { AccountsView } from '../features/accounts/AccountsView.js';
import { BudgetsView } from '../features/budgets/BudgetsView.js';
import { SavingsGoalsView } from '../features/goals/SavingsGoalsView.js';
import { RecurringPaymentsView } from '../features/recurring/RecurringPaymentsView.js';
import { CopilotView } from '../features/copilot/CopilotView.js';
import { AuthView } from '../features/auth/AuthView.js';
import { ThreeQuestionsCard } from '../features/analytics/ThreeQuestionsCard.js';
import { SafeToSpendWidget } from '../features/safetospend/SafeToSpendWidget.js';
import { SmartMoneyForecast } from '../features/forecast/SmartMoneyForecast.js';
import { WhatIfSimulator } from '../features/simulator/WhatIfSimulator.js';
import { WeeklyMoneyCheckin } from '../features/checkin/WeeklyMoneyCheckin.js';
import { calculateSafeToSpend, ScheduledCashFlowEvent } from '../lib/fintech.js';
import { LanguageProvider, useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';

import { useTheme } from '../hooks/useTheme.js';
import { usePWAInstall } from '../hooks/usePWAInstall.js';
import { useSyncStatus } from '../hooks/useSyncStatus.js';
import {
  useCategories,
  useAccounts,
  useBudgets,
  useGoals,
  useRecurring,
  useExpenses,
  useAllExpenses,
  useDailySummary,
  useMonthlySummary,
  useCategorySummary,
  useBalance,
  useExpenseMutations,
} from '../hooks/useExpenseQueries.js';
import { ActiveTab, Expense, ExpenseFilters, CopilotDraftTransaction } from '../types/index.js';
import { getTodayDateString, getCurrentMonthString, formatBDT } from '../lib/utils.js';
import { Wallet, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, CalendarCheck, TrendingUp, Sliders } from 'lucide-react';

const AuthenticatedDashboard: React.FC = () => {
  const { lang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [currency, setCurrency] = useState<string>('BDT');

  // Sub-tabs for Goals/Recurring
  const [goalsSubTab, setGoalsSubTab] = useState<'goals' | 'recurring' | 'accounts'>('goals');

  // PWA and offline status
  const {
    canInstall,
    isInstalled,
    isIOS,
    hasNativePrompt,
    showInstallModal,
    setShowInstallModal,
    promptInstall,
  } = usePWAInstall();
  const syncStatus = useSyncStatus();

  // Filters state
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    pageSize: 20,
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState<boolean>(false);
  const [isWeeklyCheckinOpen, setIsWeeklyCheckinOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [prefilledAmount, setPrefilledAmount] = useState<string | null>(null);

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Queries
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: balanceData } = useBalance();

  const todayDate = useMemo(() => getTodayDateString(), []);
  const currentMonth = useMemo(() => selectedDate.substring(0, 7) || getCurrentMonthString(), [selectedDate]);

  const { data: budgets = [] } = useBudgets(currentMonth);
  const { data: goals = [] } = useGoals();
  const { data: recurring = [] } = useRecurring();

  // Deterministic financial calculations for DailyFlow 2.0
  const upcomingBillsMinor = useMemo(() => {
    return recurring
      .filter((r) => r.type === 'expense' && r.isActive)
      .reduce((sum, r) => sum + r.amountMinor, 0);
  }, [recurring]);

  const upcomingBillsCount = useMemo(() => {
    return recurring.filter((r) => r.type === 'expense' && r.isActive).length;
  }, [recurring]);

  const dailySafeToSpendMinor = useMemo(() => {
    if (balanceData?.availableBalanceMinor == null) return 0;
    const safe = calculateSafeToSpend({
      currentBalanceMinor: balanceData.availableBalanceMinor,
      upcomingBillsMinor,
      savingsCommitmentsMinor: 200000,
      emergencyBufferMinor: 300000,
      daysUntilIncome: 14,
    });
    return safe.dailySafeToSpendMinor;
  }, [balanceData?.availableBalanceMinor, upcomingBillsMinor]);

  const scheduledEvents: ScheduledCashFlowEvent[] = useMemo(() => {
    return recurring.map((r) => ({
      date: r.nextDueDate,
      amountMinor: r.amountMinor,
      title: r.categoryName || (r.type === 'income' ? 'Scheduled Income' : 'Recurring Bill'),
      type: r.type,
    }));
  }, [recurring]);

  // Overview expenses filter vs History filters
  const effectiveFilters = useMemo(() => {
    if (activeTab === 'overview') {
      return {
        from: selectedDate,
        to: selectedDate,
        ...filters,
      };
    }
    return filters;
  }, [activeTab, selectedDate, filters]);

  const { data: expensesResponse, isLoading: isLoadingExpenses } = useExpenses(effectiveFilters);
  const expenses = expensesResponse?.data || [];
  const meta = expensesResponse?.meta || { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 };

  // All historical expenses for trend graph & calendar
  const { data: allHistoricalExpenses = [] } = useAllExpenses();

  // Summaries
  const { data: todaySummary } = useDailySummary(todayDate);
  const { data: selectedDaySummary } = useDailySummary(selectedDate);
  const { data: monthlySummary } = useMonthlySummary(currentMonth);
  const { data: categorySummary = [], isLoading: isLoadingCategorySummary } = useCategorySummary();

  const overallBudget = useMemo(() => budgets.find((b) => b.categoryId === null), [budgets]);

  // Mutations
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    updateBalanceMutation,
    createAccountMutation,
    updateAccountMutation,
    deleteAccountMutation,
    setBudgetMutation,
    deleteBudgetMutation,
    createGoalMutation,
    contributeGoalMutation,
    deleteGoalMutation,
    createRecurringMutation,
    processRecurringMutation,
    deleteRecurringMutation,
  } = useExpenseMutations();

  // Handlers
  const handleOpenAdd = (initialAmt?: string) => {
    setEditingExpense(null);
    setPrefilledAmount(initialAmt || null);
    setIsAddModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setPrefilledAmount(null);
    setIsAddModalOpen(true);
  };

  const handleSaveExpense = async (payload: {
    amountMinor: number;
    categoryId: string;
    expenseDate: string;
    note?: string;
    currencyCode?: string;
    type?: any;
    accountId?: string | null;
    tags?: string;
  }) => {
    if (editingExpense) {
      await updateMutation.mutateAsync({
        id: editingExpense.id,
        payload,
      });
      addToast('success', 'Transaction updated successfully.', 'Updated');
    } else {
      await createMutation.mutateAsync({
        ...payload,
        currencyCode: payload.currencyCode || currency,
      });
      addToast(
        'success',
        payload.type === 'income' ? 'Income inflow recorded.' : 'Expense recorded.',
        'Saved'
      );
    }
  };

  const handleConfirmDraftTransaction = async (draft: CopilotDraftTransaction) => {
    await createMutation.mutateAsync({
      amountMinor: draft.amountMinor,
      categoryId: draft.categoryId,
      accountId: draft.accountId || null,
      type: draft.type,
      expenseDate: draft.date,
      note: draft.note,
      currencyCode: currency,
    });
    addToast('success', `Copilot draft confirmed: ${draft.amountFormatted} recorded.`, 'Transaction Saved');
  };

  const handleOpenDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteErrorMessage(null);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setDeleteErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(expenseToDelete.id);
      addToast('success', 'Transaction was successfully removed.', 'Deleted');
      setExpenseToDelete(null);
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete transaction.';
      setDeleteErrorMessage(msg);
      addToast('error', msg, 'Delete Failed');
    }
  };

  const handleSaveBalance = async (payload: {
    amountMinor: number;
    currencyCode: string;
    referenceDate: string;
  }) => {
    await updateBalanceMutation.mutateAsync(payload);
    addToast('success', 'Total available balance saved successfully.', 'Balance Saved');
  };

  const handleTransferFromCalc = (amountDecimal: string) => {
    handleOpenAdd(amountDecimal);
    addToast('info', `Transferred ${amountDecimal} ${currency} to form.`, 'Calculator');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-ink)] flex flex-col selection:bg-[var(--accent)]/20 pb-safe">
      <ScrollJourneyLine />

      {/* Header */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenAddModal={() => handleOpenAdd()}
        theme={theme}
        onThemeChange={setTheme}
        canInstall={canInstall}
        isInstalled={isInstalled}
        onInstallClick={() => setShowInstallModal(true)}
        syncStatus={syncStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-32">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Daily Expense Pending Reminder */}
            <DailyExpenseReminder
              todayExpenseCount={todaySummary?.count ?? 0}
              onOpenAddExpense={() => handleOpenAdd()}
            />

            {/* DailyFlow 2.0 Feature Banner: Weekly Review & Forecast Quick Links */}
            <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-ink)]">
                      {lang === 'bn' ? 'সাপ্তাহিক মানি চেক-ইন ও আর্থিক পরামর্শ' : 'Weekly Money Check-in & Habit Guidance'}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      7 Days
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                    {lang === 'bn'
                      ? 'গত ৭ দিনের আয়-ব্যয়, শীর্ষ ক্যাটাগরি এবং সচেতন খরচের দিকনির্দেশনা দেখুন'
                      : 'Non-judgmental review of your last 7 days of income, expenses, and savings tips'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsWeeklyCheckinOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('weeklyCheckin')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('forecast')}
                  className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-subtle)] text-[var(--text-ink)] border border-[var(--border)] text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{t('forecast')}</span>
                </button>
              </div>
            </div>

            {/* Signature Feature: 3 Essential Dashboard Questions */}
            <ThreeQuestionsCard
              availableBalanceMinor={balanceData?.availableBalanceMinor ?? null}
              upcomingBillsMinor={upcomingBillsMinor}
              upcomingBillsCount={upcomingBillsCount}
              dailySafeToSpendMinor={dailySafeToSpendMinor}
              onOpenEditBalance={() => setIsEditBalanceOpen(true)}
              onNavigateToTab={setActiveTab}
            />

            {/* Signature Feature: Safe-to-Spend Interactive Engine */}
            <SafeToSpendWidget
              currentBalanceMinor={balanceData?.availableBalanceMinor ?? null}
              upcomingBillsMinor={upcomingBillsMinor}
              onOpenEditBalance={() => setIsEditBalanceOpen(true)}
            />

            {/* Dashboard Summary Metrics */}
            <DashboardMetrics
              availableBalanceMinor={balanceData?.availableBalanceMinor ?? null}
              isBalanceConfigured={balanceData?.isConfigured ?? false}
              balanceReferenceDate={balanceData?.referenceDate}
              totalIncomeMinor={balanceData?.totalIncomeMinor ?? 0}
              totalExpensesAgainstBalanceMinor={balanceData?.totalExpensesMinor ?? 0}
              remainingBalanceMinor={balanceData?.remainingBalanceMinor ?? null}
              onEditBalance={() => setIsEditBalanceOpen(true)}
              todayTotalMinor={todaySummary?.totalMinor ?? 0}
              todayCount={todaySummary?.count ?? 0}
              todayAverageMinor={todaySummary?.averageMinor ?? 0}
              currentMonthName={new Date().toLocaleString('default', { month: 'short' })}
              monthTotalExpensesMinor={monthlySummary?.totalMinor ?? 0}
              monthTotalIncomeMinor={monthlySummary?.incomeTotalMinor ?? 0}
              overallBudget={overallBudget}
              currencyCode={currency}
            />

            {/* Quick Wallets & Copilot Hero Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Accounts Strip (8 cols) */}
              <div className="md:col-span-8 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs font-bold text-[var(--text-ink)] uppercase tracking-wider">
                      Accounts & Wallets
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setGoalsSubTab('accounts');
                      setActiveTab('goals');
                    }}
                    className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
                  >
                    Manage Accounts →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-ink)] truncate">{acc.name}</span>
                        {acc.isDefault && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold font-mono text-[var(--text-ink)] mt-2 tabular-nums">
                        {formatBDT(acc.balanceMinor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copilot Quick Launch Card (4 cols) */}
              <div className="md:col-span-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[var(--surface)] to-indigo-500/10 border border-[var(--accent)]/30 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-ink)]">
                      <Sparkles className="w-4 h-4 text-[var(--accent)] animate-pulse" />
                      AI Finance Copilot
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Ask questions grounded in your live database, compare months, and draft transactions with AI.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('copilot')}
                  className="mt-3 w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Finance Copilot</span>
                </button>
              </div>
            </div>

            {/* Expense Trend Graph */}
            <ExpenseTrendGraph
              expenses={allHistoricalExpenses.length > 0 ? allHistoricalExpenses : expenses}
              currencyCode={currency}
              defaultPeriod="daily"
            />

            {/* Split layout: Transactions List & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-ink)]">Transactions for {selectedDate}</h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Expense outflows and income inflows for selected period
                    </p>
                  </div>
                </div>

                <ExpenseFiltersBar
                  filters={filters}
                  onFilterChange={setFilters}
                  categories={categories}
                  currentExpenses={expenses}
                />

                <ExpenseList
                  expenses={expenses}
                  isLoading={isLoadingExpenses}
                  onEdit={handleEditExpense}
                  onDelete={handleOpenDelete}
                  onOpenAddModal={() => handleOpenAdd()}
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                />
              </div>

              <div className="lg:col-span-4 space-y-6">
                <InAppCalculator onTransferAmount={handleTransferFromCalc} />
                <CategoryAnalytics
                  categories={categorySummary}
                  isLoading={isLoadingCategorySummary}
                  currencyCode={currency}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS / HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-ink)]">Transaction History</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Browse, search, and export all expenses, income, and tagged records across dates
              </p>
            </div>

            <ExpenseFiltersBar
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
              currentExpenses={expenses}
            />

            <ExpenseList
              expenses={expenses}
              isLoading={isLoadingExpenses}
              onEdit={handleEditExpense}
              onDelete={handleOpenDelete}
              onOpenAddModal={() => handleOpenAdd()}
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </div>
        )}

        {/* TAB 3: BUDGETS */}
        {activeTab === 'budgets' && (
          <div className="max-w-5xl mx-auto">
            <BudgetsView
              budgets={budgets}
              categories={categories}
              currentMonth={currentMonth}
              onSetBudget={setBudgetMutation.mutateAsync}
              onDeleteBudget={deleteBudgetMutation.mutateAsync}
            />
          </div>
        )}

        {/* TAB: SMART MONEY FORECAST (30-DAY CASH-FLOW TRAJECTORY) */}
        {activeTab === 'forecast' && (
          <div className="max-w-5xl mx-auto">
            <SmartMoneyForecast
              currentBalanceMinor={balanceData?.availableBalanceMinor ?? null}
              scheduledEvents={scheduledEvents}
              historicalDailyAverageMinor={todaySummary?.averageMinor || 45000}
            />
          </div>
        )}

        {/* TAB: WHAT-IF SIMULATOR (ZERO-RISK DECISION SANDBOX) */}
        {activeTab === 'simulator' && (
          <div className="max-w-5xl mx-auto">
            <WhatIfSimulator
              currentBalanceMinor={balanceData?.availableBalanceMinor ?? null}
              upcomingBillsMinor={upcomingBillsMinor}
            />
          </div>
        )}

        {/* TAB 4: GOALS, BILLS & ACCOUNTS */}
        {activeTab === 'goals' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Sub-tab Switcher */}
            <div className="flex items-center gap-2 p-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl w-fit">
              <button
                onClick={() => setGoalsSubTab('goals')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  goalsSubTab === 'goals'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                }`}
              >
                Savings Goals
              </button>
              <button
                onClick={() => setGoalsSubTab('recurring')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  goalsSubTab === 'recurring'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                }`}
              >
                Recurring Bills & Payments
              </button>
              <button
                onClick={() => setGoalsSubTab('accounts')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  goalsSubTab === 'accounts'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                }`}
              >
                Accounts & Wallets
              </button>
            </div>

            {goalsSubTab === 'goals' && (
              <SavingsGoalsView
                goals={goals}
                onCreateGoal={createGoalMutation.mutateAsync}
                onContributeGoal={(id, amountMinor) => contributeGoalMutation.mutateAsync({ id, amountMinor })}
                onDeleteGoal={deleteGoalMutation.mutateAsync}
              />
            )}

            {goalsSubTab === 'recurring' && (
              <RecurringPaymentsView
                recurring={recurring}
                categories={categories}
                accounts={accounts}
                onCreateRecurring={createRecurringMutation.mutateAsync}
                onProcessPayment={processRecurringMutation.mutateAsync}
                onDeleteRecurring={deleteRecurringMutation.mutateAsync}
              />
            )}

            {goalsSubTab === 'accounts' && (
              <AccountsView
                accounts={accounts}
                onCreateAccount={createAccountMutation.mutateAsync}
                onUpdateAccount={(id, data) => updateAccountMutation.mutateAsync({ id, data })}
                onDeleteAccount={deleteAccountMutation.mutateAsync}
              />
            )}
          </div>
        )}

        {/* TAB 5: AI COPILOT */}
        {activeTab === 'copilot' && (
          <div className="max-w-4xl mx-auto">
            <CopilotView onConfirmDraftTransaction={handleConfirmDraftTransaction} />
          </div>
        )}

        {/* TAB 6: ANALYTICS & CALENDAR */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-ink)]">Spending Analytics & Interactive Calendar</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Inspect expenditure trajectory across Daily, Monthly, and Yearly intervals with visual heat calendar
              </p>
            </div>

            {/* Interactive Spending Calendar */}
            <SpendingCalendarView
              expenses={allHistoricalExpenses.length > 0 ? allHistoricalExpenses : expenses}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setActiveTab('overview');
              }}
            />

            {/* Daily/Monthly/Yearly Trend Graph */}
            <ExpenseTrendGraph
              expenses={allHistoricalExpenses.length > 0 ? allHistoricalExpenses : expenses}
              currencyCode={currency}
              defaultPeriod="monthly"
            />

            {/* Category Distribution Graph */}
            <CategoryDistributionGraph
              categories={categorySummary}
              isLoading={isLoadingCategorySummary}
              currencyCode={currency}
              onSelectCategory={(catId) => {
                setFilters((prev) => ({ ...prev, categoryId: catId }));
                setActiveTab('history');
              }}
            />
          </div>
        )}

        {/* TAB 7: CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-center mb-6 max-w-md">
              <h2 className="text-xl font-bold text-[var(--text-ink)]">Expense Calculator</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Perform calculations with keyboard support and transfer results directly into an expense entry.
              </p>
            </div>
            <InAppCalculator onTransferAmount={handleTransferFromCalc} />
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <SettingsView
              theme={theme}
              onThemeChange={setTheme}
              currency={currency}
              onCurrencyChange={setCurrency}
              onOpenInstallModal={() => setShowInstallModal(true)}
              isInstalled={isInstalled}
            />
          </div>
        )}

        {/* Global Footer Credit */}
        <footer className="mt-12 pt-6 pb-2 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <span>DailyFlow Personal Finance</span>
            <span>&bull;</span>
            <span>Developed by</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Sami</span>
          </p>
        </footer>
      </main>

      {/* Desktop Magnification Dock */}
      <div className="hidden md:block">
        <MagnificationDock activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => handleOpenAdd()}
      />

      {/* Add / Edit Form Modal */}
      <ExpenseFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        accounts={accounts}
        initialExpense={editingExpense}
        initialAmount={prefilledAmount}
        defaultDate={selectedDate}
        onSave={handleSaveExpense}
      />

      {/* Edit Balance Modal */}
      <EditBalanceModal
        isOpen={isEditBalanceOpen}
        onClose={() => setIsEditBalanceOpen(false)}
        currentBalanceMinor={balanceData?.availableBalanceMinor ?? null}
        currentReferenceDate={balanceData?.referenceDate}
        currencyCode={currency}
        onSave={handleSaveBalance}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(expenseToDelete)}
        expense={expenseToDelete}
        isDeleting={deleteMutation.isPending}
        errorMessage={deleteErrorMessage}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setExpenseToDelete(null);
          setDeleteErrorMessage(null);
        }}
      />

      {/* Weekly Money Check-in Modal */}
      <WeeklyMoneyCheckin
        isOpen={isWeeklyCheckinOpen}
        onClose={() => setIsWeeklyCheckinOpen(false)}
        expenses={allHistoricalExpenses.length > 0 ? allHistoricalExpenses : expenses}
        budgets={budgets}
        goals={goals}
        recurring={recurring}
      />

      {/* PWA Update Toast Notification */}
      <PWAUpdateToast />

      {/* PWA Install Modal (Android & iOS) */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        hasNativePrompt={hasNativePrompt}
        onNativeInstall={promptInstall}
        defaultPlatform={isIOS ? 'ios' : 'android'}
      />

      {/* Toast Feedback Region */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main,#0b1120)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-lg animate-pulse mb-4">
          <Wallet className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-ink,#f8fafc)] mb-1">DailyFlow</h2>
        <p className="text-xs text-[var(--text-muted,#94a3b8)] animate-pulse">
          Loading your secure financial workspace...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthView />;
  }

  return <AuthenticatedDashboard key={user.id} />;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};
