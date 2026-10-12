/**
 * DailyFlow 2.0 Fintech Core Engine
 * 
 * Strict deterministic financial computations for Safe-to-Spend, Cash-flow Forecasting,
 * What-if Simulators, and Weekly Check-ins.
 * All monetary amounts are handled strictly as integer minor units (poisha).
 */

export interface SafeToSpendParams {
  currentBalanceMinor: number;
  upcomingBillsMinor: number;
  savingsCommitmentsMinor: number;
  emergencyBufferMinor: number;
  daysUntilIncome: number;
}

export interface SafeToSpendResult {
  safeFundsMinor: number;
  dailySafeToSpendMinor: number;
  status: 'comfortable' | 'balanced' | 'tight' | 'critical';
  statusColor: string;
  explanationEn: string;
  explanationBn: string;
}

export function calculateSafeToSpend(params: SafeToSpendParams): SafeToSpendResult {
  const {
    currentBalanceMinor,
    upcomingBillsMinor,
    savingsCommitmentsMinor,
    emergencyBufferMinor,
    daysUntilIncome,
  } = params;

  // Safe Funds = Verified Balance - (Essential Bills + Savings Commitments + Emergency Cushion)
  const committedFunds = upcomingBillsMinor + savingsCommitmentsMinor + emergencyBufferMinor;
  const safeFundsMinor = currentBalanceMinor - committedFunds;

  const validDays = Math.max(1, daysUntilIncome);
  const dailySafeToSpendMinor = safeFundsMinor > 0 ? Math.floor(safeFundsMinor / validDays) : 0;

  let status: SafeToSpendResult['status'] = 'comfortable';
  let statusColor = '#10B981'; // Emerald
  let explanationEn = '';
  let explanationBn = '';

  if (safeFundsMinor <= 0) {
    status = 'critical';
    statusColor = '#EF4444'; // Red
    const deficitMinor = Math.abs(safeFundsMinor);
    explanationEn = `Your upcoming bills and commitments exceed current liquid funds by ৳${(deficitMinor / 100).toFixed(2)}. Avoid non-essential spending.`;
    explanationBn = `আপনার আসন্ন বিল ও সঞ্চয় বর্তমান ব্যালেন্সের চেয়ে ৳${(deficitMinor / 100).toFixed(2)} বেশি। এই মুহূর্তে অনাবশ্যক খরচ পুরোপুরি বন্ধ রাখুন।`;
  } else if (dailySafeToSpendMinor < 30000) {
    // Less than ৳300/day
    status = 'tight';
    statusColor = '#F59E0B'; // Amber
    explanationEn = `You have ৳${(safeFundsMinor / 100).toFixed(2)} left for discretionary spending (৳${(dailySafeToSpendMinor / 100).toFixed(2)}/day). Spend intentionally on necessities only.`;
    explanationBn = `পরবর্তী আয়ের আগে আপনার কাছে ৳${(safeFundsMinor / 100).toFixed(2)} আছে (দৈনিক ৳${(dailySafeToSpendMinor / 100).toFixed(2)})। শুধু প্রয়োজনীয় জিনিসেই খরচ করুন।`;
  } else if (dailySafeToSpendMinor < 100000) {
    // ৳300 - ৳1,000/day
    status = 'balanced';
    statusColor = '#0D9488'; // Teal
    explanationEn = `You can comfortably spend up to ৳${(dailySafeToSpendMinor / 100).toFixed(2)} daily over the next ${validDays} days while keeping bills and emergency buffer protected.`;
    explanationBn = `বিল এবং জরুরি ফান্ড সুরক্ষিত রেখে আগামী ${validDays} দিনে আপনি নিশ্চিন্তে দৈনিক ৳${(dailySafeToSpendMinor / 100).toFixed(2)} পর্যন্ত খরচ করতে পারেন।`;
  } else {
    status = 'comfortable';
    statusColor = '#10B981'; // Emerald
    explanationEn = `Healthy liquidity. Safe daily spending limit is ৳${(dailySafeToSpendMinor / 100).toFixed(2)} for the next ${validDays} days. Consider channeling excess into savings.`;
    explanationBn = `আপনার অর্থনৈতিক অবস্থা শক্তিশালী। আগামী ${validDays} দিনে দৈনিক ৳${(dailySafeToSpendMinor / 100).toFixed(2)} খরচ করার সুযোগ আছে। উদ্বৃত্ত অংশ সঞ্চয়ে রাখতে পারেন।`;
  }

  return {
    safeFundsMinor,
    dailySafeToSpendMinor,
    status,
    statusColor,
    explanationEn,
    explanationBn,
  };
}

export interface ScheduledCashFlowEvent {
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense';
  amountMinor: number;
  title: string;
}

export interface ForecastDayPoint {
  date: string;
  dayIndex: number;
  projectedBalanceMinor: number;
  scheduledIncomeMinor: number;
  scheduledExpenseMinor: number;
  discretionaryExpenseMinor: number;
  isBelowBuffer: boolean;
  eventTitles: string[];
}

export interface CashFlowForecastResult {
  points: ForecastDayPoint[];
  startBalanceMinor: number;
  endBalanceMinor: number;
  minBalanceMinor: number;
  maxBalanceMinor: number;
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  lowBalanceHazardDate: string | null;
  daysAnalyzed: number;
}

export function calculateCashFlowForecast(params: {
  startBalanceMinor: number;
  startDate: string; // YYYY-MM-DD
  daysCount: number; // 7, 30, etc.
  dailyDiscretionaryBurnMinor: number;
  scheduledEvents: ScheduledCashFlowEvent[];
  emergencyBufferMinor?: number;
}): CashFlowForecastResult {
  const {
    startBalanceMinor,
    startDate,
    daysCount,
    dailyDiscretionaryBurnMinor,
    scheduledEvents,
    emergencyBufferMinor = 0,
  } = params;

  const points: ForecastDayPoint[] = [];
  let currentBalance = startBalanceMinor;
  let minBalance = startBalanceMinor;
  let maxBalance = startBalanceMinor;
  let totalIncome = 0;
  let totalExpense = 0;
  let lowBalanceHazardDate: string | null = null;

  const baseDate = new Date(startDate);

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    // Find scheduled events on this date
    const dayEvents = scheduledEvents.filter((e) => e.date === dateStr);
    const dayIncome = dayEvents
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amountMinor, 0);
    const dayScheduledExpense = dayEvents
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amountMinor, 0);

    const discretionary = dailyDiscretionaryBurnMinor;

    currentBalance = currentBalance + dayIncome - dayScheduledExpense - discretionary;
    totalIncome += dayIncome;
    totalExpense += dayScheduledExpense + discretionary;

    if (currentBalance < minBalance) minBalance = currentBalance;
    if (currentBalance > maxBalance) maxBalance = currentBalance;

    const isBelowBuffer = currentBalance < emergencyBufferMinor;
    if (isBelowBuffer && !lowBalanceHazardDate) {
      lowBalanceHazardDate = dateStr;
    }

    points.push({
      date: dateStr,
      dayIndex: i + 1,
      projectedBalanceMinor: currentBalance,
      scheduledIncomeMinor: dayIncome,
      scheduledExpenseMinor: dayScheduledExpense,
      discretionaryExpenseMinor: discretionary,
      isBelowBuffer,
      eventTitles: dayEvents.map((e) => e.title),
    });
  }

  return {
    points,
    startBalanceMinor,
    endBalanceMinor: currentBalance,
    minBalanceMinor: minBalance,
    maxBalanceMinor: maxBalance,
    totalIncomeMinor: totalIncome,
    totalExpenseMinor: totalExpense,
    lowBalanceHazardDate,
    daysAnalyzed: daysCount,
  };
}

export type ScenarioType =
  | 'reduce_discretionary'
  | 'add_subscription'
  | 'delay_income'
  | 'boost_savings';

export interface WhatIfScenarioInput {
  type: ScenarioType;
  titleEn: string;
  titleBn: string;
  dailyReductionMinor?: number;
  monthlySubscriptionMinor?: number;
  incomeDelayDays?: number;
  savingsBoostMinor?: number;
}

export interface WhatIfScenarioOutcome {
  baselineEndBalanceMinor: number;
  simulatedEndBalanceMinor: number;
  deltaEndBalanceMinor: number;
  baselineDailySafeMinor: number;
  simulatedDailySafeMinor: number;
  deltaDailySafeMinor: number;
  impactVerdictEn: string;
  impactVerdictBn: string;
}

export function simulateWhatIfScenario(params: {
  currentBalanceMinor: number;
  daysUntilIncome: number;
  dailyDiscretionaryBurnMinor: number;
  upcomingBillsMinor: number;
  savingsCommitmentsMinor: number;
  emergencyBufferMinor: number;
  scenario: WhatIfScenarioInput;
}): WhatIfScenarioOutcome {
  const {
    currentBalanceMinor,
    daysUntilIncome,
    dailyDiscretionaryBurnMinor,
    upcomingBillsMinor,
    savingsCommitmentsMinor,
    emergencyBufferMinor,
    scenario,
  } = params;

  // Baseline Safe-to-Spend
  const baselineSafe = calculateSafeToSpend({
    currentBalanceMinor,
    upcomingBillsMinor,
    savingsCommitmentsMinor,
    emergencyBufferMinor,
    daysUntilIncome,
  });

  const baselineEndBalanceMinor =
    currentBalanceMinor - upcomingBillsMinor - savingsCommitmentsMinor - dailyDiscretionaryBurnMinor * daysUntilIncome;

  let simulatedBills = upcomingBillsMinor;
  let simulatedSavings = savingsCommitmentsMinor;
  let simulatedDays = daysUntilIncome;
  let simulatedDailyBurn = dailyDiscretionaryBurnMinor;

  let impactVerdictEn = '';
  let impactVerdictBn = '';

  switch (scenario.type) {
    case 'reduce_discretionary': {
      const reduction = scenario.dailyReductionMinor || 0;
      simulatedDailyBurn = Math.max(0, dailyDiscretionaryBurnMinor - reduction);
      impactVerdictEn = `Saving ৳${(reduction / 100).toFixed(0)} daily preserves ৳${((reduction * daysUntilIncome) / 100).toFixed(0)} extra in your balance before next income.`;
      impactVerdictBn = `দৈনিক ৳${(reduction / 100).toFixed(0)} কম খরচ করলে পরবর্তী আয়ের আগে অতিরিক্ত ৳${((reduction * daysUntilIncome) / 100).toFixed(0)} সঞ্চিত থাকবে।`;
      break;
    }
    case 'add_subscription': {
      const sub = scenario.monthlySubscriptionMinor || 0;
      simulatedBills += sub;
      impactVerdictEn = `Adding a ৳${(sub / 100).toFixed(0)} commitment lowers your daily safe-to-spend by ৳${((sub / Math.max(1, daysUntilIncome)) / 100).toFixed(0)}/day.`;
      impactVerdictBn = `নতুন ৳${(sub / 100).toFixed(0)} সাবস্ক্রিপশন যোগ করলে আপনার দৈনিক নিরাপদ খরচ ৳${((sub / Math.max(1, daysUntilIncome)) / 100).toFixed(0)} কমে যাবে।`;
      break;
    }
    case 'delay_income': {
      const delay = scenario.incomeDelayDays || 5;
      simulatedDays += delay;
      impactVerdictEn = `If income is delayed by ${delay} days, stretch remaining safe funds across ${simulatedDays} days to avoid running dry.`;
      impactVerdictBn = `যদি আয় ${delay} দিন পিছিয়ে যায়, তবে টাকা শেষ হওয়া ঠেকাতে ব্যালেন্সকে ${simulatedDays} দিনের জন্য ভাগ করতে হবে।`;
      break;
    }
    case 'boost_savings': {
      const boost = scenario.savingsBoostMinor || 0;
      simulatedSavings += boost;
      impactVerdictEn = `Setting aside ৳${(boost / 100).toFixed(0)} immediately accelerates your goal without touching emergency reserves.`;
      impactVerdictBn = `সরাসরি ৳${(boost / 100).toFixed(0)} অতিরিক্ত সঞ্চয় করলে জরুরি রিজার্ভ না ছুঁয়েই লক্ষ্যের গতি বাড়বে।`;
      break;
    }
  }

  const simulatedSafe = calculateSafeToSpend({
    currentBalanceMinor,
    upcomingBillsMinor: simulatedBills,
    savingsCommitmentsMinor: simulatedSavings,
    emergencyBufferMinor,
    daysUntilIncome: simulatedDays,
  });

  const simulatedEndBalanceMinor =
    currentBalanceMinor - simulatedBills - simulatedSavings - simulatedDailyBurn * simulatedDays;

  return {
    baselineEndBalanceMinor,
    simulatedEndBalanceMinor,
    deltaEndBalanceMinor: simulatedEndBalanceMinor - baselineEndBalanceMinor,
    baselineDailySafeMinor: baselineSafe.dailySafeToSpendMinor,
    simulatedDailySafeMinor: simulatedSafe.dailySafeToSpendMinor,
    deltaDailySafeMinor: simulatedSafe.dailySafeToSpendMinor - baselineSafe.dailySafeToSpendMinor,
    impactVerdictEn,
    impactVerdictBn,
  };
}

export interface WeeklyMoneyCheckinData {
  weekStartDate: string;
  weekEndDate: string;
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  netSavingsMinor: number;
  savingsRatePercent: number;
  topCategoryName: string;
  topCategoryAmountMinor: number;
  topCategoryPercent: number;
  upcomingBillsCount: number;
  upcomingBillsTotalMinor: number;
  budgetStatus: 'healthy' | 'caution' | 'exceeded';
  budgetPercentUsed: number;
  actionableTipEn: string;
  actionableTipBn: string;
}

export function generateWeeklyMoneyCheckin(params: {
  expensesThisWeek: Array<{ amountMinor: number; categoryName?: string; type?: string }>;
  totalIncomeThisWeekMinor: number;
  monthlyBudgetOverall?: { amountMinor: number; spentMinor: number };
  upcomingBillsNext7Days: Array<{ amountMinor: number; title: string }>;
}): WeeklyMoneyCheckinData {
  const {
    expensesThisWeek,
    totalIncomeThisWeekMinor,
    monthlyBudgetOverall,
    upcomingBillsNext7Days,
  } = params;

  const actualExpenses = expensesThisWeek.filter((e) => (e.type || 'expense') === 'expense');
  const totalExpenseMinor = actualExpenses.reduce((sum, e) => sum + e.amountMinor, 0);
  const netSavingsMinor = totalIncomeThisWeekMinor - totalExpenseMinor;
  const savingsRatePercent =
    totalIncomeThisWeekMinor > 0
      ? Math.max(0, Math.round((netSavingsMinor / totalIncomeThisWeekMinor) * 100))
      : 0;

  // Compute top category
  const catMap: Record<string, number> = {};
  for (const exp of actualExpenses) {
    const cat = exp.categoryName || 'Miscellaneous';
    catMap[cat] = (catMap[cat] || 0) + exp.amountMinor;
  }

  let topCategoryName = 'None';
  let topCategoryAmountMinor = 0;
  for (const [cat, amt] of Object.entries(catMap)) {
    if (amt > topCategoryAmountMinor) {
      topCategoryName = cat;
      topCategoryAmountMinor = amt;
    }
  }

  const topCategoryPercent =
    totalExpenseMinor > 0 ? Math.round((topCategoryAmountMinor / totalExpenseMinor) * 100) : 0;

  const upcomingBillsTotalMinor = upcomingBillsNext7Days.reduce((sum, b) => sum + b.amountMinor, 0);

  // Budget status
  let budgetStatus: WeeklyMoneyCheckinData['budgetStatus'] = 'healthy';
  let budgetPercentUsed = 0;
  if (monthlyBudgetOverall && monthlyBudgetOverall.amountMinor > 0) {
    budgetPercentUsed = Math.round(
      (monthlyBudgetOverall.spentMinor / monthlyBudgetOverall.amountMinor) * 100
    );
    if (budgetPercentUsed > 100) budgetStatus = 'exceeded';
    else if (budgetPercentUsed >= 80) budgetStatus = 'caution';
  }

  // Compassionate, non-judgmental guidance
  let actionableTipEn = '';
  let actionableTipBn = '';

  if (budgetStatus === 'exceeded') {
    actionableTipEn = `Your monthly budget has been exceeded by ৳${((monthlyBudgetOverall!.spentMinor - monthlyBudgetOverall!.amountMinor) / 100).toFixed(0)}. Focus only on essentials for the rest of the month.`;
    actionableTipBn = `চলতি মাসের বাজেট অতিক্রান্ত হয়েছে। মাসের বাকি দিনগুলোতে শুধু জরুরি খরচগুলোতে মনযোগ দিন।`;
  } else if (topCategoryPercent > 45 && topCategoryName !== 'None') {
    actionableTipEn = `${topCategoryName} took up ${topCategoryPercent}% of this week's expenses. Setting a mini-target for this category could unlock savings.`;
    actionableTipBn = `এই সপ্তাহে মোট ব্যয়ের ${topCategoryPercent}% গেছে ${topCategoryName} খাতে। এই খাতে ছোট একটি দৈনিক সীমা রাখলে সহজেই সঞ্চয় বাড়বে।`;
  } else if (upcomingBillsNext7Days.length > 0) {
    actionableTipEn = `You have ${upcomingBillsNext7Days.length} bill(s) totaling ৳${(upcomingBillsTotalMinor / 100).toFixed(0)} due in the next 7 days. Keep these funds aside first.`;
    actionableTipBn = `আগামী ৭ দিনে ৳${(upcomingBillsTotalMinor / 100).toFixed(0)} টাকার ${upcomingBillsNext7Days.length}টি বিল রয়েছে। এই টাকাটি আগেই আলাদা রাখুন।`;
  } else {
    actionableTipEn = `Great pacing! You maintained a positive net cash flow this week. Keep recording daily transactions for consistent insights.`;
    actionableTipBn = `খুব ভালো নিয়ন্ত্রণ! এই সপ্তাহে আপনার ক্যাশ-ফ্লো ইতিবাচক ছিল। নিয়মিত খরচের হিসাব রাখার অভ্যাস বজায় রাখুন।`;
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);

  return {
    weekStartDate: weekStart.toISOString().split('T')[0],
    weekEndDate: now.toISOString().split('T')[0],
    totalIncomeMinor: totalIncomeThisWeekMinor,
    totalExpenseMinor,
    netSavingsMinor,
    savingsRatePercent,
    topCategoryName,
    topCategoryAmountMinor,
    topCategoryPercent,
    upcomingBillsCount: upcomingBillsNext7Days.length,
    upcomingBillsTotalMinor,
    budgetStatus,
    budgetPercentUsed,
    actionableTipEn,
    actionableTipBn,
  };
}
