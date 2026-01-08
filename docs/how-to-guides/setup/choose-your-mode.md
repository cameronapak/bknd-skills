# Choose Your Mode

Bknd offers two key decisions to make when setting up your project:

1. **Configuration mode**: How your Bknd app stores and manages configuration
2. **Deployment approach**: How you run and deploy your Bknd backend

## Configuration Modes

Configuration modes determine where and how your Bknd app's configuration (entity schemas, auth settings, media config, etc.) is stored and managed.

### UI-only Mode (Default)

Configuration is stored in the database (`__bknd` config table) and can be modified at runtime through the Admin UI. This is the default mode when no mode is specified.

**When to use UI-only mode:**
- **Development**: Rapid prototyping and iteration
- **Content management**: When you want non-technical users to manage schemas
- **Quick starts**: When you don't need strict version control on configuration

**Setup:**
```typescript
import type { BkndConfig } from "bknd";

export default {
  config: { /* ... */ },  // Only applied if database is empty
  options: {
    mode: "db"  // This is the default
  }
} satisfies BkndConfig;
```

**Benefits:**
- Visual configuration through Admin UI
- Runtime changes without code deployment
- Automatic database migrations when configuration changes
- Configuration versioning in the database

**Trade-offs:**
- Configuration changes aren't tracked in git
- Can lead to configuration drift between environments
- Harder to audit changes over time

### Code-only Mode

Configuration is loaded from your initial config object and treated as immutable. The app runs in read-only mode by default.

**When to use Code-only mode:**
- **Production**: Enforce strict version control
- **Serverless/Edge**: When database writes are restricted
- **Multi-tenant SaaS**: When you need predictable, auditable configuration
- **Compliance**: When changes require code review and deployment

**Setup:**
```typescript
import type { BkndConfig, em, entity, text, boolean } from "bknd";
import { secureRandomString } from "bknd/utils";

const schema = em({
  todos: entity("todos", {
    title: text(),
    done: boolean(),
  }),
});

export default {
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      jwt: {
        secret: secureRandomString(64),
      },
    }
  },
  options: {
    mode: "code",  // Configuration is always applied
  }
} satisfies BkndConfig;
```

**Benefits:**
- Configuration is version-controlled in git
- Changes require code review and deployment
- Prevents accidental configuration changes
- Easier to audit and roll back changes

**Trade-offs:**
- No runtime configuration changes
- Requires deployment for configuration updates
- Admin UI becomes read-only for configuration
- Must manually sync schema changes with `npx bknd sync --force`

### Hybrid Mode

This mode allows you to configure your backend visually while in development, and uses the produced configuration in a Code-only mode for maximum performance.

**Setup:**
```typescript
import type { BkndConfig } from "bknd";
import appConfig from "./appconfig.json" with { type: "json" };

export default {
  config: appConfig,
  options: {
    mode: process.env.NODE_ENV === "development" ? "db" : "code",
    manager: {
      secrets: process.env
    }
  }
} satisfies BkndConfig;
```

**Benefits:**
- Best of both worlds: visual development + code-controlled production
- Automatic mode switching based on environment
- Built-in syncing tools for config, secrets, and types

**Trade-offs:**
- More complex setup
- Requires exporting configuration from development
- Needs sync tools for config/secrets/types

## Deployment Approaches

### CLI Standalone

Run Bknd as a standalone backend service using the CLI. Best for prototyping or when you have multiple frontends sharing one backend.

**Quick start:**
```bash
npx bknd run
```

**Custom configuration:**
```bash
npx bknd run -p 8080  # Custom port
npx bknd run --memory  # In-memory database
```

**When to use:**
- Quick prototyping and exploration
- Shared backend for multiple apps
- Simple deployment scenarios
- Learning Bknd

**What you get:**
- Admin UI at `http://localhost:3000/admin`
- REST API at `http://localhost:3000/api`
- Automatic database creation

### Framework Embedded

Integrate Bknd directly into your framework (Next.js, React Router, Astro, etc.) for a unified full-stack application.

**Next.js example:**
```bash
npx bknd create -i nextjs my-app
cd my-app
npm run dev
```

**When to use:**
- Full-stack applications
- Tight integration with your frontend framework
- Shared server-side logic
- Type safety across full stack

**What you get:**
- Admin UI at `/admin`
- API routes at `/api/[[...bknd]]`
- Direct access to Bknd APIs in server components
- Seamless TypeScript integration

### Serverless/Edge

Deploy Bknd to serverless platforms like Cloudflare Workers, Vercel Edge, or AWS Lambda.

**Cloudflare Workers example:**
```typescript
// src/index.ts
import { createApp } from "bknd/adapter/cloudflare-worker";

const app = await createApp({
  connection: {
    binding: env.DB  // D1 database binding
  },
  config: {
    // ...your config
  }
});

export default {
  fetch: (req, env, ctx) => app.fetch(req)
};
```

**When to use:**
- Global edge deployment
- Pay-per-use pricing
- Serverless architecture
- Low-latency requirements

**What you get:**
- Edge deployment for fast response times
- Automatic scaling
- Platform-specific database adapters (D1, Neon, etc.)
- Cold start optimization

## Recommended Workflow: Mode Switching

A common pattern is to use **UI-only mode in development** and **Code-only mode in production** (Hybrid mode).

### Development (UI-only mode)

```bash
# Start with Admin UI and runtime configuration
npx bknd run
# or in your framework app with mode: "db"
```

1. Use Admin UI to experiment with schemas
2. Test different configurations
3. Export configuration when ready for production

### Production (Code-only mode)

1. **Export configuration** from development:
```bash
npx bknd config --out appconfig.json
```

2. **Export secrets** to environment file:
```bash
npx bknd secrets --out .env.local --format env
```

3. **Generate types** for your schema:
```bash
npx bknd types --out bknd-types.d.ts
```

4. **Deploy with Code-only mode**:
```typescript
import appConfig from "./appconfig.json" with { type: "json" };

export default {
  config: appConfig,
  options: {
    mode: "code",
    manager: {
      secrets: process.env
    }
  }
} satisfies BkndConfig;
```

5. **Sync database** if needed:
```bash
npx bknd sync --force
```

This gives you the flexibility of UI-driven development with the safety and auditability of code-controlled production.

### Using Mode Helpers

Bknd provides mode helpers for `code` and `hybrid` modes that automate syncing:

**Code mode helper:**
```typescript
import { code, type CodeMode } from "bknd/modes";
import { type BunBkndConfig, writer } from "bknd/adapter/bun";

const config = {
  connection: { url: "file:test.db" },
  writer,  // Required for type syncing
  isProduction: Bun.env.NODE_ENV === "production",
  typesFilePath: "bknd-types.d.ts",
  syncSchema: {
    force: true,
    drop: true,
  }
} satisfies CodeMode<BunBkndConfig>;

export default code(config);
```

**Hybrid mode helper:**
```typescript
import { hybrid, type HybridMode } from "bknd/modes";
import { type BunBkndConfig, writer, reader } from "bknd/adapter/bun";

const config = {
  connection: { url: "file:test.db" },
  writer,  // Required for type/config syncing
  reader,  // Required for reading config
  secrets: await Bun.file(".env.local").json(),
  isProduction: Bun.env.NODE_ENV === "production",
  typesFilePath: "bknd-types.d.ts",
  configFilePath: "bknd-config.json",
  syncSecrets: {
    outFile: ".env.local",
    format: "env",
    includeSecrets: true,
  },
  syncSchema: {
    force: true,
    drop: true,
  },
} satisfies HybridMode<BunBkndConfig>;

export default hybrid(config);
```

Mode helpers provide:
- Built-in syncing of config, types, and secrets
- Automatic schema syncing in development
- Automatic mode switching in hybrid (db → code)
- Automatic config validation skip in production for performance

## Decision Tree

Use this flow to decide on your configuration mode:

```
Need runtime configuration changes?
├─ Yes → Use UI-only mode
│   └─ Development or content-managed apps
└─ No → Need strict version control?
    ├─ Yes → Use Code-only mode
    │   └─ Production or compliant environments
    └─ No → Want best of both worlds?
        ├─ Yes → Use Hybrid mode
        │   └─ Visual dev + code production
        └─ No → Use UI-only mode (default)
            └─ Simple prototypes
```

Use this flow to decide on your deployment approach:

```
Building a full-stack app?
├─ Yes → Framework Embedded
│   └─ Next.js, React Router, Astro, etc.
└─ No → Need global edge deployment?
    ├─ Yes → Serverless/Edge
    │   └─ Cloudflare Workers, Vercel Edge
    └─ No → CLI Standalone
        └─ Prototyping or shared backend
```

## Related Guides

- [Next.js Integration](./integrations/nextjs.md)
- [Database Configuration](../data/seed-database.md)
- [Deployment to Production](../../getting-started/deploy-to-production.md)
- [Cloudflare Workers Guide](./integrations/cloudflare-workers.md)
