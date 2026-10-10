# DailyFlow — Personal Daily Expense Management Software (PWA)

[![Live Demo on GitHub Pages](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-0D9488?style=for-the-badge&logo=github)](https://samiulislam56.github.io/Daily-Expense-Track-/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20%7C%20Offline%20Ready-0D9488?style=for-the-badge&logo=pwa)](https://samiulislam56.github.io/Daily-Expense-Track-/)
[![CI Pipeline](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/ci.yml/badge.svg)](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/ci.yml)
[![GitHub Pages Deploy](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/deploy.yml/badge.svg)](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Frontend Stack](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind-teal)](frontend)
[![Backend Stack](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-emerald)](backend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20PGlite-blue)](docs/DATABASE.md)

> **Live Application**: [https://samiulislam56.github.io/Daily-Expense-Track-/](https://samiulislam56.github.io/Daily-Expense-Track-/)

**DailyFlow** is a modern, high-precision personal expense management progressive web application (PWA) designed to help individuals record everyday spending quickly, understand where money goes with interactive Daily, Monthly, Yearly, and Category graphs, review expenses by date, and perform calculations without leaving the app.

---

## 1. Key Features

- **Interactive Expense Graphs**:
  - **Trend Analysis Graph**: Switch between **Daily** (14-day spending trajectory), **Monthly** (annual 12-month comparison), and **Yearly** views with interactive SVG bars, gradient fills, and tooltips showing exact amounts, counts, and percentages.
  - **Category Distribution Graph**: Sleek SVG Donut/Ring graph with center hover statistics, category share percentages, and individual breakdown cards.
- **Installable Progressive Web App (PWA)**:
  - Installable on Android phones, iPhones/iPads, tablets, and desktop computers (Chrome, Edge, Safari, Brave).
  - Standalone display mode with custom app icons, splash theme, and iOS launch metadata.
  - Service worker precaching of application shell, fonts, and assets with automatic background update detection.
  - **Zero Security Risk**: Private API endpoints (`/api/v1/*`) are strictly excluded from service worker caching (`NetworkOnly`).
- **Offline Entry & Synchronization Strategy**:
  - Deliberate offline mutation queue (`dailyflow_offline_queue`) with client UUID idempotency keys and duplicate prevention.
  - Offline mutations are stored locally and automatically replayed to the database once connection resumes.
  - Live connectivity indicator pill (`Online • Synced`, `Offline • X pending`, `Syncing...`).
- **Mobile-First UI & Responsive Design**:
  - Compact thumb-friendly bottom navigation bar on mobile devices (`< 768px`) with quick-action center Add button.
  - Desktop magnification dock on larger screens with keyboard navigation (`Tab`/`Enter`).
  - Full touch target compliance (minimum 44×44px hit areas) and safe-area support (`env(safe-area-inset-bottom)`).
- **Four Redesigned Dashboard Summary Cards**:
  1. **Total Available Balance**: Manually enter and update your available money in BDT with an inline modal editor.
  2. **Remaining Balance**: Accurately computes remaining funds (`Available Balance − Expenses since Reference Date`). Dynamically turns red if overspent.
  3. **Today's Average Expense**: Real-time average per transaction for the selected date (`Day Total ÷ Transaction Count`). Gracefully displays `৳0.00` and `0 transactions` when no expenses exist.
  4. **Total Expense**: Live aggregated expense amount for the selected date.
- **Pristine Financial Data Integrity**: Money stored exclusively as integer minor currency units (`amount_minor BIGINT`) to completely prevent floating-point rounding errors (1 BDT = 100 Paisa).
- **In-App Calculator with Direct Transfer**: Full keyboard operability and a one-click button to transfer calculated results directly into the expense entry form.
- **Theme Preference System**: System, light, and dark modes with persistent local storage.

---

## 2. PWA Installation Guide

DailyFlow is a production-ready Progressive Web App that runs standalone without an app store:

### 📱 Android (Chrome / Edge / Samsung Internet)
1. Open [https://samiulislam56.github.io/Daily-Expense-Track-/](https://samiulislam56.github.io/Daily-Expense-Track-/) in Chrome or Edge.
2. Tap the **"Install App"** button in the header or tap browser menu (⋮) → **"Install app"** / **"Add to Home screen"**.
3. Confirm installation. The DailyFlow app icon will appear on your Home Screen and app drawer with a full native experience.

### 🍏 iPhone & iPad (Safari)
1. Open [https://samiulislam56.github.io/Daily-Expense-Track-/](https://samiulislam56.github.io/Daily-Expense-Track-/) in Safari.
2. Tap the **Share** icon (square with arrow pointing up) at the bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top-right corner. The app will launch in full standalone mode with no browser URL bar.

### 💻 Desktop (Chrome / Edge / Brave / macOS / Windows / Linux)
1. Open [https://samiulislam56.github.io/Daily-Expense-Track-/](https://samiulislam56.github.io/Daily-Expense-Track-/).
2. Click the **"Install App"** button in the header or the install icon in your browser's address bar.
3. DailyFlow will open in its own clean desktop window with native OS dock/taskbar integration.

---

## 3. Technology Stack & High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                       Frontend                         │
│  React 19 + TypeScript + Vite + VitePWA + Tailwind     │
│  TanStack Query + Framer Motion + Lucide React         │
│  Service Worker (Workbox) + Offline Mutation Queue     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS REST API (/api/v1)
┌───────────────────────────▼────────────────────────────┐
│                       Backend                          │
│  Node.js + Express + TypeScript                        │
│  Zod Schema Validation + Structured Logging            │
└───────────────────────────┬────────────────────────────┘
                            │ SQL Queries / Migrations
┌───────────────────────────▼────────────────────────────┐
│                       Database                         │
│  PostgreSQL (Production) / PGlite WASM (Local Zero-0)  │
│  Strict Foreign Keys, Indexes & DATE Constraints       │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite, `vite-plugin-pwa`, Workbox, Tailwind CSS, TanStack Query, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, TypeScript, Zod, pg, Supertest, Vitest.
- **Database**: PostgreSQL (with embedded `@electric-sql/pglite` WASM fallback for instant 0-configuration local setup).

---

## 4. Getting Started

### Prerequisites
- **Node.js**: v20+ or v24 LTS
- **npm**: v10+
- **PostgreSQL** *(optional for local testing; DailyFlow automatically uses embedded PostgreSQL if no `DATABASE_URL` is set)*

### Setup Commands

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
   # Run migrations and seed default categories & demo data
   npm run seed
   # Start backend API server (runs on http://localhost:4000)
   npm run dev
   ```

3. **Frontend Setup** *(in a separate terminal)*:
   ```bash
   cd frontend
   npm install
   # Start Vite dev server (runs on http://localhost:5173 with proxy to backend)
   npm run dev
   ```

---

## 5. Testing & CI Pipeline

Run all test suites across the project:

```bash
# Run backend Vitest integration suite (22 tests passing)
npm --prefix backend test

# Run frontend Vitest unit suite (6 tests passing)
npm --prefix frontend test
```

---

## 6. Deployment to GitHub Pages

GitHub Pages automatically builds and deploys the frontend via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on push to `main`.

Live Deployment:  
👉 **[https://samiulislam56.github.io/Daily-Expense-Track-/](https://samiulislam56.github.io/Daily-Expense-Track-/)**

---

## 7. License

This project is licensed under the terms of the [MIT License](LICENSE).
