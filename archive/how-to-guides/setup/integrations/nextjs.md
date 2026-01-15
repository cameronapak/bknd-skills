---
title: "Next.js Integration"
description: "Complete guide for integrating Bknd with Next.js App Router including server components and API routes."
---

## Overview

Bknd provides deep integration with Next.js through:
- **API Routes**: Catch-all route handler for REST API
- **Server Components**: Direct API access with full type safety
- **Admin UI**: Built-in admin interface at `/admin`
- **React SDK**: Client-side hooks for authentication and data fetching

## Installation

### CLI Starter (Recommended)

Create a new Next.js project with Bknd pre-configured:

```bash
npx bknd create -i nextjs
```

### Manual Installation

```bash
npm create next-app@latest my-app
cd my-app
npm install bknd
```

**Requirements**: Node.js 22 LTS or higher

## Configuration

Create `bknd.config.ts` in your project root:

```typescript
import type { NextjsBkndConfig } from "bknd/adapter/nextjs";

export default {
  connection: {
    url: "file:data.db",
  },
} satisfies NextjsBkndConfig;
```

### Additional Configuration Options

```typescript
export default {
  connection: {
    url: process.env.DATABASE_URL || "file:data.db",
  },
  cleanRequest: {
    searchParams: ["bknd"],
  },
} satisfies NextjsBkndConfig;
```

## API Setup

### Create Helper File

Create `src/bknd.ts` to manage Bknd instance:

```typescript
import {
  type NextjsBkndConfig,
  getApp as getBkndApp,
} from "bknd/adapter/nextjs";
import { headers } from "next/headers";
import config from "../bknd.config";

export { config };

export async function getApp() {
  return await getBkndApp(config, process.env);
}

export async function getApi(opts?: { verify?: boolean }) {
  const app = await getApp();
  if (opts?.verify) {
    const api = app.getApi({ headers: await headers() });
    await api.verifyAuth();
    return api;
  }

  return app.getApi();
}
```

### Create API Route

Create catch-all route at `src/app/api/[[...bknd]]/route.ts`:

```typescript
import { config } from "@/bknd";
import { serve } from "bknd/adapter/nextjs";

// Optional: Use edge runtime for better performance
// export const runtime = "edge";

const handler = serve({
  ...config,
  cleanRequest: {
    searchParams: ["bknd"],
  },
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
```

Your API is now available at `/api/*`

## Server-Side Data Fetching

Next.js server components can directly query the Bknd API with full type safety:

```typescript
import { getApi } from "@/bknd";

export default async function TodoList() {
  const api = await getApi();
  const { data: todos } = await api.data.readMany("todos", { limit: 10 });

  return (
    <ul>
      {todos.map((todo) => (
        <li key={String(todo.id)}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### With Authentication

```typescript
import { getApi } from "@/bknd";

export default async function ProtectedPage() {
  const api = await getApi({ verify: true });
  const user = api.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const { data: items } = await api.data.readMany("items");

  return <div>Welcome, {user.email}</div>;
}
```

## Admin UI

Create admin page at `src/app/admin/[[...admin]]/page.tsx`:

```typescript
import { Admin } from "bknd/ui";
import { getApi } from "@/bknd";
import "bknd/dist/styles.css";

export default async function AdminPage() {
  const api = await getApi({ verify: true });

  return (
    <Admin
      withProvider={{ user: api.getUser() }}
      config={{
        basepath: "/admin",
        logo_return_path: "/../",
        theme: "system",
      }}
    />
  );
}
```

**Accessing Admin UI:**
- Navigate to `http://localhost:3000/admin`
- MCP integration available at `/admin/mcp` (if enabled)
- User menu (top right) → MCP for AI assistant integration

**Enabling MCP:**
```typescript
// In bknd.config.ts
export default {
  config: {
    server: {
      mcp: {
        enabled: true,
      },
    },
  },
} satisfies NextjsBkndConfig;
```

Or enable via Admin UI: Settings → Server → Enable "Mcp" checkbox.

## Client-Side with React SDK

### Setup Client Provider

Wrap your app in `src/app/layout.tsx`:

```typescript
import { ClientProvider } from "bknd/client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
```

### Use useAuth Hook

```typescript
"use client";

import { useAuth } from "bknd/client";

export default function LoginForm() {
  const { user, login, logout } = useAuth();

  if (user) {
    return (
      <div>
        <p>Welcome, {user.email}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        await login({
          email: form.email.value,
          password: form.password.value,
        });
      }}
    >
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Use useEntityQuery Hook

```typescript
"use client";

import { useEntityQuery } from "bknd/client";

export default function TodoList() {
  const { data: todos, create, update, _delete, isLoading } = useEntityQuery(
    "todos",
    undefined,
    {
      limit: 10,
      sort: "-id",
    }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <form
        action={async (formData: FormData) => {
          const title = formData.get("title") as string;
          await create({ title, done: false });
        }}
      >
        <input type="text" name="title" placeholder="New todo" />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={!!todo.done}
              onChange={async () => {
                await update({ done: !todo.done }, todo.id);
              }}
            />
            <span>{todo.title}</span>
            <button onClick={() => _delete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## PostgreSQL Adapter Options

Bknd provides two PostgreSQL adapters available from the main `bknd` package:

### pg Adapter (node-postgres)

Best for traditional Node.js applications with connection pooling:

```typescript
import { pg } from "bknd";
import { Pool } from "pg";

export default {
  connection: pg({
    pool: new Pool({
      connectionString: process.env.POSTGRES_URL,
    }),
  }),
} satisfies NextjsBkndConfig;
```

### postgresJs Adapter

Best for edge runtimes (Vercel Edge Functions, Cloudflare Workers):

```typescript
import { postgresJs } from "bknd";
import postgres from "postgres";

export default {
  connection: postgresJs({
    postgres: postgres(process.env.POSTGRES_URL),
  }),
} satisfies NextjsBkndConfig;
```

### Custom PostgreSQL (Neon, Xata, etc.)

For managed PostgreSQL providers:

```typescript
import { createCustomPostgresConnection } from "bknd";
import { NeonDialect } from "kysely-neon";

const neon = createCustomPostgresConnection("neon", NeonDialect);

export default {
  connection: neon({
    connectionString: process.env.NEON_URL,
  }),
} satisfies NextjsBkndConfig;
```

> **Note:** As of v0.20.0, PostgreSQL adapters are available directly from `bknd` package. Previously they were in a separate `@bknd/postgres` package.

## Deployment

### Environment Variables

```env
DATABASE_URL="file:data.db"
# or for PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

For production, consider using PostgreSQL or Turso instead of SQLite.

### Production Considerations

- **Edge Runtime**: Enable `export const runtime = "edge"` in API routes for better performance
- **Database**: Use PostgreSQL or Turso for production databases
- **Authentication**: Use cookies for production deployments
- **CORS**: Configure CORS settings if using separate frontend/backend deployments

## Common Patterns

### Authentication in Server Actions

```typescript
"use server";

import { getApi } from "@/bknd";

export async function createTodo(formData: FormData) {
  const api = await getApi({ verify: true });
  const title = formData.get("title") as string;

  return await api.data.createOne("todos", { title, done: false });
}
```

### Type-Safe Queries

```typescript
import { getApi } from "@/bknd";

export default async function Page() {
  const api = await getApi();

  // Full type safety - TypeScript knows todo entity structure
  const todos = await api.data.readMany("todos", {
    where: { done: false },
    with: ["user"],
    limit: 10,
  });

  return (
    <ul>
      {todos.data.map((todo) => (
        <li key={todo.id}>
          {todo.title} (by {todo.user?.email})
        </li>
      ))}
    </ul>
  );
}
```

## Troubleshooting

### API Returns 404

Ensure the catch-all route is at `src/app/api/[[...bknd]]/route.ts`

### Auth Not Working in Server Components

Always pass `{ verify: true }` to `getApi()` to verify authentication:

```typescript
const api = await getApi({ verify: true });
```

### Edge Runtime Issues

Some features may not work with edge runtime. Remove `export const runtime = "edge"` if you encounter issues.

## Next Steps

- [React SDK Reference](/../../reference/react-sdk-reference) - Client-side hooks documentation
- [Data Module Reference](/../../reference/data-module) - Complete API documentation
- [Authentication Guide](/../../getting-started/add-authentication) - Set up auth with permissions
- [Configuration Reference](/../../reference/configuration) - Complete configuration options
- [Deploy to Production](/../../getting-started/deploy-to-production) - Production deployment guide
