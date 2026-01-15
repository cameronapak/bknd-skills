---
title: React Router Integration
description: Integrate Bknd with React Router v7 using loaders, actions, and the adapter API
---

React Router integration provides a seamless way to build full-stack applications with Bknd's backend capabilities, leveraging React Router v7's data loading and mutation patterns.

## Overview

Bknd's React Router adapter provides:
- **Type-safe loaders** - Server-side data fetching with automatic type inference
- **Action handlers** - Form submissions and mutations with type safety
- **Authentication** - Integrated auth verification in loaders
- **Admin UI** - Lazy-loaded admin interface support

## Installation

```bash
# Create new project with Bknd CLI (recommended)
npx bknd create -i react-router

# Or add Bknd to existing project
npm install bknd
```

## Configuration

Create `bknd.config.ts` in your project root:

```typescript
import type { ReactRouterBkndConfig } from "bknd/adapter/react-router";

export default {
  connection: {
    url: "file:data.db",
  },
} satisfies ReactRouterBkndConfig;
```

**Note:** `ReactRouterBkndConfig` extends the base `BkndConfig` with environment variables support.

## Helper Setup

Create `app/bknd.ts` to centralize Bknd API access:

```typescript
import { getApp as getBkndApp } from "bknd/adapter/react-router";
import config from "../bknd.config";

export { config };

export async function getApp() {
  return await getBkndApp(config, process.env as any);
}

export async function getApi(
  args?: { request: Request },
  opts?: { verify?: boolean }
) {
  const app = await getApp();
  if (opts?.verify) {
    const api = app.getApi({ headers: args?.request.headers });
    await api.verifyAuth();
    return api;
  }

  return app.getApi();
}
```

This helper provides:
- `getApp()` - Returns cached Bknd application instance
- `getApi(args, { verify })` - Gets API with optional auth verification

## Server-Side Data Fetching (Loaders)

Use loaders to fetch data on the server with type safety:

```typescript
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { getApi } from "~/bknd";

export const loader = async (args: LoaderFunctionArgs) => {
  // Get API with auth verification
  const api = await getApi(args, { verify: true });

  const { data: posts } = await api.data.readMany("posts", {
    sort: "-id",
    limit: 10,
  });

  const user = api.getUser();

  return { posts, user };
};

export default function PostsPage() {
  const { posts, user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Posts ({user ? `Logged in as ${user.email}` : "Guest"})</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Key points:**
- Pass `{ verify: true }` to `getApi()` for protected routes
- Use `api.getUser()` to access current user
- Loader data is automatically typed based on return value

## Form Handling (Actions)

Use actions to handle form submissions and mutations:

```typescript
import { type ActionFunctionArgs, redirect } from "react-router";
import { getApi } from "~/bknd";

export const action = async (args: ActionFunctionArgs) => {
  const api = await getApi();
  const formData = await args.request.formData();

  const action = formData.get("action") as string;

  switch (action) {
    case "create": {
      const title = formData.get("title") as string;
      await api.data.createOne("posts", { title });
      break;
    }
    case "delete": {
      const id = Number(formData.get("id"));
      await api.data.deleteOne("posts", id);
      break;
    }
  }

  return redirect("/posts");
};
```

**Note:** Actions typically don't require `{ verify: true }` since mutations can be protected via permissions on the Bknd side.

## Authentication Integration

### Protected Routes

Require authentication in loaders:

```typescript
export const loader = async (args: LoaderFunctionArgs) => {
  const api = await getApi(args, { verify: true });
  const user = api.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    throw redirect("/login");
  }

  return { user };
};
```

### Login/Logout

```typescript
// Login route
export const action = async (args: ActionFunctionArgs) => {
  const api = await getApi();
  const formData = await args.request.formData();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await api.auth.login({ email, password });

  return redirect("/dashboard");
};

// Logout route
export const action = async () => {
  const api = await getApi();
  await api.auth.logout();
  return redirect("/");
};
```

## Admin UI Integration

Create an admin route with lazy-loaded Admin UI:

```typescript
import { lazy, Suspense } from "react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { getApi } from "~/bknd";

const Admin = lazy(() =>
  import("bknd/ui").then((mod) => ({ default: mod.Admin }))
);

import "bknd/dist/styles.css";

export const loader = async (args: LoaderFunctionArgs) => {
  const api = await getApi(args, { verify: true });

  return {
    user: api.getUser(),
  };
};

export default function AdminPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<div>Loading admin...</div>}>
      <Admin
        withProvider={{ user }}
        config={{
          basepath: "/admin",
          logo_return_path: "/",
        }}
      />
    </Suspense>
  );
}
```

**Note:** The Admin UI is lazy-loaded to avoid bundling it in the main bundle.

## Unknown Details

The following aspects require further research or testing:

### API Catch-All Route Setup
**Status:** ⚠️ Unclear workflow

**What I know:**
- Next.js uses `app/api/[[...bknd]]/route.ts` with `serve()` from `bknd/adapter/nextjs`
- The example mentions `api.$.tsx` but the file was not found in the repository

**What I don't know:**
- How to set up the catch-all API route in React Router
- Whether `serve()` from `bknd/adapter/react-router` is used
- How to handle different API endpoints (auth, data, media)

**TODO:** This section needs to be updated after testing the actual API route setup

### Authentication Redirects
**Status:** ⚠️ Best practices unclear

**What I know:**
- Can use `throw redirect()` in loaders
- `verifyAuth()` throws if user is not authenticated

**What I don't know:**
- Best practices for handling auth failures
- Whether to use React Router middleware for auth checks
- How to persist auth state across route transitions

### Client-Side SDK Integration
**Status:** ⚠️ Unclear integration pattern

**What I know:**
- React SDK exists with hooks like `useAuth()`, `useEntityQuery()`
- Next.js example uses `<ClientProvider>` in layout

**What I don't know:**
- Whether to use client-side SDK in React Router
- How to combine server-side loaders with client-side hooks
- Best practices for data fetching (server vs client)

**TODO:** This section needs examples for client-side SDK usage

## Deployment

Build and deploy your React Router application:

```bash
npm run build
```

Configure environment variables for production:

```bash
# .env
DB_URL=postgres://user:pass@host:port/db
JWT_SECRET=your-secret-here
```

> **Note:** As of v0.20.0, PostgreSQL adapters (`pg`, `postgresJs`) are available directly from `bknd` package. Previously they were in a separate `@bknd/postgres` package. See [PostgreSQL Migration Guide](/migration-guides/postgres-package-merge) for adapter configuration examples.

**Note:** The `process.env` is passed to `getApp()` in the helper, allowing environment variable access.

## Troubleshooting

### Type Errors
- Ensure `bknd.config.ts` uses `satisfies ReactRouterBkndConfig`
- Run `npx bknd types` to generate types if needed

### Authentication Issues
- Check that auth is enabled in `bknd.config.ts`
- Verify JWT secret is set in environment variables
- Use `{ verify: true }` in `getApi()` for protected routes

### Admin UI Not Loading
- Ensure `bknd/dist/styles.css` is imported
- Check that `<Admin>` is lazy-loaded with `<Suspense>`
- Verify user has permission to access admin

## Example Project

For a complete working example, see:
- [React Router Example](https://github.com/bknd-io/bknd/tree/main/examples/react-router)

The example demonstrates:
- Basic CRUD operations with loaders and actions
- Authentication integration
- Admin UI setup
- Form handling with useFetcher

## Related Documentation

- [React Router Data Loading](https://reactrouter.com/start/data)
- [Authentication Guide](/getting-started/add-authentication)
- [React SDK](https://docs.bknd.io/usage/react)
- [Admin UI](https://docs.bknd.io/extending/admin)
