/**
 * CloudSync Service
 * 
 * Provides persistent, multi-device cloud synchronization for DailyFlow accounts
 * and financial records across web, Android, and iOS installed apps.
 * Works without requiring local server execution.
 */

const CLOUD_API_BASE = 'https://keyvalue.immanuel.co/api/KeyVal';
const CLOUD_APP_KEY = 'o40v19n0'; // Dedicated DailyFlow global cluster key

export interface CloudUserRecord {
  id: string;
  username: string;
  displayName: string;
  password: string;
  createdAt: string;
}

export interface CloudUserDataPayload {
  balance?: any;
  expenses?: any[];
  accounts?: any[];
  budgets?: any[];
  goals?: any[];
  recurring?: any[];
  updatedAt: string;
}

function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const n = code.toString(16);
    hex += n.length < 2 ? '0' + n : n;
  }
  return hex;
}

function hexToString(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substring(i, i + 2), 16);
    if (!isNaN(code)) {
      str += String.fromCharCode(code);
    }
  }
  return str;
}

function sanitizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

/**
 * Fetch a value from the cloud KV store with a safe timeout
 */
async function fetchCloudValue(key: string, timeoutMs = 3500): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const cleanKey = sanitizeKey(key);
    const url = `${CLOUD_API_BASE}/GetValue/${CLOUD_APP_KEY}/${cleanKey}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) return null;
    const raw = await res.text();
    // API returns JSON string like "7b22696422..." or ""
    const clean = raw.trim().replace(/^"|"$/g, '');
    return clean || null;
  } catch (err) {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Update a value in the cloud KV store with safe hex encoding
 */
async function updateCloudValue(key: string, value: string, timeoutMs = 4000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const cleanKey = sanitizeKey(key);
    const hexValue = stringToHex(value);
    const url = `${CLOUD_API_BASE}/UpdateValue/${CLOUD_APP_KEY}/${cleanKey}/${hexValue}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Length': '0',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);
    return res.ok;
  } catch (err) {
    clearTimeout(timer);
    return false;
  }
}

export const cloudSync = {
  /**
   * Save a newly registered user to the Cloud Server
   */
  async saveUserToCloud(user: CloudUserRecord): Promise<boolean> {
    try {
      const userKey = `df_u_${user.username}`;
      const payload = JSON.stringify({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        password: user.password,
        createdAt: user.createdAt,
      });

      return await updateCloudValue(userKey, payload);
    } catch {
      return false;
    }
  },

  /**
   * Look up a user in the Cloud Server by username
   */
  async getUserFromCloud(username: string): Promise<CloudUserRecord | null> {
    try {
      const userKey = `df_u_${username}`;
      const hex = await fetchCloudValue(userKey);
      if (!hex) return null;

      const jsonStr = hexToString(hex);
      if (!jsonStr) return null;

      const parsed = JSON.parse(jsonStr) as CloudUserRecord;
      if (parsed && parsed.username && parsed.password) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Save a user's financial dataset to the cloud
   */
  async saveUserDataToCloud(userId: string, data: CloudUserDataPayload): Promise<boolean> {
    try {
      const dataKey = `df_d_${userId}`;
      const payload = JSON.stringify(data);
      return await updateCloudValue(dataKey, payload);
    } catch {
      return false;
    }
  },

  /**
   * Retrieve a user's financial dataset from the cloud
   */
  async getUserDataFromCloud(userId: string): Promise<CloudUserDataPayload | null> {
    try {
      const dataKey = `df_d_${userId}`;
      const hex = await fetchCloudValue(dataKey);
      if (!hex) return null;

      const jsonStr = hexToString(hex);
      if (!jsonStr) return null;

      return JSON.parse(jsonStr) as CloudUserDataPayload;
    } catch {
      return null;
    }
  },
};
