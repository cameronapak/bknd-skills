---
title: "Configuration"
description: "Complete reference for Bknd configuration options, including connection, auth, media, admin, and runtime settings."
---

# Configuration Reference

Complete reference for all Bknd configuration options in your `bknd.config.ts` file.

## Overview

Bknd configuration uses a top-level export that defines your database connection, application config, and runtime options:

```typescript
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
      // ...
    },
  },
  options: {
    seed: async (ctx) => {
      // ...
    },
  },
} as const satisfies ViteBkndConfig;
```

## Top-Level Options

### app(env) Function

The main configuration function that receives environment variables.

```typescript
app: (env) => ({
  connection: { /* ... */ },
  config: { /* ... */ },
  secrets: env,
  isProduction: env.ENVIRONMENT === "production",
})
```

**Parameters:**
- `env` - Environment variables (typed based on your generic parameter)

**Returns:**
- `connection` - Database connection configuration
- `config` - Application configuration sections
- `secrets` - Secret values merged into config
- `isProduction` - Production mode flag
- `adminOptions` - Admin UI configuration

### connection

Database connection configuration.

```typescript
connection: {
  url: "file:data.db",  // SQLite
  // OR
  url: "postgres://user:pass@host:5432/db",  // PostgreSQL
  // OR
  url: pgPostgres({
    connectionString: env.POSTGRES_URL,
  }),
}
```

**SQLite (default):**
```typescript
connection: {
  url: "file:data.db",
}
```

**PostgreSQL:**
```typescript
import { pgPostgres } from "bknd";

connection: {
  url: pgPostgres({
    connectionString: "postgres://user:pass@host:5432/db",
  }),
}
```

**PostgreSQL (node-postgres):**
```typescript
import { postgresJs } from "bknd";

connection: {
  url: postgresJs({
    connectionString: "postgres://user:pass@host:5432/db",
  }),
}
```

**Custom PostgreSQL Dialect (Neon, Xata, etc.):**
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

### config

Application configuration sections (data, auth, media, server).

```typescript
config: {
  data: schema.toJSON(),
  auth: { /* ... */ },
  media: { /* ... */ },
  server: { /* ... */ },
}
```

## Connection Configuration

### SQLite

Default database for development and local deployments.

```typescript
connection: {
  url: "file:data.db",
}
```

**Environment Variables:**
- `DB_URL` - Database connection string (default: `file:data.db`)

### PostgreSQL

Production-ready database with `pgPostgres` or `postgresJs` adapters.

#### pgPostgres Adapter

```typescript
import { pgPostgres } from "bknd";

connection: {
  url: pgPostgres({
    connectionString: env.POSTGRES_URL,
  }),
}
```

**Options:**
| Option | Type | Description |
|--------|------|-------------|
| `connectionString` | string | PostgreSQL connection string |

#### postgresJs Adapter

```typescript
import { postgresJs } from "bknd";

connection: {
  url: postgresJs({
    connectionString: env.POSTGRES_URL,
  }),
}
```

**Options:**
| Option | Type | Description |
|--------|------|-------------|
| `connectionString` | string | PostgreSQL connection string |

**Environment Variables:**
- `POSTGRES_URL` - PostgreSQL connection string

### Custom PostgreSQL Dialects

Support for Neon, Xata, and other PostgreSQL-compatible services.

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

Your application schema definition.

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

Authentication and authorization configuration.

```typescript
config: {
  auth: {
    enabled: true,
    jwt: {
      issuer: "my-app",
      secret: secureRandomString(64),
    },
    cookie: {
      pathSuccess: "/dashboard",
      pathLoggedOut: "/login",
    },
    strategies: {
      password: {
        type: "password",
        enabled: true,
      },
    },
  },
}
```

#### Auth Module Options

| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `enabled` | boolean | `false` | Enable auth module |
| `entity_name` | string | `"users"` | Name of user entity |
| `basepath` | string | `"/api/auth"` | Auth API base path |
| `allow_register` | boolean | `true` | Allow user registration |
| `default_role_register` | string | `undefined` | Default role for new users |

#### JWT Configuration

| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `secret` | string | auto-generated | JWT signing secret |
| `alg` | `"HS256" \| "HS384" \| "HS512"` | `"HS256"` | HMAC algorithm |
| `expires` | number | `undefined` | Token expiration (seconds) |
| `issuer` | string | `undefined` | JWT issuer claim |
| `fields` | string[] | `["id", "email", "role"]` | User fields in JWT |

#### Cookie Configuration

| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `domain` | string | current domain | Cookie domain |
| `path` | string | `"/"` | Cookie path |
| `sameSite` | `"strict" \| "lax" \| "none"` | `"lax"` | SameSite attribute |
| `secure` | boolean | `true` | HTTPS-only cookie |
| `httpOnly` | boolean | `true` | HttpOnly cookie |
| `expires` | number | `604800` (1 week) | Cookie expiration (seconds) |
| `partitioned` | boolean | `false` | Partitioned cookie |
| `renew` | boolean | `true` | Auto-refresh cookie |
| `pathSuccess` | string | `"/"` | Redirect after login/register |
| `pathLoggedOut` | string | `"/"` | Redirect after logout |

#### Password Strategy

```typescript
strategies: {
  password: {
    type: "password",
    enabled: true,
    config: {
      hashing: "sha256",  // "plain", "sha256", "bcrypt"
      minLength: 8,  // Minimum password length (default: 8, min: 1)
    },
  },
}
```

**Password Strategy Options:**
| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `hashing` | `"plain" \| "sha256" \| "bcrypt"` | `"sha256"` | Hashing algorithm |
| `minLength` | number | `8` | Minimum password length |

#### Roles and Permissions

```typescript
auth: {
  roles: {
    admin: {
      implicit_allow: true,
    },
    user: {
      default: {
        permissions: ["data.entity.read", "data.entity.create"],
        is_default: true,
      },
    },
  },
}
```

**Environment Variables:**
- `JWT_SECRET` - JWT signing secret (recommended for production)

### media

File upload and media management configuration.

```typescript
import { registerLocalMediaAdapter } from "bknd/adapter/node";

const local = registerLocalMediaAdapter();

config: {
  media: {
    enabled: true,
    adapter: local({
      path: "./public/uploads",
    }),
  },
}
```

**Media Configuration Options:**
| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `enabled` | boolean | `false` | Enable media module |
| `adapter` | MediaAdapter | Media storage adapter |

**Available Adapters:**

**Local (Node.js):**
```typescript
import { registerLocalMediaAdapter } from "bknd/adapter/node";

const local = registerLocalMediaAdapter();
adapter: local({ path: "./public/uploads" })
```

**S3:** (See [Media Module Reference](/docs/reference/data-module.md) for S3 configuration)

### server

Server and Admin UI configuration.

```typescript
config: {
  server: {
    admin: {
      basepath: "/admin",
    },
    mcp: {
      enabled: true,
    },
  },
}
```

#### Admin Configuration

| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `basepath` | string | `"/admin"` | Admin UI route path |

#### MCP Configuration

| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `enabled` | boolean | `false` | Enable MCP server |

## Options

### seed

Database seeding function (executed only if database is empty).

```typescript
options: {
  seed: async (ctx) => {
    await ctx.em.mutator("todos").insertMany([
      { title: "Learn bknd", done: true },
      { title: "Build something cool", done: false },
    ]);

    await ctx.app.module.auth.createUser({
      email: "test@bknd.io",
      password: "12345678",
    });
  },
}
```

**Parameters:**
- `ctx.em` - EntityManager for database operations
- `ctx.app.module.auth` - Auth module for creating users

### Mode Helpers

#### code() Mode

Serverless deployment with schema in code.

```typescript
import { code } from "bknd/modes";

export default code<CloudflareBkndConfig>({
  app: (env) => ({
    config: {
      data: schema.toJSON(),
    },
    adminOptions: false,
    isProduction: env.ENVIRONMENT === "production",
  }),
});
```

#### hybrid() Mode

Development with file-based config, production with code mode.

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
  }),
});
```

**Hybrid Mode Options:**
| Option | Type | Description |
|--------|------|-------------|
| `reader` | function | Function to read config (returns object, not just string in v0.20.0) |
| `writer` | function | Function to write config/types (required for sync) |
| `typesFilePath` | string | Path to generated types file (default: `"bknd-types.d.ts"`) |
| `configFilePath` | string | Path to config file (default: `"bknd-config.json"`) |
| `syncSecrets` | object | Secret extraction options |

## New in v0.20.0

### Password minLength

Password strategy now supports configurable minimum length:

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

**Default:** `8` characters
**Minimum:** `1` character

### default_role_register

Set default role for newly registered users:

```typescript
auth: {
  default_role_register: "user",  // Must match configured role
}
```

### MCP Navigation

Enable Model Context Protocol (MCP) server:

```typescript
server: {
  mcp: {
    enabled: true,
  },
}
```

Access MCP at:
- Direct URL: `/mcp` (relative to Admin basepath)
- Admin UI menu: Click user menu → "MCP"

### Hybrid Mode Improvements

**Reader Returns Objects:**
```typescript
reader: async () => {
  return (await import("./bknd-config.json").default) as any;
}
```

Previously required `JSON.parse()`; now returns objects directly.

**Better Config Handling:**
- Production validation skipped for performance (`skipValidation: isProduction`)
- Config loaded from file using `reader` function
- Default config created automatically if no config file found

**sync_required Flag:**
Automatically triggers schema sync during development when changes are detected.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | Database connection string | `file:data.db`, `postgres://user:pass@host:5432/db` |
| `POSTGRES_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret | Random 64-character string |
| `ENVIRONMENT` | Environment flag | `"production"`, `"development"` |
| `NEON` | Neon database connection string | Connection string from Neon dashboard |
| `XATA_URL` | Xata database URL | URL from Xata dashboard |
| `XATA_API_KEY` | Xata API key | API key from Xata dashboard |
| `XATA_BRANCH` | Xata database branch | Branch name (e.g., `"main"`) |

## Examples

### Complete Configuration (Vite + React)

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

### Production Configuration (PostgreSQL)

```typescript
import { pgPostgres } from "bknd";
import { secureRandomString } from "bknd/utils";

export default {
  app: (env) => ({
    connection: {
      url: pgPostgres({
        connectionString: env.POSTGRES_URL,
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

### Hybrid Mode Configuration

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

## Migration Notes

### Breaking Changes from v0.19.x

1. **PostgreSQL adapters** moved from `@bknd/postgres` package to main `bknd` package
2. **Import paths:** `pgPostgres` and `postgresJs` now imported from `"bknd"`
3. **Password minLength** is now configurable (previously hardcoded to 8)

### Upgrading PostgreSQL Connection

**Before (v0.19.x):**
```typescript
import { pgPostgres } from "@bknd/postgres";

connection: {
  url: pgPostgres({
    connectionString: env.POSTGRES_URL,
  }),
}
```

**After (v0.20.0):**
```typescript
import { pgPostgres } from "bknd";

connection: {
  url: pgPostgres({
    connectionString: env.POSTGRES_URL,
  }),
}
```

## Related Documentation

- [Auth Module Reference](/docs/reference/auth-module.md) - Complete auth configuration
- [Data Module Reference](/docs/reference/data-module.md) - Media adapter configuration
- [Schema Reference](/docs/reference/schema.md) - Entity and field definitions
- [Choose Your Mode](/docs/how-to-guides/setup/choose-your-mode.md) - Mode selection guide
- [Deploy to Production](/docs/getting-started/deploy-to-production.md) - Production deployment
