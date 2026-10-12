import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { formatBDT } from '../../lib/utils.js';
import { calculateCashFlowForecast, ScheduledCashFlowEvent } from '../../lib/fintech.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface SmartMoneyForecastProps {
  currentBalanceMinor: number | null;
  scheduledEvents: ScheduledCashFlowEvent[];
  historicalDailyAverageMinor?: number;
  emergencyBufferMinor?: number;
}

export const SmartMoneyForecast: React.FC<SmartMoneyForecastProps> = ({
  currentBalanceMinor,
  scheduledEvents,
  historicalDailyAverageMinor = 45000, // ৳450/day baseline
  emergencyBufferMinor = 300000, // ৳3,000 buffer
}) => {
  const { lang, t } = useLanguage();
  const [periodDays, setPeriodDays] = useState<7 | 30>(30);
  const [discretionaryDaily, setDiscretionaryDaily] = useState<number>(historicalDailyAverageMinor);

  const startBalance = currentBalanceMinor ?? 0;
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const forecast = useMemo(() => {
    return calculateCashFlowForecast({
      startBalanceMinor: startBalance,
      startDate: todayStr,
      daysCount: periodDays,
      dailyDiscretionaryBurnMinor: discretionaryDaily,
      scheduledEvents,
      emergencyBufferMinor,
    });
  }, [startBalance, todayStr, periodDays, discretionaryDaily, scheduledEvents, emergencyBufferMinor]);

  const hasBalance = currentBalanceMinor !== null;

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-ink">
              {lang === 'bn' ? 'ক্যাশ-ফ্লো পূর্বাভাস (Smart Money Forecast)' : 'Smart Cash-Flow Forecast'}
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              {lang === 'bn' ? 'নির্ধারিত মডেল' : 'Deterministic Model'}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            {lang === 'bn'
              ? 'ভেরিফায়েড ব্যালেন্স ও নির্ধারিত খরচের ভিত্তিতে আগামী ৭ থেকে ৩০ দিনের সম্ভাব্য গতিপথ'
              : 'Projected forward trajectory based on verified liquid balance and scheduled commitments'}
          </p>
        </div>

        {/* Days Period Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-surface-subtle border border-border">
          <button
            type="button"
            onClick={() => setPeriodDays(7)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              periodDays === 7
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {lang === 'bn' ? '৭ দিন' : '7 Days'}
          </button>
          <button
            type="button"
            onClick={() => setPeriodDays(30)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              periodDays === 30
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {lang === 'bn' ? '৩০ দিন' : '30 Days'}
          </button>
        </div>
      </div>

      {!hasBalance && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {lang === 'bn'
              ? 'পূর্বাভাস নিখুঁত করার জন্য প্রথমে ড্যাশবোর্ডে আপনার বর্তমান ব্যালেন্স নির্ধারণ করুন।'
              : 'Please set your current verified balance in Overview to generate realistic projections.'}
          </span>
        </div>
      )}

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Start Balance */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-card">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
            {lang === 'bn' ? 'শুরুর ব্যালেন্স' : 'Starting Balance'}
          </span>
          <div className="text-xl font-bold text-ink font-mono">
            {formatBDT(forecast.startBalanceMinor)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            {lang === 'bn' ? 'আজকের ভেরিফায়েড' : 'Today Verified'}
          </span>
        </div>

        {/* Projected End Balance */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-card">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
            {lang === 'bn' ? `${periodDays} দিন পরের সম্ভাব্য ব্যালেন্স` : `Projected Day ${periodDays} Balance`}
          </span>
          <div
            className={`text-xl font-bold font-mono ${
              forecast.endBalanceMinor >= emergencyBufferMinor
                ? 'text-emerald-600 dark:text-emerald-400'
                : forecast.endBalanceMinor > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatBDT(forecast.endBalanceMinor)}
          </div>
          <span className="text-[10px] text-ink-muted">
            {forecast.endBalanceMinor >= emergencyBufferMinor
              ? lang === 'bn' ? 'কুশন সুরক্ষিত' : 'Cushion Intact'
              : lang === 'bn' ? 'কুশনের নিচে নামার আশঙ্কা' : 'Below Buffer Hazard'}
          </span>
        </div>

        {/* Total Scheduled Inflow */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-card">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1 flex items-center justify-between">
            <span>{lang === 'bn' ? 'সম্ভাব্য মোট আয়' : 'Projected Income'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          </span>
          <div className="text-xl font-bold text-ink font-mono">
            {formatBDT(forecast.totalIncomeMinor)}
          </div>
          <span className="text-[10px] text-ink-muted">
            {lang === 'bn' ? 'নির্ধারিত বেতন ও আয়' : 'Scheduled Inflows'}
          </span>
        </div>

        {/* Total Projected Outflow */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-card">
          <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1 flex items-center justify-between">
            <span>{lang === 'bn' ? 'সম্ভাব্য মোট ব্যয়' : 'Projected Expense'}</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          </span>
          <div className="text-xl font-bold text-ink font-mono">
            {formatBDT(forecast.totalExpenseMinor)}
          </div>
          <span className="text-[10px] text-ink-muted">
            {lang === 'bn' ? 'বিল + দৈনিক খরচ' : 'Bills + Discretionary'}
          </span>
        </div>
      </div>

      {/* Low-Balance Risk Warning Banner */}
      {forecast.lowBalanceHazardDate && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm">
              {lang === 'bn' ? 'সতর্কতা: সম্ভাব্য ক্যাশ-ফ্লো সংকট' : 'Cash-Flow Hazard Warning'}
            </h4>
            <p className="leading-relaxed">
              {lang === 'bn'
                ? `বর্তমান ব্যয়ের গতি বজায় থাকলে ${forecast.lowBalanceHazardDate} তারিখে আপনার ব্যালেন্স জরুরি রিজার্ভ (৳${(emergencyBufferMinor / 100).toFixed(0)}) এর নিচে নেমে যেতে পারে। দৈনিক খরচ সীমিত রাখার পরামর্শ দেওয়া হচ্ছে।`
                : `At this spending rate, your balance is projected to dip below your emergency cushion (৳${(emergencyBufferMinor / 100).toFixed(0)}) on ${forecast.lowBalanceHazardDate}. Consider trimming discretionary burn.`}
            </p>
          </div>
        </div>
      )}

      {/* Visual Day-by-Day Forecast Timeline Table */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'bn' ? 'দৈনিক সম্ভাব্য ব্যালেন্স তালিকা' : 'Daily Projected Trajectory'}</span>
          </h3>
          <span className="text-[11px] text-ink-muted">
            {lang === 'bn' ? 'প্রথম ১০ দিনের নমুনা' : 'Key Milestones'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'দিন' : 'Day'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'আয়' : 'Income'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'নির্ধারিত বিল' : 'Bills'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'দৈনিক খরচ' : 'Burn'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'সম্ভাব্য ব্যালেন্স' : 'Projected Balance'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {forecast.points.slice(0, 14).map((pt) => (
                <tr
                  key={pt.date}
                  className={`hover:bg-surface-elevated/40 transition-colors ${
                    pt.isBelowBuffer ? 'bg-rose-500/5' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-medium text-ink">{pt.date}</td>
                  <td className="py-2.5 px-3 text-ink-muted">Day {pt.dayIndex}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {pt.scheduledIncomeMinor > 0 ? `+${formatBDT(pt.scheduledIncomeMinor)}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-500">
                    {pt.scheduledExpenseMinor > 0 ? `-${formatBDT(pt.scheduledExpenseMinor)}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-ink-muted">
                    -{formatBDT(pt.discretionaryExpenseMinor)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-bold ${
                      pt.projectedBalanceMinor >= emergencyBufferMinor
                        ? 'text-ink'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatBDT(pt.projectedBalanceMinor)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {pt.isBelowBuffer ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {lang === 'bn' ? 'ঝুঁকিপূর্ণ' : 'Tight'}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {lang === 'bn' ? 'সুরক্ষিত' : 'Safe'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Disclaimer footer */}
        <div className="pt-3 border-t border-border flex items-start gap-2 text-[11px] text-ink-muted">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
          <p>
            {lang === 'bn'
              ? 'ঘোষণা: এই পূর্বাভাস সম্পূর্ণ গাণিতিক হিসাব। এটি কোনো ব্যাংক স্টেটমেন্ট নয়। অনাকাঙ্ক্ষিত খরচ বা আয়ের পরিবর্তন ঘটলে প্রকৃত ব্যালেন্সে পার্থক্য হতে পারে।'
              : 'Transparency Notice: Projections are mathematical estimates based on current rates and scheduled commitments, never confirmed bank balances.'}
          </p>
        </div>
      </div>
    </div>
  );
};
