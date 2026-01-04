## WIP: Build a Full-Stack Todo App with bknd and React (20 minutes)

### Target Outcome
A working todo app with:
- Local SQLite database
- Create, read, update, delete todos
- User authentication
- Clean React UI

### Structure (10 Steps, ~20 minutes)

---

## Step 1: Create the Project (3 minutes)
```bash
# Create React app with Vite
npm create vite@latest my-todo-app -- --template react-ts
cd my-todo-app
npm install

# Install bknd and React Router
npm install bknd react-router-dom @bknd/sqlocal
```

**Checkpoint**: Run `npm run dev` and verify the Vite starter loads.

---

## Step 2: Configure bknd (4 minutes) ⚠️ *Common failure point*

Create `bknd.config.ts` in root:

```typescript
import { em, entity, text, boolean } from "bknd";
import { secureRandomString } from "bknd/utils";

// Define your todo entity
const schema = em({
  todos: entity("todos", {
    title: text(),
    done: boolean(),
  }),
});

// Register types for autocomplete
type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}

export default {
  connection: {
    url: ":memory:", // Local database, clears on refresh
  },
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      jwt: {
        secret: secureRandomString(32),
      },
    },
  },
} as const;
```

**Why this matters**: This configuration tells bknd what your data looks like. Without it, nothing works.

---

## Step 3: Initialize the App (3 minutes)

Create `src/bknd.ts`:

```typescript
import { App } from "bknd";
import { SQLocalConnection } from "@bknd/sqlocal";
import config from "../bknd.config";

export async function getApp() {
  const connection = new SQLocalConnection({
    databasePath: ":memory:",
  });

  const app = App.create({
    connection,
    config,
    options: {
      seed: async (ctx) => {
        // Add sample todos
        await ctx.em.mutator("todos").insertMany([
          { title: "Learn bknd", done: true },
          { title: "Build something cool", done: false },
        ]);
      },
    },
  });

  await app.build({ sync: true });
  return app;
}

export async function getApi() {
  const app = await getApp();
  return app.getApi();
}
```

**Checkpoint**: Your configuration is now ready to connect to a database.

---

## Step 4: Set Up React Router (2 minutes)

Update `src/main.tsx`:

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import Root from "./routes/root";
import { ErrorBoundary } from "./routes/error-boundary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorBoundary />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
```

---

## Step 5: Create the Todo List UI (4 minutes)

Create `src/routes/root.tsx`:

```typescript
import { useState, useEffect } from "react";
import { getApi } from "../bknd";

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export default function Root() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  // Load todos on mount
  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      const api = await getApi();
      const { data } = await api.data.readMany("todos");
      setTodos(data);
    } catch (error) {
      console.error("Failed to load todos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo() {
    if (!newTitle.trim()) return;

    try {
      const api = await getApi();
      await api.data.createOne("todos", { title: newTitle, done: false });
      setNewTitle("");
      await loadTodos();
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  }

  async function toggleTodo(id: number, done: boolean) {
    try {
      const api = await getApi();
      await api.data.updateOne("todos", id, { done });
      await loadTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  }

  async function deleteTodo(id: number) {
    try {
      const api = await getApi();
      await api.data.deleteOne("todos", id);
      await loadTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1>My Todo App</h1>
      
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new todo..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10,
            padding: 10,
            borderBottom: "1px solid #eee"
          }}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={(e) => toggleTodo(todo.id, e.target.checked)}
            />
            <span style={{ 
              textDecoration: todo.done ? "line-through" : "none",
              flex: 1
            }}>
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Create `src/routes/error-boundary.tsx`:

```typescript
export function ErrorBoundary() {
  return <div>Something went wrong. Check the console for details.</div>;
}
```

**Checkpoint**: Run the app. You should see the seeded todos and be able to add, toggle, and delete them.

---

## Step 6: Add Authentication (3 minutes)

Create `src/routes/auth.tsx`:

```typescript
import { useState } from "react";
import { getApi } from "../bknd";

export default function Auth({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const api = await getApi();
      
      // Try to login
      try {
        await api.auth.login({ email, password });
        onAuthenticated();
      } catch (loginError) {
        // If login fails, create the user
        await api.auth.signup({ email, password });
        onAuthenticated();
      }
    } catch (error) {
      console.error("Auth failed:", error);
      alert("Authentication failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 20 }}>
      <h2>Login / Sign Up</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 15 }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 5 }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: "100%", padding: 8, marginTop: 5 }}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login / Sign Up"}
        </button>
      </form>
      <p style={{ fontSize: 14, color: "#666", marginTop: 15 }}>
        Tip: Enter any email and 8+ character password. If the user doesn't exist, we'll create it.
      </p>
    </div>
  );
}
```

Update `src/routes/root.tsx` to include auth:

```typescript
// Add this near the top
import Auth from "./auth";
import { useEffect, useState } from "react";

// In Root component, add:
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);

useEffect(() => {
  async function checkAuth() {
    try {
      const api = await getApi();
      const state = await api.getVerifiedAuthState();
      setIsAuthenticated(state.verified);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }
  checkAuth();
}, []);

if (checkingAuth) return <div>Loading...</div>;

if (!isAuthenticated) {
  return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;
}

// Keep the rest of the component the same
```

**Checkpoint**: You should now see a login screen. Enter any email/password and it will create/login the user.

---

## Step 7: Review What You Built (1 minute)

You now have:
- ✅ A React app integrated with bknd
- ✅ A local SQLite database with a todos entity
- ✅ Full CRUD operations (create, read, update, delete)
- ✅ User authentication (signup/login)
- ✅ Type-safe API calls

---

## Troubleshooting Common Issues

### "Configuration not found"
- Ensure `bknd.config.ts` is in your project root
- Check that you're importing it correctly in `src/bknd.ts`

### "Database connection failed"
- Verify you've installed `@bknd/sqlocal`
- Check that the `databasePath` is correct (`:memory:` for testing)

### "Auth not working"
- Make sure auth is enabled in `bknd.config.ts`
- Check that you're calling `api.getVerifiedAuthState()` before using protected features

---

## What's Next?

You've built a complete full-stack todo app. From here, you can:
- Add more entities (e.g., tags, due dates)
- Implement the [Admin UI](https://docs.bknd.io/admin-ui) to manage data visually
- Connect to a persistent database like [SQLite](https://docs.bknd.io/database/sqlite) or [PostgreSQL](https://docs.bknd.io/database/postgresql)
- Learn about [advanced features](https://docs.bknd.io/guide) like events, workflows, and media storage
