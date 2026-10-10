import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const db = getDatabase();
  const migrationFiles = [
    '001_init.sql',
    '002_user_balances.sql',
    '003_fintech_platform_upgrade.sql',
  ];

  for (const file of migrationFiles) {
    let migrationPath = path.join(__dirname, file);
    if (!fs.existsSync(migrationPath)) {
      migrationPath = path.join(__dirname, '../../src/migrations', file);
    }
    if (!fs.existsSync(migrationPath)) {
      migrationPath = path.join(process.cwd(), 'src/migrations', file);
    }
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await db.exec(sql);
    console.log(`✓ Successfully applied migration: ${file}`);
  }
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
