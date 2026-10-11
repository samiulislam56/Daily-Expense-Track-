import { balanceService } from './balance.service.js';
import { summaryService } from './summary.service.js';
import { budgetService } from './budget.service.js';
import { goalService } from './goal.service.js';
import { expenseRepository } from '../repositories/expense.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { accountRepository } from '../repositories/account.repository.js';
export class CopilotService {
    async processQuery(userId, query) {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.slice(0, 7);
        const [currYear, currM] = currentMonth.split('-').map(Number);
        const prevDate = new Date(currYear, currM - 2, 1);
        const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
        // 1. Gather deterministic financial context
        const [balanceSummary, todaySummary, currentMonthSummary, prevMonthSummary, categoryBreakdown, budgets, goals, categories, accounts, recentExpenses,] = await Promise.all([
            balanceService.getBalanceSummary(userId),
            summaryService.getDailySummary(today, userId),
            summaryService.getMonthlySummary(currentMonth, userId),
            summaryService.getMonthlySummary(prevMonth, userId),
            summaryService.getCategorySummary(userId, `${currentMonth}-01`, today),
            budgetService.getBudgets(userId, currentMonth),
            goalService.getGoals(userId),
            categoryRepository.findAll(),
            accountRepository.findMany(userId),
            expenseRepository.findMany({ page: 1, pageSize: 5 }, userId),
        ]);
        const totalBudgetMinor = budgets.reduce((acc, b) => acc + (b.categoryId === null ? b.amountMinor : 0), 0);
        const overallBudget = budgets.find((b) => b.categoryId === null);
        const remainingBudgetMinor = overallBudget ? overallBudget.remainingMinor : undefined;
        // Check if Gemini API key exists
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const geminiRes = await this.queryGemini({
                    apiKey,
                    userQuery: query,
                    context: {
                        today,
                        currentMonth,
                        prevMonth,
                        balance: balanceSummary,
                        todaySummary,
                        currentMonthSummary,
                        prevMonthSummary,
                        categoryBreakdown,
                        budgets,
                        goals,
                        categories,
                        accounts,
                    },
                });
                if (geminiRes) {
                    return {
                        ...geminiRes,
                        source: 'gemini',
                        metricsSnapshot: {
                            todayExpenseMinor: todaySummary.totalMinor,
                            monthExpenseMinor: currentMonthSummary.totalMinor,
                            availableBalanceMinor: balanceSummary.remainingBalanceMinor,
                            remainingBudgetMinor,
                        },
                    };
                }
            }
            catch (err) {
                console.warn('Gemini Copilot API error, falling back to deterministic engine:', err);
            }
        }
        // 2. Deterministic Financial Copilot Engine
        return this.deterministicAnalysis({
            query,
            today,
            currentMonth,
            prevMonth,
            balanceSummary,
            todaySummary,
            currentMonthSummary,
            prevMonthSummary,
            categoryBreakdown,
            budgets,
            goals,
            categories,
            accounts,
            remainingBudgetMinor,
        });
    }
    deterministicAnalysis(ctx) {
        const q = ctx.query.toLowerCase().trim();
        const formatBDT = (minor) => `৳${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        let answer = '';
        let draftTransaction = null;
        const suggestedPrompts = [
            'How much did I spend today?',
            'What are my biggest spending categories this month?',
            'How much budget remains?',
            'Compare my spending with last month',
            'Suggest a realistic savings plan for my goal',
        ];
        // Check for draft transaction creation: e.g., "spent 450 on food", "bought groceries 350", "received 5000 salary"
        const numberMatches = q.match(/(?:spent|paid|cost|bought|add|record|received|deposit|income)\D*?(\d+(?:\.\d{1,2})?)/i) || q.match(/(\d+(?:\.\d{1,2})?)\s*(?:tk|bdt|taka)?\s*(?:for|on|in)/i);
        const isIncome = /income|received|salary|deposited|earned|got/i.test(q);
        const isExpenseIntent = /spent|paid|bought|cost|expense|lunch|dinner|groceries|coffee|bus|rickshaw|rent/i.test(q);
        if (numberMatches && (isIncome || isExpenseIntent)) {
            const parsedAmount = parseFloat(numberMatches[1]);
            const amountMinor = Math.round(parsedAmount * 100);
            const type = isIncome ? 'income' : 'expense';
            // Match category
            let matchedCategory = ctx.categories[0];
            for (const cat of ctx.categories) {
                if (q.includes(cat.name.toLowerCase())) {
                    matchedCategory = cat;
                    break;
                }
            }
            // Common category keywords
            if (q.includes('food') || q.includes('lunch') || q.includes('dinner') || q.includes('snack') || q.includes('coffee')) {
                matchedCategory = ctx.categories.find((c) => /food|meal|dining|cafe/i.test(c.name)) || matchedCategory;
            }
            else if (q.includes('grocer') || q.includes('bazar')) {
                matchedCategory = ctx.categories.find((c) => /grocer/i.test(c.name)) || matchedCategory;
            }
            else if (q.includes('transport') || q.includes('uber') || q.includes('bus') || q.includes('rickshaw') || q.includes('taxi')) {
                matchedCategory = ctx.categories.find((c) => /transport/i.test(c.name)) || matchedCategory;
            }
            else if (q.includes('salary') || q.includes('freelance') || q.includes('paycheck')) {
                matchedCategory = ctx.categories.find((c) => /income|salary|earn/i.test(c.name)) || matchedCategory;
            }
            const defaultAccount = ctx.accounts.find((a) => a.isDefault) || ctx.accounts[0];
            draftTransaction = {
                type,
                amountMinor,
                amountFormatted: formatBDT(amountMinor),
                categoryId: matchedCategory.id,
                categoryName: matchedCategory.name,
                accountId: defaultAccount?.id,
                accountName: defaultAccount?.name,
                date: ctx.today,
                note: `Via Copilot: ${ctx.query.slice(0, 100)}`,
            };
            answer = `I've prepared a draft **${type.toUpperCase()}** for **${formatBDT(amountMinor)}** under **${matchedCategory.name}** (${defaultAccount?.name || 'Default Account'}). Please review and click **Confirm & Add Transaction** below to save it securely to your account.`;
            return {
                answer,
                source: 'deterministic_copilot',
                draftTransaction,
                suggestedPrompts,
                metricsSnapshot: {
                    todayExpenseMinor: ctx.todaySummary.totalMinor,
                    monthExpenseMinor: ctx.currentMonthSummary.totalMinor,
                    availableBalanceMinor: ctx.balanceSummary.remainingBalanceMinor,
                },
            };
        }
        // 1. "How much did I spend today?"
        if (q.includes('today') && (q.includes('spend') || q.includes('spent') || q.includes('expense') || q.includes('how much'))) {
            const todayTotal = ctx.todaySummary.totalMinor;
            const count = ctx.todaySummary.count;
            const avg = ctx.todaySummary.averageMinor;
            const income = ctx.todaySummary.incomeMinor;
            answer = `Today you have recorded **${count}** expense transaction${count === 1 ? '' : 's'} totaling **${formatBDT(todayTotal)}**.\n\n` +
                `• **Average Expense per Transaction:** ${formatBDT(avg)}\n` +
                (income > 0 ? `• **Today's Income:** ${formatBDT(income)}\n` : '') +
                `• **Current Total Available Balance:** ${ctx.balanceSummary.remainingBalanceMinor !== null ? formatBDT(ctx.balanceSummary.remainingBalanceMinor) : 'Not set yet (tap Edit Balance to set)'}\n\n` +
                (count === 0 ? `You haven't recorded any expenses yet today. Enjoy your day or click Quick Add to log one!` : `Your spending is tracked deterministically based on your verified records.`);
        }
        // 2. "What are my biggest spending categories this month?"
        else if (q.includes('biggest') || q.includes('top') || q.includes('category') || q.includes('categories')) {
            if (ctx.categoryBreakdown.length === 0) {
                answer = `You don't have any expense records categorized for the current month (${ctx.currentMonth}) yet.`;
            }
            else {
                const topCategories = ctx.categoryBreakdown.slice(0, 4);
                answer = `Here are your top spending categories for this month (**${ctx.currentMonth}**):\n\n` +
                    topCategories.map((c, i) => `${i + 1}. **${c.categoryName}**: ${formatBDT(c.totalMinor)} (${c.percentage}% of month total)`).join('\n') +
                    `\n\nTotal monthly spending across all categories is **${formatBDT(ctx.currentMonthSummary.totalMinor)}**.`;
            }
        }
        // 3. "How much budget remains?"
        else if (q.includes('budget') || q.includes('remain')) {
            if (ctx.budgets.length === 0) {
                answer = `You haven't configured a monthly budget for **${ctx.currentMonth}** yet. You can set an overall monthly budget or category-specific budgets in the **Budgets** section.`;
            }
            else {
                const overall = ctx.budgets.find((b) => b.categoryId === null);
                const categoryBudgets = ctx.budgets.filter((b) => b.categoryId !== null);
                let lines = [];
                if (overall) {
                    lines.push(`• **Overall Month Budget:** ${formatBDT(overall.amountMinor)}`);
                    lines.push(`• **Spent So Far:** ${formatBDT(overall.spentMinor)} (${overall.percentageUsed}%)`);
                    lines.push(`• **Remaining Budget:** **${formatBDT(overall.remainingMinor)}** ${overall.isExceeded ? '⚠️ **(EXCEEDED)**' : overall.isWarning ? '⚡ *(Near Threshold)*' : '✅ *(Healthy)*'}`);
                }
                if (categoryBudgets.length > 0) {
                    lines.push('\n**Category Budgets:**');
                    categoryBudgets.forEach((cb) => {
                        lines.push(`- **${cb.categoryName || 'Category'}**: ${formatBDT(cb.spentMinor)} of ${formatBDT(cb.amountMinor)} (${formatBDT(cb.remainingMinor)} remaining)`);
                    });
                }
                answer = lines.join('\n');
            }
        }
        // 4. "Compare my spending with last month"
        else if (q.includes('compare') || q.includes('last month') || q.includes('previous month')) {
            const curSpend = ctx.currentMonthSummary.totalMinor;
            const prevSpend = ctx.prevMonthSummary.totalMinor;
            const diff = curSpend - prevSpend;
            const pct = prevSpend > 0 ? Math.round((Math.abs(diff) / prevSpend) * 100) : 0;
            if (prevSpend === 0) {
                answer = `In this current month (**${ctx.currentMonth}**), your spending is **${formatBDT(curSpend)}**. Last month (**${ctx.prevMonth}**) had no logged expenses for comparison.`;
            }
            else if (diff > 0) {
                answer = `Your spending this month (**${formatBDT(curSpend)}**) is **${formatBDT(diff)} (${pct}%) higher** than last month (**${formatBDT(prevSpend)}**).\n\nConsider reviewing your top discretionary categories to stay within your targets.`;
            }
            else if (diff < 0) {
                answer = `Great financial discipline! Your spending this month (**${formatBDT(curSpend)}**) is **${formatBDT(Math.abs(diff))} (${pct}%) lower** than last month (**${formatBDT(prevSpend)}**).`;
            }
            else {
                answer = `Your spending this month (**${formatBDT(curSpend)}**) is exactly on par with last month (**${formatBDT(prevSpend)}**).`;
            }
        }
        // 5. "Suggest a realistic savings plan for my goal"
        else if (q.includes('goal') || q.includes('saving') || q.includes('savings') || q.includes('plan')) {
            if (ctx.goals.length === 0) {
                answer = `You haven't set up any savings goals yet. Navigate to the **Savings Goals** section to set a target (e.g. Emergency Fund, Travel, Tech Upgrade) and target date!`;
            }
            else {
                const goalList = ctx.goals.map((g) => {
                    return `• **${g.title}**: Saved ${formatBDT(g.currentAmountMinor)} of ${formatBDT(g.targetAmountMinor)} (${g.progressPercent}%).\n  Target Date: **${g.targetDate}**.\n  Suggested Monthly Contribution: **${formatBDT(g.suggestedMonthlyContributionMinor)}/month** to reach on schedule.`;
                }).join('\n\n');
                answer = `Here is your verified savings goal roadmap:\n\n${goalList}\n\n*All projections use verified time horizons without risking emergency liquid cash.*`;
            }
        }
        // Default overview
        else {
            answer = `Hello! I'm your **DailyFlow Finance Copilot**. I analyze your live verified financial records to give you deterministic answers with zero hallucination.\n\n` +
                `• **Available Balance:** ${formatBDT(ctx.balanceSummary.remainingBalanceMinor)}\n` +
                `• **Today's Expenses:** ${formatBDT(ctx.todaySummary.totalMinor)} (${ctx.todaySummary.count} entries)\n` +
                `• **This Month's Total Expenses:** ${formatBDT(ctx.currentMonthSummary.totalMinor)}\n` +
                (ctx.currentMonthSummary.incomeTotalMinor > 0 ? `• **This Month's Total Income:** ${formatBDT(ctx.currentMonthSummary.incomeTotalMinor)}\n` : '') +
                `\nAsk me questions like:\n- *"How much did I spend today?"*\n- *"What are my biggest spending categories?"*\n- *"How much budget remains?"*\n- *"Compare spending with last month"*\n- Or type: *"Spent 350 on Groceries"* to create a draft transaction!`;
        }
        return {
            answer,
            source: 'deterministic_copilot',
            draftTransaction,
            suggestedPrompts,
            metricsSnapshot: {
                todayExpenseMinor: ctx.todaySummary.totalMinor,
                monthExpenseMinor: ctx.currentMonthSummary.totalMinor,
                availableBalanceMinor: ctx.balanceSummary.remainingBalanceMinor,
                remainingBudgetMinor: ctx.remainingBudgetMinor,
            },
        };
    }
    async queryGemini(params) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${params.apiKey}`;
        const systemPrompt = `You are DailyFlow AI Finance Copilot, a strict, deterministic personal finance assistant.
RULES:
1. ONLY use the verified financial data provided below in the context JSON. NEVER fabricate or guess any figures.
2. If data is missing or zero, honestly state that.
3. If the user asks to log, add, or record a transaction (e.g., "Spent 500 on Food", "Received 10000 salary"), formulate a draft transaction in the response schema. NEVER claim the transaction has already been added to the database; it must be confirmed by the user.
4. Currency is BDT (৳). Amounts in minor units (1 BDT = 100 minor units).
5. Output MUST be valid JSON conforming to this schema:
{
  "answer": "Clear, markdown-formatted response text",
  "draftTransaction": null or {
    "type": "expense" | "income",
    "amountMinor": number,
    "amountFormatted": "৳450.00",
    "categoryId": "valid category uuid from context",
    "categoryName": "name",
    "accountId": "valid account uuid or undefined",
    "accountName": "account name",
    "date": "YYYY-MM-DD",
    "note": "brief note"
  },
  "suggestedPrompts": ["string", "string"]
}`;
        const prompt = `Context: ${JSON.stringify(params.context)}\n\nUser Question: ${params.userQuery}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] },
                ],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1,
                },
            }),
        });
        if (!res.ok) {
            console.warn(`Gemini API returned status ${res.status}`);
            return null;
        }
        const data = (await res.json());
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText)
            return null;
        try {
            const parsed = JSON.parse(candidateText);
            return {
                answer: parsed.answer,
                draftTransaction: parsed.draftTransaction || null,
                suggestedPrompts: parsed.suggestedPrompts || [],
            };
        }
        catch {
            return null;
        }
    }
}
export const copilotService = new CopilotService();
