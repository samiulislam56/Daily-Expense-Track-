import { getDatabase } from '../database/db.js';

export interface CategoryRow {
  id: string;
  name: string;
  icon_key: string;
  color_key: string;
  is_default: boolean;
  created_at: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  iconKey: string;
  colorKey: string;
  isDefault: boolean;
  createdAt: string;
}

export class CategoryRepository {
  private mapRow(row: CategoryRow): CategoryDTO {
    return {
      id: row.id,
      name: row.name,
      iconKey: row.icon_key,
      colorKey: row.color_key,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
    };
  }

  async findAll(): Promise<CategoryDTO[]> {
    const db = getDatabase();
    const result = await db.query<CategoryRow>(
      `SELECT id, name, icon_key, color_key, is_default, created_at
       FROM categories
       ORDER BY is_default DESC, name ASC`
    );
    return result.rows.map(this.mapRow);
  }

  async findById(id: string): Promise<CategoryDTO | null> {
    const db = getDatabase();
    const result = await db.query<CategoryRow>(
      `SELECT id, name, icon_key, color_key, is_default, created_at
       FROM categories
       WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }
}

export const categoryRepository = new CategoryRepository();
