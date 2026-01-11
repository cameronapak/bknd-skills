---
title: Cloudflare Workers Integration Guide
description: Deploy Bknd to Cloudflare Workers with D1 database and R2 storage for global edge deployment
---

# Cloudflare Workers Integration Guide

Deploy Bknd to Cloudflare Workers for global edge deployment with zero-configuration database access via D1 bindings.

## What You'll Learn

- Set up D1 database for edge SQLite
- Configure Cloudflare Workers adapter
- Deploy to Cloudflare's global network
- Configure R2 storage for media files

## Prerequisites

- Cloudflare account with Workers enabled
- Node.js 18+ installed
- Wrangler CLI: `npm install -g wrangler`
- Bknd project initialized

## Step 1: Install Dependencies

```bash
npm install bknd
```

## Step 2: Configure D1 Database

Create a D1 database in your Cloudflare account:

```bash
npx wrangler d1 create my-database
```

This returns a `database_id` that you'll need in the next step.

## Step 3: Configure `wrangler.json`

Create `wrangler.json` in your project root:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "bknd-worker",
  "main": "src/index.ts",
  "compatibility_date": "2025-08-03",
  "compatibility_flags": ["nodejs_compat"],
  "workers_dev": true,
  "minify": true,
  "assets": {
    "directory": "./node_modules/bknd/dist/static"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "bknd-dev",
      "database_id": "your-database-id-here"
    }
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "bknd-media"
    }
  ]
}
```

**Configuration properties:**

| Property | Description | Required |
|----------|-------------|----------|
| `name` | Worker name | Yes |
| `main` | Entry point file | Yes |
| `compatibility_date` | Workers API version | Yes |
| `compatibility_flags` | Compatibility settings | Recommended |
| `assets.directory` | Static assets path (Admin UI) | Recommended |
| `d1_databases` | D1 database bindings | Yes |
| `r2_buckets` | R2 storage buckets (for media) | Optional |

## Step 4: Create Bknd Configuration

Create `config.ts`:

```typescript
import type { CloudflareBkndConfig } from "bknd/adapter/cloudflare";

export default {
  d1: {
    session: true,
  },
} satisfies CloudflareBkndConfig;
```

**D1 Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `session` | boolean | `false` | Enable D1 sessions for transaction state across requests |

**Note:** The `session: true` option enables D1 database sessions, which help maintain transaction state across requests. This is recommended for production use.

## Step 5: Create Worker Entry Point

Create `src/index.ts`:

```typescript
import { serve } from "bknd/adapter/cloudflare";
import config from "../config";

export default serve(config);
```

The `serve()` function from `bknd/adapter/cloudflare` automatically:

- Connects to D1 database via bindings
- Sets up R2 storage for media (if configured)
- Initializes all Bknd modules
- Handles HTTP requests through the Worker runtime

## Step 6: (Optional) Use Platform Proxy for Type Generation

If you need programmatic access to bindings (e.g., for generating types), create `bknd.config.ts`:

```typescript
import { withPlatformProxy } from "bknd/adapter/cloudflare/proxy";
import config from "./config";

export default withPlatformProxy(config);
```

The `withPlatformProxy` wrapper enables:
- Programmatic access to Cloudflare bindings
- Type generation with Wrangler
- Separates config from Worker entry point

## Step 7: Run Development Server

Start local development:

```bash
npm run dev
```

This runs:
- Wrangler dev server at `http://localhost:8787`
- Live reload on file changes
- Local D1 database for testing

## Step 8: Deploy to Cloudflare Workers

Deploy your Worker to Cloudflare's global network:

```bash
npx wrangler deploy
```

This automatically:
- Builds your Worker
- Uploads to Cloudflare's edge network
- Configures D1 database and R2 bucket
- Distributes to data centers globally

## Step 9: Generate Wrangler Types (Optional)

For type-safe access to bindings in your code:

```bash
npm run typegen
```

This generates `worker-configuration.d.ts` with type definitions for:
- `Env` interface (D1 bindings, R2 buckets)
- Environment variables
- Type-safe binding access

## Edge Deployment Considerations

### Performance Benefits

Cloudflare Workers provides:
- **Global distribution**: Automatic deployment to 300+ data centers
- **Zero cold starts**: Always warm instances
- **Low latency**: Serve from nearest data center
- **Automatic scaling**: No need to manage infrastructure

### D1 Database Features

**Known advantages:**
- Edge-native database (no connection overhead)
- Automatic scaling and replication
- Transaction support with D1 sessions
- SQLite-compatible queries

### Mode Selection

**UNKNOWN: Best practices unclear**

We don't have documentation on which Bknd mode (db mode vs code mode vs hybrid mode) is recommended for Cloudflare Workers edge deployment.

**What we know:**
- D1 bindings are injected at runtime by Cloudflare
- Configuration is typically static for edge deployments
- Performance is critical for edge functions

**Recommendation:**
- Use **Code Mode** (`options.mode: "code"`) for production (eliminates database config lookups)
- Use **Hybrid Mode** for development (visual config in D1 + code in production)
- Document your mode decision and test performance

### Environment Variables

**UNKNOWN: How environment variables work in Cloudflare Workers**

We don't have documentation on:
- How to access environment variables in Bknd config
- Whether `process.env` works in Workers
- How Wrangler's `[vars]` configuration integrates with Bknd

**Workaround:**
Use Cloudflare environment variables directly in your config if needed:

```typescript
export default {
  d1: {
    session: true,
  },
  config: {
    // Access environment variables if supported
    // data: { database_url: env.DATABASE_URL }
  },
} satisfies CloudflareBkndConfig;
```

**TODO:** Research environment variable integration for Cloudflare Workers

### R2 Storage Configuration

**UNKNOWN: How to configure R2 for media storage**

We know R2 buckets can be configured in `wrangler.json`, but we don't have documentation on:
- How to enable R2 storage in Bknd config
- How to configure `media.adapter` for R2
- Whether R2 is automatic when bucket is configured

**Workaround:**
If you need media storage, consider:
- Using S3-compatible storage adapter (if R2 supports S3 API)
- Disabling media module temporarily
- Researching R2 adapter configuration

**TODO:** Document R2 media storage configuration

## Troubleshooting

### D1 Database Connection Issues

**Issue:** "Database not found" error

**Solution:**
1. Verify `database_id` in `wrangler.json` matches your D1 database
2. Create database if missing: `npx wrangler d1 create my-database`
3. Update `database_id` after creation

### Static Assets Not Loading

**Issue:** Admin UI or static files return 404

**Solution:**
1. Verify `assets.directory` in `wrangler.json` points to correct path
2. Ensure path is relative to project root
3. Check that `bknd/dist/static` exists (or rebuild Bknd)

### Type Generation Errors

**Issue:** `worker-configuration.d.ts` not found or missing types

**Solution:**
1. Run `npm run typegen` to regenerate types
2. Ensure `wrangler.json` is valid JSON
3. Check that D1 bindings and R2 buckets are properly configured

### Deployment Failures

**Issue:** `wrangler deploy` fails with build errors

**Solution:**
1. Verify TypeScript compilation: `npx tsc --noEmit`
2. Check compatibility flags in `wrangler.json`
3. Ensure `main` entry point exists and exports correctly

## Production Checklist

Before deploying to production:

- [ ] Update `database_id` to production D1 database
- [ ] Update `bucket_name` to production R2 bucket
- [ ] Set `workers_dev: false` in `wrangler.json`
- [ ] Configure production environment variables (if needed)
- [ ] Test deployment in staging environment first
- [ ] Enable Cloudflare Analytics for monitoring
- [ ] Set up log shipping (Cloudflare Logpush)
- [ ] Configure custom domain (optional)

## Advantages of Cloudflare Workers

| Feature | Benefit |
|---------|---------|
| **Global CDN** | Automatic deployment to 300+ edge locations |
| **Zero cold starts** | Instant response times |
| **D1 Database** | Edge-native SQLite with automatic scaling |
| **R2 Storage** | S3-compatible object storage with zero egress fees |
| **Automatic scaling** | No infrastructure management required |
| **Built-in security** | DDoS protection and Web Application Firewall |

## Limitations

- **D1 database** is SQLite-based (not PostgreSQL)
- **Limited execution time** (CPU time limit on Workers)
- **No filesystem access** (edge environment constraint)
- **Memory constraints** (based on Workers plan)
- **D1 is beta** (still in active development)

## Next Steps

- Set up custom domain for your Worker
- Configure Cloudflare Analytics for monitoring
- Implement environment-specific configurations (dev/staging/prod)
- Set up CI/CD for automatic deployments
- Explore Cloudflare Queues for background jobs

## Learn More

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)
- [R2 Storage Documentation](https://developers.cloudflare.com/r2/)
- [Bknd Official Documentation](https://docs.bknd.io/integration/cloudflare)
- [Bknd Discord Community](https://discord.gg/952SFk8Tb8)

## Known Issues & Gaps

### What We Don't Know

This guide is based on available documentation and example code. The following aspects require further research:

1. **Mode Selection for Edge Deployment**
   - Which Bknd mode is best for Cloudflare Workers?
   - Performance impact of db mode vs code mode at the edge
   - How mode switching works with D1 bindings

2. **Environment Variables**
   - How to access environment variables in Bknd config
   - Integration with Wrangler's `[vars]` configuration
   - Best practices for secret management

3. **R2 Media Storage**
   - How to configure R2 for media module
   - `media.adapter` configuration for R2
   - Automatic vs manual R2 bucket configuration

4. **Local Testing**
   - How to test D1 database locally
   - Wrangler dev vs Miniflare for local development
   - Testing R2 bucket operations locally

5. **Production Best Practices**
   - Migration strategies for existing databases
   - Performance optimization for edge deployment
   - Error handling and retry logic for edge failures

### How You Can Help

If you have experience with Cloudflare Workers and Bknd:

1. Test the configuration steps above
2. Share your production deployment experiences
3. Document edge-specific considerations
4. Report issues or suggest improvements
5. Contribute to the official Bknd documentation

### Resources for Further Research

- Source code: `examples/cloudflare-worker/` in bknd-io/bknd repository
- D1 connection: `app/src/adapter/cloudflare/connection/D1Connection.ts`
- Worker adapter: `app/src/adapter/cloudflare/cloudflare-workers.adapter.ts`
- Cloudflare Workers community forums
- Bknd Discord server for real-time help
