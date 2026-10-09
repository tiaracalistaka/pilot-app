# Susi Air Pilot App

Nuxt 3 frontend for the Susi Air Pilot App.

## Project Structure

```
nuxt/
├── assets/
│   └── scss/              # SCSS styles
├── components/           # Vue components
├── composables/           # Vue composables
├── layouts/              # Page layouts
├── middleware/            # Route middleware
├── pages/                 # Page components
├── stores/                # Pinia stores
├── types/                 # TypeScript types
└── public/               # Static assets
```

## Pages

1. **Login** (`/login`) - Pilot authentication
2. **Home** (`/`) - Dashboard with hours limit cards and flight hours chart
3. **Schedule** (`/schedule`) - Monthly calendar view
4. **Logbook** (`/logbook`) - Placeholder page
5. **More** (`/more`) - Placeholder page

## Components

- `PilotHeader` - Header with pilot info and avatar
- `LimitCard` - Flight hours limit card
- `FlightHoursChart` - Rolling sum chart
- `DocumentItem` - Document with expiry badge
- `BottomNavigation` - Bottom tab navigation

## Setup & Running

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NUXT_PUBLIC_API_BASE | Backend API URL | http://localhost:3000 |