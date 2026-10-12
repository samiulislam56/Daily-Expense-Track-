import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top Brand & Nav
    appName: 'DailyFlow',
    appTagline: 'Know where your money goes. Understand what comes next.',
    developedBy: 'Developed by Sami',
    overview: 'Overview',
    history: 'History',
    analytics: 'Analytics',
    budgets: 'Budgets',
    goals: 'Goals',
    copilot: 'AI Copilot',
    calculator: 'Calculator',
    settings: 'Settings',
    forecast: 'Forecast',
    simulator: 'What-if Simulator',

    // 3 Essential Dashboard Questions
    q1_title: 'How much money do I have?',
    q1_desc: 'Verified available balance across all cash, bank & wallet accounts',
    q2_title: 'What commitments are coming soon?',
    q2_desc: 'Upcoming essential bills and savings contributions in next 7-14 days',
    q3_title: 'How much can I safely spend?',
    q3_desc: 'Safe-to-spend today without disrupting future plans or bills',

    // Financial Hierarchy
    verifiedBalance: 'Verified Balance',
    safeToSpend: 'Safe to Spend',
    safeToSpendDaily: 'Daily Safe Limit',
    budgetRemaining: 'Budget Remaining',
    projectedEndBalance: 'Projected End Balance',
    emergencyBuffer: 'Emergency Cushion',
    upcomingBills: 'Upcoming Bills',
    savingsTarget: 'Savings Target',

    // Actions & Buttons
    quickAdd: 'Quick Add',
    addExpense: 'Add Expense',
    addIncome: 'Add Income',
    editBalance: 'Edit Balance',
    installApp: 'Install App',
    weeklyCheckin: 'Weekly Check-in',
    runSimulation: 'Explore Scenarios',
    viewForecast: 'View 30-Day Forecast',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    undo: 'Undo',

    // Categories
    food: 'Food & Groceries',
    transport: 'Transport',
    utilities: 'Bills & Utilities',
    healthcare: 'Healthcare',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    income: 'Income & Salary',
    misc: 'Miscellaneous',

    // Safe-to-Spend Status
    comfortable: 'Comfortable',
    balanced: 'Balanced',
    tight: 'Tight',
    critical: 'Critical',

    // Reminders & Prompts
    noExpensesToday: "You haven't recorded any expenses today yet.",
    recordNow: 'Record an expense',
    daysUntilIncome: 'days until next income',
  },
  bn: {
    // Top Brand & Nav
    appName: 'ডেইলिफ্লো',
    appTagline: 'জানুন টাকা কোথায় যাচ্ছে। বুঝুন সামনে কী আসছে। আত্মবিশ্বাসের সাথে সিদ্ধান্ত নিন।',
    developedBy: 'ডেভেলপ করেছেন সামি',
    overview: 'ওভারভিউ',
    history: 'ইতিহাস',
    analytics: 'পরিসংখ্যান',
    budgets: 'বাজেট',
    goals: 'লক্ষ্য',
    copilot: 'এআই কোপাইলট',
    calculator: 'ক্যালকুলেটর',
    settings: 'সেটিংস',
    forecast: 'ক্যাশ-ফ্লো পূর্বাভাস',
    simulator: 'হোয়াট-ইফ সিমুলেটর',

    // 3 Essential Dashboard Questions
    q1_title: 'বর্তমানে আমার কাছে কত টাকা আছে?',
    q1_desc: 'ক্যাশ, ব্যাংক এবং মোবাইল ওয়ালেটের মোট ভেরিফায়েড ব্যালেন্স',
    q2_title: 'সামনে কী কী আর্থিক বাধ্যবাধকতা আসছে?',
    q2_desc: 'আগামী ৭-১৪ দিনে জরুরি বিল ও সঞ্চয়ের কিস্তি',
    q3_title: 'চিন্তা ছাড়া কত খরচ করতে পারব?',
    q3_desc: 'ভবিষ্যতের পরিকল্পনা ব্যাহত না করে আজকের নিরাপদ ব্যয়ের সীমা',

    // Financial Hierarchy
    verifiedBalance: 'ভেরিফায়েড ব্যালেন্স',
    safeToSpend: 'নিরাপদ খরচ',
    safeToSpendDaily: 'দৈনিক নিরাপদ সীমা',
    budgetRemaining: 'বাকি বাজেট',
    projectedEndBalance: 'সম্ভাব্য সমাপনী ব্যালেন্স',
    emergencyBuffer: 'জরুরি তহবিল (কুশন)',
    upcomingBills: 'আসন্ন বিলসমূহ',
    savingsTarget: 'সঞ্চয়ের লক্ষ্য',

    // Actions & Buttons
    quickAdd: 'দ্রুত যোগ করুন',
    addExpense: 'খরচ লিখুন',
    addIncome: 'আয় লিখুন',
    editBalance: 'ব্যালেন্স পরিবর্তন',
    installApp: 'অ্যাপ ইনস্টল',
    weeklyCheckin: 'সাপ্তাহিক চেক-ইন',
    runSimulation: 'সিদ্ধান্তের প্রভাব দেখুন',
    viewForecast: '৩০ দিনের পূর্বাভাস',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    confirm: 'নিশ্চিত করুন',
    delete: 'মুছুন',
    undo: 'পূর্বাবস্থায় ফেরান',

    // Categories
    food: 'খাবার ও মুদি',
    transport: 'যাতায়াত ও ভাড়া',
    utilities: 'বিল ও ইউটিলিটি',
    healthcare: 'স্বাস্থ্য ও ওষুধ',
    entertainment: 'বিনোদন',
    shopping: 'কেনাকাটা',
    income: 'আয় ও বেতন',
    misc: 'বিবিধ',

    // Safe-to-Spend Status
    comfortable: 'স্বস্তিদায়ক',
    balanced: 'ভারসাম্যপূর্ণ',
    tight: 'সীমিত',
    critical: 'জরুরি সতর্কতা',

    // Reminders & Prompts
    noExpensesToday: 'আজকের কোনো খরচের হিসাব এখনো যুক্ত করা হয়নি।',
    recordNow: 'এখনই খরচ লিখুন',
    daysUntilIncome: 'দিন বাকি পরবর্তী আয়ের',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'bn',
  setLang: () => {},
  toggleLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dailyflow_lang') as Language;
      if (stored === 'en' || stored === 'bn') return stored;
    }
    return 'bn'; // Default to Bangladesh-first experience
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dailyflow_lang', newLang);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'bn' : 'en');
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
