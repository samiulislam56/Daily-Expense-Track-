import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Target,
  Sparkles,
  Plus,
  PiggyBank,
  PieChart,
  Settings,
  TrendingUp,
  Sliders,
  Calculator,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { ActiveTab } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';

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
  const { lang, t } = useLanguage();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType; desc: string }> = [
    {
      id: 'forecast',
      label: t('forecast'),
      icon: TrendingUp,
      desc: lang === 'bn' ? '৩০ দিনের নগদ টাকার গতিপথ' : '30-day cash trajectory',
    },
    {
      id: 'simulator',
      label: t('simulator'),
      icon: Sliders,
      desc: lang === 'bn' ? 'সিদ্ধান্তের প্রভাব বিশ্লেষণ' : 'Scenario sandbox',
    },
    {
      id: 'goals',
      label: t('goals'),
      icon: PiggyBank,
      desc: lang === 'bn' ? 'সঞ্চয় লক্ষ্য ও পুনরাবৃত্ত বিল' : 'Savings & recurring bills',
    },
    {
      id: 'history',
      label: t('history'),
      icon: CalendarDays,
      desc: lang === 'bn' ? 'সকল লেনদেনের তালিকা' : 'All transaction records',
    },
    {
      id: 'analytics',
      label: t('analytics'),
      icon: PieChart,
      desc: lang === 'bn' ? 'ক্যালেন্ডার ও খরচের গ্রাফ' : 'Charts & heatmap calendar',
    },
    {
      id: 'calculator',
      label: t('calculator'),
      icon: Calculator,
      desc: lang === 'bn' ? 'হিসাব করে খরচ যুক্ত করুন' : 'Calc & direct entry',
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: Settings,
      desc: lang === 'bn' ? 'থিম ও প্রিফারেন্স' : 'Preferences & PWA',
    },
  ];

  const handleSelectMoreItem = (id: ActiveTab) => {
    onTabChange(id);
    setIsMoreOpen(false);
  };

  const isMoreActive = ['forecast', 'simulator', 'goals', 'history', 'analytics', 'calculator', 'settings'].includes(activeTab);

  return (
    <>
      {/* More Options Modal Sheet */}
      {isMoreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end transition-opacity"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="bg-[var(--surface)] border-t border-[var(--border)] rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-ink)]">
                  {lang === 'bn' ? 'আরও ফিচারসমূহ' : 'More Features'}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {lang === 'bn' ? 'স্মার্ট মানি পূর্বাভাস ও সিমুলেটর' : 'Forecast, simulator & tools'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMoreItem(item.id)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3.5 transition-all text-left ${
                      active
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 font-semibold'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-ink)] hover:bg-[var(--surface-subtle)] border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{item.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">{item.desc}</div>
                    </div>
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
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
            <span className="text-[10px] tracking-tight">{t('overview')}</span>
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
            <span className="text-[10px] tracking-tight">{t('budgets')}</span>
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
              {t('quickAdd')}
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
            <span className="text-[10px] tracking-tight">{t('copilot')}</span>
          </button>

          {/* Tab 5: More (Forecast, Simulator, Goals, etc.) */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors relative ${
              isMoreActive
                ? 'text-[var(--accent)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
            }`}
            aria-label="Open More Features Menu"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">
              {isMoreActive
                ? moreItems.find((m) => m.id === activeTab)?.label || 'More'
                : lang === 'bn' ? 'আরও' : 'More'}
            </span>
            {isMoreActive && (
              <span className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
