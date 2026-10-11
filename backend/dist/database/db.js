import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { config } from '../config/env.js';
class PostgresPoolClient {
    pool;
    constructor(connectionString) {
        this.pool = new Pool({
            connectionString,
            ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
        });
    }
    async query(sql, params) {
        const result = await this.pool.query(sql, params);
        return { rows: result.rows };
    }
    async exec(sql) {
        await this.pool.query(sql);
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const wrappedClient = {
                query: async (sql, params) => {
                    const res = await client.query(sql, params);
                    return { rows: res.rows };
                },
                exec: async (sql) => {
                    await client.query(sql);
                },
                transaction: async () => {
                    throw new Error('Nested transactions not supported');
                },
                close: async () => { },
            };
            const result = await callback(wrappedClient);
            await client.query('COMMIT');
            return result;
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
    }
}
class PGliteClient {
    pglite;
    constructor(storagePath) {
        this.pglite = new PGlite(storagePath);
    }
    async query(sql, params) {
        const res = await this.pglite.query(sql, params);
        return { rows: res.rows };
    }
    async exec(sql) {
        await this.pglite.exec(sql);
    }
    async transaction(callback) {
        return await this.pglite.transaction(async (tx) => {
            const wrappedClient = {
                query: async (sql, params) => {
                    const res = await tx.query(sql, params);
                    return { rows: res.rows };
                },
                exec: async (sql) => {
                    await tx.exec(sql);
                },
                transaction: async () => {
                    throw new Error('Nested transactions not supported');
                },
                close: async () => { },
            };
            return await callback(wrappedClient);
        });
    }
    async close() {
        await this.pglite.close();
    }
}
let dbInstance = null;
export function getDatabase() {
    if (!dbInstance) {
        const url = config.databaseUrl;
        if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
            dbInstance = new PostgresPoolClient(url);
        }
        else {
            // Use embedded PGlite for local/embedded zero-setup development
            const storage = url === 'memory://dailyflow' ? undefined : './.pgdata';
            dbInstance = new PGliteClient(storage);
        }
    }
    return dbInstance;
}
export function setDatabase(client) {
    dbInstance = client;
}
