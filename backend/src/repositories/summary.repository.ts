import { getDatabase } from '../database/db.js';

export interface DailySummaryResult {
  date: string;
  totalMinor: number;
  count: number;
}

export interface MonthlySummaryResult {
  month: string;
  totalMinor: number;
  count: number;
}

export interface CategorySummaryItem {
  categoryId: string;
  categoryName: string;
  iconKey: string;
  colorKey: string;
  totalMinor: number;
  count: number;
  percentage: number;
}

export class SummaryRepository {
  async getDailySummary(date: string, userId: string): Promise<DailySummaryResult> {
    const db = getDatabase();
    const result = await db.query<{ total: string | number | null; count: string | number }>(
      `SELECT
         COALESCE(SUM(amount_minor), 0) AS total,
         COUNT(*) AS count
       FROM expenses
       WHERE user_id = $1 AND expense_date = $2::DATE`,
      [userId, date]
    );

    const totalMinor = parseInt(String(result.rows[0]?.total || 0), 10);
    const count = parseInt(String(result.rows[0]?.count || 0), 10);

    return {
      date,
      totalMinor,
      count,
    };
  }

  async getMonthlySummary(month: string, userId: string): Promise<MonthlySummaryResult> {
    const db = getDatabase();
    // month is in YYYY-MM format
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);

    // Calculate start and end date of that month
    const startDate = `${year}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate();
    const endDate = `${year}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const result = await db.query<{ total: string | number | null; count: string | number }>(
      `SELECT
         COALESCE(SUM(amount_minor), 0) AS total,
         COUNT(*) AS count
       FROM expenses
       WHERE user_id = $1 AND expense_date >= $2::DATE AND expense_date <= $3::DATE`,
      [userId, startDate, endDate]
    );

    const totalMinor = parseInt(String(result.rows[0]?.total || 0), 10);
    const count = parseInt(String(result.rows[0]?.count || 0), 10);

    return {
      month,
      totalMinor,
      count,
    };
  }

  async getCategoryBreakdown(
    userId: string,
    from?: string,
    to?: string
  ): Promise<CategorySummaryItem[]> {
    const db = getDatabase();
    const whereClauses: string[] = ['e.user_id = $1'];
    const params: any[] = [userId];

    if (from) {
      params.push(from);
      whereClauses.push(`e.expense_date >= $${params.length}::DATE`);
    }

    if (to) {
      params.push(to);
      whereClauses.push(`e.expense_date <= $${params.length}::DATE`);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    // Total spending for this period
    const totalRes = await db.query<{ grand_total: string | number | null }>(
      `SELECT COALESCE(SUM(amount_minor), 0) as grand_total FROM expenses e ${whereSql}`,
      params
    );
    const grandTotal = parseInt(String(totalRes.rows[0]?.grand_total || 0), 10);

    // Category sums
    const result = await db.query<{
      category_id: string;
      category_name: string;
      icon_key: string;
      color_key: string;
      total: string | number;
      count: string | number;
    }>(
      `SELECT
         c.id AS category_id,
         c.name AS category_name,
         c.icon_key,
         c.color_key,
         COALESCE(SUM(e.amount_minor), 0) AS total,
         COUNT(e.id) AS count
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND ${whereClauses.join(' AND ')}
       GROUP BY c.id, c.name, c.icon_key, c.color_key
       HAVING COALESCE(SUM(e.amount_minor), 0) > 0
       ORDER BY total DESC`,
      params
    );

    return result.rows.map((row) => {
      const itemTotal = parseInt(String(row.total), 10);
      const percentage = grandTotal > 0 ? Number(((itemTotal / grandTotal) * 100).toFixed(1)) : 0;
      return {
        categoryId: row.category_id,
        categoryName: row.category_name,
        iconKey: row.icon_key,
        colorKey: row.color_key,
        totalMinor: itemTotal,
        count: parseInt(String(row.count), 10),
        percentage,
      };
    });
  }
}

export const summaryRepository = new SummaryRepository();
