# Flags - Setup

A multiplayer geography quiz game (flags, capitals, countries).

## Prerequisites

- Node.js 20+
- Docker

## Get started

```bash
# Install dependencies
npm install

# Start Postgres, run migrations, seed data
npm run setup

# Start dev server (client + server)
npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:3000`.

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start client + server |
| `npm run setup` | Reset DB, migrate, seed |
| `npm run migrate` | Run migrations only |
| `npm run seed` | Seed data only |
| `npm run build` | Build client for production |

## Workspaces

This is an npm workspaces monorepo with three packages:

| Workspace | Package | What it does |
|-----------|---------|-------------|
| `shared/` | `@flags/shared` | Zod schemas shared between client and server |
| `client/` | `@flags/client` | React + Vite + Tailwind frontend |
| `server/` | `@flags/server` | Express + Socket.io backend with Knex migrations |

### Client scripts

| Command | What it does |
|---------|-------------|
| `npm run test -w client` | Run unit tests (Vitest) |
| `npm run test:watch -w client` | Run tests in watch mode |
| `npm run test:e2e -w client` | Run e2e tests (Playwright) |

### Server scripts

| Command | What it does |
|---------|-------------|
| `npm run migrate -w server` | Run database migrations |
| `npm run seed -w server` | Seed the database |

## Stack

- **Frontend**: React 18, Vite, Tailwind, Framer Motion
- **Backend**: Express, TypeScript, Socket.io
- **Database**: PostgreSQL 16 (via Docker)
- **Validation**: Zod (shared schemas)
- **API docs**: Swagger UI at `/api/docs`
- **Testing**: Vitest + Playwright
- **Deploy**: Coolify on Hetzner
