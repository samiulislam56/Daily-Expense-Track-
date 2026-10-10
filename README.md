# DailyFlow — Personal Daily Expense Management Software

[![Live Demo on GitHub Pages](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-0D9488?style=for-the-badge&logo=github)](https://samiulislam56.github.io/Daily-Expense-Track-/)
[![CI Pipeline](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/ci.yml/badge.svg)](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/ci.yml)
[![GitHub Pages Deploy](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/deploy.yml/badge.svg)](https://github.com/samiulislam56/Daily-Expense-Track-/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Frontend Stack](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind-teal)](frontend)
[![Backend Stack](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-emerald)](backend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20PGlite-blue)](docs/DATABASE.md)

> **Live Application**: [https://samiulislam56.github.io/Daily-Expense-Track-/](https://samiulislam56.github.io/Daily-Expense-Track-/)

**DailyFlow** is a modern, high-precision personal expense management web application designed to help individuals record everyday spending quickly, understand where money goes, review expenses by date, and perform calculations without leaving the app.

---

## 1. Key Features

- **Four Redesigned Dashboard Summary Cards**:
  1. **Total Available Balance**: Manually enter and update your available money in BDT with an inline modal editor. Automatically stores reference date and currency.
  2. **Remaining Balance**: Accurately computes remaining funds (`Available Balance − Expenses since Reference Date`). Dynamically turns red if overspent with warning indicators.
  3. **Today's Average Expense**: Real-time average per transaction for the selected date (`Day Total ÷ Transaction Count`). Gracefully displays `৳0.00` and `0 transactions` when no expenses exist.
  4. **Total Expense**: Live aggregated expense amount for the selected date and month.
- **Pristine Financial Data Integrity**: Money stored exclusively as integer minor currency units (`amount_minor BIGINT`) to completely prevent floating-point rounding errors (1 BDT = 100 Paisa).
- **Date-Wise Expense Tracking & Filters**: Add, edit, and delete daily entries with instant recalculation of summary cards.
- **Direct Expense Deletion**: Clean confirmation dialog and atomic deletion with no UUID regex rejections or stale UI state.
- **In-App Calculator with Direct Transfer**: Full keyboard operability, error-safe evaluation, and a one-click button to transfer calculated results directly into the expense entry form.
- **MagnificationDock Navigation**: Smooth magnification dock inspired by desktop workflows, with keyboard accessibility (`Tab`/`Enter`), visible focus rings, and mobile touch alternatives.
- **Scroll-Driven SVG Journey Line**: Visual progress line tracing user scroll through history and overview sections with full `prefers-reduced-motion` compliance.
- **Spending Analytics & Categorization**: Real-time category breakdown bars with exact values, percentages, and transaction volume.
- **Search, Filtering & CSV Export**: Search notes, filter by category or date ranges, and export records as CSV files.
- **Dual-Mode Engine (Zero-Config Demo + Full Stack PostgreSQL)**: Fully interactive on static GitHub Pages with persistent `localStorage` fallback, and automatically switches to the PostgreSQL REST backend when running locally or connected to a remote API.
- **Theme Preference System**: System, light, and dark modes with persistent local storage.

---

## 2. Technology Stack & High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                       Frontend                         │
│  React 19 + TypeScript + Vite + Tailwind CSS           │
│  TanStack Query + Framer Motion + Lucide React         │
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

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, TypeScript, Zod, pg, Supertest, Vitest.
- **Database**: PostgreSQL (with embedded `@electric-sql/pglite` WASM fallback for instant 0-configuration local setup).

---

## 3. Getting Started

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

## 4. Environment Variables

See [`.env.example`](.env.example) for placeholder definitions.

| Variable | Target | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Backend | PostgreSQL connection string (or `memory://dailyflow` for embedded mode) |
| `PORT` | Backend | HTTP port (default: `4000`) |
| `NODE_ENV` | Backend | `development`, `production`, or `test` |
| `CORS_ORIGIN` | Backend | Permitted origins (e.g. `http://localhost:5173`) |
| `LOG_LEVEL` | Backend | Structured logging verbosity (`info`, `debug`, `silent`) |
| `VITE_API_BASE_URL` | Frontend build | Public API endpoint for static deployments (optional) |

---

## 5. API Endpoints Overview

All endpoints live under `/api/v1` (except `/health`):

| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health status | `200` |
| `GET` | `/api/v1/categories` | List available categories | `200` |
| `POST` | `/api/v1/expenses` | Create a new expense | `201` |
| `GET` | `/api/v1/expenses` | List expenses (query: `from`, `to`, `categoryId`, `q`, `page`, `pageSize`) | `200` |
| `GET` | `/api/v1/expenses/:id` | Get single expense | `200` |
| `PATCH`| `/api/v1/expenses/:id` | Update expense permitted fields | `200` |
| `DELETE`|`/api/v1/expenses/:id` | Delete expense | `204` |
| `GET` | `/api/v1/balance` | Get available balance & remaining balance | `200` |
| `PUT` | `/api/v1/balance` | Set or update available balance in minor units | `200` |
| `GET` | `/api/v1/summary/daily`| Daily sum & count (`?date=YYYY-MM-DD`) | `200` |
| `GET` | `/api/v1/summary/monthly`| Monthly sum & count (`?month=YYYY-MM`) | `200` |
| `GET` | `/api/v1/summary/categories`| Category sums & percentages (`?from=&to=`) | `200` |

---

## 6. Testing & CI Pipeline

Run all test suites across the project:

```bash
# Run backend Vitest integration suite (22 tests passing)
npm --prefix backend test

# Run frontend Vitest unit suite (6 tests passing)
npm --prefix frontend test
```

Continuous integration is handled by [`.github/workflows/ci.yml`](.github/workflows/ci.yml) which validates linting, TypeScript typing, test suites, and production builds on push/PR to `main`.

---

## 7. Deployment to GitHub Pages

GitHub Pages automatically builds and deploys the frontend via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on push to `main`.

To enable GitHub Pages in your GitHub repository:
1. Navigate to your repository on GitHub: `https://github.com/samiulislam56/Daily-Expense-Track-`
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. The GitHub Actions workflow will automatically run and publish the live site at:  
   👉 **[https://samiulislam56.github.io/Daily-Expense-Track-/](https://samiulislam56.github.io/Daily-Expense-Track-/)**

---

## 8. Documentation

- [Software Requirements Specification (SRS v1.0)](docs/SRS.md)
- [REST API Contract Documentation](docs/API.md)
- [Database Schema & Migrations Guide](docs/DATABASE.md)

---

## 9. License

This project is licensed under the terms of the [MIT License](LICENSE).
