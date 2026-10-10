# DailyFlow — Premium Personal Finance App & AI Copilot (PWA)

[![Live Demo on GitHub Pages](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-0D9488?style=for-the-badge&logo=github)](https://samiulislam56.github.io/Daily-Expense-Track-/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20%7C%20Offline%20Ready-0D9488?style=for-the-badge&logo=pwa)](https://samiulislam56.github.io/Daily-Expense-Track-/)
[![CI Pipeline](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/ci.yml/badge.svg)](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Frontend Stack](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind-teal)](frontend)
[![Backend Stack](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-emerald)](backend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20PGlite-blue)](docs/DATABASE.md)

> **Live Application URL**: [https://samiulislam56.github.io/Daily-Expense-Track-/](https://samiulislam56.github.io/Daily-Expense-Track-/)

**DailyFlow** is a premium, mobile-first fintech personal finance platform equipped with an **AI Finance Copilot**, multi-account liquidity tracking (Cash, Bank, Mobile Wallets like bKash), category and monthly budgets with threshold alerts, milestone-based savings goals, recurring bills management, and visual spending analytics.

---

## 1. Core Architecture & Features

### 🤖 1. AI Finance Copilot
- **Grounded & Deterministic**: All answers are grounded strictly in the user's verified application records and database calculations. Zero hallucination.
- **Conversational Intelligence**: Ask natural questions like:
  - *"How much did I spend today?"*
  - *"What are my biggest spending categories this month?"*
  - *"How much budget remains?"*
  - *"Compare my spending with last month"*
  - *"Suggest a realistic savings plan for my goal"*
- **Natural Language Draft Proposal Cards**: Type *"Spent 450 BDT on Food today"* or *"Received 25000 salary"* to generate a structured draft proposal card.
- **Explicit Confirmation Step**: Transactions are never committed automatically by the AI. An explicit **"Confirm & Add Transaction"** review action is required before records are created.
- **Zero-Failure Architecture**: Works out of the box with the built-in deterministic financial engine; seamlessly connects to Google Gemini Flash when `GEMINI_API_KEY` is present.

### 💳 2. Financial Accounting Correctness
- **Consistent Accounting Model**:
  $$\text{Remaining Balance} = \text{Opening Balance} + \text{Income}_{\ge t} - \text{Expenses}_{\ge t}$$
- **Multi-Account Support**: Manage multiple accounts: Cash in Hand, Bank Accounts, and Mobile Financial Services (bKash, Nagad).
- **Exact Numeric Representation**: Monetary values are stored as integer minor units (`amount_minor BIGINT`) to avoid floating-point inaccuracies (1 BDT = 100 Paisa).
- **Reference Date Balance Setup**: Prevents historical transactions from being double-subtracted.

### 🎯 3. Monthly & Category Budgets
- Set monthly overall spending limits and category-specific budgets.
- Live progress bars indicating spent vs allocated amounts.
- Early warning threshold alerts (e.g. at 80% of budget) and visual exceeded warnings.
- **Clear Financial Education**: Clearly delineates between *Available Balance* (liquid cash) and *Remaining Budget* (monthly spending ceiling).

### 🏆 4. Milestone Savings Goals
- Create custom goals (e.g. Emergency Fund, New Laptop, Vacation) with target amounts and target dates.
- Realistic periodic contribution projections: $(\text{Target} - \text{Current}) \div \text{Months Remaining}$.
- Quick **"Add Contribution"** modal.

### 🔄 5. Recurring Bills & Subscriptions
- Weekly and monthly recurring payment templates (Broadband, Rent, Subscriptions).
- One-click **"Record Payment Now"** action logs a real transaction and automatically advances the next due date forward by one cycle.

### 📅 6. Spending Calendar & Analytics
- **Interactive Calendar Grid**: Visual heat map showing daily expenditure totals. Tap any day to inspect transactions for that date.
- **Expense Trend Graph**: Switch between Daily (14-day), Monthly (12-month), and Yearly views.
- **Category Donut Graph**: Interactive ring breakdown with category percentages.
- **CSV Data Export**: Download transaction history for spreadsheet analysis.

### 📱 7. Mobile-First Progressive Web App (PWA)
- Installable on Android, iOS, tablets, and desktop computers.
- Full offline support with optimistic UI and background mutation replay.
- **Security**: Authenticated backend routes (`/api/v1/*`) use `NetworkOnly` and are never cached in public service worker stores.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, `vite-plugin-pwa`, Workbox, Tailwind CSS, TanStack Query, Framer Motion, Lucide React.
- **Backend**: Node.js v24, Express, TypeScript, Zod, pg, `@electric-sql/pglite` WASM, Vitest, Supertest.
- **Database**: PostgreSQL (Production) with automatic embedded PGlite WASM for instant local testing.

---

## 3. Getting Started

### Prerequisites
- Node.js: v20+ or v24 LTS
- npm: v10+

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/samiulislam56/Daily-Expense-Track-.git
   cd Daily-Expense-Track-
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Run migrations and seed sample demo data
   npm run seed
   # Start backend API (http://localhost:4000)
   npm run dev
   ```

3. **Frontend Setup** *(in a second terminal)*:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Start Vite dev server (http://localhost:5173 with proxy to backend)
   npm run dev
   ```

4. **Environment Variables**:
   In `backend/.env`:
   ```env
   PORT=4000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   DATABASE_URL=memory://dailyflow
   LOG_LEVEL=info

   # Optional: Google Gemini API Key for Copilot enhancement
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## 4. Testing & Verification

Run all test suites across the project:

```bash
# Backend Vitest integration suite (29 tests passing across all suites)
npm --prefix backend test

# Frontend Vitest unit suite (13 tests passing)
npm --prefix frontend test

# Production build verification
npm --prefix backend run build
npm --prefix frontend run build
```

---

## 5. Deployment

### GitHub Pages (Dual Mode)
GitHub Pages automatically deploys the interactive frontend using [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). When accessed via GitHub Pages (`github.io`), the app seamlessly activates its full-featured `mockStorage` adapter, providing 100% interactive support for Multi-Accounts, Budgets, Savings Goals, Recurring Payments, and the AI Copilot.

Live Deployment:  
👉 **[https://samiulislam56.github.io/Daily-Expense-Track-/](https://samiulislam56.github.io/Daily-Expense-Track-/)**

---

## 6. License

This project is licensed under the terms of the [MIT License](LICENSE).
