import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Sparkles } from 'lucide-react';

export const PWAUpdateToast: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('DailyFlow Service Worker registered:', r);
    },
    onRegisterError(error) {
      console.error('DailyFlow Service Worker registration error:', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <aside
      aria-label="App update notification"
      className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-4 rounded-2xl bg-forest-900/95 dark:bg-surface-elevated/95 backdrop-blur-xl border border-teal-500/40 text-white shadow-2xl shadow-teal-950/40 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">
            DailyFlow Update Ready
          </h4>
          <p className="text-xs text-teal-100/80 dark:text-ink-muted mt-0.5 leading-relaxed">
            A new version has been downloaded. Reload now to apply the latest improvements and offline fixes.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-forest-950 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Update Now
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-medium transition-all"
            >
              Later
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="p-1 rounded-lg text-white/60 hover:text-white transition-colors"
          aria-label="Dismiss update notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
