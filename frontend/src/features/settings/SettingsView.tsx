import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Sun,
  Moon,
  Coins,
  Database,
  Activity,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Download,
} from 'lucide-react';
import { ThemeMode } from '../../types/index.js';

interface SettingsViewProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onThemeChange,
  currency,
  onCurrencyChange,
  onOpenInstallModal,
  isInstalled = false,
}) => {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');

  useEffect(() => {
    fetch('/health')
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === 'ok') setHealthStatus('healthy');
        else setHealthStatus('offline');
      })
      .catch(() => setHealthStatus('offline'));
  }, []);

  const currencies = ['BDT', 'USD', 'EUR', 'GBP', 'CAD', 'JPY'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink">Settings & Preferences</h2>
        <p className="text-xs text-ink-muted">Configure your DailyFlow workspace options</p>
      </div>

      {/* 1. Theme Configuration */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-card">
        <h3 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
          <span>Theme Mode</span>
        </h3>
        <p className="text-xs text-ink-muted mb-4">
          Choose a visual appearance that matches your working environment.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onThemeChange(item.id as ThemeMode)}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all ${
                theme === item.id
                  ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold shadow-sm'
                  : 'border-border bg-surface-elevated text-ink-muted hover:text-ink hover:bg-surface-subtle'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1.5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Currency Setting */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-card">
        <h3 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
          <Coins className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Default Currency</span>
        </h3>
        <p className="text-xs text-ink-muted mb-4">
          All financial figures are processed in minor currency units to prevent precision loss.
        </p>

        <div className="flex flex-wrap gap-2">
          {currencies.map((curr) => (
            <button
              key={curr}
              onClick={() => onCurrencyChange(curr)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                currency === curr
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-surface-elevated text-ink border border-border hover:bg-surface-subtle'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Mobile App Installation (Android & iOS) */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Mobile App Installation (Android & iOS)</span>
            </h3>
            <p className="text-xs text-ink-muted">
              Install DailyFlow as a native-feel Progressive Web App on Android, iPhone, iPad, or Desktop with full offline support.
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1 rounded-full ${
              isInstalled
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
            }`}
          >
            {isInstalled ? 'Installed' : 'Ready to Install'}
          </span>
        </div>

        {onOpenInstallModal && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-ink-muted">
              {isInstalled
                ? 'DailyFlow is running in standalone app mode.'
                : 'Tap to view step-by-step instructions or install directly.'}
            </span>
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'View App Info' : 'Install App on Phone'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. System & API Health Status */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-card">
        <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Backend & Database Status</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/70 border border-border text-xs">
            <span className="font-medium text-ink">REST API Connection</span>
            <span
              className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-full ${
                healthStatus === 'healthy'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {healthStatus === 'healthy' ? 'Healthy & Connected' : 'Checking / Standalone'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/70 border border-border text-xs">
            <span className="font-medium text-ink">Data Storage Engine</span>
            <span className="font-mono text-ink-muted flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              PostgreSQL Schema (Strict Minor Unit Storage)
            </span>
          </div>
        </div>
      </div>

      {/* 4. Specifications & Architecture Documentation */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-card">
        <h3 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Documentation & Architecture</span>
        </h3>
        <p className="text-xs text-ink-muted mb-4">
          DailyFlow SRS v1.0 specifications and API contracts included in this project:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-surface-elevated border border-border">
            <span className="font-semibold block text-ink">SRS.md</span>
            <span className="text-ink-muted text-[11px]">Software Requirements Spec</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-border">
            <span className="font-semibold block text-ink">API.md</span>
            <span className="text-ink-muted text-[11px]">REST API v1 Contract</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-border">
            <span className="font-semibold block text-ink">DATABASE.md</span>
            <span className="text-ink-muted text-[11px]">Schema, ERD & Migrations</span>
          </div>
        </div>
      </div>

      {/* 5. Developer Credit */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
        <div className="text-xs">
          <p className="font-bold text-ink">DailyFlow Finance</p>
          <p className="text-[11px] text-ink-muted">Smart Personal Expense Platform</p>
        </div>
        <div className="text-xs font-medium text-ink-muted">
          Developed by <span className="text-emerald-600 dark:text-emerald-400 font-bold">Sami</span>
        </div>
      </div>
    </div>
  );
};
