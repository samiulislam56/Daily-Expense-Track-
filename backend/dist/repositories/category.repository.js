import { getDatabase } from '../database/db.js';
export class CategoryRepository {
    mapRow(row) {
        return {
            id: row.id,
            name: row.name,
            iconKey: row.icon_key,
            colorKey: row.color_key,
            isDefault: Boolean(row.is_default),
            createdAt: row.created_at,
        };
    }
    async findAll() {
        const db = getDatabase();
        const result = await db.query(`SELECT id, name, icon_key, color_key, is_default, created_at
       FROM categories
       ORDER BY is_default DESC, name ASC`);
        return result.rows.map(this.mapRow);
    }
    async findById(id) {
        const db = getDatabase();
        const result = await db.query(`SELECT id, name, icon_key, color_key, is_default, created_at
       FROM categories
       WHERE id = $1`, [id]);
        if (result.rows.length === 0)
            return null;
        return this.mapRow(result.rows[0]);
    }
}
export const categoryRepository = new CategoryRepository();
