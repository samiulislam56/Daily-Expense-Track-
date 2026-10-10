import React, { useState, useMemo } from 'react';
import { Header } from '../components/layout/Header.js';
import { MagnificationDock } from '../components/layout/MagnificationDock.js';
import { MobileBottomNav } from '../components/layout/MobileBottomNav.js';
import { ScrollJourneyLine } from '../components/layout/ScrollJourneyLine.js';
import { ToastContainer, ToastMessage } from '../components/common/Toast.js';
import { PWAUpdateToast } from '../components/common/PWAUpdateToast.js';
import { IOSInstallModal } from '../components/common/IOSInstallModal.js';
import { DashboardMetrics } from '../features/analytics/DashboardMetrics.js';
import { CategoryAnalytics } from '../features/analytics/CategoryAnalytics.js';
import { ExpenseTrendGraph } from '../features/analytics/ExpenseTrendGraph.js';
import { CategoryDistributionGraph } from '../features/analytics/CategoryDistributionGraph.js';
import { ExpenseList } from '../features/expenses/ExpenseList.js';
import { ExpenseFiltersBar } from '../features/expenses/ExpenseFilters.js';
import { ExpenseFormModal } from '../features/expenses/ExpenseFormModal.js';
import { DeleteConfirmModal } from '../features/expenses/DeleteConfirmModal.js';
import { EditBalanceModal } from '../features/balance/EditBalanceModal.js';
import { InAppCalculator } from '../features/calculator/InAppCalculator.js';
import { SettingsView } from '../features/settings/SettingsView.js';

import { useTheme } from '../hooks/useTheme.js';
import { usePWAInstall } from '../hooks/usePWAInstall.js';
import { useSyncStatus } from '../hooks/useSyncStatus.js';
import {
  useCategories,
  useExpenses,
  useAllExpenses,
  useDailySummary,
  useMonthlySummary,
  useCategorySummary,
  useBalance,
  useExpenseMutations,
} from '../hooks/useExpenseQueries.js';
import { ActiveTab, Expense, ExpenseFilters } from '../types/index.js';
import { getTodayDateString, getCurrentMonthString } from '../lib/utils.js';

export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [currency, setCurrency] = useState<string>('BDT');

  // PWA and offline status
  const { canInstall, isInstalled, showIOSModal, setShowIOSModal, promptInstall } = usePWAInstall();
  const syncStatus = useSyncStatus();

  // Filters state
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    pageSize: 20,
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState<boolean>(false);
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
  const { data: balanceData } = useBalance();

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

  // All historical expenses for trend graph
  const { data: allHistoricalExpenses = [] } = useAllExpenses();

  // Summaries
  const todayDate = useMemo(() => getTodayDateString(), []);
  const currentMonth = useMemo(() => selectedDate.substring(0, 7) || getCurrentMonthString(), [selectedDate]);

  // Today's summary for Card 3 (Today's Average Expense)
  const { data: todaySummary } = useDailySummary(todayDate);
  // Selected day's summary for Card 4 (Total Expense / Spending)
  const { data: selectedDaySummary } = useDailySummary(selectedDate);
  const { data: monthlySummary } = useMonthlySummary(currentMonth);
  const { data: categorySummary = [], isLoading: isLoadingCategorySummary } = useCategorySummary();

  // Mutations
  const { createMutation, updateMutation, deleteMutation, updateBalanceMutation } = useExpenseMutations();

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
  }) => {
    if (editingExpense) {
      await updateMutation.mutateAsync({
        id: editingExpense.id,
        payload,
      });
      addToast(
        'success',
        syncStatus.isOnline
          ? 'Expense updated successfully.'
          : 'Expense updated locally. Queued for server sync.',
        'Updated'
      );
    } else {
      await createMutation.mutateAsync({
        ...payload,
        currencyCode: payload.currencyCode || currency,
      });
      addToast(
        'success',
        syncStatus.isOnline
          ? 'Expense created and saved.'
          : 'Expense saved offline. Will sync with database when connected.',
        'Expense Saved'
      );
    }
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
      addToast('success', 'Expense was successfully removed.', 'Deleted');
      setExpenseToDelete(null);
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete expense. Please try again.';
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
    addToast('info', `Transferred ${amountDecimal} ${currency} to expense form.`, 'Calculator');
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col selection:bg-teal-500/20 pb-safe">
      {/* Decorative SVG scroll line tracking progress */}
      <ScrollJourneyLine />

      {/* Main App Header with PWA Install & Connectivity indicators */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenAddModal={() => handleOpenAdd()}
        theme={theme}
        onThemeChange={setTheme}
        canInstall={canInstall}
        isInstalled={isInstalled}
        onInstallClick={promptInstall}
        syncStatus={syncStatus}
      />

      {/* Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-32">
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Redesigned Four Dashboard Summary Cards */}
            <DashboardMetrics
              availableBalanceMinor={balanceData?.availableBalanceMinor ?? 0}
              isBalanceConfigured={balanceData?.isConfigured ?? false}
              balanceReferenceDate={balanceData?.referenceDate}
              onEditBalance={() => setIsEditBalanceOpen(true)}
              remainingBalanceMinor={balanceData?.remainingBalanceMinor ?? 0}
              totalExpensesAgainstBalanceMinor={balanceData?.totalExpensesMinor ?? 0}
              todayAverageMinor={todaySummary?.averageMinor ?? 0}
              todayCount={todaySummary?.count ?? 0}
              selectedDate={selectedDate}
              selectedDayTotalMinor={selectedDaySummary?.totalMinor ?? 0}
              selectedDayCount={selectedDaySummary?.count ?? 0}
              currencyCode={currency}
            />

            {/* Daily/Monthly/Yearly Expense Trend Graph */}
            <ExpenseTrendGraph
              expenses={allHistoricalExpenses.length > 0 ? allHistoricalExpenses : expenses}
              currencyCode={currency}
              defaultPeriod="daily"
            />

            {/* Split layout on wider screens: Main List + Calculator / Breakdown sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Expense List & Filters (8 cols) */}
              <div className="lg:col-span-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-ink">Daily Expenses</h2>
                    <p className="text-xs text-ink-muted">
                      Showing records for {selectedDate}
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

              {/* Right Column: In-App Calculator & Category Breakdown preview (4 cols) */}
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

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-ink">Expense History</h2>
              <p className="text-xs text-ink-muted">
                Browse, search, and export all recorded expenses across dates
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

        {/* TAB: ANALYTICS (Full Deep-Dive Visualizations) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-ink">Spending Analytics & Visual Graphs</h2>
              <p className="text-xs text-ink-muted">
                Analyze spending trajectory with Daily, Monthly, and Yearly graphs & category breakdown
              </p>
            </div>

            {/* Dashboard summary metrics */}
            <DashboardMetrics
              availableBalanceMinor={balanceData?.availableBalanceMinor ?? 0}
              isBalanceConfigured={balanceData?.isConfigured ?? false}
              balanceReferenceDate={balanceData?.referenceDate}
              onEditBalance={() => setIsEditBalanceOpen(true)}
              remainingBalanceMinor={balanceData?.remainingBalanceMinor ?? 0}
              totalExpensesAgainstBalanceMinor={balanceData?.totalExpensesMinor ?? 0}
              todayAverageMinor={todaySummary?.averageMinor ?? 0}
              todayCount={todaySummary?.count ?? 0}
              selectedDate={selectedDate}
              selectedDayTotalMinor={selectedDaySummary?.totalMinor ?? 0}
              selectedDayCount={selectedDaySummary?.count ?? 0}
              currencyCode={currency}
            />

            {/* 1. Daily, Monthly, and Yearly Trend Graph */}
            <ExpenseTrendGraph
              expenses={allHistoricalExpenses.length > 0 ? allHistoricalExpenses : expenses}
              currencyCode={currency}
              defaultPeriod="monthly"
            />

            {/* 2. Category Distribution Graph (Donut Chart & Detailed Slices) */}
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

        {/* TAB: CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-center mb-6 max-w-md">
              <h2 className="text-xl font-bold text-ink">Expense Calculator</h2>
              <p className="text-xs text-ink-muted mt-1">
                Perform calculations with keyboard support and transfer results directly into an expense entry.
              </p>
            </div>
            <InAppCalculator onTransferAmount={handleTransferFromCalc} />
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <SettingsView
              theme={theme}
              onThemeChange={setTheme}
              currency={currency}
              onCurrencyChange={setCurrency}
            />
          </div>
        )}
      </main>

      {/* Desktop Magnification Navigation Dock (hidden on mobile) */}
      <div className="hidden md:block">
        <MagnificationDock activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Compact Bottom Navigation Bar (md:hidden) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => handleOpenAdd()}
      />

      {/* Add / Edit Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        initialExpense={editingExpense}
        initialAmount={prefilledAmount}
        defaultDate={selectedDate}
        onSave={handleSaveExpense}
      />

      {/* Edit Total Available Balance Modal */}
      <EditBalanceModal
        isOpen={isEditBalanceOpen}
        onClose={() => setIsEditBalanceOpen(false)}
        currentBalanceMinor={balanceData?.availableBalanceMinor ?? 0}
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

      {/* PWA Background Update Toast Notification */}
      <PWAUpdateToast />

      {/* iOS Safari Home Screen Instructions Modal */}
      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />

      {/* Toast Feedback Region */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
