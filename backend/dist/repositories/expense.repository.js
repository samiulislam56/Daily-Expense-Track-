import { getDatabase } from '../database/db.js';
import crypto from 'crypto';
export class ExpenseRepository {
    mapRow(row) {
        let dateStr = row.expense_date;
        if (typeof dateStr === 'object' && dateStr !== null && 'toISOString' in dateStr) {
            dateStr = dateStr.toISOString().split('T')[0];
        }
        else if (typeof dateStr === 'string' && dateStr.includes('T')) {
            dateStr = dateStr.split('T')[0];
        }
        const dto = {
            id: row.id,
            userId: row.user_id,
            categoryId: row.category_id,
            amountMinor: typeof row.amount_minor === 'string' ? parseInt(row.amount_minor, 10) : Number(row.amount_minor),
            currencyCode: row.currency_code,
            expenseDate: dateStr,
            note: row.note ?? null,
            type: row.type || 'expense',
            accountId: row.account_id ?? null,
            tags: row.tags ?? '',
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
        if (row.cat_id) {
            dto.category = {
                id: row.cat_id,
                name: row.cat_name || '',
                iconKey: row.cat_icon_key || '',
                colorKey: row.cat_color_key || '',
            };
        }
        if (row.acc_id) {
            dto.account = {
                id: row.acc_id,
                name: row.acc_name || '',
                type: row.acc_type || 'cash',
            };
        }
        return dto;
    }
    async create(data) {
        const db = getDatabase();
        const id = crypto.randomUUID();
        const type = data.type || 'expense';
        await db.query(`INSERT INTO expenses (id, user_id, category_id, amount_minor, currency_code, expense_date, note, type, account_id, tags)
       VALUES ($1, $2, $3, $4, $5, $6::DATE, $7, $8, $9, $10)`, [
            id,
            data.userId,
            data.categoryId,
            data.amountMinor,
            data.currencyCode,
            data.expenseDate,
            data.note ?? null,
            type,
            data.accountId ?? null,
            data.tags ?? '',
        ]);
        const created = await this.findById(id, data.userId);
        if (!created) {
            throw new Error('Failed to retrieve created transaction');
        }
        return created;
    }
    async findById(id, userId) {
        const db = getDatabase();
        const result = await db.query(`SELECT
         e.id, e.user_id, e.category_id, e.amount_minor, e.currency_code,
         TO_CHAR(e.expense_date, 'YYYY-MM-DD') AS expense_date,
         e.note, e.type, e.account_id, e.tags, e.created_at, e.updated_at,
         c.id AS cat_id, c.name AS cat_name, c.icon_key AS cat_icon_key, c.color_key AS cat_color_key,
         a.id AS acc_id, a.name AS acc_name, a.type AS acc_type
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN accounts a ON e.account_id = a.id
       WHERE e.id = $1 AND e.user_id = $2`, [id, userId]);
        if (result.rows.length === 0)
            return null;
        return this.mapRow(result.rows[0]);
    }
    async findMany(filters, userId) {
        const db = getDatabase();
        const whereClauses = ['e.user_id = $1'];
        const params = [userId];
        if (filters.from) {
            params.push(filters.from);
            whereClauses.push(`e.expense_date >= $${params.length}::DATE`);
        }
        if (filters.to) {
            params.push(filters.to);
            whereClauses.push(`e.expense_date <= $${params.length}::DATE`);
        }
        if (filters.categoryId) {
            params.push(filters.categoryId);
            whereClauses.push(`e.category_id = $${params.length}`);
        }
        if (filters.type) {
            params.push(filters.type);
            whereClauses.push(`e.type = $${params.length}`);
        }
        if (filters.accountId) {
            params.push(filters.accountId);
            whereClauses.push(`e.account_id = $${params.length}`);
        }
        if (filters.q) {
            params.push(`%${filters.q}%`);
            whereClauses.push(`(e.note ILIKE $${params.length} OR e.tags ILIKE $${params.length})`);
        }
        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        // Count query
        const countResult = await db.query(`SELECT COUNT(*) as count FROM expenses e ${whereSql}`, params);
        const totalCount = parseInt(String(countResult.rows[0]?.count || 0), 10);
        // Pagination
        const offset = (filters.page - 1) * filters.pageSize;
        const limit = filters.pageSize;
        const queryParams = [...params, limit, offset];
        const dataResult = await db.query(`SELECT
         e.id, e.user_id, e.category_id, e.amount_minor, e.currency_code,
         TO_CHAR(e.expense_date, 'YYYY-MM-DD') AS expense_date,
         e.note, e.type, e.account_id, e.tags, e.created_at, e.updated_at,
         c.id AS cat_id, c.name AS cat_name, c.icon_key AS cat_icon_key, c.color_key AS cat_color_key,
         a.id AS acc_id, a.name AS acc_name, a.type AS acc_type
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN accounts a ON e.account_id = a.id
       ${whereSql}
       ORDER BY e.expense_date DESC, e.created_at DESC
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`, queryParams);
        const totalPages = Math.ceil(totalCount / filters.pageSize) || 1;
        return {
            data: dataResult.rows.map((row) => this.mapRow(row)),
            meta: {
                page: filters.page,
                pageSize: filters.pageSize,
                totalCount,
                totalPages,
            },
        };
    }
    async update(id, userId, data) {
        const db = getDatabase();
        const setClauses = ['updated_at = CURRENT_TIMESTAMP'];
        const params = [id, userId];
        if (data.categoryId !== undefined) {
            params.push(data.categoryId);
            setClauses.push(`category_id = $${params.length}`);
        }
        if (data.amountMinor !== undefined) {
            params.push(data.amountMinor);
            setClauses.push(`amount_minor = $${params.length}`);
        }
        if (data.currencyCode !== undefined) {
            params.push(data.currencyCode);
            setClauses.push(`currency_code = $${params.length}`);
        }
        if (data.expenseDate !== undefined) {
            params.push(data.expenseDate);
            setClauses.push(`expense_date = $${params.length}::DATE`);
        }
        if (data.note !== undefined) {
            params.push(data.note);
            setClauses.push(`note = $${params.length}`);
        }
        if (data.type !== undefined) {
            params.push(data.type);
            setClauses.push(`type = $${params.length}`);
        }
        if (data.accountId !== undefined) {
            params.push(data.accountId);
            setClauses.push(`account_id = $${params.length}`);
        }
        if (data.tags !== undefined) {
            params.push(data.tags);
            setClauses.push(`tags = $${params.length}`);
        }
        await db.query(`UPDATE expenses
       SET ${setClauses.join(', ')}
       WHERE id = $1 AND user_id = $2`, params);
        return this.findById(id, userId);
    }
    async delete(id, userId) {
        const db = getDatabase();
        const result = await db.query(`DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
        return result.rows.length > 0;
    }
}
export const expenseRepository = new ExpenseRepository();
