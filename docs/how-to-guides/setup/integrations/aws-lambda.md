---
title: AWS Lambda Integration
description: Deploy Bknd as a serverless backend on AWS Lambda with automatic scaling and pay-per-use pricing.
---

# AWS Lambda Integration

Deploy Bknd on AWS Lambda for a serverless backend that automatically scales and only charges for actual usage.

## Overview

AWS Lambda runs your Bknd backend without managing servers. Lambda handles infrastructure, scaling, and high availability, so you focus on your application code.

**Use cases:**
- Cost-effective backends for variable traffic
- API backends for mobile/web apps
- Event-driven data processing
- Scheduled tasks and automation

## Prerequisites

Before deploying to AWS Lambda, ensure you have:

- **AWS Account** with appropriate permissions
- **AWS CLI** installed and configured
- **Node.js 22.x** runtime
- **Cloud database** (RDS, Turso, LibSQL server, etc.)
- **esbuild** for bundling

**Install dependencies:**

```bash
npm install bknd esbuild dotenv
```

## Basic Setup

### 1. Create Lambda Entry Point

Create `index.mjs`:

```javascript
import { serve } from "bknd/adapter/aws";

export const handler = serve({
   // Admin UI assets (optional)
   assets: {
      mode: "local",
      root: "./static",
   },
   
   // Database connection
   connection: {
      url: process.env.DB_URL,
      authToken: process.env.DB_TOKEN,
   },
});
```

### 2. Configure Environment Variables

Create `.env` file:

```bash
DB_URL=libsql://your-db.turso.io
DB_TOKEN=your-database-token
```

### 3. Build and Deploy

Use the deployment script (or AWS CLI):

```bash
./deploy.sh
```

This script:
- Bundles your code with esbuild
- Copies Admin UI assets
- Creates IAM role and Lambda function
- Configures Function URL for public access

## Configuration Options

### Assets Mode

Bknd supports two asset serving modes:

**Local Mode** (serves files from bundle):
```javascript
assets: {
   mode: "local",
   root: "./static",
}
```

**URL Mode** (CDN-hosted assets):
```javascript
assets: {
   mode: "url",
   url: "https://cdn.example.com/assets",
}
```

**Note**: Run `npx bknd copy-assets --out=static` before deployment to copy Admin UI assets.

### Connection Configuration

Use cloud databases for Lambda deployments:

**RDS PostgreSQL:**

Bknd provides two PostgreSQL adapters available from main `bknd` package:

### pg Adapter (node-postgres)

Best for traditional Node.js applications with connection pooling:

```javascript
import { pg } from "bknd";
import { Pool } from "pg";

connection: {
  url: pg({
    pool: new Pool({
      connectionString: process.env.DB_URL,
    }),
  }),
}
```

### postgresJs Adapter

Best for edge runtimes:

```javascript
import { postgresJs } from "bknd";
import postgres from "postgres";

connection: {
  url: postgresJs({
    postgres: postgres(process.env.DB_URL),
  }),
}
```

> **Note:** As of v0.20.0, PostgreSQL adapters (`pg`, `postgresJs`) are available directly from `bknd` package. See [PostgreSQL Migration Guide](../migration-guides/postgres-package-merge.md) for migrating from `@bknd/postgres`.

Or use connection string directly:

**Turso (LibSQL):**
```javascript
connection: {
   url: process.env.DB_URL,
   authToken: process.env.DB_TOKEN,
}
```

**Local SQLite** (not recommended for Lambda):
```javascript
connection: {
   url: "file:data.db",
}
```

### Lambda Configuration

Configure Lambda settings in `deploy.sh`:

| Setting | Default | Description |
|---------|---------|-------------|
| `RUNTIME` | `nodejs22.x` | Node.js version |
| `ARCHITECTURE` | `arm64` | CPU architecture |
| `MEMORY` | `1024` | Memory in MB (128-10240) |
| `TIMEOUT` | `30` | Timeout in seconds (1-900) |

## Deployment Script

The deployment script (`deploy.sh`) handles the complete deployment process:

```bash
#!/bin/bash

# Lambda settings
FUNCTION_NAME="bknd-lambda"
ROLE_NAME="bknd-lambda-execution-role"
RUNTIME="nodejs22.x"
HANDLER="index.handler"
ARCHITECTURE="arm64"
MEMORY="1024"
TIMEOUT="30"

# Build bundle
rm -rf dist && mkdir dist
npx bknd copy-assets --out=dist/static
npx esbuild index.mjs \
  --bundle \
  --format=cjs \
  --platform=browser \
  --external:fs \
  --minify \
  --outfile=dist/index.js

# Package and deploy
(cd dist && zip -r lambda.zip .)
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://dist/lambda.zip
```

## IAM Role Setup

Lambda requires an IAM role with execution permissions. The script creates a role with:

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "lambda.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
  }]
}
```

**Attached Policies:**
- `AWSLambdaBasicExecutionRole` (CloudWatch logs)

**Additional permissions needed:**
- Database connectivity (VPC access if using RDS)
- S3/R2 access if using cloud storage for media
- Secrets Manager access for credentials

## Function URL

AWS Lambda Function URLs provide a direct HTTP endpoint for your Lambda:

```bash
# Create Function URL
aws lambda create-function-url-config \
  --function-name bknd-lambda \
  --auth-type NONE

# Grant public access
aws lambda add-permission \
  --function-name bknd-lambda \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --statement-id public-access
```

**Security recommendation:** Use `--auth-type AWS_IAM` or implement custom authorization in your Lambda handler instead of `NONE`.

## Production Considerations

### 1. Database Connection Pooling

Serverless functions can exhaust connection limits. Use:

- **RDS Proxy** (for RDS databases)
- **Connection pool middleware** (for LibSQL/Turso)
- **Keep database connections warm** with provisioned concurrency

### 2. Cold Starts

Reduce cold start times with:

- **Provisioned concurrency** (always warm instances)
- **Lambda SnapStart** (faster initialization)
- **Optimize bundle size** (minimize dependencies)

### 3. Environment Variables

Store sensitive data securely:

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name bknd/db-credentials \
  --secret-string '{"url":"...","token":"..."}'
```

### 4. Monitoring and Logging

- Enable **CloudWatch Logs** for debugging
- Use **X-Ray** for distributed tracing
- Set up **CloudWatch Alarms** for errors and throttling

### 5. Security

- **VPC configuration** for private database access
- **IAM authentication** for Function URLs
- **Security groups** for network access control
- **KMS encryption** for sensitive environment variables

## Testing Locally

Test your Lambda handler before deployment:

```javascript
// test.js
import { handler } from "./dist/index.js";

const event = {
  httpMethod: "GET",
  path: "/api/posts",
  headers: {},
  queryStringParameters: {},
  body: null,
};

handler(event).then(console.log);
```

Run with:

```bash
npm test
```

## Troubleshooting

### "Cannot find module" errors

Ensure esbuild includes all dependencies:

```bash
npx esbuild index.mjs \
  --bundle \
  --format=cjs \
  --platform=browser \
  --external:fs \
  --minify \
  --outfile=dist/index.js
```

### Database connection timeouts

- Check VPC configuration and security groups
- Increase Lambda timeout (default: 30s)
- Use connection pooling or RDS Proxy

### Cold start delays

- Enable provisioned concurrency
- Optimize bundle size (remove unused dependencies)
- Use ARM64 architecture (faster cold starts)

### Admin UI not loading

- Verify assets were copied: `npx bknd copy-assets --out=static`
- Check Function URL path configuration
- Ensure assets mode matches deployment (local vs URL)

## Complete Example

See the full AWS Lambda example in the Bknd repository:

```bash
cd examples/aws-lambda
cp .env.example .env
./deploy.sh
```

This example includes:
- Complete deployment script
- IAM role management
- Environment variable configuration
- Function URL setup
- Testing utilities

## Best Practices

1. **Use cloud databases** (Turso, RDS) for Lambda deployments
2. **Implement graceful shutdown** for long-running operations
3. **Set appropriate timeout and memory** based on workload
4. **Monitor cold starts** and optimize accordingly
5. **Use Lambda Layers** for shared dependencies
6. **Test with provisioned concurrency** before production
7. **Implement custom authentication** instead of public Function URLs

## Migration Guide

Migrating from other platforms to AWS Lambda:

**From Vite/Node:**
- Change import to `bknd/adapter/aws`
- Use `serve()` to export Lambda handler
- Bundle with esbuild instead of vite dev server

**From Bun:**
- Convert TypeScript to JavaScript (or use ts-node)
- Replace `serve()` with AWS adapter
- Add AWS Lambda specific configuration

**From Cloudflare Workers:**
- Replace D1 with RDS or Turso
- Use R2 for media storage (instead of local)
- Adjust for Lambda event structure

---

**UNKNOWN AREAS:**

The following aspects require additional research and testing:

**What we don't know:**
- **RDS Proxy configuration**: How to configure RDS Proxy specifically with Bknd's connection pooling
- **Provisioned concurrency setup**: How to enable and configure provisioned concurrency for Bknd Lambda
- **Custom Lambda authorizers**: How to integrate AWS Lambda authorizers with Bknd's Guard system
- **Lambda SnapStart compatibility**: Whether SnapStart works with Bknd's initialization process
- **Multi-region deployment**: Best practices for deploying Bknd Lambda across multiple AWS regions

**Workaround:**
- Use standard AWS Lambda configurations until specific Bknd patterns are documented
- Follow AWS documentation for RDS Proxy, provisioned concurrency, and SnapStart
- Test custom authorization flows in staging environments

**TODO:** This section needs updates after:
- Testing RDS Proxy with Bknd
- Configuring provisioned concurrency
- Implementing custom Lambda authorizers
- Performance testing with SnapStart enabled
