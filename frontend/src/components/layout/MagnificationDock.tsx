import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  PieChart,
  Target,
  PiggyBank,
  Sparkles,
  Calculator,
  Settings,
  TrendingUp,
  Sliders,
} from 'lucide-react';
import { ActiveTab } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface DockItemProps {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onSelect: (id: ActiveTab) => void;
  mouseX: MotionValue<number>;
}

const DockItem: React.FC<DockItemProps> = ({
  id,
  label,
  icon: Icon,
  isActive,
  onSelect,
  mouseX,
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [42, 58, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const iconScaleSync = useTransform(distance, [-120, 0, 120], [1, 1.25, 1]);
  const iconScale = useSpring(iconScaleSync, { mass: 0.1, stiffness: 180, damping: 14 });

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width }}
      onClick={() => onSelect(id)}
      className={`group relative flex items-center justify-center rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
        isActive
          ? 'bg-[var(--accent)] text-white shadow-md shadow-emerald-700/30'
          : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-ink)]'
      }`}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? 'page' : undefined}
      title={label}
    >
      <motion.div style={{ scale: iconScale }} className="flex items-center justify-center">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
      </motion.div>

      {/* Tooltip */}
      <span
        className="pointer-events-none absolute -top-9 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-ink)] whitespace-nowrap"
        role="tooltip"
      >
        {label}
      </span>

      {isActive && (
        <span
          className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--surface)]"
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
};

interface MagnificationDockProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const MagnificationDock: React.FC<MagnificationDockProps> = ({
  activeTab,
  onTabChange,
}) => {
  const mouseX = useMotionValue(Infinity);
  const { t } = useLanguage();

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType }> = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard },
    { id: 'history', label: t('history'), icon: CalendarDays },
    { id: 'budgets', label: t('budgets'), icon: Target },
    { id: 'forecast', label: t('forecast'), icon: TrendingUp },
    { id: 'simulator', label: t('simulator'), icon: Sliders },
    { id: 'goals', label: t('goals'), icon: PiggyBank },
    { id: 'copilot', label: t('copilot'), icon: Sparkles },
    { id: 'analytics', label: t('analytics'), icon: PieChart },
    { id: 'calculator', label: t('calculator'), icon: Calculator },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside
      className="hidden md:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-40 items-center justify-center"
      aria-label="Application Dock Navigation"
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-2.5 rounded-3xl bg-[var(--surface)]/90 backdrop-blur-xl border border-[var(--border)] px-4 py-2.5 shadow-xl shadow-black/5"
      >
        {navItems.map((item) => (
          <DockItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeTab === item.id}
            onSelect={onTabChange}
            mouseX={mouseX}
          />
        ))}
      </motion.div>
    </aside>
  );
};
