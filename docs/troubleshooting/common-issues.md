---
title: Troubleshooting FAQ
description: Common issues and solutions when working with Bknd
---

# Troubleshooting FAQ

Common issues you might encounter when working with Bknd and how to resolve them.

## Database Connection Errors

### "Database connection failed"

**Symptoms:**
- Backend fails to start
- API returns 500 errors
- Database tables not created

**Common Causes:**

1. **Invalid connection string**
   ```typescript
   // ❌ Missing database filename
   connection: { url: "file:" }

   // ✅ Correct
   connection: { url: "file:./bknd.db" }
   ```

2. **SQLite file path issues**
   - Ensure directory exists before starting
   - Use relative paths for portability: `file:./data/bknd.db`
   - For Bun runtime, file must have read/write permissions

3. **PostgreSQL connection issues**
   ```typescript
   // Check database exists
   connection: {
     url: "postgresql://user:pass@localhost:5432/bknd"
   }
   ```

**Solutions:**
1. Verify connection string format matches your database type
2. Check database credentials and host accessibility
3. Ensure database directory exists with write permissions
4. Test connection manually: `sqlite3 bknd.db` or `psql` for PostgreSQL

---

## Type Generation Issues

### "Cannot find module 'bknd-types.d.ts'"

**Symptoms:**
- TypeScript errors about missing types
- IntelliSense not working for entities

**Cause:** Types not generated or not included in `tsconfig.json`

**Solution:**
```bash
# Generate types
npx bknd types --out bknd-types.d.ts
```

Then update `tsconfig.json`:
```json
{
  "include": [
    "bknd-types.d.ts",
    "src/**/*"
  ]
}
```

### Type mismatch after schema changes

**Symptoms:**
- TypeScript errors about field types
- Generated types don't match actual schema

**Cause:** Types not regenerated after schema changes

**Solution:**
```bash
# Regenerate types after any schema change
npx bknd types --out bknd-types.d.ts
```

**For Code Mode:**
```bash
# Sync database and regenerate types
npx bknd sync --force
npx bknd types --out bknd-types.d.ts
```

---

## Auth Token Expiration

### "401 Unauthorized" or token expired

**Symptoms:**
- API requests fail after some time
- User gets logged out unexpectedly

**Cause:** JWT token expired (default: 24 hours)

**Solutions:**

1. **Check token expiration in config**
   ```typescript
   config: {
     auth: {
       jwt: {
         expires: "7d", // Increase to 7 days
         issuer: "your-app"
       }
     }
   }
   ```

2. **Implement token refresh** (TODO: Token refresh workflow not yet documented)
   - Monitor token expiration on client
   - Re-authenticate before token expires
   - Use `api.auth.me()` to check validity

3. **Verify token format**
   ```typescript
   // Token should be in Authorization header
   headers: {
     "Authorization": `Bearer ${token}`
   }
   ```

### "Invalid token" errors

**Symptoms:**
- Valid token rejected
- Immediate auth failures

**Common Causes:**
1. **JWT secret mismatch** between token generation and verification
2. **Token issuer mismatch** in config
3. **Corrupted token** (invalid base64)

**Solutions:**
1. Ensure consistent JWT secret across restarts
2. Match `issuer` in config with token generation
3. Generate new token if corrupted

---

## CORS Issues

### "CORS policy: No 'Access-Control-Allow-Origin' header"

**Symptoms:**
- Browser blocks API requests
- Network tab shows CORS errors
- Works from Postman/curl but not browser

**Cause:** Bknd server doesn't allow cross-origin requests

**Solution:**

Bknd handles CORS automatically in most adapters. If you see CORS issues:

1. **Check adapter configuration**
   ```typescript
   // Vite adapter (auto-configured)
   serve(app, {
     cors: true, // Default enabled
   });
   ```

2. **For custom adapters**, ensure CORS middleware:
   ```typescript
   import { cors } from 'hono/cors';

   app.use('*', cors({
     origin: ['http://localhost:5173', 'https://yourdomain.com'],
     credentials: true,
   }));
   ```

3. **Verify frontend URL matches allowed origins**

---

## Deployment Problems

### "Database file not found" in production

**Symptoms:**
- App crashes on startup in production
- Works locally but fails deployed

**Cause:** Database path not absolute or directory doesn't exist

**Solution:**

```typescript
// ❌ Relative path may fail in production
connection: { url: "file:./bknd.db" }

// ✅ Use absolute path or environment variable
connection: {
  url: `file:${process.env.DATABASE_PATH || "./data/bknd.db"}`
}
```

For serverless (Cloudflare Workers, AWS Lambda):
- Use Cloudflare D1 or Turso (LibSQL)
- Configure binding correctly
- Don't use file-based SQLite

### Environment variables not loading

**Symptoms:**
- Config uses wrong values in production
- Hardcoded values instead of env vars

**Cause:** Environment variables not loaded at build time

**Solution:**

```typescript
// Import from environment
import { getBkndApp } from "bknd/adapter/nextjs";

const config = getBkndApp({
  // Environment variables loaded here
}, process.env);
```

Then set in `.env`:
```bash
DATABASE_URL=file:./data/bknd.db
JWT_SECRET=your-secret-here
```

### Port already in use

**Symptoms:**
- `EADDRINUSE: address already in use`
- Server fails to start

**Solution:**

```bash
# Find process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or configure different port
serve(app, { port: 3001 });
```

---

## Mode Switching Issues

### "Cannot sync schema in Code Mode"

**Symptoms:**
- Schema changes not reflected
- Database tables not created

**Cause:** Code Mode requires manual sync with `--force` flag

**Solution:**
```bash
# Sync schema in Code Mode
npx bknd sync --force
```

**Important:**
- The `--force` flag is required for schema mutations in Code Mode
- Without it, only reads schema from code but doesn't update database
- Always regenerate types after sync: `npx bknd types`

### Config changes not applying

**Symptoms:**
- Modified `bknd.config.ts` doesn't change behavior
- UI shows old settings

**Cause:** Depends on mode being used

**Solution:**

| Mode | Config Source | When Changes Apply |
|------|---------------|-------------------|
| DB Mode | Database | Immediately (saved to DB) |
| Hybrid Mode | Database (dev) / Code (prod) | Dev: Immediately, Prod: On restart |
| Code Mode | Code file | On app restart |

**For Code/Hybrid Mode:**
1. Restart the application
2. Run `npx bknd sync --force` if schema changed
3. Regenerate types: `npx bknd types`

### "First boot seed not running"

**Symptoms:**
- Database empty but seed function didn't execute
- No initial data created

**Cause:** Seed function only runs on first boot when database is empty

**Solution:**

1. **Verify database is actually empty:**
   ```bash
   # SQLite
   sqlite3 bknd.db "SELECT name FROM sqlite_master WHERE type='table';"

   # Should show no tables or only system tables
   ```

2. **Check seed function in config:**
   ```typescript
   const app = createApp({
     config: {
       data: {
         seed: async (app) => {
           // Seed logic here
           console.log("Seeding database...");
         }
       }
     }
   });
   ```

3. **Force re-seed** (for development only):
   ```bash
   # Delete database and restart
   rm bknd.db
   npm run dev
   ```

---

## Common Development Issues

### Hot module replacement (HMR) not working

**Symptoms:**
- Changes require full restart
- HMR errors in console

**Cause:** Incorrect adapter or dev server configuration

**Solution:**

**For Vite:**
```typescript
// vite.config.ts
import { devServer } from "bknd/adapter/vite";

export default defineConfig({
  server: devServer(), // Required for HMR
});
```

**For Next.js:**
- HMR works automatically with Next.js dev server
- Ensure no conflicting dev servers running

### Admin UI shows 404

**Symptoms:**
- Accessing `/admin` shows 404 error
- Admin route not found

**Cause:** Admin component not properly configured in routes

**Solution:**

**For Vite:**
```typescript
// App.tsx
import { Admin } from "bknd/ui";
import "bknd/dist/styles.css";

<Admin withProvider={{ api: app.getApi() }} />
```

**For Next.js:**
```typescript
// src/app/admin/[[...admin]]/page.tsx
import { Admin } from "bknd/ui";

export default function AdminPage() {
  return <Admin />;
}
```

**For Astro:**
```astro
// src/pages/admin/[...admin].astro
---
import { Admin } from "bknd/ui";
---

<Admin client:load />
```

---

## Getting Help

If you're still having issues:

1. **Check Known Issues** - See [Known Issues](./known-issues.md) for documented bugs
2. **Search GitHub Issues** - Check [bknd-io/bknd/issues](https://github.com/bknd-io/bknd/issues)
3. **Review Source Code** - Inspect relevant files in `opensrc/repos/github.com/bknd-io/bknd/app/src/`
4. **Create Minimal Reproduction** - Create a simple example that demonstrates the issue
5. **Report the Issue** - File a GitHub issue with:
   - Bknd version
   - Node.js/Bun version
   - Operating system
   - Minimal reproduction code
   - Expected vs actual behavior
