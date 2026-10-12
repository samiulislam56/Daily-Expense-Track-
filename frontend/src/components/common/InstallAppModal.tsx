import React, { useState } from 'react';
import {
  Smartphone,
  Share,
  PlusSquare,
  X,
  Check,
  Download,
  MoreVertical,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasNativePrompt: boolean;
  onNativeInstall: () => Promise<any>;
  defaultPlatform?: 'android' | 'ios';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  hasNativePrompt,
  onNativeInstall,
  defaultPlatform = 'android',
}) => {
  const [platform, setPlatform] = useState<'android' | 'ios'>(defaultPlatform);

  if (!isOpen) return null;

  const handleNativeClick = async () => {
    await onNativeInstall();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-app-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full sm:max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 duration-300 pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 id="install-app-title" className="text-base font-bold text-[var(--text-ink)]">
                Install DailyFlow App
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Install on Android, iPhone, iPad, or Desktop
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--surface-subtle)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Toggle Tabs */}
        <div className="flex rounded-xl bg-[var(--surface-subtle)] p-1 border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              platform === 'android'
                ? 'bg-[var(--surface)] text-[var(--text-ink)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
            }`}
          >
            Android / Chrome
          </button>
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              platform === 'ios'
                ? 'bg-[var(--surface)] text-[var(--text-ink)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
            }`}
          >
            iPhone / iPad (iOS)
          </button>
        </div>

        {/* Native 1-Click Button if available */}
        {hasNativePrompt && (
          <button
            type="button"
            onClick={handleNativeClick}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Install Now (One-Click)</span>
          </button>
        )}

        {/* Platform Steps */}
        {platform === 'android' ? (
          <div className="space-y-3 text-xs text-[var(--text-ink)] leading-relaxed">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-ink)]">Tap Browser Menu (⋮)</p>
                <p className="text-[var(--text-muted)] mt-0.5">
                  In Chrome, Brave, or Edge, tap the{' '}
                  <span className="font-semibold text-[var(--text-ink)] inline-flex items-center">
                    <MoreVertical className="w-3.5 h-3.5 inline mx-0.5" /> three dots menu
                  </span>{' '}
                  in the top-right corner.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-ink)]">Tap "Install app" or "Add to Home screen"</p>
                <p className="text-[var(--text-muted)] mt-0.5">
                  Select <span className="font-semibold text-emerald-600 dark:text-emerald-400">Install app</span> (হোম স্ক্রিনে যোগ করুন) from the menu list.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-ink)]">Launch like a Native App</p>
                <p className="text-[var(--text-muted)] mt-0.5">
                  Tap <span className="font-semibold text-[var(--text-ink)]">Install</span> to confirm. DailyFlow will be added to your mobile home screen with full offline access!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-[var(--text-ink)] leading-relaxed">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-ink)]">Tap the Share Button</p>
                <p className="text-[var(--text-muted)] mt-0.5">
                  In Apple Safari, tap the{' '}
                  <span className="font-semibold text-teal-600 dark:text-teal-400 inline-flex items-center">
                    <Share className="w-3.5 h-3.5 inline mx-0.5" /> Share icon
                  </span>{' '}
                  at the bottom bar of your iPhone (or top bar on iPad).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-ink)]">Tap "Add to Home Screen"</p>
                <p className="text-[var(--text-muted)] mt-0.5">
                  Scroll down the share sheet options and select{' '}
                  <span className="font-semibold text-teal-600 dark:text-teal-400 inline-flex items-center">
                    <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" /> Add to Home Screen
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-ink)]">Tap "Add" in Top-Right</p>
                <p className="text-[var(--text-muted)] mt-0.5">
                  Tap <span className="font-semibold text-[var(--text-ink)]">Add</span> in the top-right corner. DailyFlow icon will appear directly on your iOS home screen!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dismiss Footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--text-ink)] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Close</span>
        </button>
      </div>
    </div>
  );
};
