# Susi Air Pilot API

NestJS backend for the Susi Air Pilot App with comprehensive security features.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker (optional, for database)

### Option 1: Run API with JSON Data (Default)
```bash
cd nest
npm install
cp .env.example .env
npm run start:dev
```

### Option 2: Run API and PostgreSQL with Docker
```bash
# From the repository root
docker compose up -d --build
```

The Docker app is available at `http://localhost:3000` and the API at
`http://localhost:3001`. The API connects to PostgreSQL at startup, but uses
the JSON files in `nest/data` as its application data source.

When `DATABASE_URL` is configured, the API container automatically runs
`prisma db push` and the Prisma seed. If it is not configured, Prisma setup is
skipped and the API uses JSON data. The seed skips existing data, so restarting
the container does not create duplicates.

Login credentials:

| Username | Password |
|----------|----------|
| johndoe | susiairtest |

### Option 3: Use PostgreSQL and Prisma
```bash
# From the repository root
docker compose up -d postgres

# Run Prisma commands from the nest directory
cd nest

# Setup database
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to PostgreSQL
npm run db:seed       # Seed initial data

# Start API
npm run start:dev
```

For a full Docker run after the database setup:

```bash
cd ..
docker compose up -d --build api
```

Prisma seed data is stored in PostgreSQL. The current API still reads pilot,
flight hour, document, and schedule data from `data/*.json`, so running the
Prisma seed does not switch the API data source automatically.

### Option 4: Using Make
```bash
make install        # Install dependencies
make db-up          # Start PostgreSQL
make db-setup       # Setup database
make dev            # Start dev server
```

## Project Structure

```
nest/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeder
├── src/
│   ├── auth/            # Authentication
│   ├── session/         # Session management
│   ├── security/        # Security utilities
│   └── common/         # Shared services
├── data/                # JSON data files
│   ├── mock-pilots.json     # Pilot accounts
│   ├── mock-flight-hours.json
│   ├── mock-documents.json
│   └── mock-schedules.json
├── docker-compose.yml
└── package.json
```

## Data Files

The application uses JSON files as the default data source:

| File | Description |
|------|-------------|
| `mock-pilots.json` | Pilot user accounts |
| `mock-flight-hours.json` | Flight hour records |
| `mock-documents.json` | Document records |
| `mock-schedules.json` | Schedule records |

### JSON Pilot Accounts
```json
{
  "pilots": [
    {
      "id": "pilot-001",
      "username": "johndoe",
      "password": "susiairtest",
      "name": "John Doe",
      ...
    }
  ]
}
```

## Database Setup (PostgreSQL)

### Using Docker PostgreSQL
```bash
# From the repository root
docker compose up -d postgres

# Run Prisma commands from the nest directory
cd nest

# Setup Prisma client, schema, and seed data
npm run db:setup

# Or step by step
npm run db:generate   # Generate Prisma Client
npm run db:push       # Push schema to database
npm run db:seed       # Seed data
```

### Database Commands
| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database |
| `npm run db:setup` | Generate + Push + Seed |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Login with session cookie |
| POST | /auth/logout | Logout and clear session |
| GET | /auth/session | Get current session |
| GET | /pilot/me | Get pilot profile |
| GET | /flight-hours | Get flight hours by date range |
| GET | /flight-hours/summary | Get rolling sum with chart data |
| GET | /documents | Get documents with expiry status |
| GET | /schedules | Get schedules by year/month |

## Demo Credentials

| Username | Password |
|----------|----------|
| johndoe | susiairtest |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | (optional) |
| SESSION_SECRET | Session cookie secret | (required) |
| SESSION_MAX_AGE | Session duration | 86400000 (24h) |
| MAX_LOGIN_ATTEMPTS | Max failed attempts | 5 |
| LOGIN_LOCKOUT_DURATION | Lockout duration (seconds) | 900 |
| PORT | Server port | 3000 |
| TZ | Timezone | Asia/Jakarta |

## Docker Commands

```bash
# From the repository root
# Build and start PostgreSQL + API + Nuxt app
docker compose up -d --build

# View API logs
docker compose logs -f api

# Stop containers
docker compose down
```

To run only the database:

```bash
docker compose up -d postgres
```

To build the API image only:

```bash
docker build -t susi-air-pilot-api ./nest
```
