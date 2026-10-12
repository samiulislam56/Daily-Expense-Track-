import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Calendar,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Info,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatBDT } from '../../lib/utils.js';
import { calculateSafeToSpend } from '../../lib/fintech.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface SafeToSpendWidgetProps {
  currentBalanceMinor: number | null;
  upcomingBillsMinor: number;
  savingsCommitmentMinor?: number;
  onOpenEditBalance: () => void;
}

export const SafeToSpendWidget: React.FC<SafeToSpendWidgetProps> = ({
  currentBalanceMinor,
  upcomingBillsMinor,
  savingsCommitmentMinor = 200000, // Default ৳2,000 savings target
  onOpenEditBalance,
}) => {
  const { lang, t } = useLanguage();
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // User configurable assumptions
  const [daysUntilIncome, setDaysUntilIncome] = useState<number>(14);
  const [emergencyBufferMinor, setEmergencyBufferMinor] = useState<number>(300000); // ৳3,000 cushion
  const [savingsTargetMinor, setSavingsTargetMinor] = useState<number>(savingsCommitmentMinor);
  const [manualBillsMinor, setManualBillsMinor] = useState<number>(upcomingBillsMinor);

  // Sync if props update
  React.useEffect(() => {
    if (upcomingBillsMinor > 0) {
      setManualBillsMinor(upcomingBillsMinor);
    }
  }, [upcomingBillsMinor]);

  const verifiedBalance = currentBalanceMinor ?? 0;
  const isBalanceConfigured = currentBalanceMinor !== null;

  const result = useMemo(() => {
    return calculateSafeToSpend({
      currentBalanceMinor: verifiedBalance,
      upcomingBillsMinor: manualBillsMinor,
      savingsCommitmentsMinor: savingsTargetMinor,
      emergencyBufferMinor: emergencyBufferMinor,
      daysUntilIncome: daysUntilIncome,
    });
  }, [verifiedBalance, manualBillsMinor, savingsTargetMinor, emergencyBufferMinor, daysUntilIncome]);

  if (!isBalanceConfigured) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-elevated border border-border shadow-card relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ব্যালেন্স নির্ধারিত নেই' : 'Balance Not Set'}</span>
            </div>
            <h3 className="text-base font-bold text-ink pt-1">
              {lang === 'bn' ? 'নিরাপদ ব্যয়ের হিসাব (Safe-to-Spend)' : 'Safe-to-Spend Calculator'}
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed max-w-lg">
              {lang === 'bn'
                ? 'আপনার বর্তমান মোট ব্যালেন্স ইনপুট করলে সিস্টেম স্বয়ংক্রিয়ভাবে হিসাব করে জানিয়ে দেবে আগামী আয়ের আগে প্রতিদিন কত টাকা চিন্তা ছাড়া খরচ করতে পারবেন।'
                : 'Configure your current verified balance to see exactly how much you can comfortably spend each day before your next income.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenEditBalance}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            {lang === 'bn' ? 'ব্যালেন্স দিন' : 'Set Balance'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-elevated border border-border shadow-card overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-5 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink">
                  {lang === 'bn' ? 'নিরাপদ ব্যয় সীমা (Safe-to-Spend)' : 'Daily Safe-to-Spend'}
                </h3>
                <span
                  className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${result.statusColor}18`,
                    color: result.statusColor,
                  }}
                >
                  {t(result.status)}
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">
                {lang === 'bn' ? 'পরবর্তী আয়ের আগে চিন্তা ছাড়া ব্যয়ের দৈনিক সীমা' : 'Discretionary spending limit per day until next income'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'হিসাব পরিবর্তন' : 'Adjust Rules'}</span>
            {isEditingSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Primary Numbers Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/40">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              {lang === 'bn' ? 'আজকের দৈনিক সীমা' : 'Safe to Spend Per Day'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-ink font-mono tracking-tight">
                {formatBDT(result.dailySafeToSpendMinor)}
              </span>
              <span className="text-xs text-ink-muted font-medium">
                / {lang === 'bn' ? 'দিন' : 'day'}
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">
              {daysUntilIncome} {t('daysUntilIncome')}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              {lang === 'bn' ? 'মোট নিরাপদ ফান্ড' : 'Total Safe Discretionary Pool'}
            </span>
            <div className="text-xl sm:text-2xl font-bold text-ink font-mono tracking-tight">
              {formatBDT(result.safeFundsMinor > 0 ? result.safeFundsMinor : 0)}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {lang === 'bn' ? 'বিল ও জরুরি কুশন বাদ দিয়ে' : 'After subtracting bills & reserves'}
            </p>
          </div>
        </div>

        {/* Human Explanation Callout */}
        <div className="mt-3.5 p-3 rounded-xl bg-surface-elevated/70 border border-border/60 flex items-start gap-2.5 text-xs text-ink leading-relaxed">
          <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <p>{lang === 'bn' ? result.explanationBn : result.explanationEn}</p>
        </div>
      </div>

      {/* Inline Assumption Breakdown & Adjustment Panel */}
      {isEditingSettings && (
        <div className="p-5 bg-surface-subtle/40 border-t border-border space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
              {lang === 'bn' ? 'হিসাবের শর্ত ও পরামিতি' : 'Calculation Assumptions'}
            </h4>
            <span className="text-[11px] text-ink-muted">
              {lang === 'bn' ? 'স্বচ্ছ ও সরাসরি অ্যালগরিদম' : 'Transparent deterministic logic'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* 1. Days until income */}
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-muted block">
                {lang === 'bn' ? 'পরবর্তী আয়ের বাকি দিন' : 'Days Until Next Income'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="45"
                  value={daysUntilIncome}
                  onChange={(e) => setDaysUntilIncome(Number(e.target.value))}
                  className="flex-1 accent-emerald-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-ink w-8 text-right">
                  {daysUntilIncome}d
                </span>
              </div>
            </div>

            {/* 2. Upcoming Essential Bills */}
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-muted block">
                {lang === 'bn' ? 'আসন্ন জরুরি বিলসমূহ (৳)' : 'Upcoming Essential Bills (৳)'}
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={(manualBillsMinor / 100).toFixed(0)}
                onChange={(e) => setManualBillsMinor(Math.max(0, Number(e.target.value) * 100))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border font-mono text-xs text-ink focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 3. Emergency Buffer */}
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-muted block">
                {lang === 'bn' ? 'জরুরি রিজার্ভ / কুশন (৳)' : 'Emergency Cushion Buffer (৳)'}
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={(emergencyBufferMinor / 100).toFixed(0)}
                onChange={(e) => setEmergencyBufferMinor(Math.max(0, Number(e.target.value) * 100))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border font-mono text-xs text-ink focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 4. Planned Savings Target */}
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-muted block">
                {lang === 'bn' ? 'মাসিক সঞ্চয়ের কিস্তি (৳)' : 'Planned Savings Target (৳)'}
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={(savingsTargetMinor / 100).toFixed(0)}
                onChange={(e) => setSavingsTargetMinor(Math.max(0, Number(e.target.value) * 100))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border font-mono text-xs text-ink focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-ink-muted">
              {lang === 'bn'
                ? 'সূত্র: নিরাপদ ফান্ড = বর্তমান ব্যালেন্স - (বিল + সঞ্চয় + কুশন)'
                : 'Formula: Safe Funds = Verified Balance - (Bills + Savings + Cushion)'}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingSettings(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সম্পন্ন' : 'Done'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
