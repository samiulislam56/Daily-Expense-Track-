import React from 'react';
import { Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full sm:max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 duration-300 pb-safe"
      >
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 id="ios-install-title" className="text-base font-bold text-ink">
                Install DailyFlow on iPhone / iPad
              </h3>
              <p className="text-xs text-ink-muted">
                Run DailyFlow as a native app with full offline support
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
            aria-label="Close installation instructions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-ink leading-relaxed">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-elevated border border-border/80">
            <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">Tap the Share button</p>
              <p className="text-ink-muted mt-0.5">
                In Safari, tap the <span className="inline-flex items-center font-medium text-teal-600 dark:text-teal-400 mx-1"><Share className="w-3.5 h-3.5 inline mr-0.5" /> Share</span> icon at the bottom of your screen (or top on iPad).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-elevated border border-border/80">
            <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">Select "Add to Home Screen"</p>
              <p className="text-ink-muted mt-0.5">
                Scroll down the options list and tap <span className="inline-flex items-center font-medium text-teal-600 dark:text-teal-400 mx-1"><PlusSquare className="w-3.5 h-3.5 inline mr-0.5" /> Add to Home Screen</span>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-elevated border border-border/80">
            <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink">Tap "Add" in top-right</p>
              <p className="text-ink-muted mt-0.5">
                Confirm the app title "DailyFlow" and tap <span className="font-semibold text-teal-600 dark:text-teal-400">Add</span>. The icon will appear on your Home Screen!
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Got it
        </button>
      </div>
    </div>
  );
};
