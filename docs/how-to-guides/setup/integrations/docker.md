---
title: Docker Integration
description: Deploy bknd in Docker containers with persistent storage and remote database support
---

# Docker Integration

Deploy bknd in a Docker container for isolated, portable deployments. This guide covers building images, running containers, and configuring persistent storage.

## Overview

The official bknd Docker image provides:
- Multi-stage build for optimized image size
- PM2 process management for production stability
- Persistent storage via volumes
- Support for local and remote databases
- CLI-based configuration (wrapper around `npx bknd run`)

## Quick Start

Build the Docker image:

```bash
docker build -t bknd .
```

Run the container:

```bash
docker run -p 1337:1337 bknd
```

Access the Admin UI at `http://localhost:1337/admin`

## Building the Docker Image

The official Dockerfile uses a multi-stage build with Node.js 24:

```dockerfile
# Stage 1: Build stage
FROM node:24 as builder
WORKDIR /app

ARG VERSION=0.18.0
RUN npm install --omit=dev bknd@${VERSION}

# Stage 2: Final minimal image
FROM node:24-alpine

WORKDIR /app
RUN npm install -g pm2
RUN echo '{"type":"module"}' > package.json

COPY --from=builder /app/node_modules/bknd/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

VOLUME /data
ENV DEFAULT_ARGS="--db-url file:/data/data.db"

EXPOSE 1337
CMD ["pm2-runtime", "dist/cli/index.js run ${ARGS:-${DEFAULT_ARGS}} --no-open"]
```

### Override Version

To use a specific bknd version:

```bash
docker build --build-arg VERSION=<version> -t bknd .
```

## Running the Container

### Basic Usage

Run with default SQLite database in container:

```bash
docker run -p 1337:1337 bknd
```

### Environment Variables

The Docker container accepts these environment variables:

| Variable | Description | Default |
|----------|-------------|----------|
| `ARGS` | CLI arguments to pass to bknd | `${DEFAULT_ARGS}` |
| `DEFAULT_ARGS` | Default database configuration | `--db-url file:/data/data.db` |

### Custom Database Connection

Use custom CLI arguments via the `ARGS` environment variable:

```bash
docker run -p 1337:1337 \
  -e ARGS="--db-url file:/data/data.db" \
  bknd
```

Connect to a remote Turso database:

```bash
docker run -p 1337:1337 \
  -e ARGS="--db-url libsql://<db>.turso.io --db-token <token>" \
  bknd
```

### PostgreSQL Connection

Connect to a PostgreSQL database:

```bash
docker run -p 1337:1337 \
  -e ARGS="--db-url postgres://user:password@host:port/dbname" \
  bknd
```

## Persistent Storage

### Volume Mounting

Mount a host directory for data persistence:

```bash
docker run -p 1337:1337 \
  -v /path/to/data:/data \
  bknd
```

This ensures your database and any uploaded files persist across container restarts.

### Volume Recommendations

Use a named volume for better management:

```bash
docker volume create bknd-data

docker run -p 1337:1337 \
  -v bknd-data:/data \
  bknd
```

## Docker Compose

### Basic Configuration

Create a `compose.yml` file:

```yaml
services:
  bknd:
    pull_policy: build
    build: https://github.com/bknd-io/bknd.git#main:docker
    ports:
      - 1337:1337
    environment:
      ARGS: "--db-url file:/data/data.db"
    volumes:
      - ${DATA_DIR:-.}/data:/data
```

Run with:

```bash
docker compose up -d
```

### Specific Version

Build a specific version with labels:

```yaml
services:
  bknd:
    pull_policy: build
    build:
      context: https://github.com/bknd-io/bknd.git#main:docker
      args:
        VERSION: 0.18.0
      labels:
        - x-bknd-version=0.18.0
    ports:
      - 1337:1337
    environment:
      ARGS: "--db-url file:/data/data.db"
    volumes:
      - ${DATA_DIR:-.}/data:/data
```

### With PostgreSQL

```yaml
services:
  bknd:
    pull_policy: build
    build: https://github.com/bknd-io/bknd.git#main:docker
    ports:
      - 1337:1337
    environment:
      ARGS: "--db-url postgres://bknd:password@postgres:5432/bknd"
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: bknd
      POSTGRES_PASSWORD: password
      POSTGRES_DB: bknd
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

## Advanced Configuration

### CLI Arguments

Pass any CLI argument supported by `npx bknd run`:

```bash
docker run -p 1337:1337 \
  -e ARGS="--db-url file:/data/data.db --port 3000" \
  bknd
```

Common CLI arguments:

| Argument | Description |
|----------|-------------|
| `--db-url` | Database connection URL |
| `--port` | Port to listen on |
| `--no-open` | Don't open browser (default in Docker) |

### Health Checks

Add health checks to your Docker Compose file:

```yaml
services:
  bknd:
    # ... other config
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:1337/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**UNKNOWN: The exact health endpoint path is not documented. You may need to adjust the URL or add a custom health check endpoint.**

### Resource Limits

Limit container resources:

```yaml
services:
  bknd:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Production Considerations

### Environment Variables for Production

Store sensitive configuration in environment variables:

```bash
docker run -p 1337:1337 \
  -e ARGS="--db-url ${DATABASE_URL}" \
  -v /path/to/data:/data \
  bknd
```

### Media Storage Configuration

**UNKNOWN: How to configure media storage adapters (local vs cloud) in Docker CLI mode is not documented.**

For local media storage, ensure the uploads directory is mounted:

```bash
docker run -p 1337:1337 \
  -v /path/to/data:/data \
  -v /path/to/uploads:/app/uploads \
  bknd
```

**TODO:** Document cloud storage configuration (AWS S3, Cloudflare R2) for Docker deployments.

### Mode Configuration

**UNKNOWN: How to set mode (db vs code vs hybrid) in Docker CLI mode is not documented.**

The Docker container uses CLI mode by default. For code or hybrid mode, you may need to:

1. Build a custom Dockerfile that includes your `bknd.config.ts`
2. Use a custom entry point that runs your configured app instead of the CLI

**TODO:** Document custom Dockerfile patterns for code and hybrid modes.

## Troubleshooting

### Database Connection Issues

If the container fails to connect to the database:

1. Check the `ARGS` environment variable
2. Verify database is accessible from the container
3. Ensure volume mounts are correct

```bash
docker logs <container-id>
```

### Permission Issues

If you encounter permission errors with mounted volumes:

```bash
# Create volume with correct ownership
docker run --rm -v bknd-data:/data alpine chown -R node:node /data
```

### Port Conflicts

Change the exposed port if 1337 is already in use:

```bash
docker run -p 3000:1337 bknd
```

## Comparison: Docker vs Other Deployments

| Aspect | Docker | Node.js | Bun | Cloudflare Workers |
|--------|---------|----------|------|------------------|
| **Isolation** | Containerized | Process | Process | Edge function |
| **Portability** | High | Medium | Medium | Low |
| **Setup Complexity** | Medium | Low | Low | High |
| **Startup Time** | Medium | Fast | Fastest | Fast |
| **Resource Usage** | Higher | Medium | Low | Low |
| **Persistent Storage** | Via volumes | Direct | Direct | D1/R2 |
| **Best For** | Production servers | General use | Performance | Global edge |

## Next Steps

- **Database Configuration**: Learn more about database options in the [Choose Your Mode](../choose-your-mode.md) guide
- **Production Deployment**: See the [Deploy to Production](../../getting-started/deploy-to-production.md) tutorial
- **Media Storage**: Configure cloud storage for production (needs documentation)

## Additional Resources

- [Official bknd Docker Docs](https://docs.bknd.io/integration/docker/)
- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
