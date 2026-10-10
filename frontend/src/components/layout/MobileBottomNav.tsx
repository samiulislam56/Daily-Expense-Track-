import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  PieChart,
  Calculator,
  Plus,
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 dark:bg-surface/95 backdrop-blur-lg border-t border-border pb-safe shadow-lg"
    >
      <div className="flex items-center justify-around px-2 py-1.5 h-16">
        {/* Tab 1: Overview / Dashboard */}
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'overview'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-ink-muted hover:text-ink'
          }`}
          aria-label="Go to Overview"
          aria-current={activeTab === 'overview' ? 'page' : undefined}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Overview</span>
        </button>

        {/* Tab 2: History */}
        <button
          type="button"
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'history'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-ink-muted hover:text-ink'
          }`}
          aria-label="Go to History"
          aria-current={activeTab === 'history' ? 'page' : undefined}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">History</span>
        </button>

        {/* Center Action Button: Quick Add Expense */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-4">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-teal-700/40 transition-transform focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            aria-label="Add New Expense"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-medium text-teal-700 dark:text-teal-300 mt-1">
            Add
          </span>
        </div>

        {/* Tab 3: Analytics */}
        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'analytics'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-ink-muted hover:text-ink'
          }`}
          aria-label="Go to Analytics"
          aria-current={activeTab === 'analytics' ? 'page' : undefined}
        >
          <PieChart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Analytics</span>
        </button>

        {/* Tab 4: Calculator / Settings */}
        <button
          type="button"
          onClick={() => onTabChange(activeTab === 'calculator' ? 'settings' : 'calculator')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
            activeTab === 'calculator' || activeTab === 'settings'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-ink-muted hover:text-ink'
          }`}
          aria-label="Go to Calculator and Settings"
          aria-current={activeTab === 'calculator' || activeTab === 'settings' ? 'page' : undefined}
        >
          {activeTab === 'settings' ? (
            <Settings className="w-5 h-5 mb-0.5" />
          ) : (
            <Calculator className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px] font-medium tracking-tight">
            {activeTab === 'settings' ? 'Settings' : 'Calc'}
          </span>
        </button>
      </div>
    </nav>
  );
};
