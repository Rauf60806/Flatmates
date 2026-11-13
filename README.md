# Flatmates 🏠

> A mobile-first shared expense tracker for flatmates. Split group costs down to the exact paise, track who owes what, and settle up — all in one clean Progressive Web App.

---

## Table of Contents

1. [Quick Start (Local Development)](#quick-start)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Project Structure](#project-structure)
5. [Financial Logic Explained](#financial-logic)
6. [API Reference](#api-reference)
7. [Deploying to Render](#deploying-to-render)
8. [Running Tests](#running-tests)

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd Flatmates

# 2. Copy environment variables
cp .env.example .env
# → Edit .env with your PostgreSQL DATABASE_URL and secrets

# 3. Install all dependencies (monorepo root)
npm install

# 4. Run Prisma migration and seed demo data
npx prisma migrate dev --schema server/prisma/schema.prisma --name init
npm --prefix server run prisma:seed

# 5. Start development servers (client + server concurrently)
npm run dev
```

The API server starts on `http://localhost:5000` and the Vite client dev server on `http://localhost:5173`.

---

## Environment Variables

| Variable         | Description                                       | Example                                            |
|------------------|---------------------------------------------------|----------------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string                      | `postgresql://user:pass@localhost:5432/flatmates`  |
| `JWT_SECRET`     | Secret for signing JWT tokens (min 16 chars)      | `a-very-secret-key-for-jwt-signing`                |
| `ADMIN_EMAIL`    | Email for the initial admin account               | `admin@flatmates.local`                            |
| `ADMIN_PASSWORD` | Temporary password for the auto-created admin     | `AdminTemporaryPassword123!`                       |
| `CLIENT_ORIGIN`  | CORS allowed origin for the frontend client       | `http://localhost:5173`                            |
| `NODE_ENV`       | `development` or `production`                     | `development`                                      |
| `PORT`           | Port the Express server listens on                | `5000`                                             |

---

## Database Setup

```bash
# Create and apply migrations
npx prisma migrate dev --schema server/prisma/schema.prisma

# Seed realistic demo data (4 flatmates + expenses)
npm --prefix server run prisma:seed

# View database in Prisma Studio
npx prisma studio --schema server/prisma/schema.prisma
```

---

## Project Structure

```
Flatmates/
├── server/              # Express API, Prisma ORM, TypeScript
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/      # Zod-validated env + admin seeder
│       ├── middleware/  # auth, validate, error handler
│       ├── routes/      # API routes (auth, items, balances, stats)
│       ├── services/    # split.service, balance.service, stats.service
│       └── tests/       # Vitest unit tests
└── client/              # React 18 + Vite + Tailwind CSS
    └── src/
        ├── components/  # Layout, UI, Charts, Items, Flatmates
        ├── context/     # AuthContext (cookie-based session)
        ├── pages/       # Login, Home, AddItem, Flatmates, Stats, Admin
        └── utils/       # Currency formatting, date helpers
```

---

## Financial Logic

### Why integers?

All monetary values are stored in **minor units (paise/cents)** as `INT` in PostgreSQL. This eliminates all floating-point rounding errors.

```
₹150.50 → stored as 15050
```

### Group Split Algorithm

For a group item of total **T** among **N** active flatmates:

```
Base share = floor(T / N)
Remainder  = T % N
Payer share = Base share + Remainder
Others share = Base share
```

This guarantees that `sum(all shares) === T` exactly, with any odd paise absorbed by the payer.

### Pairwise Balance Calculation

For users A (you) and B:
```
Net = (B's share from A-paid items) - (A's share from B-paid items)
      + (settlements A sent to B) - (settlements B sent to A)

Net > 0  → B owes you   (shown in green)
Net < 0  → You owe B    (shown in red)
Net == 0 → Settled       (shown in grey)
```

---

## API Reference

| Method | Path                      | Auth        | Description                                |
|--------|---------------------------|-------------|--------------------------------------------|
| GET    | `/api/health`             | Public      | Healthcheck                                |
| POST   | `/api/auth/login`         | Rate-limited| Login, sets httpOnly JWT cookie            |
| POST   | `/api/auth/logout`        | Public      | Clear auth cookie                          |
| GET    | `/api/auth/me`            | Auth        | Current user profile                       |
| POST   | `/api/auth/change-password` | Auth      | Update own password                        |
| GET    | `/api/admin`              | Admin only  | List all users                             |
| POST   | `/api/admin`              | Admin only  | Create user                                |
| PATCH  | `/api/admin/:id`          | Admin only  | Toggle active / reset password             |
| POST   | `/api/items`              | Auth        | Create expense item (auto-splits if group) |
| GET    | `/api/items`              | Auth        | Paginated item list                        |
| GET    | `/api/items/suggestions`  | Auth        | Autocomplete suggestions with last price   |
| GET    | `/api/balances`           | Auth        | Pairwise net balances                      |
| POST   | `/api/settlements`        | Auth        | Record a manual settlement                 |
| GET    | `/api/summary?period=`    | Auth        | Daily spend summary (week or month)        |
| GET    | `/api/stats`              | Auth        | Monthly comparison + analytics             |

---

## Running Tests

```bash
npm test
# or
npm --prefix server test
```

11 unit tests covering:
- Even group splits
- Remainder absorption by payer
- 3-way and 4-way balance scenarios
- Settlement factoring
- Edge cases (1-person, missing payer, invalid amounts)

---

## Deploying to Render

1. Push repository to GitHub.
2. In Render dashboard, click **"New Blueprint"** and point to your repository.
3. Render reads `render.yaml` and automatically creates:
   - A **managed PostgreSQL** database
   - A **Docker web service** with auto-wired `DATABASE_URL`
4. Set `ADMIN_EMAIL` and optionally `ADMIN_PASSWORD` in Render's environment settings.
5. On first deploy, the server auto-creates the admin account.

> The Docker entrypoint automatically runs `prisma migrate deploy` before starting the server on each deploy.

---

## Deploying to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and initialize
railway login
railway init

# Add PostgreSQL plugin in Railway dashboard
# Then set environment variables

# Deploy
railway up
```

Set `DATABASE_URL` from Railway's provided PostgreSQL internal URL.

---

## Default Demo Accounts (after `prisma:seed`)

| Name         | Email                     | Password       | Role   |
|--------------|---------------------------|----------------|--------|
| Alex Rivera  | alex@flatmates.local      | Password123!   | admin  |
| Sam Chen     | sam@flatmates.local       | Password123!   | member |
| Jordan Lee   | jordan@flatmates.local    | Password123!   | member |
| Taylor Swift | taylor@flatmates.local    | Password123!   | member |
