import { getDatabase } from '../database/db.js';
import crypto from 'crypto';
export class GoalRepository {
    mapRow(row) {
        const targetMinor = typeof row.target_amount_minor === 'string' ? parseInt(row.target_amount_minor, 10) : Number(row.target_amount_minor);
        const currentMinor = typeof row.current_amount_minor === 'string' ? parseInt(row.current_amount_minor, 10) : Number(row.current_amount_minor);
        const remainingMinor = Math.max(0, targetMinor - currentMinor);
        const progressPercent = targetMinor > 0 ? Math.min(100, Math.round((currentMinor / targetMinor) * 100)) : 0;
        const isCompleted = currentMinor >= targetMinor;
        // Calculate months remaining until targetDate
        const today = new Date();
        const target = new Date(row.target_date);
        const diffMonths = Math.max(1, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()));
        const suggestedMonthly = remainingMinor > 0 ? Math.ceil(remainingMinor / diffMonths) : 0;
        let targetDate = '';
        if (typeof row.target_date === 'string') {
            targetDate = row.target_date.split('T')[0];
        }
        else if (row.target_date && row.target_date instanceof Date) {
            const d = row.target_date;
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            targetDate = `${y}-${m}-${day}`;
        }
        else {
            targetDate = String(row.target_date || '');
        }
        return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            targetAmountMinor: targetMinor,
            currentAmountMinor: currentMinor,
            remainingMinor,
            progressPercent,
            targetDate,
            categoryId: row.category_id,
            categoryName: row.category_name,
            notes: row.notes,
            isCompleted,
            suggestedMonthlyContributionMinor: suggestedMonthly,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async findMany(userId) {
        const db = getDatabase();
        const result = await db.query(`SELECT g.id, g.user_id, g.title, g.target_amount_minor, g.current_amount_minor,
              g.target_date, g.category_id, c.name AS category_name, g.notes, g.created_at, g.updated_at
       FROM savings_goals g
       LEFT JOIN categories c ON g.category_id = c.id
       WHERE g.user_id = $1
       ORDER BY g.target_date ASC`, [userId]);
        return result.rows.map((r) => this.mapRow(r));
    }
    async findById(id, userId) {
        const db = getDatabase();
        const result = await db.query(`SELECT g.id, g.user_id, g.title, g.target_amount_minor, g.current_amount_minor,
              g.target_date, g.category_id, c.name AS category_name, g.notes, g.created_at, g.updated_at
       FROM savings_goals g
       LEFT JOIN categories c ON g.category_id = c.id
       WHERE g.id = $1 AND g.user_id = $2`, [id, userId]);
        if (result.rows.length === 0)
            return null;
        return this.mapRow(result.rows[0]);
    }
    async create(data) {
        const db = getDatabase();
        const id = crypto.randomUUID();
        await db.query(`INSERT INTO savings_goals (id, user_id, title, target_amount_minor, current_amount_minor, target_date, category_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
            id,
            data.userId,
            data.title,
            data.targetAmountMinor,
            data.currentAmountMinor || 0,
            data.targetDate,
            data.categoryId || null,
            data.notes || null,
        ]);
        const created = await this.findById(id, data.userId);
        if (!created)
            throw new Error('Failed to retrieve created goal');
        return created;
    }
    async update(id, userId, data) {
        const db = getDatabase();
        const setClauses = ['updated_at = CURRENT_TIMESTAMP'];
        const params = [id, userId];
        if (data.title !== undefined) {
            params.push(data.title);
            setClauses.push(`title = $${params.length}`);
        }
        if (data.targetAmountMinor !== undefined) {
            params.push(data.targetAmountMinor);
            setClauses.push(`target_amount_minor = $${params.length}`);
        }
        if (data.currentAmountMinor !== undefined) {
            params.push(data.currentAmountMinor);
            setClauses.push(`current_amount_minor = $${params.length}`);
        }
        if (data.targetDate !== undefined) {
            params.push(data.targetDate);
            setClauses.push(`target_date = $${params.length}`);
        }
        if (data.categoryId !== undefined) {
            params.push(data.categoryId || null);
            setClauses.push(`category_id = $${params.length}`);
        }
        if (data.notes !== undefined) {
            params.push(data.notes || null);
            setClauses.push(`notes = $${params.length}`);
        }
        await db.query(`UPDATE savings_goals SET ${setClauses.join(', ')} WHERE id = $1 AND user_id = $2`, params);
        return this.findById(id, userId);
    }
    async contribute(id, userId, amountMinor) {
        const db = getDatabase();
        await db.query(`UPDATE savings_goals
       SET current_amount_minor = current_amount_minor + $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3`, [amountMinor, id, userId]);
        return this.findById(id, userId);
    }
    async delete(id, userId) {
        const db = getDatabase();
        const result = await db.query(`DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
        return result.rows.length > 0;
    }
}
export const goalRepository = new GoalRepository();
