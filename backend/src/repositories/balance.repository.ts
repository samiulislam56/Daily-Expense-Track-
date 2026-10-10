import { getDatabase } from '../database/db.js';

export interface UserBalanceRow {
  user_id: string;
  amount_minor: string | number;
  currency_code: string;
  reference_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserBalanceDTO {
  userId: string;
  amountMinor: number;
  currencyCode: string;
  referenceDate: string;
  createdAt: string;
  updatedAt: string;
}

export class BalanceRepository {
  private mapRow(row: UserBalanceRow): UserBalanceDTO {
    let dateStr = row.reference_date;
    if (typeof dateStr === 'object' && dateStr !== null && 'toISOString' in (dateStr as any)) {
      dateStr = (dateStr as unknown as Date).toISOString().split('T')[0];
    } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }

    return {
      userId: row.user_id,
      amountMinor: typeof row.amount_minor === 'string' ? parseInt(row.amount_minor, 10) : Number(row.amount_minor),
      currencyCode: row.currency_code,
      referenceDate: dateStr,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findByUserId(userId: string): Promise<UserBalanceDTO | null> {
    const db = getDatabase();
    const result = await db.query<UserBalanceRow>(
      `SELECT
         user_id,
         amount_minor,
         currency_code,
         TO_CHAR(reference_date, 'YYYY-MM-DD') AS reference_date,
         created_at,
         updated_at
       FROM user_balances
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  async upsert(
    userId: string,
    data: {
      amountMinor: number;
      currencyCode: string;
      referenceDate: string;
    }
  ): Promise<UserBalanceDTO> {
    const db = getDatabase();
    await db.query(
      `INSERT INTO user_balances (user_id, amount_minor, currency_code, reference_date, updated_at)
       VALUES ($1, $2, $3, $4::DATE, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         amount_minor = EXCLUDED.amount_minor,
         currency_code = EXCLUDED.currency_code,
         reference_date = EXCLUDED.reference_date,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, data.amountMinor, data.currencyCode, data.referenceDate]
    );

    const updated = await this.findByUserId(userId);
    if (!updated) {
      throw new Error('Failed to retrieve updated user balance');
    }
    return updated;
  }

  async getTotalExpensesSince(userId: string, referenceDate: string): Promise<number> {
    const db = getDatabase();
    const result = await db.query<{ total: string | number | null }>(
      `SELECT COALESCE(SUM(amount_minor), 0) AS total
       FROM expenses
       WHERE user_id = $1 AND expense_date >= $2::DATE`,
      [userId, referenceDate]
    );

    return parseInt(String(result.rows[0]?.total || 0), 10);
  }
}

export const balanceRepository = new BalanceRepository();
