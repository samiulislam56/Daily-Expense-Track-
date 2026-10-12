/**
 * DailyFlow 2.0 Natural Language Transaction Parser (Bangla & English)
 * 
 * Accurately parses everyday natural expressions in Bangla and English into
 * structured transaction drafts without requiring an external AI server.
 */

import { Category, TransactionType } from '../types/index.js';

export function parseBanglaDigits(input: string): string {
  const bnToEn: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return input.replace(/[০-৯]/g, (char) => bnToEn[char] || char);
}

export interface ParsedTransactionDraft {
  amountMinor: number;
  type: TransactionType;
  categoryId?: string;
  categoryName?: string;
  note: string;
  confidence: number;
}

export function parseNaturalLanguageTransaction(
  input: string,
  categories: Category[] = []
): ParsedTransactionDraft | null {
  if (!input || !input.trim()) return null;

  const raw = input.trim();
  const normalized = parseBanglaDigits(raw);

  // Extract numeric amount: e.g. "50", "150.50", "2,500", "৳500", "500 taka", "500 tk"
  const amountMatch = normalized.match(/(?:৳|tk|bdt|টাকা)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:tk|taka|টাকা|bdt)?/i);
  let amountMinor = 0;

  if (amountMatch && amountMatch[1]) {
    const num = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      amountMinor = Math.round(num * 100);
    }
  }

  // Detect transaction type
  let type: TransactionType = 'expense';
  const lower = normalized.toLowerCase();

  const isIncome =
    lower.includes('income') ||
    lower.includes('salary') ||
    lower.includes('বেতন') ||
    lower.includes('টিউশনি') ||
    lower.includes('আয়') ||
    lower.includes('পেলাম') ||
    lower.includes('পেলুম') ||
    lower.includes('জমা');

  if (isIncome) {
    type = 'income';
  }

  // Detect category keywords
  let matchedCategory: Category | undefined = undefined;

  const foodKeywords = ['খাবার', 'ভাত', 'লাঞ্চ', 'ডিনার', 'নাশতা', 'চা', 'কফি', 'বাজার', 'মুদি', 'রেস্তোরাঁ', 'বার্গার', 'food', 'lunch', 'dinner', 'snacks', 'groceries', 'tea', 'coffee'];
  const transportKeywords = ['রিকশা', 'বাস', 'উবার', 'পাঠাও', 'ভাড়া', 'যাতায়াত', 'সিএনজি', 'মেট্রো', 'রিকশাভাড়া', 'transport', 'rickshaw', 'bus', 'uber', 'pathao', 'metro', 'fare'];
  const utilityKeywords = ['রিচার্জ', 'কারেন্ট', 'ওয়াইফাই', 'ইন্টারনেট', 'গ্যাস', 'পানি', 'বিদ্যুৎ', 'বিল', 'bill', 'electricity', 'wifi', 'recharge', 'utility', 'gas'];
  const healthKeywords = ['ওষুধ', 'ডাক্তার', 'মেডিসিন', 'হাসপাতাল', 'ফার্মেসি', 'medicine', 'doctor', 'hospital', 'health'];
  const entertainmentKeywords = ['সিনেমা', 'মুভি', 'গেম', 'ঘোরাঘুরি', 'movie', 'game', 'entertainment', 'netflix'];
  const shoppingKeywords = ['জামা', 'কাপড়', 'জুতা', 'শপিং', 'কেনাকাটা', 'shopping', 'cloth', 'shoes'];

  let detectedCategoryName = 'Miscellaneous';

  const findCatByName = (query: string) =>
    (categories || []).find((c) => c && c.name && c.name.toLowerCase().includes(query.toLowerCase()));

  if (type === 'income') {
    detectedCategoryName = 'Income & Salary';
    matchedCategory = findCatByName('Income') || (categories || []).find((c) => c.name.toLowerCase().includes('salary'));
  } else if (foodKeywords.some((k) => lower.includes(k))) {
    detectedCategoryName = 'Food & Groceries';
    matchedCategory = findCatByName('Food') || (categories && categories.length > 0 ? categories[0] : undefined);
  } else if (transportKeywords.some((k) => lower.includes(k))) {
    detectedCategoryName = 'Transport';
    matchedCategory = findCatByName('Transport');
  } else if (utilityKeywords.some((k) => lower.includes(k))) {
    detectedCategoryName = 'Bills & Utilities';
    matchedCategory = findCatByName('Bills') || findCatByName('Utilities');
  } else if (healthKeywords.some((k) => lower.includes(k))) {
    detectedCategoryName = 'Healthcare';
    matchedCategory = findCatByName('Health');
  } else if (entertainmentKeywords.some((k) => lower.includes(k))) {
    detectedCategoryName = 'Entertainment';
    matchedCategory = findCatByName('Entertainment');
  } else if (shoppingKeywords.some((k) => lower.includes(k))) {
    detectedCategoryName = 'Shopping';
    matchedCategory = findCatByName('Shopping');
  }

  if (!matchedCategory && categories && categories.length > 0) {
    matchedCategory = categories[0];
  }

  return {
    amountMinor,
    type,
    categoryId: matchedCategory?.id,
    categoryName: matchedCategory?.name || detectedCategoryName,
    note: raw,
    confidence: amountMinor > 0 ? 0.9 : 0.5,
  };
}
