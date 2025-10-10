# StudyFlow

Learning management platform built with a modern monorepo architecture.

## Tech Stack

- **API**: Fastify, TypeScript
- **Web**: React, TypeScript, Vite
- **Infrastructure**: Docker Compose (Postgres 16, Redis 7)
- **Tooling**: pnpm, ESLint, Prettier

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm 9

### Setup

```bash
# Enable pnpm
corepack enable && corepack prepare pnpm@9 --activate

# Start infrastructure
docker compose -f infra/docker-compose.yml up -d

# Install dependencies
pnpm i

# Start development servers
pnpm -w dev
```

### Local URLs

- **API Health**: http://localhost:4000/healthz
- **API Docs**: http://localhost:4000/docs
- **Web App**: http://localhost:5173

## Development

```bash
# Lint all code
pnpm lint

# Format all code
pnpm format

# Build all apps
pnpm build
```

## Project Structure

```
studyflow/
├── apps/
│   ├── api/          # Fastify API server
│   └── web/          # React web application
├── infra/            # Docker Compose infrastructure
├── .github/          # GitHub Actions workflows
└── .vscode/          # VS Code configuration
```

## License

MIT
