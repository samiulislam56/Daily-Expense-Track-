import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Target,
  Sparkles,
  Plus,
  PiggyBank,
  PieChart,
  Settings,
} from 'lucide-react';
import { ActiveTab } from '../../types/index.js';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-lg border-t border-[var(--border)] pb-safe shadow-lg"
    >
      <div className="flex items-center justify-around px-1 py-1 h-16">
        {/* Tab 1: Overview */}
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'overview'
              ? 'text-[var(--accent)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
          }`}
          aria-label="Go to Overview"
          aria-current={activeTab === 'overview' ? 'page' : undefined}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Overview</span>
        </button>

        {/* Tab 2: Budgets */}
        <button
          type="button"
          onClick={() => onTabChange('budgets')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'budgets'
              ? 'text-[var(--accent)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
          }`}
          aria-label="Go to Budgets"
          aria-current={activeTab === 'budgets' ? 'page' : undefined}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Budgets</span>
        </button>

        {/* Center Prominent Action: Quick Add Expense/Income */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-5">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
            aria-label="Quick Add Expense or Income"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-semibold text-[var(--accent)] mt-1">
            Quick Add
          </span>
        </div>

        {/* Tab 4: AI Copilot */}
        <button
          type="button"
          onClick={() => onTabChange('copilot')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'copilot'
              ? 'text-[var(--accent)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
          }`}
          aria-label="Go to AI Copilot"
          aria-current={activeTab === 'copilot' ? 'page' : undefined}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Copilot</span>
        </button>

        {/* Tab 5: Goals / Transactions More */}
        <button
          type="button"
          onClick={() => onTabChange(activeTab === 'goals' ? 'history' : 'goals')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'goals' || activeTab === 'history' || activeTab === 'analytics'
              ? 'text-[var(--accent)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
          }`}
          aria-label="Goals and Transactions"
        >
          <PiggyBank className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{activeTab === 'goals' ? 'Goals' : 'More'}</span>
        </button>
      </div>
    </nav>
  );
};
