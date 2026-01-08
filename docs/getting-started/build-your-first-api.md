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

## Step 2: Configure Bknd

Create a `bknd.config.ts` file in the root of your project:

```typescript
import type { ViteBkndConfig } from "bknd/adapter/vite";

export default {
  connection: {
    url: "file:data.db",
  },
} satisfies ViteBkndConfig;
```

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

## Step 5: Define Your Data Model

**UNKNOWN: This section requires more research.**

Based on available documentation, you should be able to:
1. Navigate to the Admin UI
2. Create entities with fields using a visual interface
3. Save the configuration to the database

However, the exact steps and UI flow for creating entities in the Admin UI are not documented. The Admin UI documentation focuses on customization options rather than basic entity creation workflow.

**What I know:**
- The Admin UI can manage backend configuration visually in `db` mode
- You can customize entity rendering and behavior
- Configuration is stored in the database

**What I don't know:**
- The exact menu/flow to create a new entity
- The field types available in the UI (text, number, boolean, etc.)
- How to set field properties (required, unique, etc.)
- How to create relationships between entities

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

- Learn about [Authentication](/getting-started/add-authentication)
- Explore [Query Options](/reference/data-module)
- Read about [Deployment](/getting-started/deploy-to-production)

## Troubleshooting

If you encounter issues with entity creation or user management, please:
1. Check the [Troubleshooting FAQ](/troubleshooting/common-issues)
2. Open an issue on [GitHub](https://github.com/bknd-io/bknd/issues)

## What We Learned

In this tutorial, you learned:
- How to set up Bknd with Vite + React
- How to serve the API and Admin UI
- How to use the Bknd SDK in your React components
- What areas of the documentation need more research (entity creation workflow, user management)
