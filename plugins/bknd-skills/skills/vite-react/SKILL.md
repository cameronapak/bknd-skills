---
name: vite-react
description: Use when setting up Bknd with Vite and React for standalone SPA applications, configuring the dev server with HMR, integrating client-side SDK, and deploying as static + server hybrid.
---

# Vite + React Integration

Bknd provides a streamlined integration with Vite and React for standalone Single Page Applications (SPAs). This setup includes hot module replacement (HMR), built-in API server, and full TypeScript support.

## What You'll Learn

- Set up Bknd in a Vite + React project
- Configure dev server with HMR
- Use React SDK for client-side operations
- Generate TypeScript types from schema
- Deploy to production

## Quick Start

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install bknd @hono/vite-dev-server
npm run dev
```

Then follow the Manual Setup section below to configure Bknd. This creates a Vite + React project with Bknd backend providing:
- REST API at `/api/*`
- Admin UI at `/`
- Auto-generated types

## Manual Setup

### Install Dependencies

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install bknd @hono/vite-dev-server
```

**Requirements**: Node.js 22 LTS or higher

### Create Configuration

Create `bknd.config.ts`:

```typescript
import type { ViteBkndConfig } from "bknd/adapter/vite";

export default {
  connection: {
    url: "file:data.db",
  },
} satisfies ViteBkndConfig;
```

### Create Server Entry

Create `server.ts` in your project root:

```typescript
import { serve } from "bknd/adapter/vite";
import config from "./bknd.config";

export default serve(config);
```

The `serve()` function:
- Creates the Bknd application
- Configures API routes
- Sets up Admin UI
- Enables HMR for development

### Update Vite Config

Update `vite.config.ts`:

```typescript
import { devServer } from "bknd/adapter/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
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

### Using React Hooks

Bknd provides React hooks for data fetching and mutations:

```typescript
import { useEntityQuery, useAuth } from "bknd/client";

function TodoList() {
  const auth = useAuth();

  const { data: todos, create, update, _delete } = useEntityQuery("todos", undefined, {
    limit: 10,
    sort: "-id",
  });

  return (
    <div>
      {todos?.map((todo) => (
        <div key={todo.id}>
          <span>{todo.title}</span>
          <button onClick={() => update({ done: !todo.done }, todo.id)}>Toggle</button>
          <button onClick={() => _delete(todo.id)}>Delete</button>
        </div>
      ))}
      <form action={async (formData) => {
        const title = formData.get("title") as string;
        await create({ title });
      }}>
        <input name="title" placeholder="New todo" />
        <button>Add</button>
      </form>
    </div>
  );
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

Or use React hooks for simpler data management:

```typescript
import { useEntityQuery } from "bknd/client";

function TodoList() {
  const { data: todos, create, update, _delete } = useEntityQuery("todos");

  return (
    <div>
      {todos?.map((todo) => (
        <div key={todo.id}>
          <span>{todo.title}</span>
          <button onClick={() => update({ done: !todo.done }, todo.id)}>Toggle</button>
          <button onClick={() => _delete(todo.id)}>Delete</button>
        </div>
      ))}
      <button onClick={() => create({ title: "New todo" })}>Add</button>
    </div>
  );
}
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

## Available Client SDK Hooks

Bknd provides the following React hooks from `"bknd/client"`:

### Core Hooks

- `useApi()` - Access the API instance
- `useBaseUrl()` - Get the current API base URL
- `useClientContext()` - Access client context
- `useInvalidate()` - Invalidate SWR cache

### Data Hooks

- `useEntity(entity, id?)` - CRUD operations for a specific entity
- `useEntityQuery(entity, id?, query?)` - Query entities with SWR
- `useEntityMutate(entity, id?)` - Mutation operations
- `useApiQuery(fn, options?)` - Generic API query with SWR
- `useApiInfiniteQuery(fn, options?)` - Infinite scroll queries

### Auth Hooks

- `useAuth()` - Authentication state and methods
  - `user`, `token`, `verified` - Auth state
  - `login()`, `register()`, `logout()`, `verify()` - Auth methods

### Module-Specific Hooks

- `useBkndData()` - Direct data module access
- `useBkndAuth()` - Direct auth module access
- `useBkndMedia()` - Media module access
- `useFlows()` - Workflow operations
- `useBkndSystem()` - System configuration access

### Example: Using useEntityQuery

```typescript
import { useEntityQuery } from "bknd/client";

function TodoList() {
  const {
    data: todos,
    create,
    update,
    _delete,
    error,
    isLoading,
  } = useEntityQuery("todos", undefined, {
    limit: 10,
    sort: "-id",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {todos?.map((todo) => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => update({ done: !todo.done }, todo.id)}
          />
          <span>{todo.title}</span>
          <button onClick={() => _delete(todo.id)}>Delete</button>
        </div>
      ))}
      <form onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await create({ title: formData.get("title") });
      }}>
        <input name="title" placeholder="New todo" />
        <button>Add</button>
      </form>
    </div>
  );
}
```

## Database Configuration

### SQLite (Default)

```typescript
export default {
  connection: {
    url: "file:data.db",
  },
} satisfies ViteBkndConfig;
```

### PostgreSQL (node-postgres)

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

### PostgreSQL (postgres.js - Edge Runtime)

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

> **Note**: As of v0.20.0, PostgreSQL adapters (`pg`, `postgresJs`) are available directly from `bknd` package.

### Custom PostgreSQL (Neon, Xata)

Use `createCustomPostgresConnection` with kysely dialects:

```typescript
import { createCustomPostgresConnection } from "bknd";
import { NeonDialect } from "kysely-neon";

const neon = createCustomPostgresConnection("neon", NeonDialect);

export default {
  connection: neon({
    connectionString: process.env.NEON_URL,
  }),
} satisfies ViteBkndConfig;
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

**Note**: MCP is experimental in v0.20.0 and may change in future versions.

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

### Changing Port

If port 5174 is already in use:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
  },
  // ... rest of config
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

## DOs and DON'Ts

**DO:**
- Use `npm run dev` for development with HMR
- Generate types with `npx bknd types` after schema changes
- Use environment variables for production configuration
- Configure PostgreSQL for production (not SQLite)
- Import and wrap app with `ClientProvider` for auth hooks

**DON'T:**
- Deploy SQLite to production (use PostgreSQL/Turso)
- Forget to create `server.ts` entry point
- Skip the `devServer()` plugin in `vite.config.ts`
- Use edge runtime without testing all features
- Forget to include `bknd-types.d.ts` in `tsconfig.json`

## Next Steps

- [Authentication](/auth) - Configure auth strategies
- [Data Schema](/data-schema) - Define your data model
- [React SDK](/api-sdk) - Complete client-side API reference
- [Deploy](/deploy) - Production deployment patterns
