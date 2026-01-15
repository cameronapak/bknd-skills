---
title: "Bun/Node Standalone"
description: "Run Bknd as a standalone server with Bun or Node.js runtimes."
---

A quick guide to running bknd as a standalone server with Bun or Node.js runtimes.

## What You'll Build

A standalone bknd API server serving REST endpoints with:
- SQLite database (persistent file storage)
- Media upload support
- Admin UI for data management
- Full CRUD API

## Prerequisites

- **Bun 1.0+** or **Node.js 22+**
- Basic JavaScript/TypeScript knowledge
- Terminal/command line access

## Choose Your Runtime

Both runtimes work identically from a bknd perspective. Choose based on:

| Runtime | Best For | Performance |
|---------|----------|-------------|
| **Bun** | Development, fast startups, edge deployments | Fastest startup, lower memory |
| **Node.js** | Production, compatibility, ecosystem | Slower startup, wider compatibility |

---

## Bun Setup (Recommended for Development)

### Option 1: CLI Starter (Fastest)

```bash
# Create new Bun project with bknd
npx bknd create -i bun

# Navigate to project
cd bknd-bun-app

# Install dependencies
bun install

# Start server
bun run dev
```

**Output:**
```
✓ bknd server running on http://localhost:3000
✓ Admin UI available at http://localhost:3000/_admin
✓ API endpoints available at http://localhost:3000/api
```

### Option 2: Manual Setup

#### 1. Initialize Project

```bash
mkdir bknd-bun-server
cd bknd-bun-server
bun init -y
bun add bknd
```

#### 2. Create Server Entry Point

Create `index.ts`:

```typescript
import { serve } from "bknd/adapter/bun";

// If configuration is omitted, uses in-memory database
serve({
  connection: {
    url: "file:data.db",
  },
});
```

#### 3. Run the Server

```bash
bun run index.ts
```

### Access the Admin UI

1. Open `http://localhost:3000/_admin` in your browser
2. Create your first admin user
3. Define entities through the UI
4. Start using the API

---

## Node.js Setup (Recommended for Production)

### Option 1: CLI Starter (Fastest)

```bash
# Create new Node project with bknd
npx bknd create -i node

# Navigate to project
cd bknd-node-app

# Install dependencies
npm install

# Start server
npm run dev
```

**Output:**
```
✓ bknd server running on http://localhost:3000
✓ Admin UI available at http://localhost:3000/_admin
✓ API endpoints available at http://localhost:3000/api
```

### Option 2: Manual Setup

#### 1. Initialize Project

```bash
mkdir bknd-node-server
cd bknd-node-server
npm init -y
npm install bknd
```

#### 2. Create Server Entry Point

Create `server.ts`:

```typescript
import { serve } from "bknd/adapter/node";

/** @type {import("bknd/adapter/node").NodeAdapterOptions} */
const config = {
  connection: {
    url: "file:data.db",
  },
};

serve(config);
```

#### 3. Run the Server

```bash
node server.ts
```

### Access the Admin UI

1. Open `http://localhost:3000/_admin` in your browser
2. Create your first admin user
3. Define entities through the UI
4. Start using the API

---

## Configuration Options

Both runtimes support the same configuration options:

### Database Connection

```typescript
connection: {
  // SQLite file (default)
  url: "file:data.db",

  // PostgreSQL (choose adapter: pg or postgresJs)
  url: "postgresql://user:pass@localhost:5432/dbname",

> **Note:** As of v0.20.0, use `pg` or `postgresJs` adapter from `bknd` package. See [PostgreSQL Migration Guide](/migration-guides/postgres-package-merge) for details.

  // In-memory (testing only)
  url: ":memory:",
}
```

### Media Storage

```typescript
config: {
  media: {
    enabled: true,
    adapter: {
      type: "local",
      config: { path: "./uploads" },
    },
  },
}
```

### Server Port (Optional)

```typescript
// For Bun
serve(config, { port: 8080 });

// For Node.js - use environment variable
PORT=8080 npm start
```

---

## Production Deployment

### Environment Variables

Create `.env` file:

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Server port
PORT=3000
```

Update server code:

```typescript
const config = {
  connection: {
    url: process.env.DATABASE_URL || "file:data.db",
  },
  // ... other config
};
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
# For Bun
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
EXPOSE 3000
CMD ["bun", "run", "index.ts"]

# For Node.js
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

Build and run:

```bash
docker build -t bknd-server .
docker run -p 3000:3000 -v ./data.db:/app/data.db bknd-server
```

---

## Using the API

Once your server is running, you can interact with it via REST API:

```bash
# List entities
curl http://localhost:3000/api/entities

# Create an item (replace with your entity name)
curl -X POST http://localhost:3000/api/your-entity \
  -H "Content-Type: application/json" \
  -d '{"name": "Example"}'

# Get all items
curl http://localhost:3000/api/your-entity
```

---

## Next Steps

- **[Choose Your Mode](/how-to-guides/setup/choose-your-mode)** - Learn about configuration modes
- **[Deploy to Production](/getting-started/deploy-to-production)** - Full deployment guide
- **[Auth Module](/reference/auth-module)** - Authentication documentation
- **[Data Module](/reference/data-module)** - Data operations documentation

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 bun run index.ts
```

**Database file permissions:**
```bash
# Ensure directory is writable
chmod +w ./data.db
```

**Module import errors:**
- Ensure `"type": "module"` is in `package.json` for Node.js
- Use `.ts` extension for Bun TypeScript files
