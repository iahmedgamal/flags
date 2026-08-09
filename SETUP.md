# Flags — Geography Game

A multiplayer geography game (flags, capitals, countries) to play online with friends. Africa-focused — learn what you don't know while having fun.

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | npm workspaces (`shared`, `client`, `server`) |
| Frontend | React + Vite + Tailwind |
| Backend | Express + TypeScript |
| Database | PostgreSQL |
| Migrations | Knex |
| Real-time / Multiplayer | Socket.io (rooms, WebSocket — runs inside server) |
| Validation | Zod (shared schemas) |
| API Docs | Swagger (swagger-ui-express + swagger-jsdoc) |
| Deploy | Coolify on Hetzner VPS |

## Project Structure

```
flags/
├── package.json              # root workspaces
├── shared/
│   ├── package.json
│   └── src/
│       └── schemas.ts        # zod schemas
├── client/
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── server/
│   ├── package.json
│   ├── Dockerfile
│   ├── knexfile.ts
│   └── src/
│       ├── index.ts
│       └── migrations/
└── docker-compose.yml
```

## Root package.json

```json
{
  "name": "flags",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "shared",
    "client",
    "server"
  ],
  "scripts": {
    "dev": "concurrently -n server,client \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w client",
    "migrate": "npm run migrate -w server",
    "seed": "npm run seed -w server"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

## docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - pg_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: flags
      POSTGRES_USER: flags
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

  server:
    build:
      context: .
      dockerfile: server/Dockerfile
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://flags:${POSTGRES_PASSWORD}@postgres:5432/flags
      PORT: 3000
    depends_on:
      - postgres

  client:
    build:
      context: .
      dockerfile: client/Dockerfile
    restart: unless-stopped
    depends_on:
      - server

volumes:
  pg_data:
```

## server/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

RUN npm install

COPY shared/ ./shared/
COPY server/ ./server/

WORKDIR /app/server
ENV NODE_ENV=production

CMD ["sh", "-c", "npx knex migrate:latest && npx tsx src/index.ts"]
```

## client/Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/

RUN npm install

COPY shared/ ./shared/
COPY client/ ./client/

WORKDIR /app/client
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
```

## client/nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://server:3000/;
    }

    location /socket.io/ {
        proxy_pass http://server:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Knex Setup (server/knexfile.ts)

```ts
import type { Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection: process.env.DATABASE_URL || "postgres://flags:flags@localhost:5432/flags",
  migrations: {
    directory: "./src/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./src/seeds",
    extension: "ts",
  },
};

export default config;
```

## Swagger API Docs

Use `swagger-jsdoc` to generate OpenAPI spec from JSDoc comments on routes, and `swagger-ui-express` to serve the UI.

- Available at `/api/docs` in dev and production
- Zod schemas converted to JSON Schema via `zod-to-json-schema` for request/response docs
- Every route gets documented — good for learning Express patterns

## Socket.io (multiplayer — runs inside server)

Socket.io handles multiplayer rooms. Each room = one game session. Players join via room code. Runs as part of the Express server — no extra service to deploy.

```ts
// Game modes:
// 1. Flag → Country name (multiple choice)
// 2. Country → Capital (multiple choice)
// 3. Flag → Capital (hard mode)
// 4. Africa-only rounds

// Room state: players, scores, current question, timer
// Events: join, answer, next-question, game-over
```

## Coolify Deployment Notes

- Set `POSTGRES_PASSWORD` as env variable in Coolify
- Coolify handles SSL/domain routing — no Traefik config needed in compose
- Use Coolify's built-in PostgreSQL or the compose postgres service
- Socket.io WebSocket upgrade handled via nginx proxy config above

## Auth

No sign-up walls. Players pick a display name + emoji avatar on first visit, stored in localStorage. Scores persist server-side keyed by a generated player ID (UUID stored in localStorage).

## Email Collection

Collect emails optionally — never as a gate. Prompt after first game completion:
"Drop your email to save your rank + get challenged by friends"

**DB table**:

```sql
players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  email TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  email_opted_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

- Email is nullable — most players won't give it on first visit
- `email_opted_in_at` tracks consent timestamp (GDPR-friendly)
- Future use: Resend for challenge links, weekly stats, "your friend beat your score" nudges
- No password, no magic link for now — email is just for communication

## Game Concept

- **Solo mode**: practice rounds, learn flags/capitals at your own pace
- **Multiplayer mode**: create a room, share code, race to answer
- **Africa focus**: weighted question pool — more African countries appear
- **Scoring**: speed bonus + streak multiplier
- **Rounds**: 10-20 questions per game, configurable

## High Scores / Leaderboard

- **Personal bests**: stored locally + synced to server per player ID
- **Global leaderboard**: top scores by game mode (flags, capitals, hard mode, Africa-only)
- **Head-to-head history**: win/loss record between players
- DB table: `leaderboard (id, player_id, player_name, avatar, game_mode, score, streak, time_seconds, created_at)`

## Animations

Use **Framer Motion** for:
- Flag card flip reveal (3D rotate)
- Correct answer: confetti burst + green pulse
- Wrong answer: shake + red flash
- Score counter: animated number tick-up
- Streak fire icon grows with streak count
- Leaderboard: staggered list entry animation
- Timer: circular countdown with color shift (green → yellow → red)
- Room join: player avatar slides in from side
