# Flags — Geography Game

A multiplayer geography game (flags, capitals, countries) to play online with friends. Africa-focused — learn what you don't know while having fun.

## Progress

### Core
- [x] Monorepo setup (npm workspaces: shared, client, server)
- [x] PostgreSQL + Knex migrations
- [x] Countries table + seed data (50+ countries, Africa-heavy)
- [x] Swagger API docs at `/api/docs`
- [x] Docker Compose (postgres, server, client)
- [x] Coolify deployment on Hetzner VPS

### Auth & Players
- [x] Player creation (display name + emoji avatar)
- [x] Player ID persisted in localStorage
- [x] Player profile page (`/profile/:id`)
- [x] Logout
- [ ] Email collection (optional, post-game prompt)
- [ ] Email verification

### Solo Mode
- [x] Flag → Capital quiz (40 questions, 7s timer)
- [x] Scoring with streak multiplier
- [x] Results page with continent breakdown
- [x] Game results saved to leaderboard
- [ ] Flag → Country mode
- [ ] Country → Capital mode
- [ ] Africa-only mode
- [ ] Configurable question count (via SoloSetup page)

### Leaderboard
- [x] Global leaderboard page (`/leaderboard`)
- [x] Per-player game history on profile
- [ ] Filter by game mode
- [ ] Head-to-head history

### Multiplayer
- [x] Socket.io server (rooms, events)
- [x] Socket.io client setup
- [ ] Create room (host picks mode + question count)
- [ ] Join room (enter code)
- [ ] Lobby (player list, host starts game)
- [ ] Live game (synced questions, real-time scores)
- [ ] Multiplayer results (podium, rankings)

### Animations
- [x] Framer Motion on all pages
- [x] Correct/wrong answer feedback (shake, color)
- [x] Timer color shift (green → yellow → red)
- [x] Staggered leaderboard list
- [ ] Flag card flip (3D rotate)
- [ ] Confetti burst on correct answer
- [ ] Streak fire icon scaling
- [ ] Room join avatar slide-in

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

## Coolify Deployment Notes

- Set `POSTGRES_PASSWORD` as env variable in Coolify
- Coolify handles SSL/domain routing — no Traefik config needed in compose
- Use Coolify's built-in PostgreSQL or the compose postgres service
- Socket.io WebSocket upgrade handled via nginx proxy config

## Game Concept

- **Solo mode**: practice rounds, learn flags/capitals at your own pace
- **Multiplayer mode**: create a room, share code, race to answer
- **Africa focus**: weighted question pool — more African countries appear
- **Scoring**: speed bonus + streak multiplier
- **Rounds**: 10-20 questions per game, configurable
