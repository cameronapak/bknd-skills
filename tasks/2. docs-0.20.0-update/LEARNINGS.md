## Task 25.0: Final Review and Validation (v0.20.0)

### What I learned:
- **Final review completes when all subtasks are done**: When a parent task has all subtasks marked [x] but the parent itself is [ ], completing the parent checkbox is the final step
- **Comprehensive review checklist**: Task 25.0's subtasks (25.1-25.8) provide a complete review framework covering breaking changes, new features, integration guides, existing docs, cross-references, navigation, and file validation
- **Documentation completion verification**: A documentation update project is complete when:
  1. All new files exist and are properly structured
  2. All updated files contain the required changes
  3. Navigation hierarchy matches the PRD specification
  4. Cross-references link relevant content bidirectionally
  5. Quality checks pass (links work, code is valid, terminology consistent)
  6. Task file is updated to reflect completion
- **Task file as living document**: The tasks-bknd-v0.20.0-docs-update.md file serves as both a project tracker and historical record, with learnings.md providing context for future work
- **Sequential task completion**: Large documentation projects can be broken down into 25+ distinct tasks, each with multiple subtasks, allowing parallel work and progress tracking

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
- **Verification is key before starting**: Before completing Task 13.0, I verified what was already done by reading all relevant files (docs.json, choose-your-mode.md, framework-comparison.md, index). Most subtasks were already complete.
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
  - **Migration guide already existed**: The migration guide (postgres-package-merge) was already complete from Task 1.0, which made this task much easier since I could reference it for migration steps and cross-link it from updated docs.
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
## Task 24.0: Quality Assurance (v0.20.0)

### What I learned:
- **Broken internal links in getting-started directory**: Files within `getting-started/` directory were using `./getting-started/` prefix which created broken links. These should use relative `./` since files are already in the same directory.

## Task 3.0: Navigation Restructure (v0.20.0)

### What I learned:
- **Task verification approach**: When checking if a task is complete, verify all subtasks by checking actual file state:
   - For docs.json changes: Read docs.json and verify the group/page exists
   - For new files: Test with `test -f` to confirm file exists
   - For cross-references: Use `grep` to verify links exist in files

## Task 23.0: Cross-References (v0.20.0)

### What I learned:
- **Cross-reference verification workflow**: When checking cross-references, use `grep` to find exact patterns in files:
   - Check for relative links in files (`./file.md`, `../directory/file.md`)
   - Verify link paths are correct based on file location in directory structure
   - Links from framework-comparison.md (in integrations/) to browser-sqlocal.md need `../` not `./`
   - **Cross-reference completeness depends on file existence**: Tasks 23.5 and 23.6 require email-otp.md and plunk-email.md to exist (Tasks 9.0 and 10.0), so cannot be completed until those tasks are done
  - **Partial task completion**: Can mark subtasks as [x] while leaving dependent subtasks as [ ] with notes about blockers
  - **Framework comparison links**: The Related Documentation section should use correct relative paths based on file location - framework-comparison.md is in `how-to-guides/setup/integrations/`, so links to guides in `how-to-guides/` need `../../` or direct path like `../browser-sqlocal.md`
  - **Cross-reference types**:
    - New files linking to existing docs (migration guide → integration guides)
    - Existing docs linking to new files (index.md → migration guides)
    - Same-level files linking to each other (framework-comparison → browser-sqlocal)
    - Reference docs linking to guides (auth-module → email-otp)
  - **Navigation structure**: docs.json uses nested groups with simple page references (no file extensions)
  - **Migration Guides placement**: Should be at top of navigation before Getting Started for visibility
  - **Status tracking**: Tasks can be marked complete even if work was done previously - verify state, then mark as [x]
  - **Task 3.0 was already complete**: The migration-guides directory, postgres-package-merge.md file, docs.json navigation, and index.md link were all already in place from previous work
  - **Link verification approach**: Use `grep` patterns to find all broken links at once: `grep -rn 'getting-started/' docs --include="*.md"`
  - **Fix strategy for internal directory links**: When files in a directory link to other files in the same directory, use relative paths like `./file.md` not `./directory/file.md`.
  - **Sed one-liner for bulk fixing**: `find directory -name "*.md" -exec sed -i '' 's/pattern/replacement/g' {} \;` works well for macOS
  - **External links verification**: Links from files outside `getting-started/` directory correctly use `../getting-started/` prefix - no changes needed.
  - **Git lock files**: Git `.git/index.lock` file can prevent commits. Delete with `rm -f .git/index.lock` if commit fails with lock error.
  - **Quality checklist execution**: Systematically check code blocks, links, terminology, and TODO markers.
  - **TODO/FIXME markers**: Found 29 TODO/FIXME/UNKNOWN markers across docs - these are intentional (areas needing future research), not bugs.
  - **@bknd/postgres references**: All references to `@bknd/postgres` are intentional (migration guide and release notes explaining breaking change).
  - **Code block verification**: 449 TypeScript code blocks found, no unclosed blocks detected.
  - **Markdown file count**: 41 markdown files in docs directory.
  - **Consistent naming**: Directory is named `getting-started` (with 'ed') - this is correct and matches docs.json navigation.

## Task 25.6: Review Navigation Hierarchy (v0.20.0)

### What I learned:
- **Navigation verification approach**: To verify navigation hierarchy is complete, read docs.json and compare against PRD requirements section by section
- **docs.json structure validation**: Check all groups, subgroups, and pages match the PRD specification
- **Page reference format**: docs.json uses page references without file extensions (e.g., "reference/configuration", not "reference/configuration.md")
- **Nested groups support**: docs.json supports deeply nested groups (e.g., How-to Guides > Setup > Integrations)
- **Page ordering matters**: Within groups, pages appear in the order they're listed in docs.json
- **New groups in v0.20.0**: Migration Guides (top-level), Integrations subgroup under How-to Guides
- **New pages in v0.20.0**: postgres-package-merge, sveltekit, browser-sqlocal, email-otp, plunk-email, configuration, v0.20.0-release-notes
  - **Reference docs ordering**: configuration.md should be first in Reference group (before auth-module)
  - **Getting Started ordering**: v0.20.0-release-notes should be in Getting Started group after index for visibility
  - **Verification checklist**: When reviewing navigation hierarchy, verify:
  1. All new groups from PRD are present
  2. All new pages are in correct groups
  3. Page ordering follows PRD specification
  4. Nested groups have correct hierarchy depth
  5. No duplicate page references
  6. All paths match actual file locations
  7. File extensions are omitted from page references

## Task 25.7: Final Review of All New Files (v0.20.0)

### What I learned:
- **New files verification approach**: Use `ls -la` to confirm all new files exist in expected locations with correct permissions
- **File size validation**: Use `wc -l` to check line counts - comprehensive guides should be 600+ lines, release notes ~270 lines, migration guide ~380 lines
- **Section structure validation**: Use `grep -E "^## "` to extract section headers and verify comprehensive structure
- **Section count indicators**: Well-structured guides have 12-15 major sections; configuration reference ~10 sections; release notes ~8 sections
- **Content completeness signs**: Files with proper section headers (Overview, Configuration, Integration, Best Practices, Troubleshooting, Related Documentation) indicate comprehensive coverage
- **File existence checklist for v0.20.0 new files**:
  1. docs/migration-guides/postgres-package-merge.md
  2. docs/how-to-guides/setup/integrations/sveltekit.md
  3. docs/how-to-guides/setup/integrations/browser-sqlocal.md
  4. docs/how-to-guides/auth/email-otp.md
  5. docs/how-to-guides/integrations/plunk-email.md
  6. docs/reference/configuration.md
  7. docs/releases/v0.20.0-release-notes.md
- **Directory creation verification**: New directories (migration-guides/, releases/, how-to-guides/integrations/) should exist and contain expected files
- **Comprehensive guide indicators**: Look for sections like Overview, Prerequisites, Installation, Configuration, Best Practices, Troubleshooting, Examples, Related Documentation
- **Reference doc indicators**: Look for sections like Overview, Configuration sections, Options, Examples, Migration Notes
- **Release note indicators**: Look for sections like Overview, What's New, Migration Guide, Changelog, Contributors, Upgrading
- **Line count baselines**: Integration guides typically 600-900 lines; reference docs ~750 lines; migration guides ~380 lines; release notes ~270 lines
- **Section header patterns**: Use consistent H2 (##) for major sections, H3 (###) for subsections

## Task 25.8: Final Review of All Updated Files (v0.20.0)

### What I learned:
- **Updated files verification approach**: Check file existence and content using bash loops with conditional checks
- **File existence pattern**: Use `if [ -f "$file" ]; then ... fi` to safely check file existence in loops
- **Line count baselines for updated files**: Updated files vary from 22 lines (README) to 1128 lines (schema) depending on scope
- **Content verification via grep**: Search for v0.20.0-specific keywords to verify updates are present across all files
- **Keyword patterns for v0.20.0**: `v0\.20\.0`, `minLength`, `default_role_register`, `readOneBy`, `auto-join`, `overwrite`, `schema\.read`, `MCP`, `Email OTP`, `Plunk`
- **Expected update count**: All 12 updated files should contain at least one v0.20.0-specific keyword
- **File content sampling**: Use `head -5 | tail -3` to preview file content and verify it's not corrupted or empty
- **Updated files list for v0.20.0**:
  1. docs/architecture-and-concepts/how-bknd-works.md (618 lines)
  2. docs/getting-started/deploy-to-production.md (344 lines)
  3. docs/reference/auth-module.md (991 lines)
  4. docs/reference/data-module.md (721 lines)
  5. docs/reference/react-sdk-reference.md (742 lines)
  6. docs/how-to-guides/setup/choose-your-mode.md (439 lines)
  7. docs/getting-started/build-your-first-api.md (231 lines)
  8. docs/reference/query-system.md (339 lines)
  9. docs/reference/schema.md (1128 lines)
  10. docs/how-to-guides/setup/integrations/framework-comparison.md (655 lines)
  11. docs/getting-started/add-authentication.md (427 lines)
  12. docs/index.md (174 lines)
  13. README.md (22 lines)
- **Grep counting optimization**: Pipe grep results to `wc -l` to count how many files contain matching patterns
- **Error suppression**: Use `2>/dev/null` to suppress grep errors when some files don't match patterns
- **Bulk file processing**: Use bash for loops with pattern matching to process multiple files efficiently

 ## Task 25.4: Review All Existing Docs Are Updated for v0.20.0 (v0.20.0)

 ### What I learned:
 - **Systematic review approach**: When verifying all existing docs are updated for a version release, use grep to search for version-specific patterns across all markdown files
 - **Verification checklist categories**: Break down review into categories: breaking changes, new features, configuration updates, and integration changes
 - **Grep patterns for verification**: Use patterns like `v0\.20\.0`, `@bknd/postgres`, `minLength`, `default_role_register`, `readOneBy`, `auto-join`, `overwrite parameter`, `schema\.read`, `MCP` to find relevant updates
 - **Reference docs verification**: Check that reference docs (auth-module, data-module, react-sdk-reference, query-system, schema) have all new methods and parameters documented with examples
 - **Integration guides verification**: Ensure all integration guides have breaking change notes (PostgreSQL package merge) and new adapter examples
 - **Getting started verification**: Check that tutorials have notes about new features that affect onboarding (hybrid mode, sync_required)
 - **Framework comparison verification**: Verify new integrations (SvelteKit, Browser mode) are included in comparison matrix with use cases and strengths
 - **Cross-reference verification**: Confirm that add-authentication.md has alternatives section linking to Email OTP guide
 - **Documentation completeness signs**: When all grep searches show appropriate coverage across files, it indicates thorough update of existing docs
 - **Version-specific updates look like**: Notes with "New in v0.20.0:", migration notes from `@bknd/postgres` to `bknd`, new parameter documentation (minLength, overwrite), and new feature mentions (Email OTP, Plunk, MCP)
 - **Documentation quality indicators**: Code examples for new features, clear migration notes, and comprehensive best practices sections indicate good documentation updates

 ## Task 0.0: Research - Answer Open Questions (v0.20.0)

 ### What I learned:
 - **Email OTP Plugin API** (from `app/src/plugins/auth/email-otp.plugin.ts`):
    - Plugin function: `emailOTP({ generateCode, apiBasePath, ttl, entity, entityConfig, generateEmail, showActualErrors, allowExternalMutations, sendEmail })`
    - Default TTL: 600 seconds (10 minutes), configurable via `ttl` parameter
    - Default entity name: "users_otp", customizable via `entity` parameter
    - Base path default: "/api/auth/otp", customizable via `apiBasePath`
    - Email sending enabled by default, can be disabled with `sendEmail: false`
    - Two OTP actions: "login" and "register" (enum values)
    - OTP fields: action, code (text, required), email (text, required), created_at (datetime), expires_at (datetime, required), used_at (datetime)
    - Rate limiting: Auto-invalidation of previous codes when generating new code via `invalidateAllUserCodes()`
    - Code generation: Default is random 6-digit numeric (100000-999999), customizable via `generateCode` function
    - Email customization: `generateEmail` callback receives otp object with all fields, returns `{ subject, body }` where body can be string or `{ text, html }`
    - Error messages: Generic "Invalid credentials" by default, enable actual errors with `showActualErrors: true`
    - Security: Mutations to OTP entity blocked by default (event listeners on InsertBefore/UpdateBefore), enable with `allowExternalMutations: true`
    - Validation: Checks code exists, not expired, not already used before allowing login/register
    - Auto-mark used: Code marked with `used_at: new Date()` upon successful verification

  - **Plunk Email Driver** (from `app/src/core/drivers/email/plunk.ts`):
     - Driver function: `plunkEmail({ apiKey, host, from })`
     - Configuration options: apiKey (required), host (default: "https://api.useplunk.com/v1/send"), from (default from address)
     - Send options: subscribed (boolean), name, from (override), reply, headers (Record<string, string>)
     - Body format: Accepts string (plain text) or object `{ text, html }` - HTML used if object provided
     - API endpoint: POST to configured host with Authorization header `Bearer ${apiKey}`
     - Response structure: `{ success: boolean, emails: Array<{contact: {id, email}, email}>, timestamp: string }`
     - Error handling: Throws error if API response not ok with API error message
     - Comparison with Resend: Both have similar API pattern, Plunk response includes contact ID tracking

  - **SvelteKit Adapter API** (from `app/src/adapter/sveltekit/sveltekit.adapter.ts`):
     - Import path: `bknd/adapter/sveltekit`
     - Two main functions: `getApp()` for load functions and `serve()` for hooks.server.ts
     - Runtime-agnostic env access: Uses `$env/dynamic/private` to access env vars, compatible with Node.js, Bun, and Edge runtimes
     - Hooks integration: `serve()` returns handler that takes SvelteKit event object and calls bknd handler with request
     - API route handling: Filter requests by pathname prefix (`/api/` or `/admin`) in hooks.server.ts
     - Server-side data fetching: Use `getApp()` in load functions, then `app.getApi()` to get API client
     - Authentication: Pass request headers to `app.getApi({ headers: request.headers })` and call `await api.verifyAuth()`
     - Admin UI static serving: Requires postinstall script `bknd copy-assets --out static` to copy assets
     - SvelteKit-specific type: `SvelteKitBkndConfig<Env>` extends `RuntimeBkndConfig<Env>` and only picks `adminOptions` property
     - Svelte 5 syntax: Example uses `$props()` runes for component props instead of `export let` declarations
     - Type-safe routing: SvelteKit provides auto-generated types (`./$types`) for load functions and actions
     - Edge deployment: Can use `postgresJs` adapter and configure SvelteKit adapter for edge runtime via `adapter({ edge: true })`

  ## Task 9.0: Email OTP Authentication Guide (v0.20.0)

 ### What I learned:
 - **Email OTP Plugin API**: The `emailOTP()` plugin function from `bknd/plugins` provides complete passwordless authentication with login and registration flows
 - **OTP configuration options**:
   - `generateCode`: Custom code generator function (default: 6-digit random numeric 100000-999999)
   - `apiBasePath`: Custom API base path (default: "/api/auth/otp")
   - `ttl`: Code expiration time in seconds (default: 600 / 10 minutes)
   - `entity`: Custom entity name for OTP storage (default: "users_otp")
   - `entityConfig`: Additional entity configuration options
   - `generateEmail`: Custom email template generator function
   - `showActualErrors`: Enable detailed error messages for debugging (default: false)
   - `allowExternalMutations`: Allow direct OTP entity mutations (default: false, security protection)
   - `sendEmail`: Enable/disable email sending (default: true, useful for testing)
 - **OTP entity fields**: action (enum: "login" | "register"), code (text, required), email (text, required), created_at (datetime), expires_at (datetime, required), used_at (datetime)
 - **Automatic code invalidation**: `invalidateAllUserCodes()` function invalidates all previous unused codes for same email when new code is generated - prevents code hoarding attacks
 - **OTP validation requirements**: Code must match email, action type, not be expired (`expires_at > now`), and not be already used (`used_at` is null)
 - **Two authentication flows**: Login flow (existing user) and registration flow (creates new user with random password on successful verification)
 - **Event listener protection**: By default, `InsertBefore` and `UpdateBefore` event listeners on OTP entity block direct mutations from API/Admin UI for security
 - **Error handling**: Default generic "Invalid credentials" message prevents email enumeration; `showActualErrors: true` reveals specific errors ("Invalid code", "Code expired", "Code already used")
 - **Documentation structure**: Email OTP guide follows comprehensive structure with Overview, Configuration, Provider Setup, User Flow, API Endpoints, SDK Integration, Security, Customization, Troubleshooting, and Best Practices sections
 - **Best practices sections**: Include Security (code strength, TTL, rate limiting), User Experience (clear instructions, auto-focus, resend button), Email Deliverability (SPF/DKIM/DMARC, avoid spam triggers), Configuration (env vars, separate environments), Performance (indexing, async sending, caching), Monitoring and Logging (metrics, alerts, audit trails), and Testing (unit, integration, E2E, load testing)
 - **Cross-reference strategy**: Email OTP guide links to Auth Module Reference (configuration), Create First User (user management), Plunk Email Provider Guide (email setup), Configuration Reference (complete options), and Release Notes (v0.20.0 feature announcement)
 - **Navigation update**: Email OTP guide added to Authentication group in docs.json between Create First User and Public Access Guard

  ## Task 10.0: Plunk Email Driver Guide (v0.20.0)

  ### What I learned:
  - **Plunk email driver API**: The `plunkEmail()` function from `bknd` provides email sending with simple API
  - **Plunk configuration options**: `apiKey` (required), `host` (default: `https://api.useplunk.com/v1/send`), `from` (optional default sender)
  - **Plunk send options**: `subscribed` (boolean - add to contacts), `name` (contact name), `from` (override default), `reply` (reply-to address), `headers` (custom email headers)
  - **Body format support**: Supports string (plain text), object with `{ text, html }` for both formats, or string that's treated as HTML by Plunk
  - **Response structure**: Returns `{ success: boolean, emails: Array<{contact: {id, email}, email}>, timestamp: string }`
  - **Error handling**: Throws error if API response not ok with Plunk API error message
  - **Self-hosting support**: Can configure custom `host` URL for self-hosted Plunk instances
  - **Comparison with Resend**: Both drivers have similar API pattern (send method with to, subject, body, options)
  - **Key differences**: Plunk has contact management built-in, returns contact IDs, lacks BCC/CC and attachments that Resend has
  - **Email OTP integration**: Use `plunkEmail()` in `options.email` when configuring `emailOTP()` plugin
  - **Password auth integration**: Use `plunkEmail()` in password strategy `email` option for password reset/verification emails
  - **Documentation structure**: Comprehensive guide with Overview, Installation, Configuration, Integration (OTP/password), Templates, Testing, Best Practices (11 sections), Comparison, Examples, Troubleshooting, Related Documentation
  - **Best practices coverage**: Setup (API keys, env vars, separate envs), Templates (mobile-first, dark mode, plain text fallback, consistent branding, preheader), Deliverability (custom domain, SPF/DKIM/DMARC, warming, bounce handling), Performance (async, batch, retry, queue, rate limiting), Cost (monitor usage, free tier, email size, segmentation), Security (scoped keys, validation, rate limiting, log sanitization, HTTPS, email injection), Monitoring (delivery, open, click, bounce, complaint rates, response time, error alerts), Integration (error handling, fallback, transaction IDs, idempotency, webhooks), Troubleshooting (checklist for each issue type), Migration (contacts, templates, deliverability, costs, dual sending), Advanced (webhooks, custom domain, metadata, segmentation, automations), Compliance (GDPR, unsubscribe, retention, privacy policy, CAN-SPAM)
  - **Navigation updates**: Added new "Integrations" group in docs.json under How-to Guides, placed plunk-email.md in that group
  - **Index.md placement**: Added Plunk link under Authentication & Permissions section, after Email OTP
  - **Cross-references**: Plunk guide links to Email OTP Guide (for OTP integration), Auth Module Reference (for password auth config), Configuration Reference (for complete config), and Resend documentation (for comparison)
  - **Learning from source code**: Read Plunk driver implementation (plunk.ts) and tests (plunk.spec.ts) to understand API and options
  - **Git lock files**: Git `.git/index.lock` file can prevent commits - delete with `rm -f .git/index.lock` if commit fails with lock error

  ## Task 11.5: Add Email OTP Alternatives to Authentication Guide (v0.20.0)

  ### What I learned:
  - **Alternatives sections improve discoverability**: When a main guide covers one approach (password auth), adding an "Alternatives" section helps users find other approaches (Email OTP) that might better suit their use case
  - **Positioning matters**: The "Alternatives to Password Auth" section should be placed after the main content but before "Related Guides" so users see it at the end of the tutorial flow
  - **Quick start examples for alternatives**: Provide a minimal but complete configuration example showing the alternative approach (Email OTP with `emailOTP` plugin and `resendEmail` driver)
  - **Decision guidance**: Include "When to use" bullet points to help users understand when to choose each alternative (Email OTP for consumer apps, high security, simplicity-focused use cases)
  - **Cross-linking strategy**: Alternatives section should link to the comprehensive guide with "For complete documentation... see [Guide Name](path)"
  - **Related Guides updates**: When adding an alternatives section, also update the "Related Guides" section to include the new alternative guide with a descriptive link text
  - **Future-proofing**: Mention other alternatives that are planned or supported but not yet documented (e.g., OAuth providers coming soon) so users know the full range of options
  - **Task dependencies**: Task 11.5 depends on Task 9.0 (Email OTP guide) being complete - need to verify the guide exists before adding references to it

  ## Task 25.1: Review All Breaking Changes (v0.20.0)

  ### What I learned:
  - **Breaking change verification requires checking multiple sources**: When verifying breaking changes are documented, check migration guides, release notes, and reference docs
  - **Git lock files can block commits**: Git `.git/index.lock` file can prevent commits when another process or crash occurs. Delete with `rm -f .git/index.lock` if commit fails with lock error.
  - **Adapter name changes must be documented everywhere**: When function names change (e.g., `pgPostgres` → `pg`), update ALL code examples including those in "Before/After" comparison sections
   - **Breaking change documentation completeness check**:
       1. Migration guide exists and is comprehensive
       2. Release notes prominently list breaking changes with migration links
       3. Reference docs show correct v0.20.0 API in all examples
       4. Index.md has prominent notice box for breaking changes
       5. Cross-references link from breaking change docs to relevant feature docs

   ## Task 0.3: Research Browser/SQLocal Implementation (v0.20.0)

   ### What I learned:
   - **BkndBrowserApp API**: Main component for browser mode that wraps React app with Wouter router and ClientProvider
     - Props: children, header, loading, notFound, adminConfig, and config options (excluding connection, app)
     - Uses SQLocalKysely for database connection with default `:localStorage:` path
     - Auto-registers OpfsStorageAdapter for media storage
     - Supports custom loading, notFound, and header components
     - Provides React context through BkndBrowserAppContext
   - **useApp hook**: Returns `{ app: App, hash: string }` from BkndBrowserAppContext
     - `app.em` for entity manager and data operations
     - `app.emgr` for entity management
     - `hash` is checksum of app state for React key optimization
   - **useEntityQuery hook**: React SDK hook for simplified data fetching with built-in CRUD
     - Parameters: entity name, optional id, query options, SWR configuration
     - Returns: create, read, update, _delete methods with SWR data/error/loading states
     - Built-in cache management with mutate() for revalidation
     - Integrates with SWR for automatic refetching and caching
   - **SQLocal Connection**: SQLocalConnection extends SqliteConnection with SQLocalKysely client
     - Default connection path: `:localStorage:` for persistent browser storage
     - Supports `:memory:` for non-persistent in-memory database
     - Accepts custom DatabasePath string for custom locations
   - **OpfsStorageAdapter**: Media storage adapter using Origin Private File System API
     - Configuration: `root` option (string) for custom directory path
     - Supports file upload/download, listing, deletion, and existence checking
     - Range request support for partial file downloads
     - Automatic ETag generation using SHA-256 hash
     - MIME type guessing from file extensions
   - **Browser mode routing**: Uses Wouter for client-side routing with React
     - Admin UI accessible at configured basepath (default: `/admin`)
     - 404 handling with custom notFound component
     - View transitions support for smooth route changes
   - **Browser mode initialization**: Setup function handles initialization on mount
     - Registers OpfsStorageAdapter with media registry
     - Creates App with SQLocal connection
     - Calls beforeBuild, builds app with sync: true, calls onBuilt callback
     - Prevents double initialization with `initialized` flag
   - **Limitations**: No server-side code, no auth plugins, no HTTP server, no MCP

## Task 23.6: Add Link from Auth Module Reference to Email OTP Guide (v0.20.0)

### What I learned:
- **Cross-reference verification workflow**: Before adding a cross-reference, always verify the target file exists using `test -f <file>` command
- **Link placement logic**: When adding links to Related Documentation sections, place them in logical order - typically getting-started first, then specialized guides, then reference docs
- **Relative path importance**: Use correct relative paths based on file location - auth-module.md is in `docs/reference/` so uses `../how-to-guides/auth/email-otp.md`
- **Task status tracking**: After completing a subtask, update the tasks-bknd-v0.20.0-docs-update.md file to mark it as [x] completed
- **Verification after edit**: Use `grep -n` to verify the link was actually added to the file at the expected line number
  - **PostgreSQL package merge breaking change** fully documented:
     - Migration guide with detailed steps
     - Release notes with prominent breaking changes section
     - Updated configuration reference (fixed incorrect `pgPostgres` → `pg` examples)
     - Prominent notices in index.md and getting-started guides
  - **Schema permission breaking change** fully documented:
     - Release notes mention `system.schema.read` requirement
     - Auth module reference documents permission with optional module filter
     - Schema reference documents which endpoints are protected
  - **Code example consistency is critical**: Found and fixed incorrect `pgPostgres` references in configuration reference that showed wrong API for v0.20.0
  - **Migration notes should include adapter rename**: When documenting breaking changes, clearly state if function names changed, not just import paths (e.g., "adapter renamed from `pgPostgres` to `pg`")
  - **Source verification**: GitHub release page is authoritative source for official breaking changes and PR references

## Task 25.2: Review All Integration Guides (v0.20.0)

### What I learned:
- **All 4 new integration guides are complete** with comprehensive sections:
  - SvelteKit: 633 lines, covers adapter setup, API integration, load functions, admin UI, deployment
  - Browser/SQLocal: 923 lines, covers SQLocal setup, OPFS storage, data operations, use cases, deployment
  - Email OTP: 810 lines, covers configuration, email providers, API endpoints, security, best practices
  - Plunk Email: 691 lines, covers configuration, OTP/password auth, templates, comparison, best practices
- **Directory naming convention**: The directory is named "how-to-guides" (with "es" suffix), not "how-to-guides" - this appears to be intentional and consistent with docs.json
- **Framework comparison includes new guides**: SvelteKit and Browser Mode are both documented in framework-comparison.md matrix
- **Navigation properly configured**: All 4 guides are correctly positioned in docs.json under appropriate groups
- **Task verification workflow**: When verifying integration guides are complete, check:
  1. File exists in expected location (test -f command)
  2. Guide is added to docs.json navigation
  3. Guide is mentioned in framework-comparison.md (for framework integrations)
  4. Related docs cross-reference to/from the guide
- **Integration guide content structure**: Comprehensive guides include Overview, Installation, Configuration, Integration, Features, Examples, Best Practices, Troubleshooting, and Related Documentation
 - **Completeness review process**: Systematically verify each guide has all required sections from PRD structure

 ## Task 25.3: Review All New Features Are Documented (v0.20.0)

 ### What I learned:
 - **Comprehensive feature verification requires cross-referencing**: When verifying all new features are documented, check the release notes systematically and verify each feature has documentation in the appropriate location
 - **Documentation locations vary by feature type**:
    - New integrations (Email OTP, Plunk, SvelteKit, Browser/SQLocal): Dedicated guides in how-to-guides
    - Configuration changes: Auth module reference, configuration reference
    - API improvements: Data module reference, react-sdk reference
    - Minor features: Scattered across multiple docs (hybrid mode in choose-your-mode, auto-join in query-system, etc.)
 - **uploadToEntity overwrite parameter documentation gap**: Found that `uploadToEntity` method's `overwrite` parameter was documented in `data-module.md` but missing from `entity-media-relationships.md`, which is where users working with media relationships would look for it
 - **Documentation completeness check workflow**:
    1. Read release notes to list all new features
    2. For each feature, locate appropriate documentation file
    3. Use grep to verify the feature is documented
    4. Check that examples, use cases, and version notes are present
    5. Look for related documentation that should reference the feature
 - **All v0.20.0 new features verified as documented**:
    - License change to Apache 2.0: README.md and index.md
    - PostgreSQL package merge: Migration guide and all integration guides
    - MCP navigation: schema.md and how-bknd-works.md
    - Improved hybrid mode: choose-your-mode.md with "New in v0.20.0" section
    - Repository auto-join: query-system.md with performance considerations
    - Email OTP plugin: Dedicated guide with comprehensive sections (809 lines)
    - Plunk email driver: Dedicated guide with comparison to Resend (690 lines)
    - SvelteKit adapter: Dedicated guide with load function integration (632 lines)
    - uploadToEntity overwrite: data-module.md and now entity-media-relationships.md
    - Browser/SQLocal support: Dedicated guide with use cases (922 lines)
    - Auth improvements: default_role_register, minLength, logout redirect in auth-module.md
    - Data module improvements: readOneBy in data-module.md
 - **Documentation quality indicators**: Comprehensive guides have 600+ lines with sections on overview, configuration, integration, best practices, troubleshooting, and cross-references

## Task 25.5: Review Cross-References (v0.20.0)

### What I learned:
- **Cross-reference verification workflow**: When reviewing cross-references, systematically check each new file both for outgoing links (what it links to) and incoming links (what links to it)
- **Grep patterns for verification**: Use patterns like `grep -n "\.md" file.md` to find markdown links, and `grep -rn "target-file-name" docs/` to find incoming references
- **Bidirectional linking importance**: Core documentation should have bidirectional links where possible - if A links to B, B should link back to A in its "Related Documentation" section
- **New file cross-reference patterns**: New integration guides should link to configuration reference, relevant reference docs, framework comparison, and related getting-started guides
- **Reference docs linking strategy**: Reference docs should link to comprehensive guides in "Related Documentation" sections, but don't need extensive linking to other reference docs
- **Breaking change cross-references**: Migration guides need extensive inbound links from all affected integration guides
- **Index.md as central hub**: Index.md should have links to all new major features and migration guides in prominent notice boxes for visibility
- **Framework comparison cross-refs**: When adding a new integration, framework-comparison.md should have a dedicated section with a cross-link to full guide
- **Missing link detection**: Use `grep -q` in loops to check which files are missing specific links
- **Priority for cross-reference fixes**: Focus on user-facing improvements first (getting-started guides, integration guides) before polishing internal reference doc links
- **Comprehensive review approach**: Check both explicit `.md` links and conceptual references (feature names, guide titles) to ensure complete coverage
