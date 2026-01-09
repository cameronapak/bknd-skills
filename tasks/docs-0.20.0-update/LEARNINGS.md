## Task 1.0: PostgreSQL Package Merge Migration Guide (v0.20.0)

### What I learned:
- **Package merge verification**: Before creating migration guides, verify actual package structure using opensrc to fetch source code and check actual exports
- **Adapter function names**: The main `bknd` package exports `pg` (not `pgPostgres`) and `postgresJs` functions for PostgreSQL connections
- **Two PostgreSQL adapters**: Bknd provides `pg` adapter (uses `pg` driver, aka node-postgres) and `postgresJs` adapter (uses `postgres` driver)
- **pg adapter**: Best for traditional Node.js applications, uses `pg` Pool for connection pooling, exported as `pg` from main bknd package
- **postgresJs adapter**: Best for edge runtimes (Vercel Edge, Cloudflare Workers), lightweight and minimal, exported as `postgresJs` from main bknd package
- **Breaking change scope**: Only import paths changed - configuration objects and connection strings remain compatible
- **Migration guide structure**: Should include overview, breaking changes, step-by-step migration, adapter comparison, code examples, troubleshooting, cross-references, and checklist
- **Navigation updates**: Add Migration Guides as a new top-level group in docs.json before Getting Started for visibility
- **Index.md visibility**: Add prominent notice box in index.md for breaking changes to catch users before they start
- **Adapter selection guidance**: Provide clear decision table for choosing between `pg` and `postgresJs` based on use case (edge vs traditional runtime, existing pg-based apps, performance needs)

## Task 18.0: Schema Permissions (v0.20.0)

### What I learned:
- **Schema permissions protect sensitive operations**: Reading and modifying application schema requires `system.schema.read` permission
- **Module-level context filtering**: The `system.schema.read` permission supports optional `module` context filter to restrict access to specific modules (e.g., `data` only, excluding `auth` or `system`)
- **Protected endpoints**: Schema-related endpoints like `/api/system/schema`, `/api/data/schema`, `/api/system/config` are all protected by this permission
- **Default user roles lack schema access**: Default roles typically do not have `system.schema.read` permission for security reasons
- **Schema Security section placement**: In schema.md, the Schema Security section should be placed before Admin Configuration section (line 841)
- **Documentation already existed**: auth-module.md already had comprehensive Schema Permissions section (lines 349-409), so task was primarily about ensuring schema.md also had the documentation
- **Security best practices**: Schema access should be restricted to admin roles only, as schema operations expose application structure and configuration

## Task 19.0: License Update - Apache 2.0

### What I learned:
- Bknd is licensed under Apache-2.0 license (verified from GitHub repo)
- Apache-2.0 is permissive license allowing commercial use, modification, and distribution
- When updating docs for license changes, update both README.md (description + dedicated section) and docs/index.md (Official Resources section)
- License information should be prominent in documentation repositories to set clear expectations for users
- Always verify license from official sources (GitHub LICENSE.md file, not just assumptions)

## Task 17.0: MCP Navigation (v0.20.0)

### What I learned:
- **MCP (Model Context Protocol)** is an open standard introduced by Anthropic in November 2024 for connecting AI applications to external systems
- **MCP server in Bknd**: Built-in experimental feature that enables AI assistants and IDEs to interact with Bknd instances
- **Enabling MCP**: Can be enabled via config (`config.server.mcp.enabled: true`) or through Admin UI (Settings → Server → Mcp checkbox)
- **MCP access points**:
  - MCP UI: `/mcp` (relative to Admin UI basepath)
  - Admin UI menu: Click user menu (top right) → MCP
  - MCP API endpoint: `/api/system/mcp` (independent of Admin path)
- **Route-aware configuration**:
  - Admin UI path controlled by `config.server.admin.basepath` (default: `/admin`)
  - MCP UI always at `{adminBasepath}/mcp`
  - MCP API endpoint always at `/api/system/mcp`
  - Example: If admin basepath is `/my-admin`, then MCP UI is `/my-admin/mcp`
- **MCP transports**: Bknd supports both Streamable HTTP (`/api/system/mcp`) and STDIO (`npx bknd mcp`) transports
- **Authentication**: MCP uses same authentication as main API (JWT tokens), ensuring permissions work consistently
  - HTTP: Pass `Authorization: Bearer <token>` header to client
  - STDIO: Use `--token <token>` or `BEARER_TOKEN` environment variable
- **External tool integration**: MCP can be used with IDEs and AI assistants like Cursor, VS Code, Claude Desktop through config files
- **Dynamic tool generation**: Bknd MCP server automatically generates tools and resources from schema-defined entities, Hono routes, and manual definitions
- **Built-in MCP client**: Bknd provides `McpClient` from `bknd/utils` for direct usage without external clients
- **Experimental status**: MCP is currently experimental in v0.20.0 and may change in future versions
- **Documentation update locations**:
  - `docs/architecture-and-concepts/how-bknd-works.md`: Added MCP section to Request Lifecycle
  - `docs/reference/schema.md`: Added Admin Configuration section with MCP settings
  - Integration guides: Updated Admin UI sections to mention MCP availability and configuration

## Task 4.0: Auth Module Updates (v0.20.0)

### What I learned:
- **Source code verification is critical**: Use opensrc to fetch package source and verify actual implementation before updating docs
  - Task descriptions may contain outdated information (e.g., "password length is hardcoded" was incorrect for v0.20.0)
  - Search source for actual configuration options (e.g., `minLength` in PasswordStrategy.ts)
  - Verify permission names from SystemPermissions exports
- **New auth config options in v0.20.0**:
  - `default_role_register` - Set default role for newly registered users (must match configured role)
  - `minLength` in password config - Configurable password minimum length (default: 8, minimum: 1)
- **Schema permissions**: Schema operations protected by `system.schema.read` permission with optional module context filter
- **logout endpoint**: Supports `redirect` query parameter to override configured `pathLoggedOut`
- **Documentation update workflow**:
  1. Read existing file to understand structure
  2. Use opensrc to verify implementation details
  3. Update configuration tables with new options
  4. Remove outdated TODO notes
  5. Add examples for new features

## Task 6.0: React SDK Updates (v0.20.0)

### What I learned:
- **`useApi()` hook provides direct access to API modules**: The `api` object includes `data`, `auth`, `media`, and `system` modules
- **Direct API usage vs. hooks**: While `useAuth()` provides `logout()` method, you can also access `api.auth.logout()` directly through `useApi()`
- **Auth API logout behavior**: Calls `/api/auth/logout` endpoint with `Accept: application/json` header to prevent redirect, then triggers `onTokenUpdate` callback to clear token
- **Documentation organization**: When documenting SDK methods, show both hook-level convenience methods (like `useAuth().logout()`) and direct API access (like `api.auth.logout()`)
- **React SDK already had logout documented**: Task 6.0 items 6.2 and 6.3 were already complete - only needed to add direct API usage documentation in `useApi()` section

## Task 5.0: Data Module Updates (v0.20.0)

### What I learned:
- **readOneBy method**: Alternative to findOne that uses findMany with limit: 1 internally
   - Supports more query options (where, select, join, with) compared to findOne
   - Excludes limit, offset, and sort (automatically set to limit: 1, offset: 0)
   - Returns same result structure as findOne
   - Use case: When you need field selection or joins in single-record queries
- **Auto-join behavior**: Automatic joins triggered when filtering by related entity fields
   - Uses dot notation in where clause (e.g., `{"author.username": "john"}`)
   - Bknd automatically adds necessary joins behind the scenes
   - Checks if related field exists in relationship before adding join
   - Index warnings triggered for non-indexed related fields
   - Performance considerations: Auto-joins are convenient but may load unnecessary data; manual joins with explicit field selection can be more efficient
- **uploadToEntity overwrite parameter**: Media API method for uploading files to entity fields
   - `overwrite` parameter (boolean) controls behavior when file already exists
   - Default (overwrite not set): Error if file exists
   - `overwrite: true`: Replaces existing file with new one
   - Use case: Allow replacing profile pictures, cover images, etc. in update operations
- **Documentation structure**: When adding new methods, place them logically near related methods
   - readOneBy placed after findOne (both are single-record read methods)
   - Auto-join section added after Eager Loading Relations (both relate to joins)
   - Media Uploads added to Mutator API (Media API accessed through app.media)

## Task 16.0: Auto-Join Documentation (v0.20.0)

### What I learned:
- **Auto-join implementation details**:
  - Triggered when using dot notation in where clause (e.g., `{"posts.title": "value"}`)
  - Automatically validates that related entity exists and has a defined relationship
  - Checks if field exists on related entity before adding join
  - Adds join to validated options when filter conditions are processed (line 146 in Repository.ts)
  - Throws InvalidSearchParamsException if relation doesn't exist or field is invalid
- **Performance implications of auto-join**:
  - Auto-join loads all columns from related table by default
  - Can use explicit `join` parameter with `select` to load only needed columns
  - Index warnings are issued for non-indexed related fields (checkIndex method)
  - Best practice: Add `.index()` to fields used in auto-join filters
  - Consider using `with` parameter for eager loading vs filtering
- **Auto-join in media relationships**:
  - Works with polymorphic relations (polyToOne, polyToMany)
  - Can filter by media fields like mime_type, width, height
  - Useful for finding entities with specific media types
  - Same performance considerations apply - use explicit joins with select for optimization
- **Documentation organization**:
  - Auto-join section placed in Filtering section of query-system.md (logical location)
  - Performance considerations added as dedicated section with examples
  - Media-specific auto-join examples added to entity-media-relationships.md
  - Cross-referenced best practices between general query docs and media-specific docs

## Task 14.0 & 15.0: Hybrid Mode Improvements (v0.20.0)

### What I learned:
- **Reader returns objects improvement (v0.20.0)**:
  - The `reader` function in hybrid mode now accepts objects directly, not just strings
  - Previously required `JSON.parse()` on string return values
  - Now can return objects directly from async functions, enabling direct JSON imports
  - Simplifies config loading: `reader: async () => (await import("./config.json")).default`
  - Backwards compatible with string returns (still works with `reader` from adapters)
- **sync_required flag behavior**:
  - Flag is set by `ModuleHelper.ts` when schema changes are detected (lines 29, 40, 44, 62, 70)
  - Triggers automatic schema sync in hybrid mode during development (not in production)
  - Checked in `hybrid.ts` line 78: `if (ctx.flags.sync_required && !isProd && syncSchemaOptions.force)`
  - Allows seamless schema updates during development without manual sync commands
  - Reset to false after sync completes (ModuleHelper.ts lines 40, 44)
- **Better config handling**:
  - Production validation is skipped for performance improvement (hybrid.ts line 74: `skipValidation: isProd`)
  - Configuration is loaded from file using `reader` function (hybrid.ts line 50-51)
  - If no config file found, default config is created automatically (hybrid.ts line 54)
  - `writer` function is required for type/config syncing to work
  - Secrets are merged into configuration from `secrets` option
- **Documentation approach**:
  - Added "New in v0.20.0" section at top of Hybrid Mode section for visibility
  - Provided separate code example showing v0.20.0 improvements with detailed comments
  - Updated existing "Hybrid mode helper" section with v0.20.0 annotations
  - Added reference to hybrid mode in build-your-first-api.md production note
  - Marked items as completed in tasks-bknd-v0.20.0-docs-update.md
- **Key implementation details**:
  - `isProduction` flag determines mode: `db` in dev, `code` in production (hybrid.ts line 70)
  - `syncSchemaOptions.force` controls whether sync happens when `sync_required` is true
  - Config file path defaults to "bknd-config.json" but can be customized via `configFilePath`
   - Types file path defaults to "bknd-types.d.ts" but can be customized via `typesFilePath`

## Task 20.0: Configuration Reference (v0.20.0)

### What I learned:
- **Configuration file structure**: Bknd uses a top-level export with `app(env)` function that receives environment variables and returns connection, config, secrets, isProduction, and adminOptions
- **Connection options**:
  - SQLite is default with `url: "file:data.db"` or `env.DB_URL ?? "file:data.db"`
  - PostgreSQL supports both `pgPostgres` and `postgresJs` adapters from main `bknd` package (v0.20.0 change)
  - Custom PostgreSQL dialects via `createCustomPostgresConnection` for Neon, Xata, etc.
- **Auth configuration is comprehensive**:
  - JWT: secret, alg, expires, issuer, fields for token payload
  - Cookie: domain, path, sameSite, secure, httpOnly, expires, partitioned, renew, pathSuccess, pathLoggedOut
  - Password strategy: hashing (plain, sha256, bcrypt) and minLength (default: 8, min: 1)
  - Roles and permissions with default role assignment
  - default_role_register (v0.20.0) for setting default role on registration
- **Media configuration**: Enable module and configure adapter (Local, S3, etc.)
- **Server configuration**:
  - Admin: basepath for UI route
  - MCP: enable flag (v0.20.0)
- **Mode helpers**:
  - `code()` for serverless deployments with schema in code
  - `hybrid()` for development with file-based config and production with code mode
- **Hybrid mode specific options**:
  - `reader` function now returns objects directly (v0.20.0 improvement), not just strings
  - `writer` function required for type/config syncing
  - `typesFilePath` and `configFilePath` customizable
  - `syncSecrets` for extracting secrets to .env.example files
- **Seed function**: Executed only if database is empty, receives `ctx.em` and `ctx.app.module.auth` for database and user operations
- **Environment variables**: DB_URL, POSTGRES_URL, JWT_SECRET, ENVIRONMENT, and provider-specific vars (NEON, XATA_URL, etc.)
- **Documentation organization for configuration reference**:
  - Start with overview and top-level options
  - Break down by section (connection, config sections, options)
   - Include migration notes for breaking changes
   - Provide complete examples for common scenarios
   - Cross-reference related documentation files
   - **Research approach**: Use opensrc examples to understand actual configuration patterns and imports, then verify with existing docs

## Task 12.0: Browser/SQLocal Integration Guide (v0.20.0)

### What I learned:
- **Browser mode runs entirely in browser**: Uses SQLocal (SQLite WASM) for database and OPFS (Origin Private File System) for media storage
- **SQLocal integration**: Requires `sqlocal/vite` plugin in vite.config.ts for WASM loading; `sqlocal` dependency must be excluded from optimizeDeps
- **BkndBrowserApp component**: Main entry point for browser mode, wraps app with React context and router (Wouter-based)
- **Configuration options**:
  - `connection`: Database path (default: `:localStorage:`), accepts `:memory:` for non-persistent DB
  - `adminConfig.basepath`: Admin UI route path (default: `/admin`)
  - `options.seed`: Function to seed data (only runs if database is empty)
  - `config.auth`: Not supported in browser mode (auth plugins not available)
- **Database export/import**: Use `SQLocalConnection.client.getDatabaseFile()` to export, `loadDatabaseFile(file)` to import
- **Media storage**: `OpfsStorageAdapter` automatically registered for OPFS file storage; can configure custom root directory via `config.media.adapter.config.root`
- **useApp hook**: Provides access to `app.em` for data operations and `app.emgr` for entity manager
- **useEntityQuery hook**: React SDK hook for simplified data fetching with built-in CRUD methods (create, update, delete)
- **Limitations**:
  - No authentication (no auth plugins, JWT, or user management)
  - No API routes (no HTTP server, no MCP integration)
  - Performance limited by browser WASM and OPFS
  - Data can be cleared by browser (localStorage clearing, incognito mode)
  - Storage quotas vary by browser (~60% of disk on Chrome, ~1GB on Safari)
- **Vite plugin configuration**: SQLocal plugin must come before React plugin in plugins array for proper WASM handling
- **Navigation**: Browser mode uses Wouter for client-side routing; Admin UI integrated at configured basepath
- **Type safety**: Works same as other modes - register schema with `declare module "bknd"` for global types
- **Use cases**: Offline-first apps (PWAs), local development without backend, client-side demos, privacy-focused apps, embedded tools
- **Deployment**: Can deploy as static site (Vercel, Netlify, GitHub Pages); convert to PWA for offline capability
- **Best practices**: Seed sample data in development, implement database export for backups, use pagination for performance, add indexes to frequently queried fields
- **Documentation placement**: Should be added to docs.json integration guides, linked from index.md, mentioned in choose-your-mode and framework-comparison

 ## Task 21.0: Navigation - Add Configuration Reference (v0.20.0)

 ### What I learned:
 - **Configuration reference positioning**: Should be placed first in Reference group (before auth-module) because it's the foundational document users need when setting up any bknd project
 - **Cross-linking strategy**: When adding a new central reference document, add links from:
   - All getting-started guides (build-your-first-api, add-authentication, deploy-to-production)
   - Decision/setup guides (choose-your-mode)
   - Framework integration guides (nextjs, vite-react, etc.)
 - **Navigation structure updates**: docs.json uses nested groups with simple page references (no file extensions)
 - **Path consistency**: When adding cross-links from different directory levels, use relative paths correctly:
   - Same directory: `./page-name.md`
   - Up one level: `../page-name.md`
   - Up two levels: `../../page-name.md`
   - Root reference docs: `../../../reference/configuration.md`
 - **Cross-linking completeness**: Don't need to link from every single file - focus on:
   - High-traffic pages (getting-started)
   - Decision/setup pages (choose-your-mode)
   - Framework integration guides (nextjs, vite-react)
   - Skip: specific feature guides (data seeding, entity relationships, etc.) unless configuration is directly relevant

## Task 13.0: Navigation - Add Browser Guide (v0.20.0)

### What I learned:
- **Verification is key before starting**: Before completing Task 13.0, I verified what was already done by reading all relevant files (docs.json, choose-your-mode.md, framework-comparison.md, index.md). Most subtasks were already complete.
- **Decision tree hierarchy matters**: When adding a new deployment mode to the decision tree, it should be placed at the appropriate decision point. Browser mode was added as the first branch after "Building a full-stack app?" because it's a distinct use case (offline/local-only) that should be considered before edge deployment.
- **Decision tree flow logic**: The deployment decision tree follows a hierarchical decision structure:
  1. First decision: Full-stack app? (Framework Embedded vs others)
  2. Second decision (if not full-stack): Offline/local-only? (Browser Mode vs server-based)
  3. Third decision (if server-based): Global edge deployment? (Serverless/Edge vs CLI Standalone)
- **Task verification approach**: When completing a navigation task, check these files:
  - docs.json: Navigation structure
  - choose-your-mode.md: Mode and deployment sections + decision tree
  - framework-comparison.md: Comparison table
  - index.md: Main page links
- **Incremental progress tracking**: The tasks file tracks all subtasks individually. When completing a task, mark all subtasks as complete with [x] even if they were already done in previous work.

## Task 7.0: SvelteKit Integration Guide (v0.20.0)

### What I learned:
- **SvelteKit adapter provides two main functions**: `getApp()` for load functions and `serve()` for hooks.server.ts
- **Runtime-agnostic environment variable access**: SvelteKit adapter uses `$env/dynamic/private` to access environment variables, making it compatible with Node.js, Bun, and Edge runtimes
- **Hooks integration pattern**: The `serve()` function returns a handler that takes a SvelteKit event object and calls `bkndHandler(event)` to handle API requests
- **API route handling**: API requests are filtered by pathname prefix (`/api/` or `/admin`) in hooks.server.ts before being passed to Bknd handler
- **Server-side data fetching**: Use `getApp()` in SvelteKit load functions to get the Bknd app instance, then call `app.getApi()` to get the API client
- **Authentication in load functions**: Pass request headers to `app.getApi({ headers: request.headers })` and call `await api.verifyAuth()` to authenticate requests
- **Form actions pattern**: SvelteKit uses form actions for mutations (create, update, delete) - define actions in `+page.server.ts` and use `use:enhance` directive in Svelte components
- **Admin UI static serving**: Requires a postinstall script (`bknd copy-assets --out static`) to copy Admin UI assets to the static folder
- **SvelteKit-specific type**: `SvelteKitBkndConfig<Env>` extends `RuntimeBkndConfig<Env>` and only picks `adminOptions` property
- **Svelte 5 syntax**: Example uses `$props()` runes for component props instead of `export let` declarations
- **Type-safe routing**: SvelteKit provides auto-generated types (`./$types`) for load functions and actions
- **Edge deployment support**: Can use `postgresJs` adapter and configure SvelteKit adapter for edge runtime via `adapter({ edge: true })`

## Task 8.0: Navigation - Add SvelteKit Guide (v0.20.0)

### What I learned:
- **Navigation update coordination**: When adding a new integration guide, must update three places: docs.json navigation, framework comparison table, and index.md links
- **docs.json structure**: Integration guides are nested under `How-to Guides` > `Setup` > `Integrations` group in the navigation hierarchy
- **Framework comparison table placement**: SvelteKit should be added in the decision matrix between React Router and Astro (alphabetical order makes sense, but framework type grouping is more important)
- **Framework comparison content**: Each framework section should include Integration Pattern, Best Use Cases, Strengths, Considerations, Key Integration Features (code examples), Deployment options
- **SvelteKit key features for comparison**: SSR via load functions, runtime-agnostic env access, form actions, SEO-friendly with SSR, small bundle size
- **Index.md link placement**: Integration guides link should be in "Integration Guides" section with other framework links
- **Cross-reference consistency**: New integration guide should cross-reference framework comparison and other integration guides
- **Task completion marking**: Related tasks (7.0 content creation and 8.0 navigation updates) can be completed in sequence and marked together

## Task 2.0: Week 1 Critical Path: Update Existing Files for Postgres Package Merge (Priority: HIGH)

### What I learned:
- **Source code verification is critical**: Before updating documentation, verify actual implementation from source code. The bknd source shows that the export is `pg` (not `pgPostgres`), while release notes mentioned `pgPostgres`. Always verify with opensrc and check actual exports in `app/src/index.ts`.
- **Adapter names in v0.20.0**: The correct export names from `bknd` package are `pg` (for node-postgres driver) and `postgresJs` (for postgres-js driver). Both adapters are now available from main `bknd` package without needing separate `@bknd/postgres` package.
- **Documentation update workflow**: When updating multiple files for a breaking change:
  1. First, verify the correct API from official release notes and source code
  2. Update architecture/concept docs with the adapter reference
  3. Add detailed "PostgreSQL Adapter Options" sections to integration guides showing both adapters with use cases
  4. Update deployment guides with PostgreSQL adapter guidance
  5. Update configuration reference with correct import paths and adapter names
  6. Cross-reference to the migration guide for detailed migration steps
 - **Migration guide already existed**: The migration guide (postgres-package-merge.md) was already complete from Task 1.0, which made this task much easier since I could reference it for migration steps and cross-link it from updated docs.
- **Consistent note format**: Add a clear note box at the end of updated sections indicating "As of v0.20.0, PostgreSQL adapters (`pg`, `postgresJs`) are available directly from `bknd` package" with cross-link to the migration guide.
- **Adapter choice guidance**: When documenting PostgreSQL adapters, always provide guidance on when to use each:
  
## Task 22.0: Release Notes (v0.20.0)

### What I learned:
- **Release notes structure**: A comprehensive release note should include: overview, what's new (major features), other improvements (minor features), migration guide (breaking changes), detailed changelog (PR list), contributors, and upgrading instructions
- **Cross-referencing**: Release notes should link to migration guides, configuration reference, and feature documentation to help users find detailed information
- **Breaking change visibility**: Use clear sections for breaking changes with migration steps and links to dedicated migration guides
- **Feature documentation**: For each major feature, provide code examples and links to detailed documentation (integration guides, reference docs)
- **Changelog format**: Include PR numbers and contributor links for transparency and to give credit to contributors
- **New contributors section**: Highlight first-time contributors separately to acknowledge their contributions
- **Navigation updates**: Add release notes to docs.json under Getting Started group (after index, before other pages) for visibility
- **Index.md updates**: Add a prominent notice box in index.md linking to release notes to catch users before they start (similar to migration guide notice)
- **Version-specific releases**: Create a `/docs/releases/` directory for version-specific release notes to maintain history
- **Research approach**: Use GitHub release page as primary source for accurate release information, including full changelog, contributors, and PR links
  - `pg()` adapter: Best for traditional Node.js applications with connection pooling (uses Pool from pg package)
  - `postgresJs()` adapter: Best for edge runtimes (Vercel Edge Functions, Cloudflare Workers) - lightweight and minimal
  - Custom connections: For managed providers like Neon, Xata that provide their own dialects