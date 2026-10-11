import { getDatabase } from '../database/db.js';
export class BalanceRepository {
    mapRow(row) {
        let dateStr = row.reference_date;
        if (typeof dateStr === 'object' && dateStr !== null && 'toISOString' in dateStr) {
            dateStr = dateStr.toISOString().split('T')[0];
        }
        else if (typeof dateStr === 'string' && dateStr.includes('T')) {
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
    async findByUserId(userId) {
        const db = getDatabase();
        const result = await db.query(`SELECT
         user_id,
         amount_minor,
         currency_code,
         TO_CHAR(reference_date, 'YYYY-MM-DD') AS reference_date,
         created_at,
         updated_at
       FROM user_balances
       WHERE user_id = $1`, [userId]);
        if (result.rows.length === 0)
            return null;
        return this.mapRow(result.rows[0]);
    }
    async upsert(userId, data) {
        const db = getDatabase();
        await db.query(`INSERT INTO user_balances (user_id, amount_minor, currency_code, reference_date, updated_at)
       VALUES ($1, $2, $3, $4::DATE, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         amount_minor = EXCLUDED.amount_minor,
         currency_code = EXCLUDED.currency_code,
         reference_date = EXCLUDED.reference_date,
         updated_at = CURRENT_TIMESTAMP`, [userId, data.amountMinor, data.currencyCode, data.referenceDate]);
        const updated = await this.findByUserId(userId);
        if (!updated) {
            throw new Error('Failed to retrieve updated user balance');
        }
        return updated;
    }
    async getCashflowSince(userId, referenceDate) {
        const db = getDatabase();
        const result = await db.query(`SELECT
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_minor ELSE 0 END), 0) AS expenses,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount_minor ELSE 0 END), 0) AS income
       FROM expenses
       WHERE user_id = $1 AND expense_date >= $2::DATE`, [userId, referenceDate]);
        return {
            expensesMinor: parseInt(String(result.rows[0]?.expenses || 0), 10),
            incomeMinor: parseInt(String(result.rows[0]?.income || 0), 10),
        };
    }
    async getTotalExpensesSince(userId, referenceDate) {
        const cashflow = await this.getCashflowSince(userId, referenceDate);
        return cashflow.expensesMinor;
    }
}
export const balanceRepository = new BalanceRepository();
