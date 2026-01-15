---
name: bknd-configuration
description: Configures Bknd backend apps via bknd.config.ts. Use when setting up database connections, auth, media, admin UI, or runtime options.
---

# Bknd Configuration

Complete reference for all Bknd configuration options in `bknd.config.ts`.

## Structure Overview

```typescript
export default {
  app: (env) => ({
    connection: { /* database */ },
    config: { /* app config */ },
    secrets: env,
    isProduction: env.ENVIRONMENT === "production",
    adminOptions: { /* admin UI */ },
  }),
  config: {
    data: schema.toJSON(),
    auth: { /* ... */ },
    media: { /* ... */ },
    server: { /* ... */ },
  },
  options: {
    seed: async (ctx) => { /* initial data */ },
  },
} as const satisfies ViteBkndConfig;
```

## Top-Level Options

### app(env) Function

| Return Property | Description |
|-----------------|-------------|
| `connection` | Database connection configuration |
| `config` | Application configuration sections |
| `secrets` | Secret values merged into config |
| `isProduction` | Production mode flag |
| `adminOptions` | Admin UI configuration |

## Connection Configuration

### SQLite (Default)

```typescript
connection: {
  url: "file:data.db",
}
```

### PostgreSQL (pg adapter - node-postgres)

Best for traditional Node.js applications with connection pooling:

```typescript
import { pg } from "bknd";
import { Pool } from "pg";

connection: {
  url: pg({
    pool: new Pool({
      connectionString: env.POSTGRES_URL,
    }),
  }),
}
```

| Option | Type | Description |
|--------|------|-------------|
| `pool` | Pool | PostgreSQL Pool instance |

### PostgreSQL (postgresJs adapter - postgres-js)

Best for edge runtimes:

```typescript
import { postgresJs } from "bknd";
import postgres from "postgres";

connection: {
  url: postgresJs({
    postgres: postgres(env.POSTGRES_URL),
  }),
}
```

| Option | Type | Description |
|--------|------|-------------|
| `postgres` | Sql | postgres-js Sql instance |

### Custom PostgreSQL Dialects (Neon, Xata, etc.)

```typescript
import { createCustomPostgresConnection } from "bknd";
import { NeonDialect } from "kysely-neon";

const neon = createCustomPostgresConnection("neon", NeonDialect);

connection: {
  url: neon({
    connectionString: process.env.NEON,
  }),
}
```

## Config Sections

### data

Schema definition using entity manager:

```typescript
import { em, entity, text, boolean } from "bknd";

const schema = em({
  todos: entity("todos", {
    title: text().required(),
    done: boolean(),
  }),
});

config: {
  data: schema.toJSON(),
}
```

**Type Registration (Optional):**
```typescript
type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}
```

### auth

```typescript
auth: {
  enabled: true,
  jwt: {
    issuer: "my-app",
    secret: env.JWT_SECRET,
    expires: 3600,
  },
  cookie: {
    pathSuccess: "/dashboard",
    pathLoggedOut: "/login",
  },
  default_role_register: "user",
  strategies: {
    password: {
      type: "password",
      enabled: true,
      config: {
        hashing: "bcrypt",
        minLength: 12,
      },
    },
  },
}
```

**Auth Options:**

| Option | Type | Description |
|--------|------|-------------|
| `enabled` | boolean | Enable auth module |
| `jwt.issuer` | string | JWT issuer claim |
| `jwt.secret` | string | JWT signing secret |
| `jwt.expires` | number | Token expiry in seconds |
| `cookie.pathSuccess` | string | Redirect after login |
| `cookie.pathLoggedOut` | string | Redirect after logout |
| `default_role_register` | string | Default role for new users |

**Password Strategy Options:**

| Option | Type | Description |
|--------|------|-------------|
| `hashing` | string | `"bcrypt"` or `"argon2"` |
| `minLength` | number | Minimum password length (default: 8, min: 1) |

### media

```typescript
media: {
  enabled: true,
}
```

### server

```typescript
server: {
  admin: {
    basepath: "/admin",
  },
  mcp: {
    enabled: true,
  },
}
```

**Server Options:**

| Option | Type | Description |
|--------|------|-------------|
| `admin.basepath` | string | Admin UI base path |
| `mcp.enabled` | boolean | Enable MCP server at `/mcp` |

## Hybrid Mode Configuration

For production with config file caching:

```typescript
import { hybrid } from "bknd/modes";
import { devFsWrite } from "bknd/adapter/cloudflare";

export default hybrid<CloudflareBkndConfig>({
  reader: async () => {
    return (await import("./bknd-config.json").default) as any;
  },
  writer: devFsWrite,
  typesFilePath: "./bknd-types.d.ts",
  configFilePath: "./bknd-config.json",
  syncSecrets: {
    enabled: true,
    outFile: ".env.example",
    format: "env",
  },
  app: (env) => ({
    isProduction: env.ENVIRONMENT === "production",
    secrets: env,
    adminOptions: false,
  }),
});
```

**Hybrid Mode Options:**

| Option | Type | Description |
|--------|------|-------------|
| `reader` | function | Async function returning config object |
| `writer` | function | Config writer (e.g., `devFsWrite`) |
| `typesFilePath` | string | Path to generated types (default: `"bknd-types.d.ts"`) |
| `configFilePath` | string | Path to config file (default: `"bknd-config.json"`) |
| `syncSecrets` | object | Secret extraction options |

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | Database connection string | `file:data.db`, `postgres://...` |
| `POSTGRES_URL` | PostgreSQL connection | `postgres://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret | Random 64-character string |
| `ENVIRONMENT` | Environment flag | `"production"`, `"development"` |
| `NEON` | Neon connection string | From Neon dashboard |
| `XATA_URL` | Xata database URL | From Xata dashboard |
| `XATA_API_KEY` | Xata API key | From Xata dashboard |
| `XATA_BRANCH` | Xata database branch | `"main"` |

## Complete Examples

### Vite + React Configuration

```typescript
import type { ViteBkndConfig } from "bknd/adapter/vite";
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
  }),
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      jwt: {
        issuer: "my-app",
      },
      cookie: {
        pathSuccess: "/dashboard",
        pathLoggedOut: "/login",
      },
      default_role_register: "user",
    },
    media: {
      enabled: true,
    },
    server: {
      admin: {
        basepath: "/admin",
      },
      mcp: {
        enabled: true,
      },
    },
  },
  options: {
    seed: async (ctx) => {
      await ctx.em.mutator("todos").insertMany([
        { title: "Welcome to bknd", done: false },
      ]);
    },
  },
} as const satisfies ViteBkndConfig<{ DB_URL?: string }>;
```

### Production PostgreSQL Configuration

```typescript
import { pg } from "bknd";
import { Pool } from "pg";
import { secureRandomString } from "bknd/utils";

export default {
  app: (env) => ({
    connection: {
      url: pg({
        pool: new Pool({
          connectionString: env.POSTGRES_URL,
        }),
      }),
    },
    config: {
      data: schema.toJSON(),
      auth: {
        enabled: true,
        jwt: {
          secret: env.JWT_SECRET ?? secureRandomString(64),
          issuer: "my-app",
          expires: 3600,
        },
        strategies: {
          password: {
            type: "password",
            enabled: true,
            config: {
              hashing: "bcrypt",
              minLength: 12,
            },
          },
        },
      },
    },
  }),
} as const satisfies BkndConfig<{ POSTGRES_URL?: string; JWT_SECRET?: string }>;
```

## v0.20.0 Changes

### Password minLength

```typescript
strategies: {
  password: {
    type: "password",
    enabled: true,
    config: {
      minLength: 12,  // Custom minimum length
    },
  },
}
```

Default: 8 characters, Minimum: 1 character

### default_role_register

```typescript
auth: {
  default_role_register: "user",  // Must match configured role
}
```

### MCP Navigation

```typescript
server: {
  mcp: {
    enabled: true,
  },
}
```

Access at `/mcp` (relative to Admin basepath) or via Admin UI menu.

### Hybrid Mode Improvements

- `reader` now returns objects directly (no `JSON.parse()` needed)
- Production validation skipped for performance
- `sync_required` flag auto-triggers schema sync in development
