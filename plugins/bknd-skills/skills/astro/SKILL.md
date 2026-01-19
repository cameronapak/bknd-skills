---
name: astro
description: Use when integrating Bknd with Astro for content-focused websites with SSR, setting up API routes, server-side data fetching, admin UI, PostgreSQL adapters, type generation, and deploying to Vercel/Netlify/Cloudflare. Covers both page-based and middleware integration patterns.
---

# Astro Integration

Bknd integrates seamlessly with Astro for content-focused websites with SSR capabilities.

## What You'll Learn

- Set up Bknd in an Astro project (CLI or manual)
- Choose integration pattern: page-based or middleware
- Query data from Astro server components
- Implement authentication with protected routes
- Configure PostgreSQL adapters
- Generate TypeScript types
- Deploy to production

## Quick Start

```bash
npx bknd create -i astro
cd my-astro-app
npm run dev
```

Your Bknd backend is ready with:
- REST API at `/api/*`
- Admin UI at `/admin`
- SSR enabled

## Manual Setup

### Install Dependencies

```bash
npm create astro@latest my-astro-app
cd my-astro-app
npm install bknd
```

### Create Configuration

Create `bknd.config.ts`:

```typescript
import type { AstroBkndConfig } from "bknd/adapter/astro";

export default {
  app: (env) => ({
    connection: {
      url: env.BKND_DB_URL || "file:data.db",
    },
  }),
} satisfies AstroBkndConfig;
```

Environment variables in `.env`:

```env
BKND_DB_URL=file:data.db
# or PostgreSQL:
# BKND_DB_URL=postgresql://user:password@localhost:5432/database
```

### Create Helper File

Create `src/bknd.ts`:

```typescript
import { getApp as getBkndApp, getApi as _getApi } from "bknd/adapter/astro";
import config from "../bknd.config";

let app: Awaited<ReturnType<typeof getBkndApp>> | null = null;

export async function getApp() {
  if (!app) {
    app = await getBkndApp(config, import.meta.env);
  }
  return app;
}

export async function getApi(args: AstroGlobal, options?: { verify?: boolean }) {
  return await _getApi(config, import.meta.env, args, options);
}
```

## Page-Based Integration (Recommended)

Simpler setup, automatic static assets handling.

### API Route

Create `src/pages/api/[...api].astro`:

```astro
---
import { getApi } from "../../bknd";

export const prerender = false;

const api = await getApi(Astro);
return api.fetch(Astro.request);
---
```

### Admin UI

Create `src/pages/admin/[...admin].astro`:

```astro
---
import { Admin } from "bknd/ui";
import "bknd/dist/styles.css";
import { getApi } from "../../bknd";

export const prerender = false;

const api = await getApi(Astro, { verify: true });
const user = api.getUser();

if (!user) {
  return Astro.redirect("/login");
}
---

<html>
  <body>
    <Admin
      withProvider={{ user }}
      config={{ basepath: "/admin", theme: "system" }}
      client:only
    />
  </body>
</html>
```

### Server-Side Data Fetching

```astro
---
import { getApi } from "../bknd";
import Layout from "../layouts/Layout.astro";

const api = await getApi(Astro);
const { data: todos } = await api.data.readMany("todos", { limit: 10 });
---

<Layout title="Todos">
  <h1>Todos</h1>
  <ul>
    {todos.map((todo) => (
      <li>
        <input type="checkbox" checked={todo.done} />
        {todo.title}
      </li>
    ))}
  </ul>
</Layout>
```

### Form Handling Pattern

```astro
---
import { getApi } from "../bknd";

const api = await getApi(Astro);

if (Astro.request.method === "POST") {
  const formData = await Astro.request.formData();
  const title = formData.get("title") as string;

  await api.data.createOne("todos", { title, done: false });

  return Astro.redirect("/");
}

const { data: todos } = await api.data.readMany("todos");
---

<form method="POST">
  <input name="title" type="text" required />
  <button type="submit">Add Todo</button>
</form>

<ul>
  {todos.map((todo) => <li>{todo.title}</li>)}
</ul>
```

## Authentication Middleware

For protecting routes without the Admin UI, use Astro middleware:

```typescript
import { getApi } from "../bknd";
import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const api = await getApi(context, { verify: true });
  const user = api.getUser();

  if (!user) {
    return context.redirect("/login");
  }

  context.locals.user = user;
  return next();
};
```

## PostgreSQL Adapters

### pg Adapter (node-postgres)

Best for traditional Node.js:

```typescript
import { pg } from "bknd";
import { Pool } from "pg";

export default {
  connection: pg({
    pool: new Pool({
      connectionString: process.env.POSTGRES_URL,
    }),
  }),
} satisfies AstroBkndConfig;
```

### postgresJs Adapter (Edge Runtime)

Best for edge deployments:

```typescript
import { postgresJs } from "bknd";
import postgres from "postgres";

export default {
  connection: postgresJs({
    postgres: postgres(process.env.POSTGRES_URL),
  }),
} satisfies AstroBkndConfig;
```

## Type Generation

Generate TypeScript types for your schema:

```bash
npx bknd types --out bknd-types.d.ts
```

Add to `tsconfig.json`:

```json
{
  "include": ["bknd-types.d.ts"]
}
```

## Deployment

### Build

```bash
npm run build
```

### Environment Variables

Production requires PostgreSQL:

```env
BKND_DB_URL=postgresql://user:password@host:5432/database
```

### Deployment Targets

- **Vercel**: Works out of the box
- **Netlify**: SSR must be enabled
- **Cloudflare Pages**: Use adapter-sst or adapter-node
- **Node.js**: Works with adapter-node

## DOs and DON'Ts

**DO:**
- Use page-based integration for most use cases
- Set `export const prerender = false;` on API routes
- Use `getApi(Astro, { verify: true })` for protected routes
- Use PostgreSQL for production
- Add `client:only` to Admin component

**DON'T:**
- Forget to set `output: 'server'` in astro.config.mjs for SSR
- Use React SDK hooks in Astro (server-side only)
- Deploy SQLite to production
- Skip static asset copy in middleware pattern

## Next Steps

- [Authentication](/permissions) - Configure auth strategies
- [Data Schema](/data-schema) - Define your data model
- [Database](/database) - PostgreSQL configuration details
- [Deploy](/deploy) - Production deployment patterns
