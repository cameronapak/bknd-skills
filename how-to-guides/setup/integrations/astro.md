---
title: Astro Integration
description: How to integrate Bknd with Astro for content-focused websites
---

# Astro Integration

Bknd provides a seamless integration with Astro for building content-focused websites with SSR capabilities.

## What This Integration Provides

- Server-side rendering (SSR) with Astro
- Type-safe API access via helper functions
- Admin UI integration
- Environment-based configuration
- Support for all Bknd modules (Data, Auth, Media, Flows)

## Installation

### Option 1: CLI Starter (Recommended)

```bash
npx bknd create -i astro
```

This creates a complete Astro project with Bknd pre-configured.

### Option 2: Manual Setup

```bash
npm create astro@latest my-astro-app
cd my-astro-app
npm install bknd
```

## Configuration

Create `bknd.config.ts`:

```typescript
import type { AstroBkndConfig } from "bknd/adapter/astro";
import { boolean, entity, text, integer } from "bknd/data";

export default {
  app: (env) => ({
    connection: {
      url: env.BKND_DB_URL || "file:data.db",
    },
    config: {
      data: {
        entities: {
          todos: {
            fields: {
              title: { type: "text", required: true },
              description: { type: "text" },
              done: { type: "boolean", default: false },
            },
          },
        },
      },
    },
  }),
} satisfies AstroBkndConfig;
```

### Environment Variables

Create `.env`:

```env
BKND_DB_URL=file:data.db
 ## PostgreSQL Adapter Options

Bknd provides two PostgreSQL adapters available from main `bknd` package:

### pg Adapter (node-postgres)

Best for traditional Node.js applications with connection pooling:

```typescript
import { pg } from "bknd";
import { Pool } from "pg";

export default {
  connection: pg({
    pool: new Pool({
      connectionString: "postgresql://user:password@localhost:5432/database",
    }),
  }),
} satisfies AstroBkndConfig;
```

### postgresJs Adapter

Best for edge runtimes (Vercel Edge Functions, Cloudflare Workers):

```typescript
import { postgresJs } from "bknd";
import postgres from "postgres";

export default {
  connection: postgresJs({
    postgres: postgres("postgresql://user:password@localhost:5432/database"),
  }),
} satisfies AstroBkndConfig;
```

> **Note:** As of v0.20.0, PostgreSQL adapters are available directly from `bknd` package. See [PostgreSQL Migration Guide](/migration-guides/postgres-package-merge) for migrating from `@bknd/postgres`.

```env
# For production with PostgreSQL:
# BKND_DB_URL=postgresql://user:password@host:5432/database
```

## Helper File Setup

Create `src/bknd.ts`:

```typescript
import { getApp, getApi as _getApi } from "bknd/adapter/astro";
import config from "../bknd.config";
import type { AstroGlobal } from "astro";

let app: Awaited<ReturnType<typeof getApp>> | null = null;

export async function getApp() {
  if (!app) {
    app = await getApp(config, import.meta.env);
  }
  return app;
}

export async function getApi(args: AstroGlobal, options?: { verify?: boolean }) {
  return await _getApi(config, import.meta.env, args, options);
}
```

## Standard Integration (Page-Based)

### API Routes

Create `src/pages/api/[...api].astro`:

```astro
---
import { getApi } from "../../bknd";

export const prerender = false;

const api = await getApi(Astro);
return api.fetch(Astro.request);
---

<!-- API routes return JSON, no HTML needed -->
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
---

<html>
  <body>
    <Admin
      withProvider={{ user }}
      config={{ basepath: "/admin", theme: "dark", logo_return_path: "/" }}
      client:only
    />
  </body>
</html>
```

### Server-Side Data Fetching

Create `src/pages/index.astro`:

```astro
---
import { getApi } from "../bknd";
import Layout from "../layouts/Layout.astro";

const api = await getApi(Astro);
const { data } = await api.data.readMany("todos");
---

<Layout title="My Astro App">
  <h1>Todos</h1>
  <ul>
    {data.map((todo) => (
      <li>
        <input type="checkbox" checked={todo.done} />
        {todo.title}
      </li>
    ))}
  </ul>
</Layout>
```

## Middleware Integration (Advanced)

Astro also supports a middleware-based integration pattern that keeps your API routes clean. This approach is useful if you want to:

- Keep Astro routes focused on UI
- Have more control over request routing
- Use Astro's middleware for authentication checks

### Step 1: Update bknd.config.ts

Add an `onBuilt` handler to serve static files:

```typescript
import type { AstroBkndConfig } from "bknd/adapter/astro";
import { registerLocalMediaAdapter } from "bknd/adapter/node";

export default {
  app: (env) => ({
    connection: {
      url: env.BKND_DB_URL || "file:data.db",
    },
    config: {
      data: {
        entities: {
          todos: {
            fields: {
              title: { type: "text", required: true },
              done: { type: "boolean", default: false },
            },
          },
        },
      },
    },
  }),
  onBuilt: async (app) => {
    // Register admin controller to serve static assets
    await app.server.registerController({
      path: "/_bknd",
      handler: app.server.adminController,
      method: "*",
    });
  },
} satisfies AstroBkndConfig;
```

### Step 2: Add Postinstall Script

Update `package.json` to copy Bknd static assets:

```json
{
  "scripts": {
    "postinstall": "cp -r node_modules/bknd/dist/public public/_bknd"
  }
}
```

### Step 3: Create Middleware

Create `src/middleware.ts`:

```typescript
import { getApp } from "../bknd";
import type { MiddlewareHandler } from "astro";

const app = await getApp();

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);

  // Route API and admin requests to Bknd
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin/")) {
    return app.server.fetch(context.request);
  }

  // Continue to Astro routes
  return next();
};
```

### Step 4: Use Bknd in Pages

With middleware, you can use Bknd directly in Astro pages:

```astro
---
import { getApi } from "../bknd";

const api = await getApi(Astro);
const { data } = await api.data.readMany("todos");
---

<h1>Todos</h1>
{data.map((todo) => (
  <li>{todo.title}</li>
))}
```

## Authentication Patterns

### Protected Routes

```typescript
import { getApi } from "../bknd";
import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const api = await getApi(context);

  try {
    const user = api.getUser();

    if (!user) {
      return context.redirect("/login");
    }

    context.locals.user = user;
    return next();
  } catch (error) {
    return context.redirect("/login");
  }
};
```

### Admin UI with Auth

```astro
---
import { Admin } from "bknd/ui";
import "bknd/dist/styles.css";
import { getApi } from "../../bknd";

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
      config={{ basepath: "/admin" }}
      client:only
    />
  </body>
</html>
```

## Type Safety

Bknd provides full TypeScript support for Astro. Generate types:

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

Ensure your production environment has:

```env
BKND_DB_URL=your-production-database-url
```

### Deployment Targets

- **Vercel**: Works out of the box
- **Netlify**: Works with SSR enabled
- **Cloudflare Pages**: Use adapter-sst or adapter-node
- **Node.js**: Works with adapter-node

## Common Patterns

### Server Actions Pattern

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

const { data } = await api.data.readMany("todos");
---

<form method="POST">
  <input name="title" type="text" required />
  <button type="submit">Add Todo</button>
</form>

<ul>
  {data.map((todo) => (
    <li>{todo.title}</li>
  ))}
</ul>
```

### Error Handling

```typescript
import { getApi } from "../bknd";

try {
  const api = await getApi(Astro);
  const { data } = await api.data.readMany("posts");
  // Use data
} catch (error) {
  console.error("Failed to fetch posts:", error);
  // Handle error
}
```

## Unknown Details

The following aspects require further research:

**⚠️ Unknown: Client-Side SDK Integration**

It's unclear whether Bknd's React SDK (`useAuth`, `useEntityQuery` hooks) works with Astro's islands/components. Astro's partial hydration may have compatibility issues.

**What we know:**
- Server-side `getApi()` works perfectly
- Admin UI requires `client:only` directive
- React components can be used in Astro islands

**What we don't know:**
- Whether `useAuth()` hook works in Astro island components
- How to combine server-side rendering with client-side state management
- Best practices for optimistic updates in Astro

**Workaround:**
Use server-side data fetching with `<form>` submissions and redirects. Client-side SDK may work in pure React islands, but needs testing.

**TODO:** Test React SDK integration with Astro islands and update this section.

### Static Assets

The middleware pattern requires copying Bknd static assets manually. The page-based approach handles this automatically.

## Troubleshooting

### Issue: "getApi is not a function"

**Cause:** Importing from wrong package or missing helper file.

**Solution:** Ensure you have created `src/bknd.ts` with the `getApi` export and import from that file.

### Issue: Admin UI shows blank screen

**Cause:** Missing `client:only` directive or incorrect basepath.

**Solution:** Add `client:only` to the Admin component and verify `basepath` config matches your route.

### Issue: Types not generated

**Cause:** Missing `npx bknd types` command or incorrect tsconfig.

**Solution:** Run `npx bknd types --out bknd-types.d.ts` and ensure `"include": ["bknd-types.d.ts"]` in tsconfig.json.

### Issue: Middleware not working

**Cause:** Astro SSR not enabled.

**Solution:** Ensure you have `output: 'server'` in `astro.config.mjs` or `export const prerender = false;` on specific pages.

## Comparison: Page-Based vs Middleware

| Aspect | Page-Based | Middleware |
|--------|-----------|-------------|
| **Setup** | Simpler | More complex |
| **Route Control** | Separate routes | Centralized routing |
| **Static Assets** | Automatic | Manual copy required |
| **Best For** | Most use cases | Advanced routing needs |

## Next Steps

- [Deploy to Production Guide](/getting-started/deploy-to-production)
- [Auth with Permissions Tutorial](/getting-started/add-authentication)
- [Data Module Reference](/reference/data-module)
