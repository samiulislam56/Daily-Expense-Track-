import { getDatabase } from '../database/db.js';
import crypto from 'crypto';

export interface BudgetDTO {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  categoryId: string | null;
  categoryName?: string | null;
  amountMinor: number;
  spentMinor: number;
  remainingMinor: number;
  percentageUsed: number;
  warningThresholdPercent: number;
  isExceeded: boolean;
  isWarning: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BudgetRow {
  id: string;
  user_id: string;
  month: string;
  category_id: string | null;
  category_name: string | null;
  amount_minor: string | number;
  spent_minor: string | number;
  warning_threshold_percent: number;
  created_at: string;
  updated_at: string;
}

export class BudgetRepository {
  private mapRow(row: BudgetRow): BudgetDTO {
    const amountMinor = typeof row.amount_minor === 'string' ? parseInt(row.amount_minor, 10) : Number(row.amount_minor);
    const spentMinor = typeof row.spent_minor === 'string' ? parseInt(row.spent_minor, 10) : Number(row.spent_minor || 0);
    const remainingMinor = amountMinor - spentMinor;
    const percentageUsed = amountMinor > 0 ? Math.round((spentMinor / amountMinor) * 100) : 0;
    const warningThreshold = row.warning_threshold_percent ?? 80;

    return {
      id: row.id,
      userId: row.user_id,
      month: row.month,
      categoryId: row.category_id,
      categoryName: row.category_name,
      amountMinor,
      spentMinor,
      remainingMinor,
      percentageUsed,
      warningThresholdPercent: warningThreshold,
      isExceeded: spentMinor > amountMinor,
      isWarning: percentageUsed >= warningThreshold && spentMinor <= amountMinor,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findByMonth(userId: string, month: string): Promise<BudgetDTO[]> {
    const db = getDatabase();
    const startDate = `${month}-01`;
    // Last day of month
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(year, m, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    const query = `
      SELECT 
        b.id,
        b.user_id,
        b.month,
        b.category_id,
        c.name AS category_name,
        b.amount_minor,
        COALESCE(
          (
            SELECT SUM(e.amount_minor)
            FROM expenses e
            WHERE e.user_id = b.user_id
              AND e.type = 'expense'
              AND e.expense_date >= $2
              AND e.expense_date <= $3
              AND (
                (b.category_id IS NULL)
                OR (b.category_id IS NOT NULL AND e.category_id = b.category_id)
              )
          ), 0
        ) AS spent_minor,
        b.warning_threshold_percent,
        b.created_at,
        b.updated_at
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = $1 AND b.month = $4
      ORDER BY b.category_id NULLS FIRST, b.amount_minor DESC
    `;

    const result = await db.query<BudgetRow>(query, [userId, startDate, endDate, month]);
    return result.rows.map((r) => this.mapRow(r));
  }

  async upsert(
    userId: string,
    data: {
      month: string;
      categoryId?: string | null;
      amountMinor: number;
      warningThresholdPercent?: number;
    }
  ): Promise<BudgetDTO> {
    const db = getDatabase();
    const warningThreshold = data.warningThresholdPercent ?? 80;
    const catId = data.categoryId || null;

    // Check if exists
    let existingQuery = `SELECT id FROM budgets WHERE user_id = $1 AND month = $2 AND `;
    const existingParams: any[] = [userId, data.month];
    if (catId) {
      existingQuery += `category_id = $3`;
      existingParams.push(catId);
    } else {
      existingQuery += `category_id IS NULL`;
    }

    const existingRes = await db.query(existingQuery, existingParams);

    if (existingRes.rows.length > 0) {
      const budgetId = existingRes.rows[0].id;
      await db.query(
        `UPDATE budgets
         SET amount_minor = $1, warning_threshold_percent = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [data.amountMinor, warningThreshold, budgetId]
      );
      const list = await this.findByMonth(userId, data.month);
      const updated = list.find((b) => b.id === budgetId);
      if (!updated) throw new Error('Failed to find updated budget');
      return updated;
    } else {
      const newId = crypto.randomUUID();
      await db.query(
        `INSERT INTO budgets (id, user_id, month, category_id, amount_minor, warning_threshold_percent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newId, userId, data.month, catId, data.amountMinor, warningThreshold]
      );
      const list = await this.findByMonth(userId, data.month);
      const created = list.find((b) => b.id === newId);
      if (!created) throw new Error('Failed to find created budget');
      return created;
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db.query(`DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    return result.rows.length > 0;
  }
}

export const budgetRepository = new BudgetRepository();
