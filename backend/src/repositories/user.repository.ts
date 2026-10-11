import { getDatabase } from '../database/db.js';

export interface UserRecord {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export class UserRepository {
  private mapRow(row: any): UserRecord {
    return {
      id: row.id,
      username: row.username,
      displayName: row.display_name || row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
    };
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const db = getDatabase();
    const result = await db.query(
      `SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1`,
      [username.trim()]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  async findById(id: string): Promise<UserRecord | null> {
    const db = getDatabase();
    const result = await db.query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  async create(user: {
    id: string;
    username: string;
    passwordHash: string;
    displayName?: string;
    email?: string | null;
  }): Promise<UserRecord> {
    const db = getDatabase();
    const displayName = user.displayName || user.username;
    const result = await db.query(
      `INSERT INTO users (id, username, password_hash, display_name, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.id, user.username.trim(), user.passwordHash, displayName, user.email || null]
    );
    return this.mapRow(result.rows[0]);
  }
}

export const userRepository = new UserRepository();
