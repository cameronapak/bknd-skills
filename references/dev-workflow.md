# Development Workflow Reference

Technical reference for Bknd v0.20.0 local development setup, environment variables, CLI commands, and debugging.

## Local Development Setup

### Quick Start with CLI

```bash
# Create new project (interactive)
npx bknd create my-app

# Run with in-memory database (fastest for prototyping)
npx bknd run --memory

# Run with file-based database
npx bknd run

# Custom port
npx bknd run --port 8080

# Specify runtime
npx bknd run --server bun
npx bknd run --server node

# Don't auto-open browser
npx bknd run --no-open
```

### CLI Run Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --port <port>` | Server port | 3000 |
| `-m, --memory` | Use in-memory database | - |
| `--server <server>` | Runtime (node, bun) | Auto-detected |
| `--no-open` | Don't open browser | Opens by default |
| `-c, --config <path>` | Config file path | Auto-detected |
| `--db-url <url>` | Database URL override | - |

### Runtime Adapters

**Bun:**
```typescript
import { serve } from "bknd/adapter/bun";
serve(); // Minimal setup with in-memory DB
```

**Node.js:**
```typescript
import { serve } from "bknd/adapter/node";
serve();
```

**With configuration:**
```typescript
import { serve } from "bknd/adapter/bun";

serve({
  app: {
    connection: { url: "file:data.db" },
  },
});
```

---

## Configuration File

Bknd auto-detects config files in order:
- `bknd.config.ts`
- `bknd.config.js`
- `bknd.config.mjs`
- `bknd.config.cjs`
- `bknd.config.json`

### Basic Config Structure

```typescript
import type { CliBkndConfig } from "bknd";
import { em, entity, text, boolean } from "bknd";

const schema = em({
  todos: entity("todos", {
    title: text().required(),
    done: boolean(),
  }),
});

type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}

export default {
  app: (env) => ({
    connection: {
      url: env.DB_URL ?? "file:data.db",
    },
    schema,
  }),
} satisfies CliBkndConfig;
```

### Framework-Specific Configs

```typescript
// Next.js
import type { NextjsBkndConfig } from "bknd/adapter/nextjs";

// Astro
import type { AstroBkndConfig } from "bknd/adapter/astro";

// React Router
import type { ReactRouterBkndConfig } from "bknd/adapter/react-router";
```

---

## Environment Variables

### Loading Order

Bknd loads environment files in order (later takes precedence):
1. `.env`
2. `.dev.vars` (Cloudflare-style, for dev-specific overrides)

### Common Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `DB_URL` | Database connection URL | `:memory:` |
| `DB_TOKEN` | LibSQL auth token (Turso) | - |
| `JWT_SECRET` | JWT signing secret | Auto-generated |
| `LOCAL` | Disable telemetry | - |

### Database Connection Priority

1. `--db-url` CLI argument
2. Config file `connection.url`
3. `--memory` flag → `:memory:`
4. `DB_URL` environment variable
5. Fallback → `file:data.db`

### Example .env

```bash
# Database
DB_URL=file:data.db
DB_TOKEN=your-turso-token

# Server
PORT=3000

# Auth
JWT_SECRET=your-secret-here

# Development
LOCAL=true
```

### Injecting Env in Config

```typescript
export default {
  app: (env) => ({
    connection: {
      url: env.DB_URL ?? "file:data.db",
      authToken: env.DB_TOKEN,
    },
    auth: {
      jwt: {
        secret: env.JWT_SECRET ?? "dev-secret",
      },
    },
  }),
} satisfies CliBkndConfig;
```

---

## Type Generation

Generate TypeScript types from your schema:

```bash
# Generate types to bknd-types.d.ts (default)
npx bknd types

# Custom output file
npx bknd types -o types/bknd.d.ts

# Print to console (useful for debugging)
npx bknd types --dump

# With specific config
npx bknd types -c bknd.config.ts
```

### Using Generated Types

```typescript
// bknd-types.d.ts is auto-generated
// Import and use in your code:

import { Api } from "bknd/client";

const api = new Api({ url: "http://localhost:3000" });

// Fully typed queries
const todos = await api.data.readMany("todos", {
  where: { done: { $eq: false } },
});
```

---

## Debugging

### Debug Commands

```bash
# Show internal paths
npx bknd debug paths

# Show all registered routes
npx bknd debug routes
```

### Debug Output: paths

```
[PATHS] {
  rootpath: '/path/to/bknd',
  distPath: '/path/to/dist',
  relativeDistPath: './dist',
  cwd: '/your/project',
  dir: '/path/to/cli',
  resolvedPkg: '/path/to/package.json'
}
```

### Debug Output: routes

Shows all Hono routes registered by your app:
- API endpoints (`/api/data/*`, `/api/auth/*`, `/api/media/*`)
- Admin UI routes (`/admin/*`)
- Custom routes

### Console Logging

Bknd uses colorized console output. Key log patterns:

| Prefix | Meaning |
|--------|---------|
| `Using connection from` | Shows database source |
| `Using config from` | Config file loaded |
| `Using in-memory` | Memory DB active |
| `Server listening on` | Server ready |

### Common Debug Scenarios

**Check what config is loaded:**
```bash
# Look for "Using config from" in output
npx bknd run
```

**Verify database connection:**
```bash
# Look for "Using connection from" or "Using fallback connection"
npx bknd run
```

**See registered routes:**
```bash
npx bknd debug routes
```

---

## Project Structure

### Recommended Layout

```
my-bknd-app/
├── bknd.config.ts      # Main config
├── bknd-types.d.ts     # Generated types
├── .env                # Environment variables
├── .dev.vars           # Dev overrides (optional)
├── data.db             # SQLite file (if using file:)
├── uploads/            # Local media storage
└── package.json
```

### Framework Integration Layout

```
my-nextjs-app/
├── app/
│   ├── api/
│   │   └── bknd/
│   │       └── [[...bknd]]/
│   │           └── route.ts   # API handler
│   └── admin/
│       └── page.tsx           # Admin UI
├── bknd.config.ts
├── bknd-types.d.ts
└── .env.local
```

---

## Development Tips

### Hot Reload

Schema changes in `bknd.config.ts` require server restart. Watch mode:

```bash
# With bun
bun --watch index.ts

# With nodemon
nodemon --exec "npx bknd run"
```

### Database Reset

```bash
# Delete SQLite file for fresh start
rm data.db

# Or use in-memory for ephemeral dev
npx bknd run --memory
```

### Admin UI Access

Default: `http://localhost:3000/admin`

The admin UI provides:
- Entity data browsing/editing
- Schema visualization
- User management
- Media management

### API Testing

```bash
# REST API base
curl http://localhost:3000/api/data/todos

# With auth token
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/data/todos
```

---

## Configuration Modes

### Code Mode (Default)

Schema defined in code, synced to database:

```typescript
export default {
  app: {
    schema,  // Your em() schema
    connection: { url: "file:data.db" },
  },
} satisfies CliBkndConfig;
```

### Hybrid Mode

Code schema merged with runtime database config:

```typescript
export default {
  app: {
    schema,
    mode: "hybrid",
  },
} satisfies CliBkndConfig;
```

---

## Troubleshooting

### Common Issues

**"Config file could not be resolved"**
- Check file extension matches supported types
- Verify path is correct if using `-c` flag

**Database not persisting**
- Ensure using `file:data.db` not `:memory:`
- Check write permissions in directory

**Types not updating**
- Re-run `npx bknd types` after schema changes
- Restart TypeScript server in IDE

**Admin UI 404**
- Ensure admin route is mounted correctly
- Check for trailing slash issues

**Windows path issues**
- Use forward slashes in config URLs
- Consider using `path.join()` for paths

### Getting Help

```bash
# CLI help
npx bknd --help
npx bknd run --help
npx bknd types --help

# Version check
npx bknd --version
```

---

## Related References

- [Schema Modeling](./schema-modeling.md) - Entity and field definitions
- [Authentication](./authentication.md) - Auth setup and JWT config
- [API Consumption](./api-consumption.md) - SDK and client setup
- [Deployment](./deployment.md) - Production configuration
