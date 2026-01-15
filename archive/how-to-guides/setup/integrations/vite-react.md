---
title: "Vite + React Integration"
description: Set up Bknd with Vite and React for standalone SPA applications
---

Set up Bknd with Vite + React for standalone Single Page Applications (SPAs). This integration provides a development-friendly setup with hot module replacement (HMR) and full type safety.

## Overview

The Vite + React integration is ideal for:
- Standalone SPA applications
- Projects requiring fast development iterations
- Teams familiar with Vite and React

**Key Features:**
- Hot Module Replacement (HMR) for rapid development
- Built-in API server at `/api/*` routes
- Admin UI at `/` by default
- Full TypeScript support
- Simple deployment configuration

## Prerequisites

- Node.js 22 or higher
- Basic knowledge of React and Vite

## Installation

### Option 1: Manual Setup

Create a new Vite project:

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install bknd @hono/vite-dev-server
```

### Option 2: CLI Starter (Recommended)

Use the Bknd CLI to scaffold a project:

```bash
npx bknd create -i vite
```

This creates a complete project structure with all dependencies pre-configured.

## Configuration

### 1. Create `bknd.config.ts`

Create a configuration file in your project root:

```typescript
import type { ViteBkndConfig } from "bknd/adapter/vite";

export default {
  connection: {
    url: "file:data.db",
  },
} satisfies ViteBkndConfig;
```

### PostgreSQL Adapter Options

For PostgreSQL connections, Bknd provides two adapters:

#### pg Adapter (node-postgres)

Best for traditional Node.js applications with connection pooling:

```typescript
import { pg } from "bknd";
import { Pool } from "pg";

export default {
  connection: pg({
    pool: new Pool({
      connectionString: "postgresql://user:password@localhost:5432/dbname",
    }),
  }),
} satisfies ViteBkndConfig;
```

#### postgresJs Adapter

Best for edge runtimes:

```typescript
import { postgresJs } from "bknd";
import postgres from "postgres";

export default {
  connection: postgresJs({
    postgres: postgres("postgresql://user:password@localhost:5432/dbname"),
  }),
} satisfies ViteBkndConfig;
```

> **Note:** As of v0.20.0, PostgreSQL adapters (`pg`, `postgresJs`) are available directly from `bknd` package. See [PostgreSQL Migration Guide](/migration-guides/postgres-package-merge) for migrating from `@bknd/postgres`.

### 2. Create `server.ts`

Create the server entry point in your root directory:

```typescript
import { serve } from "bknd/adapter/vite";
import config from "./bknd.config";

export default serve(config);
```

This `serve()` function:
- Creates the Bknd application
- Configures API routes
- Sets up the Admin UI
- Enables HMR for development

### 3. Update `vite.config.ts`

Configure Vite to use the Bknd dev server plugin:

```typescript
import { devServer } from "bknd/adapter/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    devServer({
      entry: "./server.ts",
    }),
  ],
});
```

The `devServer()` plugin:
- Integrates Hono server with Vite
- Provides hot module replacement
- Serves API endpoints at `/api/*`
- Handles React HMR injection

## Running the Application

Start the development server:

```bash
npm run dev
```

Access your application:
- **Frontend**: `http://localhost:5174/`
- **API**: `http://localhost:5174/api/*`
- **Admin UI**: `http://localhost:5174/`

## Client-Side Integration

### Using the Bknd SDK

Import the SDK in your React components:

```typescript
import { Api } from "bknd/client";

const api = new Api();

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.data.readMany("your-entity").then(({ data }) => {
      setData(data);
    });
  }, []);

  return <div>{/* your UI */}</div>;
}
```

### Generating Types

Generate TypeScript types from your schema:

```bash
npx bknd types
```

This creates `bknd-types.d.ts` in your project root with type-safe entities.

## Common Patterns

### Pattern 1: API Integration

Create a reusable API instance:

```typescript
// src/api.ts
import { Api } from "bknd/client";

export const api = new Api();

export const fetchData = async (entity: string) => {
  const { data } = await api.data.readMany(entity);
  return data;
};

export const createItem = async (entity: string, item: any) => {
  const { data } = await api.data.createOne(entity, item);
  return data;
};
```

### Pattern 2: Authentication

Use the React SDK for auth:

```typescript
import { ClientProvider, useAuth } from "bknd/client";

// Wrap your app
function Root() {
  return (
    <ClientProvider>
      <App />
    </ClientProvider>
  );
}

// Use auth hooks
function App() {
  const { user, login, logout } = useAuth();

  if (!user) {
    return <button onClick={() => login("email", "password")}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Pattern 3: State Management

Combine with React state or libraries like Zustand:

```typescript
import { create } from "zustand";
import { api } from "./api";

interface StoreState {
  todos: any[];
  fetchTodos: () => Promise<void>;
  addTodo: (todo: any) => Promise<void>;
}

const useStore = create<StoreState>((set) => ({
  todos: [],
  fetchTodos: async () => {
    const data = await api.data.readMany("todos");
    set({ todos: data.data });
  },
  addTodo: async (todo) => {
    const { data } = await api.data.createOne("todos", todo);
    set((state) => ({ todos: [...state.todos, data] }));
  },
}));
```

## Configuration Options

### Environment Variables

Use environment variables for configuration:

```typescript
// bknd.config.ts
export default {
  connection: {
    url: process.env.DATABASE_URL || "file:data.db",
  },
  config: {
    auth: {
      enabled: true,
      jwt: {
        secret: process.env.JWT_SECRET || "dev-secret",
      },
    },
  },
} satisfies ViteBkndConfig;
```

### Custom Admin UI Path

Configure Admin UI location:

```typescript
import { serve } from "bknd/adapter/vite";
import config from "./bknd.config";

export default serve({
  ...config,
  adminOptions: {
    basePath: "/admin",
  },
});
```

### Enabling MCP

Model Context Protocol (MCP) allows AI assistants to interact with your Bknd instance:

**Via Configuration:**
```typescript
export default {
  config: {
    server: {
      mcp: {
        enabled: true,
      },
    },
  },
} satisfies ViteBkndConfig;
```

**Via Admin UI:**
1. Access Admin UI at `http://localhost:5174/`
2. Click user menu (top right) → Settings → Server
3. Enable "Mcp" checkbox
4. Save configuration

**Accessing MCP:**
- MCP UI: `http://localhost:5174/mcp`
- Admin menu: Click user menu → MCP
- MCP API: `http://localhost:5174/api/system/mcp`

**Note:** MCP is experimental in v0.20.0 and may change in future versions.

### Static File Serving

Configure static file serving:

```typescript
import { serve } from "bknd/adapter/vite";
import config from "./bknd.config";

export default serve({
  ...config,
  serveStatic: [
    "/assets/*",
    { root: "./public" },
  ],
});
```

## Deployment

### Build for Production

Build your application:

```bash
npm run build
```

This creates:
- Frontend build in `dist/`
- Optimized production assets

### Preview Production Build

Preview the production build:

```bash
npm run preview
```

### Deployment Targets

**Vercel:**
```bash
npm run build
npx vercel --prod
```

**Netlify:**
- Build command: `npm run build`
- Publish directory: `dist`

**Node.js Server:**
```bash
node server.js
```

Use with process managers like PM2:
```bash
pm2 start server.js --name my-bknd-app
```

## Troubleshooting

### Issue: Port Already in Use

If port 5174 is already in use:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000, // Change to available port
  },
  // ... rest of config
});
```

### Issue: Type Generation Errors

If types are not generated:

```bash
# Regenerate types
npx bknd types --force

# Verify types are included in tsconfig
```

In `tsconfig.json`:
```json
{
  "include": ["bknd-types.d.ts", "src/**/*"]
}
```

### Issue: HMR Not Working

Ensure `@hono/vite-dev-server` is installed:

```bash
npm install @hono/vite-dev-server
```

Verify `vite.config.ts` has the `devServer()` plugin:

```typescript
export default defineConfig({
  plugins: [
    react(),
    devServer({ entry: "./server.ts" }),
  ],
});
```

### Issue: API Routes Not Found

Verify API routes are accessible:

```bash
curl http://localhost:5174/api/system/config
```

Should return JSON configuration.

## Best Practices

1. **Generate Types Regularly**: Run `npx bknd types` after schema changes
2. **Use Environment Variables**: Separate dev and production configs
3. **Optimize Bundle Size**: Use dynamic imports for large components
4. **Enable Compression**: Use compression middleware in production
5. **Monitor Performance**: Use Vite's built-in performance analyzer

## Differences from Other Integrations

| Feature | Vite + React | Next.js | Bun |
|---------|-------------|---------|-----|
| **Framework** | React SPA | Full-stack React | Runtime only |
| **Deployment** | Static + Server | Vercel/Edge | Any hosting |
| **SSR** | No | Yes | Optional |
| **API Routes** | `/api/*` | `/api/*` | All routes |
| **HMR** | ✅ Built-in | ✅ Built-in | ✅ Watch mode |

## Next Steps

- Learn about [Authentication](/../getting-started/add-authentication)
- Explore [Data Module](/../../reference/data-module)
- Read about [Deployment](/../getting-started/deploy-to-production)
- Check [Configuration Reference](/../../reference/configuration) - Complete configuration options
- Check [Query System](/../../reference/query-system)
