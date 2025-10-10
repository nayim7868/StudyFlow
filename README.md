# StudyFlow

A modern study management platform.

## Quick Start

```bash
# Enable pnpm
corepack enable && corepack prepare pnpm@9 --activate

# Start infrastructure
docker compose -f infra/docker-compose.yml up -d

# Install dependencies
pnpm i

# Run development servers
pnpm -w dev
```

## Local URLs

- API Health: http://localhost:4000/healthz
- API Docs: http://localhost:4000/docs
- Web App: http://localhost:5173

## Project Structure

```
studyflow/
├── apps/
│   ├── api/          # Fastify API server
│   └── web/          # React web application
├── infra/            # Docker Compose infrastructure
└── .vscode/          # VS Code configuration
```

## Tech Stack

- **API**: Fastify, TypeScript
- **Web**: React, TypeScript, Vite
- **Infra**: Docker, PostgreSQL 16, Redis 7
- **Tooling**: pnpm, ESLint, Prettier

## License

MIT
