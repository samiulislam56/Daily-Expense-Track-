import React from 'react';
import {
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  Zap,
  Activity,
  Film,
  MoreHorizontal,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'graduation-cap': GraduationCap,
  'shopping-bag': ShoppingBag,
  zap: Zap,
  activity: Activity,
  film: Film,
  'more-horizontal': MoreHorizontal,
};

const colorStyleMap: Record<string, { bg: string; text: string; border: string }> = {
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
  violet: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/30',
  },
  orange: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30',
  },
  slate: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/30',
  },
};

interface CategoryIconProps {
  iconKey?: string;
  colorKey?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconKey = '',
  colorKey = 'slate',
  className = '',
  size = 18,
}) => {
  const IconComponent = iconMap[iconKey] || DollarSign;
  const style = colorStyleMap[colorKey] || colorStyleMap.slate;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl p-2.5 ${style.bg} ${style.text} ${className}`}
      aria-hidden="true"
    >
      <IconComponent size={size} />
    </div>
  );
};
