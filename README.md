# PeopleOps

Employee and salary management application built for the Incubyte engineering assessment.

## Features

- Employee CRUD: create, view, update, and delete records.
- Search employees by name or email, filter by country and job title, and paginate results.
- View employee count, minimum, maximum, and average salary by country.
- View average salary and employee count by job title within a country.
- Seed the database with 10,000 synthetic employees.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend:** Node.js, Express, TypeScript, Zod
- **Database:** PostgreSQL, Prisma ORM 8

## Prerequisites

- Node.js and npm
- PostgreSQL 15 or newer

## Setup and Run

### 1. Install dependencies

From the repository root:

```bash
npm --prefix server install
npm --prefix client install
```

### 2. Configure environment variables

Create `server/.env` using `server/.env.example` and configure your PostgreSQL connection:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/peopleops"
CLIENT_URL="http://localhost:5173"
PORT="3000"
```

Set `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Create the PostgreSQL database before initializing the schema.

### 3. Initialize the database and seed data

```bash
cd server
npm run contract:emit
npx prisma db init
npm run seed
npm run dev
```

The seed script creates 10,000 synthetic employee records in batches. It aborts if employee records already exist.

### 4. Start the frontend

In a separate terminal, from the repository root:

```bash
cd client
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Tests

Run unit tests and type checks:

```bash
npm --prefix server test
npm --prefix client test
npm --prefix server run typecheck
npm --prefix client run typecheck
npm --prefix client run build
```

Backend integration tests require a separate PostgreSQL test database. Configure `server/.env.test` with its `DATABASE_URL` and initialize the test schema before running:

```bash
npm --prefix server run test:integration
```

Generate coverage reports:

```bash
npm --prefix server run test:coverage
npm --prefix client run test:coverage
```

## Assumptions and Trade-offs

- Supported countries and job titles are fixed lists. Currency is derived from the employee's country.
- Salary analytics are calculated for one country at a time. Salaries across different currencies are not directly compared.
- Employee deletion uses soft deletion. Deleted employees are excluded from active listings and salary analytics.
- Salary analytics use database aggregations on request instead of a separately maintained summary table. This avoids synchronization complexity and keeps results current for the assessment's dataset.
- Search uses case-insensitive substring matching on employee names and email addresses.
- The seed data is synthetic and intended for development and demonstration, not real HR use.

## Out of Scope and Trade-offs

- **Authentication & RBAC:** Excluded to prioritize the assessment's core employee management and salary analytics workflows.
- **Payroll, Attendance, Leave & Recruitment:** Excluded because these require separate business workflows beyond the stated requirements.
- **Precomputed Analytics:** Salary statistics are calculated directly from database aggregations to keep results current without introducing summary synchronization logic.
- **Advanced Search Optimization:** Deferred because the assessment dataset is limited to 10,000 employees; optimization should follow measured performance results.

The implementation prioritizes working end-to-end flows, meaningful automated tests, and maintainable code over additional features outside the assessment scope.
