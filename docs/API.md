# DailyFlow API Documentation

**Base Path**: `/api/v1`  
**Data Format**: JSON (`application/json`)  
**Standard Currency Format**: Minor integer units (e.g., `12500` = `125.00 BDT`)

---

## 1. Endpoints

### Health Check
- **Endpoint**: `GET /health`
- **Description**: Liveness and readiness health check.
- **Success (200 OK)**:
```json
{
  "status": "ok"
}
```

---

### Categories
- **Endpoint**: `GET /api/v1/categories`
- **Description**: Retrieve list of active expense categories.
- **Success (200 OK)**:
```json
{
  "data": [
    {
      "id": "11111111-1111-1111-1111-111111111101",
      "name": "Food & Dining",
      "iconKey": "utensils",
      "colorKey": "amber",
      "isDefault": true,
      "createdAt": "2026-10-10T12:00:00.000Z"
    }
  ]
}
```

---

### Expenses

#### 1. List Expenses with Filtering and Pagination
- **Endpoint**: `GET /api/v1/expenses`
- **Query Parameters**:
  - `from` *(string, optional)*: ISO date filter `YYYY-MM-DD`
  - `to` *(string, optional)*: ISO date filter `YYYY-MM-DD`
  - `categoryId` *(string UUID, optional)*: Filter by category
  - `q` *(string, optional)*: Search in note text
  - `page` *(number, optional, default: 1)*: 1-indexed page
  - `pageSize` *(number, optional, default: 20)*: Page limit (1-100)
- **Success (200 OK)**:
```json
{
  "data": [
    {
      "id": "a9b1c2d3-0000-0000-0000-111122223333",
      "userId": "00000000-0000-0000-0000-000000000001",
      "categoryId": "11111111-1111-1111-1111-111111111101",
      "category": {
        "id": "11111111-1111-1111-1111-111111111101",
        "name": "Food & Dining",
        "iconKey": "utensils",
        "colorKey": "amber"
      },
      "amountMinor": 12500,
      "currencyCode": "BDT",
      "expenseDate": "2026-10-10",
      "note": "Lunch with team",
      "createdAt": "2026-10-10T12:30:00.000Z",
      "updatedAt": "2026-10-10T12:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

#### 2. Create Expense
- **Endpoint**: `POST /api/v1/expenses`
- **Request Body**:
```json
{
  "amountMinor": 12500,
  "currencyCode": "BDT",
  "categoryId": "11111111-1111-1111-1111-111111111101",
  "expenseDate": "2026-10-10",
  "note": "Lunch with team"
}
```
- **Success (201 Created)**:
```json
{
  "data": {
    "id": "a9b1c2d3-0000-0000-0000-111122223333",
    "amountMinor": 12500,
    "currencyCode": "BDT",
    "categoryId": "11111111-1111-1111-1111-111111111101",
    "expenseDate": "2026-10-10",
    "note": "Lunch with team",
    "createdAt": "2026-10-10T12:30:00.000Z",
    "updatedAt": "2026-10-10T12:30:00.000Z"
  }
}
```

#### 3. Get Expense by ID
- **Endpoint**: `GET /api/v1/expenses/:id`
- **Success (200 OK)**:
```json
{
  "data": {
    "id": "a9b1c2d3-0000-0000-0000-111122223333",
    "amountMinor": 12500,
    "currencyCode": "BDT",
    "categoryId": "11111111-1111-1111-1111-111111111101",
    "expenseDate": "2026-10-10",
    "note": "Lunch with team",
    "createdAt": "2026-10-10T12:30:00.000Z",
    "updatedAt": "2026-10-10T12:30:00.000Z"
  }
}
```

#### 4. Update Expense
- **Endpoint**: `PATCH /api/v1/expenses/:id`
- **Request Body** (partial updates permitted):
```json
{
  "amountMinor": 15000,
  "note": "Lunch with team + coffee"
}
```
- **Success (200 OK)**:
```json
{
  "data": {
    "id": "a9b1c2d3-0000-0000-0000-111122223333",
    "amountMinor": 15000,
    "currencyCode": "BDT",
    "categoryId": "11111111-1111-1111-1111-111111111101",
    "expenseDate": "2026-10-10",
    "note": "Lunch with team + coffee",
    "createdAt": "2026-10-10T12:30:00.000Z",
    "updatedAt": "2026-10-10T12:35:00.000Z"
  }
}
```

#### 5. Delete Expense
- **Endpoint**: `DELETE /api/v1/expenses/:id`
- **Success (204 No Content)**

---

### Summaries

#### 1. Daily Summary
- **Endpoint**: `GET /api/v1/summary/daily?date=YYYY-MM-DD`
- **Success (200 OK)**:
```json
{
  "data": {
    "date": "2026-10-10",
    "totalMinor": 12500,
    "count": 1
  }
}
```

#### 2. Monthly Summary
- **Endpoint**: `GET /api/v1/summary/monthly?month=YYYY-MM`
- **Success (200 OK)**:
```json
{
  "data": {
    "month": "2026-10",
    "totalMinor": 12500,
    "count": 1
  }
}
```

#### 3. Category Breakdown
- **Endpoint**: `GET /api/v1/summary/categories?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **Success (200 OK)**:
```json
{
  "data": [
    {
      "categoryId": "11111111-1111-1111-1111-111111111101",
      "categoryName": "Food & Dining",
      "iconKey": "utensils",
      "colorKey": "amber",
      "totalMinor": 12500,
      "count": 1,
      "percentage": 100.0
    }
  ]
}
```

---

## 2. Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted fields.",
    "details": [
      {
        "field": "amountMinor",
        "message": "Must be greater than zero."
      }
    ]
  }
}
```

Standard Error Codes:
- `VALIDATION_ERROR` (400)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `INTERNAL_SERVER_ERROR` (500)
