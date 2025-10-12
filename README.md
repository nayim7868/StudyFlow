# StudyFlow

A modern monorepo with API and Web applications, built with TypeScript, Fastify, React, and Vite.

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Setup

1. **Enable pnpm and install dependencies:**
   ```bash
   corepack enable && corepack prepare pnpm@9 --activate
   pnpm i
   ```

2. **Start infrastructure:**
   ```bash
   docker compose -f infra/docker-compose.yml up -d
   ```

3. **Start development servers:**
   ```bash
   pnpm -w dev
   ```

### Local URLs

- **Web App:** http://localhost:5173
- **API:** http://localhost:4000
- **API Docs:** http://localhost:4000/docs
- **Health Check:** http://localhost:4000/healthz

## Project Structure

```
StudyFlow/
├── packages/
│   ├── api/          # Fastify API server
│   └── web/          # React + Vite web app
├── infra/            # Docker Compose infrastructure
├── .vscode/          # VS Code settings
└── .github/          # GitHub Actions CI
```

## Development

### Available Scripts

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

### Infrastructure

- **PostgreSQL 16** - Database (port 5432)
- **Redis 7** - Cache (port 6379)

### VS Code

The project includes VS Code settings for:
- Auto-formatting on save
- ESLint integration
- Debug configurations for API and Web
- Recommended extensions

## CI/CD

GitHub Actions workflow includes:
- Linting and formatting checks
- TypeScript type checking
- Build verification
- Infrastructure testing

