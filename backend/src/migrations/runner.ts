import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const db = getDatabase();
  let migrationPath = path.join(__dirname, '001_init.sql');
  if (!fs.existsSync(migrationPath)) {
    migrationPath = path.join(__dirname, '../../src/migrations/001_init.sql');
  }
  if (!fs.existsSync(migrationPath)) {
    migrationPath = path.join(process.cwd(), 'src/migrations/001_init.sql');
  }
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Execute migration statements
  await db.exec(sql);
  console.log('✓ Successfully applied database migrations');
}

// Direct execution support
if (process.argv[1] && process.argv[1].endsWith('runner.ts')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
