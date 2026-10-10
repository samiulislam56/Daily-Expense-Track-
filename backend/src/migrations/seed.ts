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
  { id: '11111111-1111-1111-1111-111111111108', name: 'Salary & Income', iconKey: 'wallet', colorKey: 'emerald' },
  { id: '11111111-1111-1111-1111-111111111109', name: 'Other / Miscellaneous', iconKey: 'more-horizontal', colorKey: 'slate' },
];

export const DEFAULT_ACCOUNTS = [
  { id: '33333333-3333-3333-3333-333333333301', name: 'Cash Wallet', type: 'cash', balanceMinor: 500000, isDefault: true },
  { id: '33333333-3333-3333-3333-333333333302', name: 'City Bank Account', type: 'bank', balanceMinor: 2500000, isDefault: false },
  { id: '33333333-3333-3333-3333-333333333303', name: 'bKash Wallet', type: 'mobile_wallet', balanceMinor: 120000, isDefault: false },
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

  // 4. Seed Default Accounts
  for (const acc of DEFAULT_ACCOUNTS) {
    await db.query(
      `INSERT INTO accounts (id, user_id, name, type, balance_minor, currency_code, is_default)
       VALUES ($1, $2, $3, $4, $5, 'BDT', $6)
       ON CONFLICT (id) DO NOTHING`,
      [acc.id, config.defaultUserId, acc.name, acc.type, acc.balanceMinor, acc.isDefault]
    );
  }

  // 5. Seed sample expenses if table is empty
  const countRes = await db.query('SELECT COUNT(*) as count FROM expenses');
  const count = parseInt(countRes.rows[0]?.count || '0', 10);

  if (count === 0) {
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
        type: 'expense',
        accountId: DEFAULT_ACCOUNTS[0].id,
      },
      {
        id: '22222222-2222-2222-2222-222222222202',
        catId: DEFAULT_CATEGORIES[1].id, // Transport
        amountMinor: 12000, // 120.00 BDT
        date: today,
        note: 'Metro ride & Rickshaw fare',
        type: 'expense',
        accountId: DEFAULT_ACCOUNTS[0].id,
      },
      {
        id: '22222222-2222-2222-2222-222222222203',
        catId: DEFAULT_CATEGORIES[0].id, // Food
        amountMinor: 8500, // 85.00 BDT
        date: yesterday,
        note: 'Morning coffee & pastry',
        type: 'expense',
        accountId: DEFAULT_ACCOUNTS[2].id,
      },
      {
        id: '22222222-2222-2222-2222-222222222204',
        catId: DEFAULT_CATEGORIES[4].id, // Bills
        amountMinor: 145000, // 1450.00 BDT
        date: yesterday,
        note: 'Home internet fiber bill',
        type: 'expense',
        accountId: DEFAULT_ACCOUNTS[1].id,
      },
      {
        id: '22222222-2222-2222-2222-222222222205',
        catId: DEFAULT_CATEGORIES[2].id, // Education
        amountMinor: 99000, // 990.00 BDT
        date: threeDaysAgo,
        note: 'Advanced TypeScript & Architecture book',
        type: 'expense',
        accountId: DEFAULT_ACCOUNTS[1].id,
      },
      // Demo Income
      {
        id: '22222222-2222-2222-2222-222222222206',
        catId: DEFAULT_CATEGORIES[7].id, // Salary & Income
        amountMinor: 4500000, // 45,000.00 BDT
        date: today.slice(0, 7) + '-01',
        note: 'Monthly Consulting / Professional Salary',
        type: 'income',
        accountId: DEFAULT_ACCOUNTS[1].id,
      },
    ];

    for (const exp of demoExpenses) {
      await db.query(
        `INSERT INTO expenses (id, user_id, category_id, amount_minor, currency_code, expense_date, note, type, account_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [exp.id, config.defaultUserId, exp.catId, exp.amountMinor, 'BDT', exp.date, exp.note, exp.type, exp.accountId]
      );
    }
    console.log('✓ Seeded sample demo transactions');
  }

  // 6. Seed sample Monthly Budget
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  await db.query(
    `INSERT INTO budgets (id, user_id, month, category_id, amount_minor, warning_threshold_percent)
     VALUES ($1, $2, $3, NULL, $4, 80)
     ON CONFLICT DO NOTHING`,
    ['44444444-4444-4444-4444-444444444401', config.defaultUserId, currentMonthStr, 2500000] // 25,000 BDT budget
  );

  // 7. Seed sample Savings Goal
  const nextYearDate = new Date();
  nextYearDate.setMonth(nextYearDate.getMonth() + 6);
  await db.query(
    `INSERT INTO savings_goals (id, user_id, title, target_amount_minor, current_amount_minor, target_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [
      '55555555-5555-5555-5555-555555555501',
      config.defaultUserId,
      'Emergency Fund',
      10000000, // 100,000 BDT
      3500000,  // 35,000 BDT saved
      nextYearDate.toISOString().split('T')[0],
      'High-priority 3-month safety buffer fund',
    ]
  );

  // 8. Seed sample Recurring Transaction
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + 5);
  await db.query(
    `INSERT INTO recurring_transactions (id, user_id, type, amount_minor, category_id, frequency, next_due_date, note)
     VALUES ($1, $2, 'expense', $3, $4, 'monthly', $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      '66666666-6666-6666-6666-666666666601',
      config.defaultUserId,
      145000, // 1,450 BDT
      DEFAULT_CATEGORIES[4].id, // Bills & Utilities
      nextDueDate.toISOString().split('T')[0],
      'Monthly High-speed Fiber Internet subscription',
    ]
  );

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
