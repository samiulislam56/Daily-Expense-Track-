# DAILYFLOW
## Personal Daily Expense Management Software
### Software Requirements Specification (SRS)
**Version 1.0 | 10 October 2026**

---

### Document Overview
- **Document purpose**: Define product scope, requirements, architecture, data model, API contract, user experience, quality standards, and delivery plan for DailyFlow.
- **Product type**: Responsive web application with persistent expense storage and a separate backend API.
- **Primary audience**: Product owner, UI/UX designer, frontend developer, backend developer, tester, and future maintainers.
- **Document status**: Baseline proposal. Requirements confirmed for implementation; hosting providers and deployment secrets are environment-specific.

---

### 1. Introduction
#### 1.1 Purpose
This SRS defines the requirements for DailyFlow, a personal expense management web application. It guides design, implementation, testing, deployment, and maintenance to ensure delivered software complies with all technical and design principles.

#### 1.2 Product Vision
Help a person record everyday spending quickly, understand where money goes, review expenses by date, and perform simple calculations without leaving the app. The product feels calm, precise, approachable, and trustworthy—not like a generic admin template.

#### 1.3 Terms
- **SRS**: Software Requirements Specification
- **CRUD**: Create, read, update, delete
- **API**: Application Programming Interface
- **UTC**: Coordinated Universal Time; timestamps are stored consistently
- **Minor currency unit**: The smallest currency unit (e.g., paisa/cents); integer storage avoids floating-point rounding
- **Responsive**: Layout adapts to mobile, tablet, and desktop
- **WCAG**: Web Content Accessibility Guidelines

---

### 2. Product Overview and Scope
#### 2.1 Core Capabilities
- Record an expense with amount, category, date, and optional note.
- Persist records in a database and retrieve them after reload or sign-in.
- Browse, filter, and group expenses by date; calculate totals automatically.
- Edit and delete entries with clear confirmation and feedback.
- Use an in-app calculator, including keyboard input and value transfer.
- View daily, weekly, monthly, and category-level spending summaries.
- Use a responsive interface with theme options and accessible motion.
- Deploy the frontend on GitHub Pages if desired, while hosting the API and database separately.

#### 2.2 In Scope for Version 1.0
- Single-user personal tracking experience with user ownership data model.
- Expense CRUD, date filters, daily totals, monthly summary, category breakdown, calculator, theme, responsive navigation, export-ready architecture, and documentation.
- Backend validation, database migrations, seed/demo data, automated tests, CI checks, and static frontend deployment workflow.

#### 2.3 Out of Scope for Version 1.0
- Bank account linking, automated bank transaction imports, payment processing, multi-currency live conversions, receipt OCR, shared household budgets, native mobile applications.

---

### 3. Users and Operating Environment
- **Frontend**: Modern evergreen browsers: Chrome, Edge, Firefox, Safari. Mobile, tablet, desktop.
- **Frontend Stack**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React.
- **Data Fetching**: TanStack Query / React Query cache layer.
- **Backend Stack**: Node.js with TypeScript and Express.
- **Validation**: Zod schemas at API boundaries.
- **Database**: PostgreSQL with migrations and indexed queries.

---

### 4. Functional Requirements
- **FR-01: Add expense**: amount, category, date, optional note. Valid submission is stored and appears in the selected date list.
- **FR-02: Daily total**: automatically sum expenses for a date. Total equals the sum of all visible eligible expense amounts for that date.
- **FR-03: Date-wise history and filtering**: navigate dates and see entries grouped or filtered by date.
- **FR-04: Edit an expense**: Changes persist and totals refresh correctly.
- **FR-05: Delete an expense with confirmation**: Confirmed deletion removes entry and recalculates totals.
- **FR-06: Built-in calculator**: Basic arithmetic (+, -, *, /), clear, backspace, keyboard use, safe error states, and transfer to expense amount.
- **FR-07: Dashboard overview**: selected-day total, current-month total, transaction count, recent entries.
- **FR-08: Category analytics**: category totals and simple weekly/monthly trend.
- **FR-09: Search and filters**: filter by date range, category, and note text.
- **FR-10: Theme preference**: Light, dark, and system themes with readable contrast.
- **FR-11: Responsive navigation**: Desktop and compact mobile navigation remain usable from 320px up.
- **FR-12: Export expenses**: Download filtered entries as CSV.
- **FR-13: Loading, empty, success, and error states**: Meaningful feedback for all asynchronous operations.
- **FR-14: Scroll journey line**: Decorative SVG line progress tracks page/section scroll and respects reduced motion.
- **FR-15: MagnificationDock navigation**: Dock magnifies items on pointer hover and remains accessible by keyboard/touch alternatives.
