# Susi Air Pilot App

Fullstack mobile-first pilot management app for schedules, flight hours, duty
limits, and pilot documents.

## 1. Tech Stack

- **Frontend:** Nuxt 3, Vue 3 Composition API, TypeScript, Pinia, SCSS
- **Charts:** Chart.js with `vue-chartjs`
- **Icons:** Lucide Vue Next
- **Backend:** NestJS, Node.js, TypeScript
- **Data source saat ini:** JSON files loaded when the API starts
- **Database preparation:** PostgreSQL with Prisma schema and seed script
- **Authentication:** Custom HTTP-only cookie session
- **Security:** Helmet, CORS, rate limiting, input validation, account lockout
- **Runtime option:** Docker Compose for Nuxt, NestJS API, and PostgreSQL

## 2. Run Locally

### Prerequisites

- Git
- Node.js 20+
- npm
- PostgreSQL is optional for JSON mode

### Clone repository

```bash
git clone <REPOSITORY_URL>
cd susi-air-pilot-app
```

### Start backend

Open Terminal 1:

```bash
cd nest
npm install
cp .env.example .env
PORT=3001 npm run start:dev
```

The API runs at `http://localhost:3001` when `PORT=3001` is set in `.env`.
If using the default port, it runs at `http://localhost:3000`.

### Start frontend

Open Terminal 2:

```bash
cd nuxt
npm install
cp .env.example .env
npm run dev -- --port 3000
```

Open `http://localhost:3000`.

The frontend API URL is configured in `nuxt/.env`:

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

### Demo login

| Username | Password |
|----------|----------|
| `johndoe` | `susiairtest` |

## 3. Environment Variables

### Backend: `nest/.env`

| Variable | Purpose |
|----------|---------|
| `PORT` | API port, normally `3001` for local development |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `SESSION_SECRET` | Secret used to create session tokens |
| `SESSION_MAX_AGE` | Session lifetime in milliseconds |
| `CORS_ORIGIN` | Allowed frontend origin |
| `MAX_LOGIN_ATTEMPTS` | Failed login limit |
| `LOGIN_LOCKOUT_DURATION` | Lockout duration in seconds |
| `TZ` | Application timezone |

### Frontend: `nuxt/.env`

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

## 4. Run With Docker

Docker is already prepared with one root compose file:

```text
docker-compose.yml
```

It starts three services:

- `postgres`: PostgreSQL database
- `api`: NestJS API
- `app`: Nuxt production app

### Start all services

From the repository root:

```bash
docker compose up -d --build
```

Open:

- App: `http://localhost:3000`
- API: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

### View logs

```bash
docker compose logs -f api
docker compose logs -f app
```

### Stop services

```bash
docker compose down
```

The PostgreSQL volume is preserved. To remove the database volume too:

```bash
docker compose down -v
```

### Why Docker is useful for deployment

- The same Node.js versions and dependencies run in every environment.
- API, frontend, and database networking is configured consistently.
- PostgreSQL is available through the service name `postgres`.
- Health checks control service startup order.
- The app can be rebuilt and deployed without manually installing Node.js.
- Environment configuration is separated from the application source code.

## 5. PostgreSQL, Prisma, and Seeder

The PostgreSQL and Prisma setup is ready for future database usage.

On Docker API startup, the entrypoint automatically runs:

```bash
prisma db push
npm run db:seed
```

The seed is idempotent. If the initial user already exists, it skips the seed
to avoid duplicate records.

To run the database setup manually:

```bash
cd nest
npm run db:generate
npm run db:push
npm run db:seed
```

### Current data source

The API currently reads these files at startup:

- `nest/data/mock-pilots.json`
- `nest/data/mock-flight-hours.json`
- `nest/data/mock-documents.json`
- `nest/data/mock-schedules.json`

Therefore, seeding PostgreSQL does not yet change the API response data.

### What must change to read from PostgreSQL

The service layer must be changed from `DataLoaderService` to `PrismaService`.
The main areas are:

1. Replace JSON reads in `AuthService` with Prisma user queries.
2. Replace `PilotService` reads with `prisma.user` queries.
3. Replace `FlightHoursService` reads with `prisma.flightHours` queries.
4. Replace `DocumentsService` reads with `prisma.document` queries.
5. Replace `SchedulesService` reads with `prisma.schedule` queries.
6. Add user/session persistence if sessions must survive API restarts.
7. Add Prisma migrations for production instead of relying only on `db push`.

The frontend API contract can remain unchanged while these backend services are
switched from JSON to Prisma.

## 6. API and Security

### Main API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/auth/login` | Validate credentials and create a session |
| `POST` | `/auth/logout` | Destroy the current session |
| `GET` | `/auth/session` | Check the current session |
| `GET` | `/pilot/me` | Return the logged-in pilot profile |
| `GET` | `/flight-hours` | Return daily flight hours for a date range |
| `GET` | `/flight-hours/summary` | Return server-calculated rolling sums |
| `GET` | `/documents` | Return documents and expiry status |
| `GET` | `/schedules` | Return schedules for a selected month |

### Security flow

1. The frontend sends username and password to `/auth/login`.
2. NestJS validates the input and credentials.
3. The backend creates a server-side session and sends an HTTP-only
	`susi_session` cookie.
4. The browser automatically sends the cookie with later API requests.
5. `SessionGuard` validates the cookie before protected endpoints execute.
6. Helmet adds security headers and CORS limits browser origins.
7. Failed logins are rate-limited and can temporarily lock the account.

The current code uses a custom NestJS cookie session. The
cookie approach prevents JavaScript from reading the session token and is a
good fit for a browser-based first-party app. For multiple API instances, the
in-memory session store should be replaced with Redis or a database-backed
session store.

## 7. Rolling Sum Decisions

The rolling sum is calculated on the backend in `FlightHoursService.rollingWindow()`.
The frontend only renders the returned series.

### Window before the earliest dataset date

If a rolling window starts before the first available record, dates without a
record contribute `0`. Existing records inside the window are still included.
This keeps the window length correct without inventing flight hours.

### Future dates

The chart shows seven days before today, today, and seven days after today.
Today is fixed to `15 May 2026` for consistent evaluation. Future dates reuse
the latest known rolling sum from today because there is no actual future flight
data. This creates a stable forecast-like continuation rather than returning
missing values.

### Values above the limit

The API returns the real rolling sum even when it exceeds the limit. The chart
automatically expands its Y-axis above the configured maximum so the value and
the red limit line remain visible.

## 8. Future Improvements

With more time, I would add:


- Add loading states and skeletons
- Push and in-app notifications for document expiry and duty limits.
- Full logbook duty entry and completion workflow.
- Offline mode with local changes synchronized when connectivity returns.
- PostgreSQL as the primary data source instead of JSON.
- Redis or database-backed sessions for multi-instance deployment.
- Production Prisma migrations and a CI/CD deployment pipeline.


