import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { formatBDT } from '../../lib/utils.js';
import { simulateWhatIfScenario, WhatIfScenarioInput } from '../../lib/fintech.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface WhatIfSimulatorProps {
  currentBalanceMinor: number | null;
  upcomingBillsMinor: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  currentBalanceMinor,
  upcomingBillsMinor,
}) => {
  const { lang } = useLanguage();

  const presets: WhatIfScenarioInput[] = [
    {
      type: 'reduce_discretionary',
      titleEn: 'Cut daily tea & snacks by ৳150/day',
      titleBn: 'প্রতিদিন নাশতা ও বাইরের খরচ ৳১৫০ কমানো',
      dailyReductionMinor: 15000,
    },
    {
      type: 'reduce_discretionary',
      titleEn: 'Trim discretionary burn by ৳400/day',
      titleBn: 'অপ্রয়োজনীয় খরচ প্রতিদিন ৳৪০০ কমানো',
      dailyReductionMinor: 40000,
    },
    {
      type: 'add_subscription',
      titleEn: 'Add monthly subscription (৳1,200/mo)',
      titleBn: 'নতুন মাসিক সাবস্ক্রিপশন যোগ (৳১,২০০/মাস)',
      monthlySubscriptionMinor: 120000,
    },
    {
      type: 'delay_income',
      titleEn: 'Salary delayed by 7 days',
      titleBn: 'বেতন বা টিউশনি ফি ৭ দিন দেরিতে আসা',
      incomeDelayDays: 7,
    },
    {
      type: 'boost_savings',
      titleEn: 'Deposit extra ৳2,500 to Emergency Fund',
      titleBn: 'জরুরি তহবিলে অতিরিক্ত ৳২,৫০০ জমা রাখা',
      savingsBoostMinor: 250000,
    },
  ];

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const activeScenario = presets[selectedPresetIndex];

  const outcome = useMemo(() => {
    return simulateWhatIfScenario({
      currentBalanceMinor: currentBalanceMinor ?? 2500000, // fallback ৳25,000 for simulation if unset
      daysUntilIncome: 14,
      dailyDiscretionaryBurnMinor: 50000, // ৳500/day
      upcomingBillsMinor,
      savingsCommitmentsMinor: 200000, // ৳2,000
      emergencyBufferMinor: 300000, // ৳3,000
      scenario: activeScenario,
    });
  }, [currentBalanceMinor, upcomingBillsMinor, activeScenario]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-ink">
            {lang === 'bn' ? 'হোয়াট-ইফ সিমুলেটর (What-if Simulator)' : 'What-if Financial Simulator'}
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            {lang === 'bn' ? 'জিরো-রিস্ক স্যান্ডবক্স' : 'Zero-Risk Sandbox'}
          </span>
        </div>
        <p className="text-xs text-ink-muted mt-1">
          {lang === 'bn'
            ? 'আসল আর্থিক রেকর্ডে কোনো পরিবর্তন না এনে যেকোনো সিদ্ধান্ত বা পরিস্থিতির প্রভাব যাচাই করুন।'
            : 'Explore simulated financial decisions without modifying any of your real transactions or balances.'}
        </p>
      </div>

      {/* Preset Scenario Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
          {lang === 'bn' ? 'পরীক্ষা করার মতো সিদ্ধান্ত বেছে নিন:' : 'Choose a decision scenario to test:'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedPresetIndex(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedPresetIndex === idx
                  ? 'bg-emerald-500/10 border-emerald-500 text-ink shadow-sm'
                  : 'bg-surface border-border hover:bg-surface-elevated text-ink-muted hover:text-ink'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold block leading-snug">
                  {lang === 'bn' ? preset.titleBn : preset.titleEn}
                </span>
                {selectedPresetIndex === idx && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Outcome Comparison Matrix */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'bn' ? 'সিদ্ধান্তের প্রভাব বিশ্লেষণ' : 'Scenario Impact Analysis'}</span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {lang === 'bn' ? 'সিমুলেটেড হিসাব' : 'Simulation active'}
          </span>
        </div>

        {/* Impact Metric Cards Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: End Balance Impact */}
          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border space-y-2">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
              {lang === 'bn' ? 'মাসের শেষে প্রভাব (End Balance)' : 'Month-End Balance Impact'}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black font-mono ${
                  outcome.deltaEndBalanceMinor >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {outcome.deltaEndBalanceMinor >= 0 ? '+' : ''}
                {formatBDT(outcome.deltaEndBalanceMinor)}
              </span>
              <span className="text-xs text-ink-muted">
                {lang === 'bn' ? 'পার্থক্য' : 'delta'}
              </span>
            </div>
            <div className="text-xs text-ink-muted flex items-center justify-between pt-1 border-t border-border/40 font-mono">
              <span>{lang === 'bn' ? 'আসল:' : 'Original:'} {formatBDT(outcome.baselineEndBalanceMinor)}</span>
              <span>{lang === 'bn' ? 'নতুন:' : 'Simulated:'} {formatBDT(outcome.simulatedEndBalanceMinor)}</span>
            </div>
          </div>

          {/* Card 2: Daily Safe-to-Spend Impact */}
          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border space-y-2">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
              {lang === 'bn' ? 'দৈনিক নিরাপদ খরচ (Daily Safe-to-Spend)' : 'Daily Safe Limit Impact'}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black font-mono ${
                  outcome.deltaDailySafeMinor >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {outcome.deltaDailySafeMinor >= 0 ? '+' : ''}
                {formatBDT(outcome.deltaDailySafeMinor)}
              </span>
              <span className="text-xs text-ink-muted">
                / {lang === 'bn' ? 'দিন' : 'day'}
              </span>
            </div>
            <div className="text-xs text-ink-muted flex items-center justify-between pt-1 border-t border-border/40 font-mono">
              <span>{lang === 'bn' ? 'আসল:' : 'Original:'} {formatBDT(outcome.baselineDailySafeMinor)}/d</span>
              <span>{lang === 'bn' ? 'নতুন:' : 'Simulated:'} {formatBDT(outcome.simulatedDailySafeMinor)}/d</span>
            </div>
          </div>
        </div>

        {/* Human Verdict Callout */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-ink leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-medium">
            {lang === 'bn' ? outcome.impactVerdictBn : outcome.impactVerdictEn}
          </p>
        </div>
      </div>
    </div>
  );
};
