---
title: Build Your First API
description: Create a complete backend with Bknd in 15 minutes
---

In this tutorial, you'll build a complete todo API backend with Bknd. You'll learn how to:

- Set up Bknd with Vite + React
- Define your data model
- Enable authentication
- Build a React UI to consume your API

## Prerequisites

- Node.js 22 or higher
- Basic knowledge of React
- 15 minutes

## Step 1: Create a Vite + React Project

Create a new Vite project and install Bknd:

```bash
npm create vite@latest my-first-api -- --template react
cd my-first-api
npm install
npm install bknd @hono/vite-dev-server
```

## Step 2: Configure Bknd with Schema

Create a `bknd.config.ts` file in the root of your project:

```typescript
import { createApp, em, entity, text, boolean } from "bknd";
import type { ViteBkndConfig } from "bknd/adapter/vite";

// Define your data model
const schema = em({
  todos: entity("todos", {
    title: text().required(),
    done: boolean(),
  }),
});

export default {
  connection: {
    url: "file:data.db",
  },
  config: {
    data: schema.toJSON(),
  },
} satisfies ViteBkndConfig;
```

This configures:
- SQLite database stored in `data.db`
- A `todos` entity with `title` (text) and `done` (boolean) fields
- The `id` field is automatically added by Bknd

Create a `server.ts` file to serve the API:

```typescript
import { serve } from "bknd/adapter/vite";
import config from "./bknd.config";

export default serve(config);
```

Update your `vite.config.ts`:

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

## Step 3: Start the Backend

Run your development server:

```bash
npm run dev
```

Visit `http://localhost:5174/api/system/config` to verify the API is running.

## Step 4: Add the Admin UI

Replace the contents of `App.tsx` with:

```typescript
import { Admin } from "bknd/ui";
import "bknd/dist/styles.css";

export default function App() {
  return <Admin withProvider />;
}
```

Visit `http://localhost:5174/` to access the Admin UI.

## Step 5: Manage Data with Admin UI

Visit `http://localhost:5174/` to access the Admin UI.

The Admin UI allows you to:
- View and edit all `todos` records
- Add new todos with the form interface
- Delete existing todos
- Filter and sort your data

Since we defined our `todos` entity in `bknd.config.ts`, it's automatically available in the Admin UI. No additional configuration needed.

**Note:** In this tutorial, we're using `code mode` (schema defined in code). If you prefer to define entities visually, you can switch to `db mode` by removing the `config` object from your `bknd.config.ts` and creating entities through the Admin UI. For production deployments using hybrid mode, the `sync_required` flag automatically handles schema synchronization in development. See [Choose Your Mode](../how-to-guides/setup/choose-your-mode.md) for details on hybrid mode improvements in v0.20.0.

## Step 6: Enable Auth Module

**UNKNOWN: This section requires more research.**

To enable authentication, you need to configure the Auth module in `bknd.config.ts`:

```typescript
export default {
  connection: {
    url: "file:data.db",
  },
  config: {
    auth: {
      enabled: true,
      jwt: {
        issuer: "my-first-api",
      },
    },
  },
} satisfies ViteBkndConfig;
```

**What I don't know:**
- How to create the first admin user through the Admin UI
- The exact CLI command syntax for user creation (e.g., `npx bknd user create ...`)
- Whether user creation requires a manual database operation initially

## Step 7: Build the React UI

Use the Bknd SDK to interact with your API. First, generate types:

```bash
npx bknd types
```

Create a component to display todos:

```typescript
import { Api } from "bknd/client";
import { useEffect, useState } from "react";

const api = new Api();

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    api.data.readMany("todos").then(({ data }) => setTodos(data));
  }, []);

  const addTodo = async () => {
    const { data } = await api.data.createOne("todos", {
      title: "New todo",
      done: false,
    });
    setTodos([...todos, data]);
  };

  return (
    <div>
      <h1>My Todo App</h1>
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos.map((todo: any) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

## Next Steps

- Learn about [Authentication](./add-authentication.md) - Add user auth with permissions
- Explore [Data Module Reference](../reference/data-module.md) - Complete CRUD operations API
- Read [Deploy to Production](./deploy-to-production.md) - Launch your app
- View [Configuration Reference](../reference/configuration.md) - All configuration options
- Choose Your [Configuration Mode](../how-to-guides/setup/choose-your-mode.md) - Understand db vs code mode
- Learn [Database Seeding](../how-to-guides/data/seed-database.md) - Populate initial data

## Related Guides

- [Create First User](../how-to-guides/auth/create-first-user.md) - User creation methods
- [Seed Database](../how-to-guides/data/seed-database.md) - Database initialization patterns
- [Schema IDs vs UUIDs](../how-to-guides/data/schema-ids-vs-uuids.md) - Primary key configuration
- [Choose Your Mode](../how-to-guides/setup/choose-your-mode.md) - Configuration and deployment decisions

## Troubleshooting

If you encounter issues with entity creation or user management, please:
1. Check the [Troubleshooting FAQ](./troubleshooting/common-issues.md)
2. Open an issue on [GitHub](https://github.com/bknd-io/bknd/issues)

## What We Learned

In this tutorial, you learned:
- How to set up Bknd with Vite + React
- How to define your data model using `em()` and `entity()` in code
- How to serve the API and Admin UI
- How to use the Admin UI to manage your data
- How to use the Bknd SDK in your React components

**Note:** This tutorial uses `code mode` (schema defined in code). For visual schema creation in Admin UI, see [Choose Your Mode](../how-to-guides/setup/choose-your-mode.md) to learn about `db mode`.
