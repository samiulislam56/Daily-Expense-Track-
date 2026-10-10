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
  Calculator,
  Settings,
} from 'lucide-react';
import { ActiveTab } from '../../types/index.js';

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

  // Distance from cursor to item center
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Calculate width magnification using smooth bell curve
  const widthSync = useTransform(distance, [-120, 0, 120], [44, 62, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const iconScaleSync = useTransform(distance, [-120, 0, 120], [1, 1.35, 1]);
  const iconScale = useSpring(iconScaleSync, { mass: 0.1, stiffness: 180, damping: 14 });

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width }}
      onClick={() => onSelect(id)}
      className={`group relative flex items-center justify-center rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
        isActive
          ? 'bg-teal-600 text-white shadow-md shadow-teal-700/30 dark:bg-teal-500 dark:shadow-teal-500/20'
          : 'bg-surface text-ink-muted hover:bg-surface-elevated hover:text-ink dark:bg-surface-elevated dark:hover:bg-surface-subtle'
      }`}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? 'page' : undefined}
      title={label}
    >
      <motion.div style={{ scale: iconScale }} className="flex items-center justify-center">
        <Icon className="w-5 h-5 transition-transform" />
      </motion.div>

      {/* Floating tooltip above dock item */}
      <span
        className="pointer-events-none absolute -top-9 rounded-md bg-forest-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-surface-subtle dark:text-ink whitespace-nowrap"
        role="tooltip"
      >
        {label}
      </span>

      {/* Active pill dot indicator */}
      {isActive && (
        <span
          className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 ring-2 ring-surface"
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

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      aria-label="Primary navigation dock"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[94vw]"
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-3xl bg-surface/90 backdrop-blur-md border border-border shadow-dock dark:shadow-dock-dark"
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
    </nav>
  );
};
