# StudyFlow

A minimal monorepo scaffold for API (Fastify + TypeScript) and Web (React + Vite). Includes Docker Compose for Postgres 16 and Redis 7, VS Code setup, ESLint + Prettier, and GitHub Actions CI.

## Apps
- `@studyflow/api` (Fastify, port 4000)
- `@studyflow/web` (Vite React, port 5173)

## Quick start

1. Install pnpm via Corepack and activate it

```
corepack enable && corepack prepare pnpm@9 --activate
```

2. Start infra (Postgres 16, Redis 7)

```
docker compose -f infra/docker-compose.yml up -d
```

3. Install dependencies

```
pnpm i
```

4. Run both apps in dev mode (web + api)

```
pnpm -w dev
```

## Local URLs
- API health: http://localhost:4000/healthz
- API docs:   http://localhost:4000/docs
- Web app:    http://localhost:5173

## Lint & build
```
pnpm -w lint
pnpm -w build
```

## License
See `LICENSE`.
