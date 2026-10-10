import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { config } from '../config/env.js';

export interface QueryResult<T = any> {
  rows: T[];
}

export interface DatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  exec(sql: string): Promise<void>;
  transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

class PostgresPoolClient implements DatabaseClient {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const result = await this.pool.query(sql, params);
    return { rows: result.rows as T[] };
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const wrappedClient: DatabaseClient = {
        query: async <R = any>(sql: string, params?: any[]): Promise<QueryResult<R>> => {
          const res = await client.query(sql, params);
          return { rows: res.rows as R[] };
        },
        exec: async (sql: string) => {
          await client.query(sql);
        },
        transaction: async () => {
          throw new Error('Nested transactions not supported');
        },
        close: async () => {},
      };
      const result = await callback(wrappedClient);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

class PGliteClient implements DatabaseClient {
  private pglite: PGlite;

  constructor(storagePath?: string) {
    this.pglite = new PGlite(storagePath);
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const res = await this.pglite.query<T>(sql, params);
    return { rows: res.rows as T[] };
  }

  async exec(sql: string): Promise<void> {
    await this.pglite.exec(sql);
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    return await this.pglite.transaction(async (tx) => {
      const wrappedClient: DatabaseClient = {
        query: async <R = any>(sql: string, params?: any[]): Promise<QueryResult<R>> => {
          const res = await tx.query<R>(sql, params);
          return { rows: res.rows as R[] };
        },
        exec: async (sql: string) => {
          await tx.exec(sql);
        },
        transaction: async () => {
          throw new Error('Nested transactions not supported');
        },
        close: async () => {},
      };
      return await callback(wrappedClient);
    });
  }

  async close(): Promise<void> {
    await this.pglite.close();
  }
}

let dbInstance: DatabaseClient | null = null;

export function getDatabase(): DatabaseClient {
  if (!dbInstance) {
    const url = config.databaseUrl;
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
      dbInstance = new PostgresPoolClient(url);
    } else {
      // Use embedded PGlite for local/embedded zero-setup development
      const storage = url === 'memory://dailyflow' ? undefined : './.pgdata';
      dbInstance = new PGliteClient(storage);
    }
  }
  return dbInstance;
}

export function setDatabase(client: DatabaseClient): void {
  dbInstance = client;
}
