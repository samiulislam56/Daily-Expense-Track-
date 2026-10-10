import { getDatabase } from '../database/db.js';
import crypto from 'crypto';

export interface ExpenseRow {
  id: string;
  user_id: string;
  category_id: string;
  amount_minor: string | number;
  currency_code: string;
  expense_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  cat_id?: string;
  cat_name?: string;
  cat_icon_key?: string;
  cat_color_key?: string;
}

export interface ExpenseDTO {
  id: string;
  userId: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    iconKey: string;
    colorKey: string;
  };
  amountMinor: number;
  currencyCode: string;
  expenseDate: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilterParams {
  from?: string;
  to?: string;
  categoryId?: string;
  q?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export class ExpenseRepository {
  private mapRow(row: ExpenseRow): ExpenseDTO {
    // Normalise expense_date to YYYY-MM-DD string
    let dateStr = row.expense_date;
    if (typeof dateStr === 'object' && dateStr !== null && 'toISOString' in (dateStr as any)) {
      dateStr = (dateStr as unknown as Date).toISOString().split('T')[0];
    } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }

    const dto: ExpenseDTO = {
      id: row.id,
      userId: row.user_id,
      categoryId: row.category_id,
      amountMinor: typeof row.amount_minor === 'string' ? parseInt(row.amount_minor, 10) : Number(row.amount_minor),
      currencyCode: row.currency_code,
      expenseDate: dateStr,
      note: row.note ?? null,
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

    return dto;
  }

  async create(data: {
    userId: string;
    categoryId: string;
    amountMinor: number;
    currencyCode: string;
    expenseDate: string;
    note?: string | null;
  }): Promise<ExpenseDTO> {
    const db = getDatabase();
    const id = crypto.randomUUID();

    await db.query(
      `INSERT INTO expenses (id, user_id, category_id, amount_minor, currency_code, expense_date, note)
       VALUES ($1, $2, $3, $4, $5, $6::DATE, $7)`,
      [
        id,
        data.userId,
        data.categoryId,
        data.amountMinor,
        data.currencyCode,
        data.expenseDate,
        data.note ?? null,
      ]
    );

    const created = await this.findById(id, data.userId);
    if (!created) {
      throw new Error('Failed to retrieve created expense');
    }
    return created;
  }

  async findById(id: string, userId: string): Promise<ExpenseDTO | null> {
    const db = getDatabase();
    const result = await db.query<ExpenseRow>(
      `SELECT
         e.id, e.user_id, e.category_id, e.amount_minor, e.currency_code,
         TO_CHAR(e.expense_date, 'YYYY-MM-DD') AS expense_date,
         e.note, e.created_at, e.updated_at,
         c.id AS cat_id, c.name AS cat_name, c.icon_key AS cat_icon_key, c.color_key AS cat_color_key
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1 AND e.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  async findMany(filters: ExpenseFilterParams, userId: string): Promise<PaginatedResult<ExpenseDTO>> {
    const db = getDatabase();
    const whereClauses: string[] = ['e.user_id = $1'];
    const params: any[] = [userId];

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

    if (filters.q) {
      params.push(`%${filters.q}%`);
      whereClauses.push(`e.note ILIKE $${params.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count query
    const countResult = await db.query<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM expenses e ${whereSql}`,
      params
    );
    const totalCount = parseInt(String(countResult.rows[0]?.count || 0), 10);

    // Pagination
    const offset = (filters.page - 1) * filters.pageSize;
    const limit = filters.pageSize;

    const queryParams = [...params, limit, offset];
    const dataResult = await db.query<ExpenseRow>(
      `SELECT
         e.id, e.user_id, e.category_id, e.amount_minor, e.currency_code,
         TO_CHAR(e.expense_date, 'YYYY-MM-DD') AS expense_date,
         e.note, e.created_at, e.updated_at,
         c.id AS cat_id, c.name AS cat_name, c.icon_key AS cat_icon_key, c.color_key AS cat_color_key
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       ${whereSql}
       ORDER BY e.expense_date DESC, e.created_at DESC
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
      queryParams
    );

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

  async update(
    id: string,
    userId: string,
    data: {
      categoryId?: string;
      amountMinor?: number;
      currencyCode?: string;
      expenseDate?: string;
      note?: string | null;
    }
  ): Promise<ExpenseDTO | null> {
    const db = getDatabase();
    const setClauses: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const params: any[] = [id, userId];

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

    const result = await db.query(
      `UPDATE expenses
       SET ${setClauses.join(', ')}
       WHERE id = $1 AND user_id = $2`,
      params
    );

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db.query<{ id: string }>(
      `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return result.rows.length > 0;
  }
}

export const expenseRepository = new ExpenseRepository();
