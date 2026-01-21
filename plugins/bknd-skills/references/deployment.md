# Deployment Reference

Technical reference for Bknd v0.20.0 deployment to various hosting platforms, database provisioning, and production configuration.

## Deployment Modes

Bknd supports three primary deployment approaches:

| Mode | Best For | Database Options |
|------|----------|------------------|
| **Standalone** | VPS, Docker, dedicated servers | SQLite file, PostgreSQL, LibSQL |
| **Serverless** | AWS Lambda, Vercel | LibSQL (Turso), PostgreSQL (Neon/Supabase) |
| **Edge** | Cloudflare Workers/Pages | Cloudflare D1, Durable Objects |

---

## Hosting Platforms

### Cloudflare Workers/Pages

**Best for:** Edge deployment, global low-latency

```typescript
// bknd.config.ts
import { hybrid, type CloudflareBkndConfig } from "bknd/adapter/cloudflare";
import { d1Sqlite } from "bknd/adapter/cloudflare";

export default hybrid<CloudflareBkndConfig>({
  app: (env) => ({
    connection: d1Sqlite({ binding: env.DB }),
    config: {
      media: {
        enabled: true,
        adapter: {
          type: "r2",
          config: { bucket: env.R2_BUCKET },
        },
      },
    },
    isProduction: true,
  }),
});
```

**wrangler.toml:**
```toml
name = "my-bknd-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "your-d1-database-id"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "my-bucket"
```

**Deploy:**
```bash
wrangler d1 create my-database
wrangler deploy
```

---

### Node.js / Bun (VPS, Docker)

**Best for:** Traditional server deployments, full control

**Bun:**
```typescript
// index.ts
import { serve, type BunBkndConfig } from "bknd/adapter/bun";

const config: BunBkndConfig = {
  connection: {
    url: process.env.DB_URL ?? "file:data.db",
  },
  config: {
    media: {
      enabled: true,
      adapter: {
        type: "s3",
        config: {
          bucket: process.env.S3_BUCKET,
          region: process.env.S3_REGION,
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
      },
    },
  },
};

serve(config);
```

**Node.js:**
```javascript
// index.js
import { serve } from "bknd/adapter/node";

serve({
  connection: {
    url: process.env.DB_URL ?? "file:data.db",
  },
});
```

**Run:**
```bash
# Bun
bun run index.ts

# Node.js (requires @hono/node-server)
npm install @hono/node-server
node index.js
```

---

### Docker

**Dockerfile:**
```dockerfile
FROM oven/bun:1.0-alpine

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

# Data directory for SQLite
RUN mkdir -p /app/data

ENV PORT=3000
ENV DB_URL=file:/app/data/bknd.db

EXPOSE 3000

CMD ["bun", "run", "index.ts"]
```

**docker-compose.yml:**
```yaml
version: "3.8"
services:
  bknd:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - bknd-data:/app/data
      - bknd-uploads:/app/uploads
    environment:
      - DB_URL=file:/app/data/bknd.db
      - JWT_SECRET=${JWT_SECRET}

volumes:
  bknd-data:
  bknd-uploads:
```

---

### Next.js (Vercel)

**Best for:** Full-stack apps with SSR

```typescript
// bknd.config.ts
import type { NextjsBkndConfig } from "bknd/adapter/nextjs";
import { em, entity, text } from "bknd";

const schema = em({
  posts: entity("posts", {
    title: text().required(),
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
    isProduction: env.NODE_ENV === "production",
  }),
} satisfies NextjsBkndConfig;
```

**API Route (`app/api/bknd/[[...bknd]]/route.ts`):**
```typescript
export { GET, POST, PUT, DELETE } from "bknd/adapter/nextjs";
```

**Vercel Environment Variables:**
- `DB_URL` - LibSQL/Turso connection URL
- `DB_TOKEN` - Database auth token
- `JWT_SECRET` - Auth signing secret

---

### AWS Lambda

**Best for:** Serverless, pay-per-use

```typescript
// handler.ts
import { createHandler } from "bknd/adapter/aws";

export const handler = createHandler({
  connection: {
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN,
  },
});
```

**serverless.yml:**
```yaml
service: bknd-api

provider:
  name: aws
  runtime: nodejs20.x
  environment:
    DB_URL: ${env:DB_URL}
    DB_TOKEN: ${env:DB_TOKEN}

functions:
  api:
    handler: handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

---

## Database Provisioning

### SQLite (Local/File)

**Best for:** Development, single-server deployments

```typescript
connection: {
  url: "file:data.db",  // Relative to cwd
  // or absolute path
  url: "file:/var/data/bknd.db",
}
```

---

### LibSQL / Turso

**Best for:** Edge-compatible SQLite, serverless

1. Create database at [turso.tech](https://turso.tech)
2. Get connection URL and auth token

```typescript
connection: {
  url: "libsql://your-db.turso.io",
  authToken: process.env.DB_TOKEN,
}
```

**CLI setup:**
```bash
turso db create my-bknd-db
turso db show my-bknd-db --url    # Get URL
turso db tokens create my-bknd-db  # Get token
```

---

### Cloudflare D1

**Best for:** Cloudflare Workers deployments

```typescript
import { d1Sqlite } from "bknd/adapter/cloudflare";

connection: d1Sqlite({ binding: env.DB })
```

**Create D1 database:**
```bash
wrangler d1 create my-database
# Add binding to wrangler.toml
```

---

### PostgreSQL

**Best for:** Complex queries, large datasets, transactions

**Direct PostgreSQL:**
```typescript
import { PostgresJsConnection } from "bknd/adapter/postgres";

connection: new PostgresJsConnection({
  connectionString: process.env.DATABASE_URL,
})
```

**Neon (Serverless Postgres):**
```typescript
import { createCustomPostgresConnection } from "bknd";
import { NeonDialect } from "kysely-neon";

const neon = createCustomPostgresConnection("neon", NeonDialect);

connection: neon({
  connectionString: process.env.NEON_DATABASE_URL,
})
```

**Supabase:**
```typescript
connection: {
  url: process.env.SUPABASE_DB_URL,
  // Use direct connection string from Supabase dashboard
}
```

**Xata:**
```typescript
import { createCustomPostgresConnection } from "bknd";
import { XataDialect } from "@xata.io/kysely";

const xata = createCustomPostgresConnection("xata", XataDialect);

connection: xata({
  apiKey: process.env.XATA_API_KEY,
  workspace: "your-workspace",
  database: "your-database",
})
```

---

## Production Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | Yes | Database connection URL |
| `DB_TOKEN` | Depends | Auth token (LibSQL/Turso) |
| `JWT_SECRET` | Yes | Auth token signing secret (min 32 chars) |
| `PORT` | No | Server port (default: 3000) |

### Security Checklist

```typescript
export default {
  app: (env) => ({
    connection: { url: env.DB_URL },
    isProduction: true,
    auth: {
      jwt: {
        secret: env.JWT_SECRET,  // MUST be set in production
        expires: "7d",
      },
    },
    config: {
      guard: {
        enabled: true,  // Enable authorization
      },
    },
  }),
};
```

**Critical security items:**
- Set strong `JWT_SECRET` (never use defaults)
- Enable Guard for authorization
- Use HTTPS (handled by platform)
- Set appropriate CORS origins
- Use cloud storage (not local) for media

### Media Storage for Production

**Never use local storage in serverless/edge.** Use cloud providers:

```typescript
// AWS S3
config: {
  media: {
    adapter: {
      type: "s3",
      config: {
        bucket: env.S3_BUCKET,
        region: env.S3_REGION,
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
    },
  },
}

// Cloudflare R2
config: {
  media: {
    adapter: {
      type: "r2",
      config: { bucket: env.R2_BUCKET },
    },
  },
}

// Cloudinary
config: {
  media: {
    adapter: {
      type: "cloudinary",
      config: {
        cloudName: env.CLOUDINARY_CLOUD,
        apiKey: env.CLOUDINARY_KEY,
        apiSecret: env.CLOUDINARY_SECRET,
      },
    },
  },
}
```

---

## Platform Comparison

| Platform | Database | Storage | Cold Start | Cost Model |
|----------|----------|---------|------------|------------|
| Cloudflare Workers | D1, Durable Objects | R2 | ~0ms | Per-request |
| Vercel | LibSQL, Neon | S3, Cloudinary | ~200ms | Per-request |
| AWS Lambda | LibSQL, RDS | S3 | ~500ms | Per-request |
| Docker/VPS | Any | Any | N/A | Fixed |

---

## Deployment Commands

### CLI Helpers

```bash
# Generate types before deploy
npx bknd types

# Sync schema to database
npx bknd sync

# Export static admin assets (for CDN)
npx bknd export
```

### Platform-Specific

```bash
# Cloudflare
wrangler deploy

# Vercel
vercel deploy --prod

# Docker
docker build -t my-bknd-app .
docker push my-bknd-app

# AWS (with Serverless Framework)
serverless deploy --stage prod
```

---

## Troubleshooting

### Common Issues

**"Connection refused" in serverless**
- Ensure database URL is correct for serverless (not file-based)
- Check auth token is set for LibSQL/Turso

**"Module not found" for native modules**
- Use LibSQL instead of better-sqlite3 in serverless
- Check platform-specific adapter imports

**Cold start timeouts**
- Reduce bundle size
- Use lighter database connections
- Enable connection pooling for Postgres

**Media upload failures**
- Verify cloud storage credentials
- Check bucket permissions and CORS
- Ensure adapter type matches your provider

**"JWT_SECRET required"**
- Set `JWT_SECRET` environment variable
- Must be at least 32 characters for security

---

## Related References

- [Dev Workflow](./dev-workflow.md) - Local development setup
- [Authentication](./authentication.md) - Auth configuration
- [Files & Media](./files-media.md) - Storage adapters
- [Authorization](./authorization.md) - Guard and permissions
