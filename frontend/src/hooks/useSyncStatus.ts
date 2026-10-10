import { useState, useEffect, useCallback } from 'react';
import { offlineSync } from '../services/offlineSync.js';

export function useSyncStatus() {
  const [state, setState] = useState(() => offlineSync.getState());

  useEffect(() => {
    const unsubscribe = offlineSync.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const manualSync = useCallback(async () => {
    return await offlineSync.processQueue();
  }, []);

  return {
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    pendingCount: state.pendingCount,
    lastSyncedAt: state.lastSyncedAt,
    manualSync,
  };
}
