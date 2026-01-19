# Anthropic Plugin Marketplace Structure

## marketplace.json Format
- Must include `$schema` pointing to `https://anthropic.com/claude-code/marketplace.schema.json`
- Required fields: `name`, `owner`, `plugins` array
- Each plugin needs: `name`, `source`, optional `version`, `author`, `category`
- The `source` field is relative to the repo root (e.g., `"./plugins/bknd-skills"`)

## Plugin Directory Structure
```
.repo-root/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    └── plugin-name/
        ├── .claude-plugin/
        │   └── plugin.json
        └── skills/
            └── {skill-name}/SKILL.md
```

## Plugin.json Format
- Minimal required: `name`, `version`, `description`, `author`
- Author field needs `name` and `email` subfields

## Task 1.0 Completion
- Successfully created marketplace.json with proper schema
- Created plugin.json with author info
- Created 15 empty skill directories for future content

## Task 2.1 Completion (getting-started skill)
- Created first SKILL.md following Encore's format: YAML frontmatter + markdown content
- Skill should be 200-400 lines (getting-started is 407 lines - acceptable)
- Description in frontmatter includes trigger phrases for semantic matching (e.g., "Use when setting up a new Bknd project")
- Must include working, copy-paste ready TypeScript code examples (no pseudo-code)
- Include DOs and DON'Ts section at the end
- Structure: Quick Start → Project Setup → Configuration Modes → CLI Commands → Architecture → Next Steps
- Adapt content from archive docs but rewrite as focused guidance, not tutorial walkthrough

## Task 2.2 Completion (data-schema skill)
- Complex topics like data schema may exceed 200-400 line guideline (data-schema is 470 lines - acceptable)
- Bknd field types: primary, text, number, boolean, date, enum, json, jsonschema, media
- Relationship types: many-to-one, one-to-one, many-to-many, polymorphic
- Index creation supports chaining: `index(users).on(["email"], true).on(["username"], true)`
- Second parameter `true` in index creation creates unique index
- Self-referencing relations need `inversedBy` and `mappedBy` for parent/child relationships
 - Many-to-many with custom fields requires third parameter to schema with additional fields
 - Use plural snake_case for entity names (users, posts) not singular (user, post)

## Task 2.3 Completion (query skill)
 - Query skill is 304 lines, fits 200-400 line guideline
 - Auto-join uses dot notation ('relation.field') and automatically performs JOINs
 - Auto-join issues warnings if related field is not indexed (important for performance)
 - $like operator uses * wildcard, not % (Bknd normalizes % to *)
 - Sort supports string shorthand: '-id' for DESC, 'id' for ASC, or object form { by: 'name', dir: 'desc' }
 - Default limit is 10, always set explicit limits for production queries
 - Use with/{} for eager loading relations, supports deep nesting
 - Explicit join + select is more performant than auto-join for large tables
  - Type safety extends to query filters - TypeScript checks if fields exist on entities

## Task 2.4 Completion (auth skill)
  - Auth skill is 376 lines, fits 200-400 line guideline
  - Three main strategies: password (email/password), OAuth (Google, GitHub, Discord, Facebook), and custom OAuth
  - Email OTP is a separate plugin, requires email driver (Resend, Plunk)
  - JWT configuration supports HS256/HS384/HS512 algorithms, auto-generates secret if not provided
  - Cookie configuration includes sliding session via `renew: true` - refreshes expiration on activity
  - Users created via CLI (`npx bknd user create`), programmatic (`app.auth.createUser`), or OAuth auto-creation
  - Password hashing options: plain (dev only), sha256 (default), bcrypt (rounds 1-10)
  - OAuth stores `strategy_value` as provider's unique user ID (sub claim), not password
  - Hidden fields: `strategy` and `strategy_value` are hidden from API queries for security
  - Cookie `pathSuccess` and `pathLoggedOut` control post-login/logout redirects
  - `allow_register` enables public registration endpoint for password strategy
  - OAuth flow: /{strategy}/login → provider → /{strategy}/callback → session creation

## Task 2.5 Completion (permissions skill)
   - Permissions skill is 435 lines, acceptable for complex topic (data-schema was 470)
   - Guard is automatically enabled when auth.enabled: true - no separate Guard configuration needed
   - Three permission effects: allow (grants access), deny (revokes access, takes precedence), filter (row-level security)
   - Policy variables use @variable syntax: @user.id, @user.role, @user.*, @ctx.*
   - implicit_allow: true is a security risk - always use implicit_allow: false for production roles
   - Guest access configured via is_default: true on a role, assigns to users without explicit role
   - Data permissions: entityRead, entityCreate, entityUpdate, entityDelete (filterable: Read/Update/Delete)
   - Schema permissions: system.schema.read protects /api/system/schema and /api/data/schema endpoints
   - Filter effect enables row-level security by adding WHERE clauses based on user context

 ## Task 3.1 Completion (nextjs skill)
    - Nextjs skill is 388 lines, fits 200-400 line guideline
    - Helper file pattern: src/bknd.ts exports getApp() and getApi({ verify?: boolean }) for easy reuse
    - getApi({ verify: true }) is critical for protected server components - must pass verify flag
    - Admin UI requires import of "bknd/dist/styles.css" for styling
    - ClientProvider from bknd/client wraps app for client-side hooks (useAuth, useEntityQuery)
    - useEntityQuery takes entity name, optional context, and options (limit, sort, filters)
    - PostgreSQL adapters available: pg (node-postgres, connection pooling), postgresJs (edge runtime), custom (Neon/Xata via kysely dialects)
    - Edge runtime optional: export const runtime = "edge" - some features incompatible
    - Catch-all route must be at src/app/api/[[...bknd]]/route.ts for REST API to work

  ## Task 3.2 Completion (vite-react skill)
     - Vite-react skill is 506 lines, exceeds 200-400 guideline but acceptable for integration complexity
     - Dev server integration uses @hono/vite-dev-server plugin with devServer({ entry: "./server.ts" })
     - Server.ts entry point exports serve(config) - different from Next.js catch-all routes
     - HMR enabled by default with dev server plugin
     - Access points: Frontend at port 5174, API at /api/*, Admin UI at root /
     - Client-side integration same pattern as Next.js: ClientProvider, useAuth, Api class
     - PostgreSQL adapters identical to Next.js: pg, postgresJs, custom via createCustomPostgresConnection
     - MCP (Model Context Protocol) available via config or Admin UI settings - experimental in v0.20.0
     - Static file serving configurable via serveStatic option in serve()
     - Deployment: npm run build creates dist/, npm run preview tests production build

  ## Task 3.3 Completion (astro skill)
     - Astro skill is 370 lines, fits 200-400 line guideline
     - Two integration patterns: page-based (simpler, auto static assets) and middleware (advanced routing)
     - Page-based: src/pages/api/[...api].astro and src/pages/admin/[...admin].astro
     - Helper pattern: src/bknd.ts exports getApp() and getApi(args, options) with AstroGlobal parameter
     - getApi(Astro, { verify: true }) critical for protected routes - must pass Astro context
     - Admin UI requires client:only directive and import of "bknd/dist/styles.css"
     - PostgreSQL adapters identical to Next.js: pg and postgresJs from main bknd package
     - Server-side data fetching via getApi(Astro) in frontmatter, client SDK not supported
     - Form handling: check request.method, use Astro.request.formData(), return Astro.redirect()
     - Middleware pattern requires onBuilt handler for static assets and cp -r for public/_bknd
     - SSR required: export const prerender = false; on routes or output: 'server' in astro.config.mjs



