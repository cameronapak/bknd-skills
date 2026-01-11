---
description: Deploy your Bknd application to production on Vercel in 15 minutes
---

# Deploy to Production

Complete guide for deploying a Bknd application to Vercel production environment.

## Prerequisites

Before starting, ensure you have:
- A Bknd application with entities defined and working locally
- A GitHub repository with your code pushed
- A Vercel account (free tier works)

## Step 1: Prepare Your Application

### Update Configuration

Open your `bknd.config.ts` and ensure it uses environment variables:

```typescript
import type { NextjsBkndConfig } from "bknd/adapter/nextjs";

export default {
  connection: {
    url: process.env.DATABASE_URL || "file:data.db",
  },
} satisfies NextjsBkndConfig;
```

### Create Environment File

Create `.env.local` for local development:

```env
DATABASE_URL="file:data.db"
```

## Step 2: Choose Your Database

For production deployment, you have three options:

### Option A: SQLite with Turso (Recommended for Edge)

Turso provides a hosted SQLite database that works with Vercel Edge Functions.

1. Sign up at https://turso.tech
2. Create a database: `turso db create bknd-prod`
3. Get your connection URL: `turso db show bknd-prod`
4. Create auth token: `turso db tokens create bknd-prod`

Set these environment variables:
```env
DATABASE_URL="libsql://bknd-prod.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"
```

 ### Option B: PostgreSQL (Recommended for Traditional)

Use a PostgreSQL provider like Neon, Supabase, or Railway.

**Choose an adapter:**

For traditional Node.js deployments (connection pooling):

```typescript
import { pg } from "bknd";
import { Pool } from "pg";

export default {
  connection: pg({
    pool: new Pool({
      connectionString: "postgresql://user:password@host:5432/dbname",
    }),
  }),
} satisfies BkndConfig;
```

For edge runtimes (Vercel Edge Functions, Cloudflare Workers):

```typescript
import { postgresJs } from "bknd";
import postgres from "postgres";

export default {
  connection: postgresJs({
    postgres: postgres("postgresql://user:password@host:5432/dbname"),
  }),
} satisfies BkndConfig;
```

For managed providers (Neon, Xata, etc.):

```typescript
import { createCustomPostgresConnection } from "bknd";
import { NeonDialect } from "kysely-neon";

const neon = createCustomPostgresConnection("neon", NeonDialect);

export default {
  connection: neon({
    connectionString: process.env.NEON_URL,
  }),
} satisfies BkndConfig;
```

> **Note:** As of v0.20.0, PostgreSQL adapters (`pg`, `postgresJs`) are available directly from `bknd` package. See [PostgreSQL Migration Guide](/migration-guides/postgres-package-merge) for migrating from `@bknd/postgres`.

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### Option C: SQLite File (Not Recommended for Production)

File-based SQLite works but has limitations:
- Database doesn't persist across deployments
- Cannot use with edge runtime
- Not suitable for production use

## Step 3: Configure Vercel

### Create Project

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or adjust if needed)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Set Environment Variables

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add your database connection string:
   ```
   DATABASE_URL=your-database-url
   ```

If using Turso, also add:
```
TURSO_AUTH_TOKEN=your-auth-token
```

3. Click **Save**

### Configure Edge Runtime (Optional)

For better performance with Turso or PostgreSQL, enable edge runtime in your API route:

```typescript
// src/app/api/[[...bknd]]/route.ts
import { config } from "@/bknd";
import { serve } from "bknd/adapter/nextjs";

export const runtime = "edge";

const handler = serve({
  ...config,
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
```

## Step 4: Deploy

### Deploy to Production

1. Click **Deploy** in Vercel
2. Wait for the build to complete
3. Vercel will provide a production URL (e.g., `https://your-app.vercel.app`)

### Verify Deployment

1. Visit your production URL
2. Try accessing your API endpoints:
   - `https://your-app.vercel.app/api/[entity]`
3. Test your application functionality

## Step 5: Configure Admin UI

### Protect Admin Route

Ensure your admin route requires authentication:

```typescript
// src/app/admin/[[...admin]]/page.tsx
import { Admin } from "bknd/ui";
import { getApi } from "@/bknd";
import "bknd/dist/styles.css";

export default async function AdminPage() {
  const api = await getApi({ verify: true });

  if (!api.getUser()) {
    return <div>Access denied</div>;
  }

  return (
    <Admin
      withProvider={{ user: api.getUser() }}
      config={{
        basepath: "/admin",
        logo_return_path: "/",
        theme: "system",
      }}
    />
  );
}
```

## Choosing Your Mode

### Development: Database Mode

Use database mode during development for quick iteration:

```typescript
export default {
  connection: {
    url: "file:data.db",
  },
  data: {
    mode: "database",
  },
} satisfies NextjsBkndConfig;
```

### Production: Code Mode

Switch to code mode for production to enforce schema in code:

```typescript
import schema from "./bknd.schema"; // Your schema file

export default {
  connection: {
    url: process.env.DATABASE_URL!,
  },
  data: {
    mode: "code",
    schema,
  },
} satisfies NextjsBkndConfig;
```

### Mode Switching Workflow

1. **Development**: Use database mode for fast changes
2. **Schema Freeze**: When ready for production, export schema from Admin UI
3. **Code Mode Switch**: Implement code mode with exported schema
4. **Test Locally**: Verify code mode works locally
5. **Deploy**: Deploy with code mode enabled

## Production Checklist

Before going live, verify:

- [ ] Database connection string is set in Vercel
- [ ] Environment variables are configured
- [ ] Admin UI is protected with authentication
- [ ] Authentication is using secure cookies (not local storage)
- [ ] Database seeding works in production
- [ ] Edge runtime is enabled if using Turso
- [ ] CORS is configured if needed
- [ ] Domain is configured (custom domain if desired)

## Common Issues

### Database Connection Failed

**Problem**: Application fails to connect to database

**Solutions**:
1. Verify `DATABASE_URL` is set in Vercel environment variables
2. Check database credentials are correct
3. Ensure database is accessible from Vercel (whitelist Vercel IPs if needed)
4. Check database firewall settings

### Auth Not Working

**Problem**: Authentication fails after deployment

**Solutions**:
1. Ensure cookies are set with `secure: true` in production
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Check CORS configuration if using separate domains
4. Ensure auth module is enabled in config

### Edge Runtime Errors

**Problem**: Application crashes with edge runtime errors

**Solutions**:
1. Remove `export const runtime = "edge"` from API routes
2. Switch to Node.js runtime instead
3. Ensure all dependencies are edge-compatible

### Data Not Persisting

**Problem**: Created data disappears after deployment

**Solutions**:
1. Stop using file-based SQLite in production
2. Switch to Turso or PostgreSQL
3. Ensure `DATABASE_URL` points to persistent database

## Next Steps

- [Next.js Integration Guide](/how-to-guides/setup/integrations/nextjs) - Set up Next.js integration
- [Choose Your Mode](/how-to-guides/setup/choose-your-mode) - Learn about configuration modes
- [Configuration Reference](/reference/configuration) - Review all configuration options
- [Seed Database](/how-to-guides/data/seed-database) - Seed your production database
- [Troubleshooting](/troubleshooting/common-issues) - Debug common issues

## Related Guides

- [Add Authentication with Permissions](/add-authentication) - Complete auth setup before deployment
- [Build Your First API](/build-your-first-api) - Complete onboarding tutorial
- [Create First User](/how-to-guides/auth/create-first-user) - Set up admin users for production
- [Cloudflare Workers Guide](/how-to-guides/setup/integrations/cloudflare-workers) - Alternative edge deployment
- [AWS Lambda Guide](/how-to-guides/setup/integrations/aws-lambda) - Serverless deployment
- [Docker Guide](/how-to-guides/setup/integrations/docker) - Container deployment

## Additional Deployment Options

### Other Platforms

While this guide focuses on Vercel, Bknd also supports:

- **Netlify**: Similar configuration, use edge functions
- **AWS Lambda**: Use AWS Lambda integration guide
- **Cloudflare Workers**: Use Cloudflare Workers integration guide
- **Docker**: Use Docker deployment guide

See the [Integration Guides](/how-to-guides/setup/integrations/) for more details.
