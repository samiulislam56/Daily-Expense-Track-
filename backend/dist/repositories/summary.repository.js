import { getDatabase } from '../database/db.js';
export class SummaryRepository {
    async getDailySummary(date, userId) {
        const db = getDatabase();
        const result = await db.query(`SELECT
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_minor ELSE 0 END), 0) AS expense_total,
         COUNT(CASE WHEN type = 'expense' THEN 1 ELSE NULL END) AS expense_count,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount_minor ELSE 0 END), 0) AS income_total,
         COUNT(CASE WHEN type = 'income' THEN 1 ELSE NULL END) AS income_count
       FROM expenses
       WHERE user_id = $1 AND expense_date = $2::DATE`, [userId, date]);
        const totalMinor = parseInt(String(result.rows[0]?.expense_total || 0), 10);
        const count = parseInt(String(result.rows[0]?.expense_count || 0), 10);
        const incomeMinor = parseInt(String(result.rows[0]?.income_total || 0), 10);
        const incomeCount = parseInt(String(result.rows[0]?.income_count || 0), 10);
        const averageMinor = count > 0 ? Math.round(totalMinor / count) : 0;
        return {
            date,
            totalMinor,
            count,
            averageMinor,
            incomeMinor,
            incomeCount,
        };
    }
    async getMonthlySummary(month, userId) {
        const db = getDatabase();
        const [yearStr, monthStr] = month.split('-');
        const year = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10);
        const startDate = `${year}-${String(m).padStart(2, '0')}-01`;
        const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate();
        const endDate = `${year}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        const result = await db.query(`SELECT
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_minor ELSE 0 END), 0) AS expense_total,
         COUNT(CASE WHEN type = 'expense' THEN 1 ELSE NULL END) AS expense_count,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount_minor ELSE 0 END), 0) AS income_total,
         COUNT(CASE WHEN type = 'income' THEN 1 ELSE NULL END) AS income_count
       FROM expenses
       WHERE user_id = $1 AND expense_date >= $2::DATE AND expense_date <= $3::DATE`, [userId, startDate, endDate]);
        const totalMinor = parseInt(String(result.rows[0]?.expense_total || 0), 10);
        const count = parseInt(String(result.rows[0]?.expense_count || 0), 10);
        const incomeTotalMinor = parseInt(String(result.rows[0]?.income_total || 0), 10);
        const incomeCount = parseInt(String(result.rows[0]?.income_count || 0), 10);
        const netSavingsMinor = incomeTotalMinor - totalMinor;
        return {
            month,
            totalMinor,
            count,
            incomeTotalMinor,
            incomeCount,
            netSavingsMinor,
        };
    }
    async getCategoryBreakdown(userId, from, to) {
        const db = getDatabase();
        const expenseClauses = ["e.user_id = $1", "e.type = 'expense'"];
        const params = [userId];
        if (from) {
            params.push(from);
            expenseClauses.push(`e.expense_date >= $${params.length}::DATE`);
        }
        if (to) {
            params.push(to);
            expenseClauses.push(`e.expense_date <= $${params.length}::DATE`);
        }
        const whereSql = `WHERE ${expenseClauses.join(' AND ')}`;
        // Total expense for period
        const totalRes = await db.query(`SELECT COALESCE(SUM(amount_minor), 0) as grand_total FROM expenses e ${whereSql}`, params);
        const grandTotal = parseInt(String(totalRes.rows[0]?.grand_total || 0), 10);
        // Category breakdown
        const result = await db.query(`SELECT
         c.id AS category_id,
         c.name AS category_name,
         c.icon_key,
         c.color_key,
         COALESCE(SUM(e.amount_minor), 0) AS total,
         COUNT(e.id) AS count
       FROM categories c
       JOIN expenses e ON e.category_id = c.id
       ${whereSql}
       GROUP BY c.id, c.name, c.icon_key, c.color_key
       HAVING COALESCE(SUM(e.amount_minor), 0) > 0
       ORDER BY total DESC`, params);
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
