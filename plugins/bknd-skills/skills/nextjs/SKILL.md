---
name: nextjs
description: Use when integrating Bknd with Next.js App Router, setting up API routes, server components, authentication, admin UI, and deploying to Vercel. Covers both server-side and client-side data access with React SDK hooks. Also applicable to Remix, Nuxt, and React Router frameworks with adaptation.
---

# Next.js Integration

Bknd provides deep integration with Next.js App Router through server components, API routes, and React SDK hooks.

## What You'll Learn

- Set up Bknd in a Next.js project
- Create REST API with catch-all routes
- Query data from server components
- Implement authentication with cookies
- Use React SDK for client-side operations
- Deploy to production

## Quick Start

```bash
npx bknd create -i nextjs
cd my-app
npm run dev
```

Your Bknd backend is now ready with:
- REST API at `/api/*`
- Admin UI at `/admin`
- Auto-generated types

## Manual Setup

### Install Dependencies

```bash
npm create next-app@latest my-app
cd my-app
npm install bknd
```

**Requirements**: Node.js 22 LTS or higher

### Create Configuration

Create `bknd.config.ts`:

```typescript
import type { NextjsBkndConfig } from "bknd/adapter/nextjs";

export default {
  connection: {
    url: "file:data.db",
  },
} satisfies NextjsBkndConfig;
```

### Create Helper File

Create `src/bknd.ts`:

```typescript
import { getApp as getBkndApp } from "bknd/adapter/nextjs";
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

## Server-Side Data Fetching

Query directly from server components with full type safety:

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

  if (!user) return <div>Not authenticated</div>;

  const { data: items } = await api.data.readMany("items");

  return <div>Welcome, {user.email}</div>;
}
```

## Admin UI

Create `src/app/admin/[[...admin]]/page.tsx`:

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

Access at `http://localhost:3000/admin`

## Client-Side with React SDK

### Setup Client Provider

Wrap in `src/app/layout.tsx`:

```typescript
import { ClientProvider } from "bknd/client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
```

### Authentication Hook

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

### Entity Query Hook

```typescript
"use client";

import { useEntityQuery } from "bknd/client";

export default function TodoList() {
  const { data: todos, create, update, _delete, isLoading } = useEntityQuery(
    "todos",
    undefined,
    { limit: 10, sort: "-id" }
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
        <input name="title" placeholder="New todo" />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={!!todo.done}
              onChange={async () => await update({ done: !todo.done }, todo.id)}
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

## Database Configuration

### SQLite (Default)

```typescript
export default {
  connection: {
    url: "file:data.db",
  },
} satisfies NextjsBkndConfig;
```

### PostgreSQL (node-postgres)

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

### PostgreSQL (postgres.js - Edge Runtime)

```typescript
import { postgresJs } from "bknd";
import postgres from "postgres";

export default {
  connection: postgresJs({
    postgres: postgres(process.env.POSTGRES_URL),
  }),
} satisfies NextjsBkndConfig;
```

### Custom PostgreSQL (Neon, Xata)

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

## Edge Runtime

Enable in API routes for better performance:

```typescript
export const runtime = "edge";
```

Note: Some features may not work with edge runtime.

## Deployment

### Environment Variables

```env
DATABASE_URL="file:data.db"
# or for PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### Vercel Deployment

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

Use PostgreSQL or Turso for production (not SQLite).

## Common Patterns

### Server Actions with Auth

```typescript
"use server";

import { getApi } from "@/bknd";

export async function createTodo(formData: FormData) {
  const api = await getApi({ verify: true });
  const title = formData.get("title") as string;
  return await api.data.createOne("todos", { title, done: false });
}
```

## DOs and DON'Ts

**DO:**
- Pass `{ verify: true }` to `getApi()` in protected server components
- Use `getApi()` in server components for type-safe queries
- Use React SDK hooks in client components
- Configure PostgreSQL for production

**DON'T:**
- Forget to create the catch-all route at `src/app/api/[[...bknd]]/route.ts`
- Use edge runtime without testing all features
- Deploy SQLite to production (use PostgreSQL/Turso)
- Wrap server components in ClientProvider unnecessarily

## Next Steps

- [Authentication](/permissions) - Configure auth strategies and permissions
- [React SDK](/api-sdk) - Complete client-side API reference
- [Data Schema](/data-schema) - Define your data model
- [Deploy](/deploy) - Production deployment patterns
