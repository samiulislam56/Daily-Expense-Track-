import { getDatabase } from '../database/db.js';
import { runMigrations } from './runner.js';
import { config } from '../config/env.js';

export const DEFAULT_CATEGORIES = [
  { id: '11111111-1111-1111-1111-111111111101', name: 'Food & Dining', iconKey: 'utensils', colorKey: 'amber' },
  { id: '11111111-1111-1111-1111-111111111102', name: 'Transportation', iconKey: 'car', colorKey: 'emerald' },
  { id: '11111111-1111-1111-1111-111111111103', name: 'Education', iconKey: 'graduation-cap', colorKey: 'blue' },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Shopping', iconKey: 'shopping-bag', colorKey: 'violet' },
  { id: '11111111-1111-1111-1111-111111111105', name: 'Bills & Utilities', iconKey: 'zap', colorKey: 'rose' },
  { id: '11111111-1111-1111-1111-111111111106', name: 'Health & Wellness', iconKey: 'activity', colorKey: 'cyan' },
  { id: '11111111-1111-1111-1111-111111111107', name: 'Entertainment', iconKey: 'film', colorKey: 'orange' },
  { id: '11111111-1111-1111-1111-111111111108', name: 'Other / Miscellaneous', iconKey: 'more-horizontal', colorKey: 'slate' },
];

export async function runSeed(): Promise<void> {
  const db = getDatabase();

  // Ensure tables exist
  await runMigrations();

  // 1. Seed Default User
  await db.query(
    `INSERT INTO users (id, email, display_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO NOTHING`,
    [config.defaultUserId, 'john.doe@example.com', 'John Doe']
  );

  // 2. Seed User Preferences
  await db.query(
    `INSERT INTO user_preferences (user_id, theme, locale, default_currency)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO NOTHING`,
    [config.defaultUserId, 'system', 'en-US', 'BDT']
  );

  // 3. Seed Default Categories
  for (const cat of DEFAULT_CATEGORIES) {
    await db.query(
      `INSERT INTO categories (id, name, icon_key, color_key, is_default)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         icon_key = EXCLUDED.icon_key,
         color_key = EXCLUDED.color_key`,
      [cat.id, cat.name, cat.iconKey, cat.colorKey]
    );
  }

  // 4. Seed sample expenses if table is empty
  const countRes = await db.query('SELECT COUNT(*) as count FROM expenses');
  const count = parseInt(countRes.rows[0]?.count || '0', 10);

  if (count === 0) {
    // Current date in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().split('T')[0];
    d.setDate(d.getDate() - 2);
    const threeDaysAgo = d.toISOString().split('T')[0];

    const demoExpenses = [
      {
        id: '22222222-2222-2222-2222-222222222201',
        catId: DEFAULT_CATEGORIES[0].id, // Food
        amountMinor: 35000, // 350.00 BDT
        date: today,
        note: 'Team lunch at Bistro',
      },
      {
        id: '22222222-2222-2222-2222-222222222202',
        catId: DEFAULT_CATEGORIES[1].id, // Transport
        amountMinor: 12000, // 120.00 BDT
        date: today,
        note: 'Metro ride & Rickshaw fare',
      },
      {
        id: '22222222-2222-2222-2222-222222222203',
        catId: DEFAULT_CATEGORIES[0].id, // Food
        amountMinor: 8500, // 85.00 BDT
        date: yesterday,
        note: 'Morning coffee & pastry',
      },
      {
        id: '22222222-2222-2222-2222-222222222204',
        catId: DEFAULT_CATEGORIES[4].id, // Bills
        amountMinor: 145000, // 1450.00 BDT
        date: yesterday,
        note: 'Home internet fiber bill',
      },
      {
        id: '22222222-2222-2222-2222-222222222205',
        catId: DEFAULT_CATEGORIES[2].id, // Education
        amountMinor: 99000, // 990.00 BDT
        date: threeDaysAgo,
        note: 'Advanced TypeScript & Architecture book',
      },
    ];

    for (const exp of demoExpenses) {
      await db.query(
        `INSERT INTO expenses (id, user_id, category_id, amount_minor, currency_code, expense_date, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [exp.id, config.defaultUserId, exp.catId, exp.amountMinor, 'BDT', exp.date, exp.note]
      );
    }
    console.log('✓ Seeded sample demo expenses');
  }

  console.log('✓ Successfully completed database seeding');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
