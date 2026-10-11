import { getDatabase } from '../database/db.js';
import crypto from 'crypto';
export class RecurringRepository {
    mapRow(row) {
        let nextDueDate = '';
        if (typeof row.next_due_date === 'string') {
            nextDueDate = row.next_due_date.split('T')[0];
        }
        else if (row.next_due_date && row.next_due_date instanceof Date) {
            const d = row.next_due_date;
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            nextDueDate = `${y}-${m}-${day}`;
        }
        else {
            nextDueDate = String(row.next_due_date || '');
        }
        return {
            id: row.id,
            userId: row.user_id,
            type: row.type,
            amountMinor: typeof row.amount_minor === 'string' ? parseInt(row.amount_minor, 10) : Number(row.amount_minor),
            categoryId: row.category_id,
            categoryName: row.category_name,
            accountId: row.account_id,
            accountName: row.account_name,
            frequency: row.frequency,
            nextDueDate,
            note: row.note,
            isActive: Boolean(row.is_active),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async findMany(userId) {
        const db = getDatabase();
        const result = await db.query(`SELECT r.id, r.user_id, r.type, r.amount_minor, r.category_id, c.name AS category_name,
              r.account_id, a.name AS account_name, r.frequency, r.next_due_date, r.note,
              r.is_active, r.created_at, r.updated_at
       FROM recurring_transactions r
       JOIN categories c ON r.category_id = c.id
       LEFT JOIN accounts a ON r.account_id = a.id
       WHERE r.user_id = $1
       ORDER BY r.is_active DESC, r.next_due_date ASC`, [userId]);
        return result.rows.map((r) => this.mapRow(r));
    }
    async findById(id, userId) {
        const db = getDatabase();
        const result = await db.query(`SELECT r.id, r.user_id, r.type, r.amount_minor, r.category_id, c.name AS category_name,
              r.account_id, a.name AS account_name, r.frequency, r.next_due_date, r.note,
              r.is_active, r.created_at, r.updated_at
       FROM recurring_transactions r
       JOIN categories c ON r.category_id = c.id
       LEFT JOIN accounts a ON r.account_id = a.id
       WHERE r.id = $1 AND r.user_id = $2`, [id, userId]);
        if (result.rows.length === 0)
            return null;
        return this.mapRow(result.rows[0]);
    }
    async create(data) {
        const db = getDatabase();
        const id = crypto.randomUUID();
        await db.query(`INSERT INTO recurring_transactions (id, user_id, type, amount_minor, category_id, account_id, frequency, next_due_date, note, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
            id,
            data.userId,
            data.type || 'expense',
            data.amountMinor,
            data.categoryId,
            data.accountId || null,
            data.frequency || 'monthly',
            data.nextDueDate,
            data.note || null,
            data.isActive !== undefined ? Boolean(data.isActive) : true,
        ]);
        const created = await this.findById(id, data.userId);
        if (!created)
            throw new Error('Failed to retrieve created recurring transaction');
        return created;
    }
    async update(id, userId, data) {
        const db = getDatabase();
        const setClauses = ['updated_at = CURRENT_TIMESTAMP'];
        const params = [id, userId];
        if (data.type !== undefined) {
            params.push(data.type);
            setClauses.push(`type = $${params.length}`);
        }
        if (data.amountMinor !== undefined) {
            params.push(data.amountMinor);
            setClauses.push(`amount_minor = $${params.length}`);
        }
        if (data.categoryId !== undefined) {
            params.push(data.categoryId);
            setClauses.push(`category_id = $${params.length}`);
        }
        if (data.accountId !== undefined) {
            params.push(data.accountId || null);
            setClauses.push(`account_id = $${params.length}`);
        }
        if (data.frequency !== undefined) {
            params.push(data.frequency);
            setClauses.push(`frequency = $${params.length}`);
        }
        if (data.nextDueDate !== undefined) {
            params.push(data.nextDueDate);
            setClauses.push(`next_due_date = $${params.length}`);
        }
        if (data.note !== undefined) {
            params.push(data.note || null);
            setClauses.push(`note = $${params.length}`);
        }
        if (data.isActive !== undefined) {
            params.push(Boolean(data.isActive));
            setClauses.push(`is_active = $${params.length}`);
        }
        await db.query(`UPDATE recurring_transactions SET ${setClauses.join(', ')} WHERE id = $1 AND user_id = $2`, params);
        return this.findById(id, userId);
    }
    async delete(id, userId) {
        const db = getDatabase();
        const result = await db.query(`DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
        return result.rows.length > 0;
    }
}
export const recurringRepository = new RecurringRepository();
