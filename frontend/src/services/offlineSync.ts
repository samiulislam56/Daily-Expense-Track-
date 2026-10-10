import { api } from './api.js';

export type QueueActionType =
  | 'CREATE_EXPENSE'
  | 'UPDATE_EXPENSE'
  | 'DELETE_EXPENSE'
  | 'UPDATE_BALANCE';

export interface QueuedMutation {
  id: string; // Idempotency identifier
  type: QueueActionType;
  entityId?: string; // Expense ID if applicable
  payload: any;
  createdAt: string;
  retryCount: number;
}

const STORAGE_QUEUE_KEY = 'dailyflow_offline_queue_v1';
const STORAGE_LAST_SYNC_KEY = 'dailyflow_last_synced_at_v1';

type Listener = (state: {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
}) => void;

class OfflineSyncService {
  private queue: QueuedMutation[] = [];
  private isSyncing = false;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<Listener> = new Set();
  private lastSyncedAt: string | null = null;

  constructor() {
    this.loadQueue();
    this.loadLastSync();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private loadQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_QUEUE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
    this.notify();
  }

  private loadLastSync() {
    try {
      this.lastSyncedAt = localStorage.getItem(STORAGE_LAST_SYNC_KEY);
    } catch {
      this.lastSyncedAt = null;
    }
  }

  private setLastSync(iso: string) {
    this.lastSyncedAt = iso;
    try {
      localStorage.setItem(STORAGE_LAST_SYNC_KEY, iso);
    } catch {}
    this.notify();
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    this.processQueue();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  private notify() {
    const state = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.queue.length,
      lastSyncedAt: this.lastSyncedAt,
    };
    this.listeners.forEach((listener) => listener(state));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener({
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.queue.length,
      lastSyncedAt: this.lastSyncedAt,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.queue.length,
      lastSyncedAt: this.lastSyncedAt,
    };
  }

  /**
   * Enqueue a mutation when offline or when background sync is required
   */
  public enqueue(
    type: QueueActionType,
    payload: any,
    entityId?: string
  ): QueuedMutation {
    // Generate idempotency client ID
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Duplicate Prevention / Deduping:
    // If updating balance, only keep the newest balance update in queue
    if (type === 'UPDATE_BALANCE') {
      this.queue = this.queue.filter((m) => m.type !== 'UPDATE_BALANCE');
    }

    // If deleting an expense that was created in the queue and never sent to server, cancel both
    if (type === 'DELETE_EXPENSE' && entityId) {
      const createdIndex = this.queue.findIndex(
        (m) => m.type === 'CREATE_EXPENSE' && m.payload?.id === entityId
      );
      if (createdIndex !== -1) {
        this.queue.splice(createdIndex, 1);
        this.saveQueue();
        return {
          id,
          type,
          entityId,
          payload,
          createdAt: new Date().toISOString(),
          retryCount: 0,
        };
      }
    }

    const item: QueuedMutation = {
      id,
      type,
      entityId,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    this.queue.push(item);
    this.saveQueue();

    // If online, immediately attempt to process
    if (this.isOnline) {
      this.processQueue();
    }

    return item;
  }

  /**
   * Process all pending mutations sequentially
   */
  public async processQueue(): Promise<boolean> {
    if (this.isSyncing || this.queue.length === 0 || !this.isOnline) {
      return false;
    }

    this.isSyncing = true;
    this.notify();

    let allSucceeded = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        try {
          switch (item.type) {
            case 'CREATE_EXPENSE':
              await api.createExpense(item.payload);
              break;

            case 'UPDATE_EXPENSE':
              if (item.entityId) {
                await api.updateExpense(item.entityId, item.payload);
              }
              break;

            case 'DELETE_EXPENSE':
              if (item.entityId) {
                try {
                  await api.deleteExpense(item.entityId);
                } catch (e: any) {
                  // If already 404 on server, it is already deleted
                  if (e?.status !== 404) throw e;
                }
              }
              break;

            case 'UPDATE_BALANCE':
              await api.updateBalance(item.payload);
              break;
          }

          // Successfully processed, shift from queue
          this.queue.shift();
          this.saveQueue();
        } catch (error: any) {
          console.warn('Sync mutation failed, will retry later:', item, error);
          item.retryCount += 1;
          allSucceeded = false;
          // Stop queue processing on connectivity failure
          break;
        }
      }

      if (allSucceeded) {
        this.setLastSync(new Date().toISOString());
      }
    } finally {
      this.isSyncing = false;
      this.notify();
    }

    return allSucceeded;
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineSync = new OfflineSyncService();
