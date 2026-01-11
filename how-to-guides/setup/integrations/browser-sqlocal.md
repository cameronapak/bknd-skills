---
title: Browser + SQLocal Integration
description: Run Bknd entirely in the browser using SQLocal for local-first applications
---

Run Bknd entirely in the browser with SQLocal for local-first, offline-capable applications. This integration provides a complete backend experience without requiring a server.

## Overview

Browser mode runs Bknd entirely in the browser using:
- **SQLocal**: SQLite in browser using WebAssembly (WASM)
- **Origin Private File System (OPFS)**: Browser-native file storage for media
- **Full Bknd API**: All data operations, relationships, and query system available

**Use cases:**
- **Offline-first applications**: Progressive Web Apps (PWAs) that work without network
- **Local development**: Prototyping without backend setup
- **Client-side demos**: Interactive examples and tutorials
- **Privacy-focused apps**: Data never leaves user's browser
- **Embedded tools**: In-browser admin panels and dashboards

**What's available:**
- ✅ Full CRUD operations (create, read, update, delete)
- ✅ Entity relationships and eager loading
- ✅ Query system with filtering, sorting, pagination
- ✅ Admin UI for visual management
- ✅ Database export/import for migration
- ✅ Type-safe entity access

**Limitations:**
- ❌ No authentication (auth plugins not supported)
- ❌ No API routes (no HTTP server)
- ❌ No MCP integration
- ❌ Performance limited by browser and WASM

## Prerequisites

- Node.js 22 or higher
- React 18 or higher
- Vite for bundling (required for SQLocal)
- Modern browser with WebAssembly support

## Installation

### Option 1: CLI Starter (Recommended)

Use Bknd CLI to scaffold a browser-based project:

```bash
npx bknd create -i browser my-app
cd my-app
npm run dev
```

This creates a complete project with SQLocal pre-configured.

### Option 2: Manual Setup

Create a new Vite + React project:

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install bknd sqlocal wouter
```

**Required dependencies:**
- `bknd`: Main Bknd package with browser adapter
- `sqlocal`: SQLite in browser (WASM)
- `wouter`: Lightweight routing (optional, used by BkndBrowserApp)

## Configuration

### 1. Create `bknd.config.ts`

Define your Bknd schema and configuration:

```typescript
import { em, entity, text, boolean } from "bknd";

const schema = em({
  todos: entity("todos", {
    title: text(),
    done: boolean(),
  }),
});

// Register schema for TypeScript completion
type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}
```

### 2. Configure `BkndBrowserApp`

Wrap your app with `BkndBrowserApp` component:

```typescript
import { BkndBrowserApp, type BrowserBkndConfig } from "bknd/adapter/browser";
import { Route } from "wouter";
import { schema } from "./bknd.config";

const config: BrowserBkndConfig = {
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: false,  // Auth not supported in browser mode
    },
  },
  adminConfig: {
    basepath: "/admin",
    logo_return_path: "/../",
  },
  options: {
    seed: async (ctx) => {
      // Seed only runs if database is empty
      await ctx.em.mutator("todos").insertMany([
        { title: "Learn bknd", done: true },
        { title: "Build something cool", done: false },
      ]);
    },
  },
};

export default function App() {
  return (
    <BkndBrowserApp {...config}>
      <Route path="/" component={HomePage} />
    </BkndBrowserApp>
  );
}
```

**Config options:**
- `connection` (optional): SQLocal connection config or database path (default: `":localStorage:"`)
- `config.data`: Entity schema configuration
- `config.auth`: Auth settings (not supported in browser mode)
- `adminConfig`: Admin UI configuration (basepath, logo_return_path)
- `options.seed`: Function to seed initial data (runs only if DB is empty)

### 3. Update `vite.config.ts`

Configure Vite for SQLocal:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sqlocal from "sqlocal/vite";

export default defineConfig({
  plugins: [
    sqlocal(),  // Required for SQLocal
    react(),
  ],
  optimizeDeps: {
    exclude: ["sqlocal"],  // Don't bundle SQLocal
  },
});
```

The `sqlocal()` plugin:
- Handles WASM loading for SQLite
- Optimizes SQLocal bundle
- Provides hot reload support

## Database Configuration

### Database Location

By default, SQLocal uses `:localStorage:` which stores the database in browser localStorage:

```typescript
const config: BrowserBkndConfig = {
  connection: ":localStorage:",  // Default
  // ... rest of config
};
```

**Custom database path:**

```typescript
import { SQLocalKysely } from "sqlocal/kysely";

const config: BrowserBkndConfig = {
  connection: {
    databasePath: "custom.db",
  },
  // ... rest of config
};
```

**In-memory database (not persisted):**

```typescript
const config: BrowserBkndConfig = {
  connection: ":memory:",
  // ... rest of config
};
```

### Database Export and Import

Export your database as a downloadable file:

```typescript
import { useApp } from "bknd/adapter/browser";
import type { SQLocalConnection } from "bknd";

function DatabaseExport() {
  const { app } = useApp();
  const connection = app.em.connection as SQLocalConnection;

  async function exportDatabase() {
    const databaseFile = await connection.client.getDatabaseFile();
    const fileUrl = URL.createObjectURL(databaseFile);

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "database.sqlite3";
    a.click();
    a.remove();

    URL.revokeObjectURL(fileUrl);
  }

  return (
    <button onClick={exportDatabase}>
      Download Database
    </button>
  );
}
```

**Import database:**
```typescript
async function importDatabase(file: File) {
  const connection = app.em.connection as SQLocalConnection;
  await connection.client.loadDatabaseFile(file);
  // App automatically reloads with new database
}
```

## Data Operations

### Using App Context

Access Bknd APIs through `useApp` hook:

```typescript
import { useApp } from "bknd/adapter/browser";

function TodoList() {
  const { app } = useApp();
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    async function loadTodos() {
      const { data } = await app.em.findMany("todos");
      setTodos(data);
    }
    loadTodos();
  }, [app]);

  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id}>
          {todo.title} - {todo.done ? "Done" : "Pending"}
        </div>
      ))}
    </div>
  );
}
```

### Using Entity Manager

Use `app.emgr` for entity-specific operations:

```typescript
const { app } = useApp();

// Create
const newTodo = await app.em.mutator("todos").insert({
  title: "New task",
  done: false,
});

// Update
await app.em.mutator("todos").update(
  { done: true },
  todo.id
);

// Delete
await app.em.mutator("todos").delete(todo.id);

// Query with filtering
const { data: completedTodos } = await app.em.findMany("todos", {
  where: { done: true },
  sort: "-id",
  limit: 10,
});
```

### Using useEntityQuery Hook

Use the React SDK hook for simpler data fetching:

```typescript
import { useEntityQuery } from "bknd/client";

function TodoList() {
  const { data: todos, create, update, _delete } = useEntityQuery(
    "todos",
    undefined,
    { sort: "-id", limit: 10 }
  );

  return (
    <div>
      {todos.map((todo) => (
        <div key={String(todo.id)}>
          <input
            type="checkbox"
            checked={!!todo.done}
            onChange={() => update({ done: !todo.done }, todo.id)}
          />
          {todo.title}
          <button onClick={() => _delete(todo.id)}>Delete</button>
        </div>
      ))}
      <form
        action={async (formData) => {
          const title = formData.get("title") as string;
          await create({ title });
        }}
      >
        <input name="title" placeholder="New todo" />
        <button>Add</button>
      </form>
    </div>
  );
}
```

## Media Storage

### OPFS Storage Adapter

Browser mode uses `OpfsStorageAdapter` for file storage via Origin Private File System:

```typescript
import { OpfsStorageAdapter } from "bknd/adapter/browser";

// Configured automatically by BkndBrowserApp
// Available for media uploads
```

**OPFS features:**
- Browser-native file system access
- Persistent storage (survives page reloads)
- Private to origin (not accessible by other sites)
- Supports directories and nested paths

### Custom OPFS Configuration

Configure custom OPFS root directory:

```typescript
import { OpfsStorageAdapter } from "bknd/adapter/browser";

const config: BrowserBkndConfig = {
  config: {
    media: {
      enabled: true,
      adapter: {
        type: "opfs",
        config: {
          root: "uploads",  // Custom root directory
        },
      },
    },
  },
  // ... rest of config
};
```

### Uploading Files

Upload files using the media API:

```typescript
const { app } = useApp();

async function uploadProfilePicture(file: File) {
  const { data } = await app.media.upload({
    entity: "users",
    entityId: userId,
    field: "avatar",
    file,
  });

  return data;
}
```

## Admin UI

### Accessing Admin UI

Admin UI is automatically available at configured basepath:

```typescript
const config: BrowserBkndConfig = {
  adminConfig: {
    basepath: "/admin",  // Admin UI at /admin
    logo_return_path: "/../",
  },
};
```

Access at: `http://localhost:5173/admin`

### Admin UI Features

- **Entity Management**: Create, read, update, delete entities
- **Schema Browser**: View entity structure and relationships
- **Query Builder**: Build and test queries visually
- **Media Browser**: View and manage uploaded files
- **Database Info**: View database size, row counts

### Custom Admin Navigation

Add navigation link to Admin UI:

```typescript
import { Link } from "wouter";

function App() {
  return (
    <BkndBrowserApp {...config}>
      <Route path="/" component={HomePage} />
      <div>
        <Link to="/admin">Go to Admin</Link>
      </div>
    </BkndBrowserApp>
  );
}
```

## Type Safety

### Generate TypeScript Types

Generate types from your schema for full type safety:

```typescript
import { em, entity, text, boolean } from "bknd";

const schema = em({
  todos: entity("todos", {
    title: text(),
    done: boolean(),
  }),
});

// Register schema globally
type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}
```

Now you have autocomplete for all entity fields:

```typescript
const { app } = useApp();

// Type-safe entity access
const todo = await app.em.findOne("todos", { id: 1 });

// ✅ Fields are typed
console.log(todo.title);  // string
console.log(todo.done);   // boolean

// ❌ TypeScript error: Property 'invalidField' does not exist
console.log(todo.invalidField);
```

### Database Info

Access database information for debugging:

```typescript
import { useApp } from "bknd/adapter/browser";
import type { SQLocalConnection } from "bknd";

function DatabaseInfo() {
  const { app } = useApp();
  const connection = app.em.connection as SQLocalConnection;
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function loadInfo() {
      const dbInfo = await connection.client.getDatabaseInfo();
      setInfo(dbInfo);
    }
    loadInfo();
  }, [connection]);

  return (
    <pre>
      {JSON.stringify(info, null, 2)}
    </pre>
  );
}
```

Returns:
- Database file size
- Table information
- Row counts per table

## Limitations and Considerations

### Authentication

Authentication is **not supported** in browser mode:

- No auth plugins (password, OAuth, Email OTP)
- No user management
- No permission system
- No protected routes

**Workaround:** Implement client-side auth using localStorage:
```typescript
function login(email: string, password: string) {
  // Simple client-side auth (not secure for production)
  localStorage.setItem("user", JSON.stringify({ email }));
}

function logout() {
  localStorage.removeItem("user");
}

function useAuth() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return { user, login, logout };
}
```

### Performance

Browser mode performance considerations:

- **WASM overhead**: SQLite runs in WebAssembly, slower than native
- **Large datasets**: Queries may be slower for large tables (>10K rows)
- **Memory limits**: Browser memory limits apply
- **OPFS size**: Limited by browser storage quota

**Best practices:**
- Use pagination with `limit` parameter
- Add indexes on frequently queried fields
- Avoid large text/blob fields in entities
- Use `select` to load only needed fields

### No API Routes

Browser mode does not provide HTTP API:

- No REST API endpoints
- No webhooks
- No external integrations requiring HTTP
- No MCP (Model Context Protocol)

**Workaround:** Use `window.postMessage` for communication with iframes or other tabs.

### Data Persistence

Data is stored in browser and can be cleared:

- **Clearing browser data**: Wipes database and OPFS storage
- **Incognito mode**: Data lost when session ends
- **Private browsing**: Persistence depends on browser settings

**Best practices:**
- Implement database export for user backups
- Warn users before clearing browser data
- Provide import/export for data migration

## Use Cases

### Offline-First Application

Build a PWA that works without network:

```typescript
const config: BrowserBkndConfig = {
  config: {
    data: schema.toJSON(),
  },
  options: {
    seed: async (ctx) => {
      // Seed with offline data
      await ctx.em.mutator("articles").insertMany(offlineArticles);
    },
  },
};

// Service worker for offline capability (PWA)
// public/sw.js
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(["/", "/index.html"]);
    })
  );
});
```

### Local Development Prototype

Prototype your app without backend setup:

```typescript
const config: BrowserBkndConfig = {
  config: {
    data: schema.toJSON(),
  },
  options: {
    seed: async (ctx) => {
      // Seed with sample data for development
      await ctx.em.mutator("users").insertMany(sampleUsers);
      await ctx.em.mutator("posts").insertMany(samplePosts);
    },
  },
};
```

**Benefits:**
- No server setup required
- Instant hot reload
- Easy data reset (clear localStorage)
- Database export for sharing test data

### Interactive Tutorial

Create an interactive tutorial with live data:

```typescript
function TutorialStep({ title, description }) {
  const { app } = useApp();

  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button
        onClick={async () => {
          // Interactive example that modifies data
          await app.em.mutator("todos").insert({
            title: "Try me!",
            done: false,
          });
        }}
      >
        Try it
      </button>
    </div>
  );
}
```

## Deployment

### Static Site Hosting

Deploy browser-mode apps as static sites:

**Vercel:**
```bash
npm run build
npx vercel --prod
```

**Netlify:**
- Build command: `npm run build`
- Publish directory: `dist`

**GitHub Pages:**
```bash
npm run build
# Deploy dist/ to gh-pages branch
```

### PWA Deployment

Convert to Progressive Web App:

1. Add PWA plugin to Vite:
```bash
npm install vite-plugin-pwa
```

2. Update `vite.config.ts`:
```typescript
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    sqlocal(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "My App",
        short_name: "MyApp",
        description: "Bknd browser app",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
```

### Storage Limits

Browser storage limits vary by browser:

- **Chrome/Edge**: ~60% of available disk space
- **Firefox**: ~50% of available disk space
- **Safari**: ~1GB (varies by device)

**Check available storage:**
```typescript
async function checkStorage() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    console.log(
      `Used: ${estimate.usage} bytes`,
      `Available: ${estimate.quota} bytes`
    );
  }
}
```

## Best Practices

1. **Always seed sample data**: Use `options.seed` for better developer experience
2. **Implement database export**: Allow users to backup their data
3. **Use pagination**: Limit query results with `limit` parameter
4. **Add indexes**: Improve query performance on frequently accessed fields
5. **Warn about data loss**: Inform users when clearing browser data
6. **Test in multiple browsers**: Browser mode behavior varies by browser
7. **Monitor storage usage**: Check OPFS and localStorage usage
8. **Use TypeScript**: Leverage type safety for entity operations
9. **Optimize bundle size**: Code-split SQLocal WASM for faster initial load
10. **Provide data migration**: Support export/import for upgrades

## Troubleshooting

### SQLocal WASM Loading Error

**Error:** `Failed to load WASM module`

**Solution:** Ensure `sqlocal` plugin is in `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [
    sqlocal(),  // Required
    react(),
  ],
});
```

### Database Not Persisting

**Issue:** Data lost on page reload

**Solution:** Check database connection:
```typescript
const config: BrowserBkndConfig = {
  connection: ":localStorage:",  // Use this, not ":memory:"
  // ... rest of config
};
```

### OPFS Not Available

**Issue:** `Origin Private File System is not supported`

**Solution:** OPFS requires HTTPS or localhost. Deploy with:
- HTTPS in production
- localhost for development
- Not supported in non-secure contexts

### Type Errors on Entities

**Issue:** TypeScript errors on entity fields

**Solution:** Ensure schema is registered globally:
```typescript
type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}
```

### Admin UI Not Loading

**Issue:** Admin UI returns 404

**Solution:** Check `adminConfig.basepath`:
```typescript
const config: BrowserBkndConfig = {
  adminConfig: {
    basepath: "/admin",  // Ensure correct path
    logo_return_path: "/../",
  },
};
```

Access at: `http://localhost:5173/admin`

## Examples

### Complete Todo App

```typescript
import { BkndBrowserApp, type BrowserBkndConfig } from "bknd/adapter/browser";
import { em, entity, text, boolean } from "bknd";
import { Route } from "wouter";
import { useEntityQuery } from "bknd/client";

const schema = em({
  todos: entity("todos", {
    title: text(),
    done: boolean(),
  }),
});

type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}

const config: BrowserBkndConfig = {
  config: {
    data: schema.toJSON(),
  },
  adminConfig: {
    basepath: "/admin",
    logo_return_path: "/../",
  },
  options: {
    seed: async (ctx) => {
      await ctx.em.mutator("todos").insertMany([
        { title: "Welcome to Bknd!", done: false },
      ]);
    },
  },
};

function TodoApp() {
  const { data: todos, create, update, _delete } = useEntityQuery("todos");

  return (
    <div>
      <h1>Todo List</h1>
      <ul>
        {todos.map((todo) => (
          <li key={String(todo.id)}>
            <input
              type="checkbox"
              checked={!!todo.done}
              onChange={() => update({ done: !todo.done }, todo.id)}
            />
            {todo.title}
            <button onClick={() => _delete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <form
        action={async (formData) => {
          const title = formData.get("title") as string;
          await create({ title });
        }}
      >
        <input name="title" placeholder="New todo" />
        <button>Add</button>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <BkndBrowserApp {...config}>
      <Route path="/" component={TodoApp} />
    </BkndBrowserApp>
  );
}
```

## Related Guides

- [Choose Your Mode](/choose-your-mode) - Decision tree for mode selection
- [Data Module](/../../reference/data-module) - Data operations API
- [Query System](/../../reference/query-system) - Advanced querying
- [Entity Relationships](/data/entity-media-relationships) - Entity relations
- [Configuration Reference](/../../reference/configuration) - Configuration options
- [Vite + React Integration](/vite-react) - SPA setup (server-based)
