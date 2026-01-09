---
title: "Postgres Package Merge Migration Guide"
description: "Migrate from @bknd/postgres to main bknd package"
---

# PostgreSQL Package Merge Migration Guide

**Version:** v0.20.0  
**Impact:** Breaking change for users with PostgreSQL connections

## Overview

In Bknd v0.20.0, the `@bknd/postgres` package has been merged into the main `bknd` package. PostgreSQL adapters are now directly available from the `bknd` package, eliminating the need for a separate PostgreSQL package.

### What Changed

- **Package removed:** `@bknd/postgres` no longer exists
- **New exports:** `pg` and `postgresJs` now exported from main `bknd` package
- **Adapter names:** Function names remain the same but import paths change

### Benefits

- Simplified installation - one less package to manage
- Consistent import paths with other adapters
- Better version synchronization between adapters and core

## Breaking Changes

### 1. Import Path Change

**Before (v0.19.x):**
```typescript
import { pgPostgres } from "@bknd/postgres";
```

**After (v0.20.0):**
```typescript
import { pg, postgresJs } from "bknd";
```

### 2. Adapter Names

- `pgPostgres` → `pg` (function name change)
- `postgresJs` → `postgresJs` (unchanged)

### 3. Configuration Object

Configuration objects remain compatible - only the import path changes.

## Migration Steps

### Step 1: Update package.json

Remove the `@bknd/postgres` dependency:

```bash
npm uninstall @bknd/postgres
```

```json
// Remove this line:
"@bknd/postgres": "^0.19.0"
```

Update `bknd` to v0.20.0 or later:

```bash
npm install bknd@latest
```

### Step 2: Update Imports

Update all files importing from `@bknd/postgres`:

**Find all occurrences:**
```bash
grep -r "@bknd/postgres" --include="*.ts" --include="*.tsx"
```

**Replace imports:**
```typescript
// Before:
import { pgPostgres } from "@bknd/postgres";

// After:
import { pg } from "bknd";
```

### Step 3: Update Adapter Function Calls

If you were using `pgPostgres()`, update to `pg()`:

```typescript
// Before:
import { pgPostgres } from "@bknd/postgres";

connection: {
  url: pgPostgres({
    connectionString: env.POSTGRES_URL,
  }),
}

// After:
import { pg } from "bknd";

connection: {
  url: pg({
    connectionString: env.POSTGRES_URL,
  }),
}
```

### Step 4: Update Type Imports

If you have type imports, update them as well:

```typescript
// Before:
import type { PostgresDialectConfig } from "@bknd/postgres";

// After:
import type { PostgresDialectConfig } from "bknd";
```

### Step 5: Test Your Application

1. Start your development server
2. Test database connections
3. Run your test suite
4. Verify all queries work correctly

## Adapter Comparison

Two PostgreSQL adapters are available in the main `bknd` package:

### pg Adapter (formerly pgPostgres)

**Driver:** `pg` (node-postgres)  
**Best for:** Traditional Node.js applications

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

**Advantages:**
- Widely used and battle-tested
- Extensive community support
- Works with all Node.js runtimes
- Connection pooling built-in

**Use when:**
- Using standard Node.js runtime
- Need connection pooling
- Migrating from existing pg-based applications

### postgresJs Adapter

**Driver:** `postgres` (postgres-js)  
**Best for:** Edge runtimes and modern frameworks

```typescript
import { postgresJs } from "bknd";

connection: {
  url: postgresJs({
    postgres: {
      connectionString: env.POSTGRES_URL,
    },
  }),
}
```

**Advantages:**
- Lightweight and fast
- Works with edge runtimes (Vercel Edge, Cloudflare Workers)
- Minimal dependencies
- Modern Promise-based API

**Use when:**
- Deploying to edge environments
- Using Vercel Edge Functions
- Need minimal bundle size
- Performance-critical applications

### Which Should You Use?

| Use Case | Recommended Adapter |
|----------|-------------------|
| Vercel Edge Functions | `postgresJs` |
| Standard Node.js runtime | `pg` |
| Cloudflare Workers | `postgresJs` |
| Bun runtime | Either (both work) |
| Existing pg-based apps | `pg` |
| Minimal bundle size | `postgresJs` |

## Code Examples

### Complete Migration Example

**Before (v0.19.x):**
```typescript
// bknd.config.ts
import { pgPostgres } from "@bknd/postgres";
import { Pool } from "pg";

export default {
  connection: {
    url: pgPostgres({
      pool: new Pool({
        connectionString: process.env.POSTGRES_URL,
      }),
    }),
  },
};
```

**After (v0.20.0):**
```typescript
// bknd.config.ts
import { pg } from "bknd";
import { Pool } from "pg";

export default {
  connection: {
    url: pg({
      pool: new Pool({
        connectionString: process.env.POSTGRES_URL,
      }),
    }),
  },
};
```

### Migration to postgresJs

**Before (v0.19.x with @bknd/postgres):**
```typescript
import { pgPostgres } from "@bknd/postgres";

export default {
  connection: {
    url: pgPostgres({
      connectionString: env.POSTGRES_URL,
    }),
  },
};
```

**After (v0.20.0 with postgresJs):**
```typescript
import { postgresJs } from "bknd";

export default {
  connection: {
    url: postgresJs({
      postgres: {
        connectionString: env.POSTGRES_URL,
      },
    }),
  },
};
```

## Troubleshooting

### Module Not Found Error

**Error:** `Cannot find module '@bknd/postgres'`

**Solution:** Remove all imports from `@bknd/postgres` and update to import from `bknd`:

```typescript
// Remove:
import { pgPostgres } from "@bknd/postgres";

// Add:
import { pg } from "bknd";
```

### Type Errors

**Error:** `Type 'PgPostgresConnection' is not exported from 'bknd'`

**Solution:** The class is not exported, only the factory function:

```typescript
// Correct:
import { pg } from "bknd";

const connection = pg({
  pool: new Pool({ connectionString: process.env.POSTGRES_URL }),
});

// Incorrect (class not exported):
import { PgPostgresConnection } from "bknd";
```

### Build Failures

**Error:** Build fails after migration

**Solutions:**

1. Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear build cache:
```bash
rm -rf .next
npm run build
```

3. Check for stale imports:
```bash
grep -r "@bknd/postgres" --include="*.ts" --include="*.tsx"
```

### Runtime Errors

**Error:** Connection fails after migration

**Solutions:**

1. Verify connection string format:
```typescript
connection: {
  url: pg({
    pool: new Pool({
      connectionString: "postgresql://user:password@host:5432/dbname",
    }),
  }),
}
```

2. Check environment variables are still set:
```bash
echo $POSTGRES_URL
```

3. Verify adapter configuration:
- `pg` requires `pool` option with `Pool` instance
- `postgresJs` requires `postgres` option with connection config

## Related Guides

- [Configuration Reference](../reference/configuration.md) - Complete configuration options
- [Next.js Integration](../how-to-guides/setup/integrations/nextjs.md) - PostgreSQL setup in Next.js
- [Deploy to Production](../getting-started/deploy-to-production.md) - Production database configuration
- [PostgreSQL Connection](../reference/configuration.md#postgresql-connection) - Detailed PostgreSQL setup

## Migration Checklist

- [ ] Uninstalled `@bknd/postgres` package
- [ ] Updated `bknd` to v0.20.0 or later
- [ ] Updated all imports from `@bknd/postgres` to `bknd`
- [ ] Replaced `pgPostgres()` with `pg()`
- [ ] Updated type imports
- [ ] Tested development environment
- [ ] Ran test suite
- [ ] Verified production deployment configuration
- [ ] Updated deployment environment variables if needed
- [ ] Documented any custom adapter configurations

## Getting Help

If you encounter issues during migration:

1. Check the [troubleshooting guide](../troubleshooting/common-issues.md)
2. Review [GitHub issues](https://github.com/bknd-io/bknd/issues)
3. Join the [community Discord](https://bknd.io/community)
4. Open a new issue with:
   - Error messages
   - Configuration file
   - Steps to reproduce
