# Bknd Deployment Learnings

- Bknd supports multiple deployment platforms: Vercel, AWS Lambda, Cloudflare Workers, Docker, and standalone Node.js servers
- PostgreSQL adapters (`pg` and `postgresJs`) are available directly from the `bknd` package as of v0.20.0 (previously in separate `@bknd/postgres` package)
- `pg` adapter uses node-postgres Pool for connection pooling, best for traditional Node.js deployments
- `postgresJs` adapter uses postgres package, best for edge runtimes (Vercel Edge Functions, Cloudflare Workers)
- Turso provides edge-hosted SQLite database, requires two environment variables: `TURSO_URL` and `TURSO_AUTH_TOKEN`
- For AWS Lambda deployment, need to bundle with esbuild and copy Admin UI assets with `npx bknd copy-assets --out=static`
- Lambda handler uses `serve()` from `bknd/adapter/aws` and exports a default export
- Cloudflare Workers uses D1 database bindings configured in `wrangler.json` and `serve()` from `bknd/adapter/cloudflare`
- Docker deployment uses CLI mode with `ARGS` environment variable to pass database URL
- Production media storage requires cloud providers (AWS S3, Cloudflare R2) - local filesystem doesn't work in serverless environments
- Code Mode recommended for production to ensure schema is versioned in code; Database Mode works for development
- Edge runtime can be enabled in Vercel by adding `export const runtime = "edge"` to API route
- Docker Compose examples show how to run Bknd with PostgreSQL in containers with volume persistence
- Skill files use YAML frontmatter with `name` and `description` fields; description should include trigger phrases like "Use when..."
- Skills should include DOs and DON'Ts sections for best practices
- Skills should end with "Related Skills" section linking to other relevant skills
