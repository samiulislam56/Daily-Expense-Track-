import { getDatabase } from '../database/db.js';
import crypto from 'crypto';

export interface AccountDTO {
  id: string;
  userId: string;
  name: string;
  type: 'cash' | 'bank' | 'mobile_wallet' | 'other';
  balanceMinor: number;
  currencyCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountRow {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance_minor: string | number;
  currency_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export class AccountRepository {
  private mapRow(row: AccountRow): AccountDTO {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type as any,
      balanceMinor: typeof row.balance_minor === 'string' ? parseInt(row.balance_minor, 10) : Number(row.balance_minor),
      currencyCode: row.currency_code,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findMany(userId: string): Promise<AccountDTO[]> {
    const db = getDatabase();
    const result = await db.query<AccountRow>(
      `SELECT id, user_id, name, type, balance_minor, currency_code, is_default, created_at, updated_at
       FROM accounts
       WHERE user_id = $1
       ORDER BY is_default DESC, name ASC`,
      [userId]
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  async findById(id: string, userId: string): Promise<AccountDTO | null> {
    const db = getDatabase();
    const result = await db.query<AccountRow>(
      `SELECT id, user_id, name, type, balance_minor, currency_code, is_default, created_at, updated_at
       FROM accounts
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  async create(data: {
    userId: string;
    name: string;
    type: string;
    balanceMinor?: number;
    currencyCode?: string;
    isDefault?: boolean;
  }): Promise<AccountDTO> {
    const db = getDatabase();
    const id = crypto.randomUUID();

    if (data.isDefault) {
      await db.query(`UPDATE accounts SET is_default = false WHERE user_id = $1`, [data.userId]);
    }

    await db.query(
      `INSERT INTO accounts (id, user_id, name, type, balance_minor, currency_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        data.userId,
        data.name,
        data.type || 'cash',
        data.balanceMinor || 0,
        data.currencyCode || 'BDT',
        Boolean(data.isDefault),
      ]
    );

    const created = await this.findById(id, data.userId);
    if (!created) throw new Error('Failed to retrieve created account');
    return created;
  }

  async update(
    id: string,
    userId: string,
    data: {
      name?: string;
      type?: string;
      balanceMinor?: number;
      currencyCode?: string;
      isDefault?: boolean;
    }
  ): Promise<AccountDTO | null> {
    const db = getDatabase();

    if (data.isDefault) {
      await db.query(`UPDATE accounts SET is_default = false WHERE user_id = $1 AND id != $2`, [userId, id]);
    }

    const setClauses: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const params: any[] = [id, userId];

    if (data.name !== undefined) {
      params.push(data.name);
      setClauses.push(`name = $${params.length}`);
    }
    if (data.type !== undefined) {
      params.push(data.type);
      setClauses.push(`type = $${params.length}`);
    }
    if (data.balanceMinor !== undefined) {
      params.push(data.balanceMinor);
      setClauses.push(`balance_minor = $${params.length}`);
    }
    if (data.currencyCode !== undefined) {
      params.push(data.currencyCode);
      setClauses.push(`currency_code = $${params.length}`);
    }
    if (data.isDefault !== undefined) {
      params.push(Boolean(data.isDefault));
      setClauses.push(`is_default = $${params.length}`);
    }

    await db.query(
      `UPDATE accounts SET ${setClauses.join(', ')} WHERE id = $1 AND user_id = $2`,
      params
    );

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db.query(`DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    return result.rows.length > 0;
  }
}

export const accountRepository = new AccountRepository();
