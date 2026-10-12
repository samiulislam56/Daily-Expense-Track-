import React from 'react';
import {
  Wallet,
  CalendarClock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { formatBDT } from '../../lib/utils.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface ThreeQuestionsCardProps {
  availableBalanceMinor: number | null;
  upcomingBillsMinor: number;
  upcomingBillsCount: number;
  dailySafeToSpendMinor: number;
  onOpenEditBalance: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const ThreeQuestionsCard: React.FC<ThreeQuestionsCardProps> = ({
  availableBalanceMinor,
  upcomingBillsMinor,
  upcomingBillsCount,
  dailySafeToSpendMinor,
  onOpenEditBalance,
  onNavigateToTab,
}) => {
  const { lang, t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {/* Question 1: How much money do I currently have? */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {lang === 'bn' ? 'প্রশ্ন ১ • বর্তমান টাকা' : 'Question 1 • Liquid Cash'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-ink mb-1">
            {t('q1_title')}
          </h4>
          <p className="text-[11px] text-ink-muted leading-relaxed line-clamp-2">
            {t('q1_desc')}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-baseline justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-black text-ink font-mono tracking-tight">
              {availableBalanceMinor !== null ? formatBDT(availableBalanceMinor) : '---'}
            </div>
            <span className="text-[10px] text-ink-muted">
              {availableBalanceMinor !== null
                ? lang === 'bn' ? 'ভেরিফায়েড ব্যালেন্স' : 'Verified Available'
                : lang === 'bn' ? 'নির্ধারণ করা হয়নি' : 'Not configured yet'}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenEditBalance}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{availableBalanceMinor !== null ? (lang === 'bn' ? 'পরিবর্তন' : 'Edit') : (lang === 'bn' ? 'যুক্ত করুন' : 'Set')}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Question 2: What financial commitments are coming soon? */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between hover:border-amber-500/30 transition-all group">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {lang === 'bn' ? 'প্রশ্ন ২ • আসন্ন দায়' : 'Question 2 • Commitments'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-ink mb-1">
            {t('q2_title')}
          </h4>
          <p className="text-[11px] text-ink-muted leading-relaxed line-clamp-2">
            {t('q2_desc')}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-baseline justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-black text-ink font-mono tracking-tight">
              {formatBDT(upcomingBillsMinor)}
            </div>
            <span className="text-[10px] text-ink-muted">
              {upcomingBillsCount > 0
                ? `${upcomingBillsCount} ${lang === 'bn' ? 'টি বিল নির্ধারিত' : 'bill(s) upcoming'}`
                : lang === 'bn' ? 'জরুরি কোনো বিল নেই' : 'No urgent bills'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('goals')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>{lang === 'bn' ? 'বিল তালিকা' : 'View Bills'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Question 3: How much can I reasonably spend without disrupting my plans? */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between hover:border-teal-500/30 transition-all group">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
              {lang === 'bn' ? 'প্রশ্ন ৩ • নিরাপদ ব্যয়' : 'Question 3 • Safe Limit'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <h4 className="text-xs font-bold text-ink mb-1">
            {t('q3_title')}
          </h4>
          <p className="text-[11px] text-ink-muted leading-relaxed line-clamp-2">
            {t('q3_desc')}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-baseline justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 font-mono tracking-tight">
              {availableBalanceMinor !== null ? formatBDT(dailySafeToSpendMinor) : '---'}
            </div>
            <span className="text-[10px] text-ink-muted">
              {lang === 'bn' ? 'দৈনিক নিরাপদ বাজেট' : 'Per day safe budget'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('forecast')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>{lang === 'bn' ? 'পূর্বাভাস' : 'Forecast'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
