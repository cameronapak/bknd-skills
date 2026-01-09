---
title: SvelteKit Integration
description: Set up Bknd with SvelteKit for full-stack applications
---

Integrate Bknd with SvelteKit for full-stack applications with SSR and optimized performance. This integration leverages SvelteKit's hooks system and load functions for seamless data fetching.

## Overview

The SvelteKit integration is ideal for:
- Full-stack applications with server-side rendering
- Projects requiring SEO optimization
- Teams familiar with Svelte and SvelteKit conventions
- Edge deployment with Vercel or Cloudflare

**Key Features:**
- Server-side data fetching via load functions
- API routes handled through SvelteKit hooks
- Admin UI support with static asset serving
- Runtime-agnostic deployment (Node.js, Bun, Edge)
- Full TypeScript support
- Type-safe environment variables via `$env/dynamic/private`

## Prerequisites

- Node.js 22 or higher (or Bun for Bun runtime)
- Basic knowledge of SvelteKit and its conventions
- SvelteKit project created (or follow manual setup below)

## Installation

### Option 1: Manual Setup

Create a new SvelteKit project and install bknd:

```bash
npm create svelte@latest my-app
cd my-app
npm install bknd
```

Then copy Admin UI assets to your static folder by adding a postinstall script:

```json title="package.json"
{
  "scripts": {
    "postinstall": "bknd copy-assets --out static"
  }
}
```

### Option 2: CLI Starter (Recommended)

Use Bknd CLI to scaffold a complete SvelteKit project:

```bash
npx bknd create -i sveltekit
```

This creates a complete project structure with:
- Pre-configured bknd setup
- Example schema with todos entity
- Authentication configured
- Admin UI integrated
- Example routes demonstrating API usage

## Configuration

### 1. Create `bknd.config.ts`

Create a configuration file in your project root:

```typescript title="bknd.config.ts"
import type { SvelteKitBkndConfig } from "bknd/adapter/sveltekit";

export default {
  connection: {
    url: "file:data.db",
  },
} satisfies SvelteKitBkndConfig;
```

### PostgreSQL Adapter Options

For PostgreSQL connections, Bknd provides two adapters:

#### pg Adapter (node-postgres)

Best for traditional Node.js applications with connection pooling:

```typescript
import { pg } from "bknd";
import { Pool } from "pg";
import type { SvelteKitBkndConfig } from "bknd/adapter/sveltekit";

export default {
  connection: pg({
    pool: new Pool({
      connectionString: "postgresql://user:password@localhost:5432/dbname",
    }),
  }),
} satisfies SvelteKitBkndConfig;
```

#### postgresJs Adapter

Best for edge runtimes:

```typescript
import { postgresJs } from "bknd";
import postgres from "postgres";
import type { SvelteKitBkndConfig } from "bknd/adapter/sveltekit";

export default {
  connection: postgresJs({
    postgres: postgres("postgresql://user:password@localhost:5432/dbname"),
  }),
} satisfies SvelteKitBkndConfig;
```

### Schema and Auth Configuration

```typescript title="bknd.config.ts"
import type { SvelteKitBkndConfig } from "bknd/adapter/sveltekit";
import { em, entity, text } from "bknd";

const schema = em({
  todos: entity("todos", {
    title: text().required(),
    done: text(),
  }),
});

export default {
  connection: {
    url: "file:data.db",
  },
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      allow_register: true,
      jwt: {
        issuer: "bknd-sveltekit-app",
        secret: process.env.JWT_SECRET || "dev-secret-change-in-production",
      },
      roles: {
        admin: {
          implicit_allow: true,
        },
        default: {
          permissions: ["data.entity.read", "data.entity.create"],
          is_default: true,
        },
      },
    },
  },
} satisfies SvelteKitBkndConfig;
```

See [configuration reference](../../../reference/configuration.md) for complete configuration options.

## API Setup

The SvelteKit adapter uses SvelteKit's hooks mechanism to handle API requests. Create `src/hooks.server.ts`:

```typescript title="src/hooks.server.ts"
import type { Handle } from "@sveltejs/kit";
import { serve } from "bknd/adapter/sveltekit";
import { env } from "$env/dynamic/private";
import config from "../bknd.config";

const bkndHandler = serve(config, env);

export const handle: Handle = async ({ event, resolve }) => {
  // Handle bknd API requests
  const pathname = event.url.pathname;
  if (pathname.startsWith("/api/")) {
    const res = await bkndHandler(event);
    if (res.status !== 404) {
      return res;
    }
  }

  return resolve(event);
};
```

<Callout type="info">
The adapter uses `$env/dynamic/private` to access environment variables, making it runtime-agnostic and compatible with any deployment target (Node.js, Bun, Cloudflare, etc.).
</Callout>

## Server-Side Data Fetching

Use SvelteKit's load functions to fetch data from Bknd on the server:

### Basic Data Fetching

```typescript title="src/routes/+page.server.ts"
import type { PageServerLoad } from "./$types";
import { getApp } from "bknd/adapter/sveltekit";
import { env } from "$env/dynamic/private";
import config from "../../bknd.config";

export const load: PageServerLoad = async () => {
  const app = await getApp(config, env);
  const api = app.getApi();

  const todos = await api.data.readMany("todos");

  return {
    todos: todos.data ?? [],
  };
};
```

Display data in your Svelte component:

```svelte title="src/routes/+page.svelte"
<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<h1>Todos</h1>
<ul>
  {#each data.todos as todo (todo.id)}
    <li>{todo.title}</li>
  {/each}
</ul>
```

### With Authentication

To use authentication in your load functions, pass request headers to the API:

```typescript title="src/routes/+page.server.ts"
import type { PageServerLoad } from "./$types";
import { getApp } from "bknd/adapter/sveltekit";
import { env } from "$env/dynamic/private";
import config from "../../bknd.config";

export const load: PageServerLoad = async ({ request }) => {
  const app = await getApp(config, env);
  const api = app.getApi({ headers: request.headers });
  await api.verifyAuth();

  const todos = await api.data.readMany("todos");

  return {
    todos: todos.data ?? [],
    user: api.getUser(),
  };
};
```

### Creating Data

Create an action to handle form submissions:

```svelte title="src/routes/+page.svelte"
<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>Todos</h1>

<form method="POST" action="?/createTodo" use:enhance>
  <input type="text" name="title" required />
  <button type="submit">Add Todo</button>
</form>

<ul>
  {#each data.todos as todo (todo.id)}
    <li>{todo.title}</li>
  {/each}
</ul>
```

```typescript title="src/routes/+page.server.ts"
import type { Actions, PageServerLoad } from "./$types";
import { getApp } from "bknd/adapter/sveltekit";
import { env } from "$env/dynamic/private";
import { fail } from "@sveltejs/kit";
import config from "../../bknd.config";

export const load: PageServerLoad = async () => {
  const app = await getApp(config, env);
  const api = app.getApi();

  const todos = await api.data.readMany("todos");

  return { todos: todos.data ?? [] };
};

export const actions: Actions = {
  createTodo: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title") as string;

    const app = await getApp(config, env);
    const api = app.getApi();
    await api.data.create("todos", { title });

    return { success: true };
  },
};
```

## Admin UI

### Enable Admin UI

Admin UI can be served as static assets from SvelteKit:

```typescript title="bknd.config.ts"
import type { SvelteKitBkndConfig } from "bknd/adapter/sveltekit";

export default {
  connection: {
    url: "file:data.db",
  },
  adminOptions: {
    adminBasepath: "/admin"
  },
} satisfies SvelteKitBkndConfig;
```

Update your `hooks.server.ts` to handle admin routes:

```typescript title="src/hooks.server.ts"
import type { Handle } from "@sveltejs/kit";
import { serve } from "bknd/adapter/sveltekit";
import { env } from "$env/dynamic/private";
import config from "../bknd.config";

const bkndHandler = serve(config, env);

export const handle: Handle = async ({ event, resolve }) => {
  // Handle bknd API and admin requests
  const pathname = event.url.pathname;
  if (pathname.startsWith("/api/") || pathname.startsWith("/admin")) {
    const res = await bkndHandler(event);
    if (res.status !== 404) {
      return res;
    }
  }

  return resolve(event);
};
```

### Access Admin UI

Navigate to `/admin` in your browser to access the Admin UI.

<Callout type="warning">
Remember to run `npm install` or `pnpm install` after adding the postinstall script to ensure Admin UI assets are copied to the static folder.
</Callout>

## Type Safety

Bknd provides full TypeScript support with auto-generated types:

```typescript title="src/routes/+page.server.ts"
import type { PageServerLoad } from "./$types";
import { getApp } from "bknd/adapter/sveltekit";
import { env } from "$env/dynamic/private";
import config from "../../bknd.config";

export const load: PageServerLoad = async () => {
  const app = await getApp(config, env);
  const api = app.getApi();

  // Type-safe API calls
  const todos = await api.data.readMany("todos");

  return {
    todos: todos.data ?? [],
  };
};
```

Your data is fully typed - no `any` types needed!

## Deployment

### Vercel Deployment

SvelteKit with Bknd can be deployed to Vercel with minimal configuration:

```typescript title="svelte.config.js"
import adapter from "@sveltejs/adapter-vercel";

export default {
  adapter: adapter(),
};
```

Set environment variables in Vercel dashboard:

- `DATABASE_URL` - Your database connection string
- `JWT_SECRET` - Secret for JWT tokens

### Edge Runtime

For edge deployment with Vercel Edge Functions or Cloudflare Workers:

1. Use `postgresJs` adapter (not `pg`)
2. Configure runtime in SvelteKit:

```typescript title="svelte.config.js"
import adapter from "@sveltejs/adapter-vercel";

export default {
  adapter: adapter({
    edge: true,
  }),
};
```

3. Use environment variables compatible with edge runtimes

## Complete Example

Here's a complete example of a todo app with Bknd + SvelteKit:

**bknd.config.ts:**
```typescript
import type { SvelteKitBkndConfig } from "bknd/adapter/sveltekit";
import { em, entity, text } from "bknd";

const schema = em({
  todos: entity("todos", {
    title: text().required(),
    done: text(),
  }),
});

export default {
  connection: {
    url: "file:data.db",
  },
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      allow_register: true,
      jwt: {
        issuer: "bknd-sveltekit-example",
        secret: process.env.JWT_SECRET || "dev-secret",
      },
    },
  },
  options: {
    seed: async (ctx) => {
      await ctx.em.mutator("todos").insertMany([
        { title: "Learn Bknd", done: "true" },
        { title: "Build with SvelteKit", done: "false" },
      ]);
    },
  },
} satisfies SvelteKitBkndConfig;
```

**src/hooks.server.ts:**
```typescript
import type { Handle } from "@sveltejs/kit";
import { serve } from "bknd/adapter/sveltekit";
import { env } from "$env/dynamic/private";
import config from "../bknd.config";

const bkndHandler = serve(config, env);

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;
  if (pathname.startsWith("/api/")) {
    const res = await bkndHandler(event);
    if (res.status !== 404) {
      return res;
    }
  }

  return resolve(event);
};
```

**src/routes/+page.server.ts:**
```typescript
import type { Actions, PageServerLoad } from "./$types";
import { getApp } from "bknd/adapter/sveltekit";
import { env } from "$env/dynamic/private";
import { fail, redirect } from "@sveltejs/kit";
import config from "../../bknd.config";

export const load: PageServerLoad = async () => {
  const app = await getApp(config, env);
  const api = app.getApi();

  const todos = await api.data.readMany("todos");

  return { todos: todos.data ?? [] };
};

export const actions: Actions = {
  createTodo: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title") as string;

    if (!title) {
      return fail(400, { error: "Title is required" });
    }

    const app = await getApp(config, env);
    const api = app.getApi();
    await api.data.create("todos", { title });

    return { success: true };
  },

  toggleTodo: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const done = formData.get("done") as string;

    const app = await getApp(config, env);
    const api = app.getApi();
    await api.data.update("todos", id, { done });

    return { success: true };
  },

  deleteTodo: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    const app = await getApp(config, env);
    const api = app.getApi();
    await api.data.delete("todos", id);

    return { success: true };
  },
};
```

**src/routes/+page.svelte:**
```svelte
<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>Todo App</h1>

{#if form?.error}
  <p style="color: red">{form.error}</p>
{/if}

{#if form?.success}
  <p style="color: green">Action completed!</p>
{/if}

<form method="POST" action="?/createTodo" use:enhance>
  <input type="text" name="title" placeholder="New todo..." required />
  <button type="submit">Add Todo</button>
</form>

<ul>
  {#each data.todos as todo (todo.id)}
    <li>
      <form method="POST" action="?/toggleTodo" use:enhance style="display: inline;">
        <input type="hidden" name="id" value={todo.id} />
        <input type="hidden" name="done" value={todo.done === "true" ? "false" : "true"} />
        <input type="checkbox" checked={todo.done === "true"} onchange="this.form.submit()" />
      </form>

      <span style="text-decoration: {todo.done === 'true' ? 'line-through' : 'none'}">
        {todo.title}
      </span>

      <form method="POST" action="?/deleteTodo" use:enhance style="display: inline; margin-left: 10px;">
        <input type="hidden" name="id" value={todo.id} />
        <button type="submit" style="color: red;">×</button>
      </form>
    </li>
  {/each}
</ul>

<p><a href="/api/data/entity/todos">API: /api/data/entity/todos</a></p>
```

## Best Practices

- Use server-side load functions for data fetching to avoid exposing API credentials to the client
- Keep Admin UI accessible only to authorized users
- Use environment variables for sensitive configuration (JWT secrets, database URLs)
- Implement proper error handling in load functions and actions
- Use SvelteKit's form actions for mutations (create, update, delete)
- Leverage SvelteKit's `$env/dynamic/private` for runtime-agnostic environment variable access

## Troubleshooting

**Admin UI 404 error:**
- Ensure you've added the postinstall script to package.json
- Run `npm install` or `pnpm install` to copy assets

**API routes returning 404:**
- Check that your hooks.server.ts correctly routes API requests
- Verify the `/api/` prefix matches in both hooks.server.ts and your API calls

**Environment variables not loading:**
- Use `$env/dynamic/private` instead of `$env/static/private` for runtime compatibility
- Verify environment variables are set in your deployment platform

## Next Steps

- [Configure authentication](../../authentication/add-authentication.md) for user management
- [Learn about data relationships](../../data/entity-media-relationships.md)
- [Deploy to production](../../../getting-started/deploy-to-production.md)
- Explore [Admin UI](../../../reference/schema.md) for visual schema management

## Additional Resources

- [SvelteKit Official Documentation](https://svelte.dev/docs/kit)
- [Bknd GitHub Example](https://github.com/bknd-io/bknd/tree/main/examples/sveltekit)
- [Framework Comparison](./framework-comparison.md)
