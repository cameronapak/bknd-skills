## Relevant Files

### New Files to Create
- `/docs/migration-guides/postgres-package-merge.md` - Critical migration guide for Postgres package merge breaking change
- `/docs/migration-guides/` - New directory for all migration guides
- `/docs/how-to-guides/setup/integrations/sveltekit.md` - SvelteKit integration guide
- `/docs/how-to-guides/setup/integrations/browser-sqlocal.md` - Browser/SQLocal integration guide
- `/docs/how-to-guides/auth/email-otp.md` - Email OTP authentication guide
- `/docs/how-to-guides/integrations/plunk-email.md` - Plunk email provider guide
- `/docs/how-to-guides/integrations/` - New directory for third-party integrations
- `/docs/reference/configuration.md` - Centralized configuration reference
- `/docs/releases/v0.20.0-release-notes.md` - Release notes for v0.20.0
- `/docs/releases/` - New directory for version-specific release notes

### Files to Update
- `docs.json` - Navigation hierarchy with new groups and pages
- `/docs/architecture-and-concepts/how-bknd-works.md` - PostgreSQL adapter reference, MCP navigation
- `/docs/how-to-guides/setup/integrations/nextjs.md` - PostgreSQL adapter configuration
- `/docs/getting-started/deploy-to-production.md` - Database configuration
- `/docs/reference/auth-module.md` - New config options, logout, schema permissions
- `/docs/reference/data-module.md` - readOneBy method, auto-join, uploadToEntity overwrite
- `/docs/reference/react-sdk-reference.md` - logout method
- `/docs/how-to-guides/setup/choose-your-mode.md` - Hybrid mode improvements, browser mode
- `/docs/getting-started/build-your-first-api.md` - Hybrid mode configuration
- `/docs/reference/query-system.md` - Auto-join documentation
- `/docs/how-to-guides/data/entity-media-relationships.md` - Auto-join filtering, overwrite parameter
- `/docs/reference/schema.md` - MCP navigation, schema permissions
- `/docs/how-to-guides/setup/integrations/framework-comparison.md` - SvelteKit, Browser mode comparison
- `/docs/how-to-guides/setup/integrations/` - All integration guides (PostgreSQL adapter section)
- `/docs/getting-started/add-authentication.md` - Email OTP alternatives
- `/README.md` - Apache 2.0 license update
- `/docs/index.md` - New links to migration guides, new features

### Notes
- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Research - Answer Open Questions (Pre-requisite for Many Tasks)
  - [ ] 0.1 Research Email OTP implementation details (API, TTL, template variables, rate limits)
  - [ ] 0.2 Research Plunk integration details (configuration syntax, options, comparison with Resend)
  - [ ] 0.3 Research Browser/SQLocal implementation (BkndBrowserApp API, OpfsStorageAdapter, limitations)
  - [ ] 0.4 Research SvelteKit adapter (import paths, config options, load system, type generation)
  - [ ] 0.5 Research Hybrid mode improvements (reader returns objects, sync_required flag, config handling)
  - [ ] 0.6 Research Auto-join behavior (trigger conditions, performance implications, control options)
  - [ ] 0.7 Research MCP navigation (what it is, Admin UI integration, configuration options)
  - [ ] 0.8 Research documentation content approach (code snippets, target audience, best practices detail level)
  - [ ] 0.9 Research implementation priorities (experimental features, beta releases, breaking changes)
  - [ ] 0.10 Research release coordination (official release date, additional breaking changes, team consultation)

- [ ] 1.0 Week 1 Critical Path: Postgres Package Migration Guide (Priority: HIGH)
  - [ ] 1.1 Create `/docs/migration-guides/` directory
  - [ ] 1.2 Create `/docs/migration-guides/postgres-package-merge.md` with complete structure
  - [ ] 1.3 Write "Overview" section explaining the Postgres package merge
  - [ ] 1.4 Write "Breaking Changes" section listing all changes
  - [ ] 1.5 Write "Migration Steps" section with detailed instructions
  - [ ] 1.6 Write "Adapter Comparison" section (pgPostgres vs postgresJs)
  - [ ] 1.7 Write "Code Examples" section with before/after comparisons
  - [ ] 1.8 Write "Troubleshooting" section for common migration issues
  - [ ] 1.9 Add cross-references to integration guides and configuration reference
  - [ ] 1.10 Review and validate migration guide for accuracy and completeness

- [ ] 2.0 Week 1 Critical Path: Update Existing Files for Postgres Package Merge (Priority: HIGH)
  - [ ] 2.1 Update `/docs/architecture-and-concepts/how-bknd-works.md` line 250 (PostgreSQL adapter reference)
  - [ ] 2.2 Update `/docs/how-to-guides/setup/integrations/nextjs.md` PostgreSQL section
  - [ ] 2.3 Update `/docs/getting-started/deploy-to-production.md` database configuration
  - [ ] 2.4 Update all integration guides with "PostgreSQL Adapter Options" section
  - [ ] 2.5 Verify all PostgreSQL adapter imports reference main bknd package

- [ ] 3.0 Week 1 Critical Path: Navigation Restructure - Add Migration Guides (Priority: HIGH)
  - [ ] 3.1 Update `docs.json` to add "Migration Guides" group at top
  - [ ] 3.2 Add postgres-package-merge page to Migration Guides group
  - [ ] 3.3 Test navigation structure to ensure proper rendering
  - [ ] 3.4 Update `/docs/index.md` to link to Migration Guides

 - [x] 4.0 Week 1 Critical Path: Auth Module Updates (Priority: HIGH)
   - [x] 4.1 Update `/docs/reference/auth-module.md` JWT Configuration table (default_role_register)
   - [x] 4.2 Update `/docs/reference/auth-module.md` Password Strategy section (minLength)
   - [x] 4.3 Update `/docs/reference/auth-module.md` API Endpoints (logout method)
   - [x] 4.4 Update `/docs/reference/auth-module.md` to reflect configurable password validation
   - [x] 4.5 Update `/docs/reference/auth-module.md` Roles and Permissions section (schema permissions)
   - [x] 4.6 Add new endpoints to API Endpoints table if any

- [x] 5.0 Week 1 Critical Path: Data Module Updates (Priority: HIGH)
   - [x] 5.1 Update `/docs/reference/data-module.md` Repository API (readOneBy method)
   - [x] 5.2 Add note about readOneBy as alternative to findOne
   - [x] 5.3 Provide code examples comparing readOneBy vs findOne
   - [x] 5.4 Update `/docs/reference/data-module.md` Query System (auto-join behavior)
   - [x] 5.5 Update `/docs/reference/data-module.md` Filtering section (related entity filtering)
   - [x] 5.6 Update `/docs/reference/data-module.md` findMany options (with parameter)
   - [x] 5.7 Add warning about performance implications of auto-joins
   - [x] 5.8 Update `/docs/reference/data-module.md` Mutator API (uploadToEntity overwrite parameter)
   - [x] 5.9 Add overwrite parameter documentation and examples

- [x] 6.0 Week 1 Critical Path: React SDK Updates (Priority: HIGH)
  - [x] 6.1 Update `/docs/reference/react-sdk-reference.md` API Methods (auth.logout())
  - [x] 6.2 Update `/docs/reference/react-sdk-reference.md` useAuth hook table
  - [x] 6.3 Update examples to include logout usage

- [ ] 7.0 Week 1 Critical Path: SvelteKit Integration Guide (Priority: HIGH)
  - [ ] 7.1 Create `/docs/how-to-guides/setup/integrations/sveltekit.md` with complete structure
  - [ ] 7.2 Write "Overview" section on SvelteKit adapter capabilities
  - [ ] 7.3 Write "Installation" section (CLI starter and manual)
  - [ ] 7.4 Write "Configuration" section (bknd.config.ts, SvelteKit-specific options)
  - [ ] 7.5 Write "API Setup" section (API routes, load functions)
  - [ ] 7.6 Write "Server-Side Data Fetching" section (+page.server.ts, +layout.server.ts)
  - [ ] 7.7 Write "Admin UI" section (integration with SvelteKit pages)
  - [ ] 7.8 Write "Client-Side with SDK" section (Svelte stores, useAuth equivalent)
  - [ ] 7.9 Write "Type Safety" section (TypeScript, type generation)
  - [ ] 7.10 Write "Deployment" section (Vercel, edge runtime)
  - [ ] 7.11 Write "Examples" section with complete app examples
  - [ ] 7.12 Add cross-references to reference docs and framework comparison

- [ ] 8.0 Week 1 Critical Path: Navigation - Add SvelteKit Guide (Priority: HIGH)
  - [ ] 8.1 Update `docs.json` to include SvelteKit guide in Integration Guides
  - [ ] 8.2 Position SvelteKit after React Router, before Cloudflare Workers
  - [ ] 8.3 Update `/docs/how-to-guides/setup/integrations/framework-comparison.md`
  - [ ] 8.4 Add SvelteKit comparison row to framework comparison table
  - [ ] 8.5 Update `/docs/index.md` with SvelteKit link

- [ ] 9.0 Week 2 Parallel: Email OTP Guide (Priority: MEDIUM)
  - [ ] 9.1 Create `/docs/how-to-guides/auth/email-otp.md` with complete structure
  - [ ] 9.2 Write "Overview" section (what is Email OTP, benefits, how it works)
  - [ ] 9.3 Write "Configuration" section (enabling plugin, TTL, templates, auto-invalidation)
  - [ ] 9.4 Write "Email Provider Setup" section (Resend and Plunk configuration)
  - [ ] 9.5 Write "User Flow" section (request, receive, verify, auto-invalidate)
  - [ ] 9.6 Write "API Endpoints" section (request, verify, resend)
  - [ ] 9.7 Write "SDK Integration" section (React hooks, example components)
  - [ ] 9.8 Write "Security Considerations" section
  - [ ] 9.9 Write "Customization" section (templates, OTP length, validation)
  - [ ] 9.10 Write "Troubleshooting" section
  - [ ] 9.11 Write "Best Practices" section (security, UX, deliverability, configuration, performance, monitoring, compliance, migration, testing)
  - [ ] 9.12 Add cross-references to auth module reference, Plunk guide, create-first-user

- [ ] 10.0 Week 2 Parallel: Plunk Email Driver Guide (Priority: MEDIUM)
  - [ ] 10.1 Create `/docs/how-to-guides/integrations/` directory
  - [ ] 10.2 Create `/docs/how-to-guides/integrations/plunk-email.md` with complete structure
  - [ ] 10.3 Write "Overview" section (what is Plunk, why use it, features)
  - [ ] 10.4 Write "Installation" section (Plunk SDK, API key setup)
  - [ ] 10.5 Write "Configuration" section (email driver, Plunk settings, env vars)
  - [ ] 10.6 Write "Integration with Email OTP" section
  - [ ] 10.7 Write "Integration with Password Auth" section (password reset, verification)
  - [ ] 10.8 Write "Email Templates" section (defaults, custom, variables)
  - [ ] 10.9 Write "Testing" section (test sending, debug delivery)
  - [ ] 10.10 Write "Best Practices" section (setup, templates, deliverability, performance, cost, security, monitoring, integration, troubleshooting, migration, advanced, compliance)
  - [ ] 10.11 Write "Comparison: Plunk vs Resend" section
  - [ ] 10.12 Write "Examples" section with complete email integration
  - [ ] 10.13 Add cross-references to Email OTP guide, auth module reference, Resend docs

- [ ] 11.0 Week 2 Parallel: Navigation - Add Email & Plunk Guides (Priority: MEDIUM)
  - [ ] 11.1 Update `docs.json` to add "Integrations" group under How-to Guides
  - [ ] 11.2 Add plunk-email to Integrations group
  - [ ] 11.3 Add email-otp to Authentication group (after public-access-guard)
  - [ ] 11.4 Update `/docs/index.md` with Email OTP and Plunk links
  - [ ] 11.5 Update `/docs/getting-started/add-authentication.md` with Email OTP alternatives section

- [ ] 12.0 Week 2 Parallel: Browser/SQLocal Integration Guide (Priority: MEDIUM)
  - [ ] 12.1 Create `/docs/how-to-guides/setup/integrations/browser-sqlocal.md` with complete structure
  - [ ] 12.2 Write "Overview" section (Browser mode, SQLocal, use cases)
  - [ ] 12.3 Write "Installation" section (dependencies, SQLocal setup)
  - [ ] 12.4 Write "Configuration" section (BkndBrowserApp, OpfsStorageAdapter, DB location)
  - [ ] 12.5 Write "Getting Started" section (basic setup, loading DBs, persisting)
  - [ ] 12.6 Write "Features Available" section (CRUD, relationships, query system, limitations)
  - [ ] 12.7 Write "Admin UI" section (browser-based access)
  - [ ] 12.8 Write "Use Cases" section (offline apps, local dev, prototyping)
  - [ ] 12.9 Write "Data Migration" section (export/import)
  - [ ] 12.10 Write "Limitations" section (no auth, no API, performance)
  - [ ] 12.11 Write "Examples" section with complete browser app
  - [ ] 12.12 Add cross-references to data module reference, choose-your-mode

- [ ] 13.0 Week 2 Parallel: Navigation - Add Browser Guide (Priority: MEDIUM)
  - [ ] 13.1 Update `docs.json` to include Browser guide in Integration Guides
  - [ ] 13.2 Position Browser guide after Docker (last integration guide)
  - [ ] 13.3 Update `/docs/how-to-guides/setup/choose-your-mode.md` with Browser mode
  - [ ] 13.4 Add Browser mode to decision tree
  - [ ] 13.5 Add Browser mode to deployment approaches
  - [ ] 13.6 Update `/docs/index.md` with Browser mode link
  - [ ] 13.7 Update framework comparison with Browser mode row

- [ ] 14.0 Week 2 Parallel: Minor Features - Hybrid Mode (Priority: MEDIUM)
  - [ ] 14.1 Update `/docs/how-to-guides/setup/choose-your-mode.md` Hybrid Mode section
  - [ ] 14.2 Document "reader returns objects" improvement
  - [ ] 14.3 Document sync_required flag behavior
  - [ ] 14.4 Document better config handling improvements
  - [ ] 14.5 Update code examples for v0.20.0 API
  - [ ] 14.6 Clarify sync behavior with new flags

- [ ] 15.0 Week 2 Parallel: Minor Features - Build First API (Priority: MEDIUM)
  - [ ] 15.1 Update `/docs/getting-started/build-your-first-api.md` hybrid mode configuration
  - [ ] 15.2 Add note about sync_required flag in production deployments

- [ ] 16.0 Week 2 Parallel: Minor Features - Auto-Join (Priority: MEDIUM)
  - [ ] 16.1 Update `/docs/reference/query-system.md` Filtering section with auto-join examples
  - [ ] 16.2 Update `/docs/reference/query-system.md` Performance section with auto-join considerations
  - [ ] 16.3 Document query plan for auto-joined queries
  - [ ] 16.4 Update `/docs/how-to-guides/data/entity-media-relationships.md`
  - [ ] 16.5 Add "Automatic Join Filtering" section with examples
  - [ ] 16.6 Document when auto-join is triggered

- [ ] 17.0 Week 2 Parallel: Minor Features - MCP Navigation (Priority: MEDIUM)
  - [ ] 17.1 Update `/docs/architecture-and-concepts/how-bknd-works.md` Admin UI section
  - [ ] 17.2 Add MCP navigation documentation
  - [ ] 17.3 Update Request Lifecycle section with MCP route handling
  - [ ] 17.4 Update `/docs/reference/schema.md` Admin Configuration section
  - [ ] 17.5 Add MCP navigation settings
  - [ ] 17.6 Add example of customizing MCP route
  - [ ] 17.7 Update all integration guides Admin UI sections
  - [ ] 17.8 Add note about route-aware MCP access

- [ ] 18.0 Week 2 Parallel: Minor Features - Schema Permissions (Priority: MEDIUM)
  - [ ] 18.1 Update `/docs/reference/schema.md` with Schema Security section
  - [ ] 18.2 Document permission requirements
  - [ ] 18.3 Document endpoint protection for schema operations
  - [ ] 18.4 Update `/docs/reference/auth-module.md` schema permission documentation
  - [ ] 18.5 Add schema-related permissions to permissions table
  - [ ] 18.6 Provide examples of schema permission configuration

- [x] 19.0 Week 2 Parallel: Minor Features - License Update (Priority: LOW)
  - [x] 19.1 Update `/README.md` description section with Apache 2.0
  - [x] 19.2 Update `/README.md` licensing section with Apache 2.0 information
  - [x] 19.3 Update `/docs/index.md` official resources with license mention

- [ ] 20.0 Week 2 Parallel: Configuration Reference (Priority: MEDIUM)
  - [ ] 20.1 Create `/docs/reference/configuration.md` with complete structure
  - [ ] 20.2 Write "Overview" section (configuration file structure)
  - [ ] 20.3 Write "Top-level Options" section (connection, config, options)
  - [ ] 20.4 Write "Connection Configuration" section (database URL formats, adapters)
  - [ ] 20.5 Write "Config Sections" section (data, auth, media, admin)
  - [ ] 20.6 Write "Auth Configuration" section (comprehensive: JWT, cookie, strategies, roles, email providers)
  - [ ] 20.7 Write "Options" section (mode, seed, manager)
  - [ ] 20.8 Write "New in v0.20.0" section (default_role_register, minLength, MCP, hybrid mode)
  - [ ] 20.9 Write "Environment Variables" section (all supported vars, defaults)
  - [ ] 20.10 Write "Examples" section with complete configuration files
  - [ ] 20.11 Write "Migration Notes" section (changes from previous versions)
  - [ ] 20.12 Add cross-references to all reference docs and how-to guides

- [ ] 21.0 Week 2 Parallel: Navigation - Add Configuration Reference (Priority: MEDIUM)
  - [ ] 21.1 Update `docs.json` to include configuration reference in Reference group
  - [ ] 21.2 Position configuration reference first (before auth-module)
  - [ ] 21.3 Add cross-links from existing docs to new config reference

- [ ] 22.0 Week 2 Parallel: Release Notes (Priority: LOW)
  - [ ] 22.1 Create `/docs/releases/` directory
  - [ ] 22.2 Create `/docs/releases/v0.20.0-release-notes.md`
  - [ ] 22.3 Write quick summary of all changes
  - [ ] 22.4 Add links to migration guides
  - [ ] 22.5 Add links to new feature documentation
  - [ ] 22.6 Format as changelog
  - [ ] 22.7 Update `/docs/index.md` to link to release notes

- [ ] 23.0 Final Polish: Cross-References (Priority: MEDIUM)
  - [ ] 23.1 Review all new files for required cross-references
  - [ ] 23.2 Add links from migration guide to integration guides and configuration reference
  - [ ] 23.3 Add links from index.md to all new content
  - [ ] 23.4 Add links from framework comparison to SvelteKit and Browser mode
  - [ ] 23.5 Add links from add-authentication to Email OTP guide
  - [ ] 23.6 Add links from auth module reference to Email OTP guide
  - [ ] 23.7 Add links from choose-your-mode to Browser mode
  - [ ] 23.8 Verify all cross-references are bidirectional where appropriate

- [ ] 24.0 Final Polish: Quality Assurance (Priority: HIGH)
  - [ ] 24.1 Verify all links in new documentation (no broken links)
  - [ ] 24.2 Verify all code examples are syntactically correct
  - [ ] 24.3 Verify all configuration options are accurate
  - [ ] 24.4 Check for contradictory information between docs
  - [ ] 24.5 Verify file structure follows established conventions
  - [ ] 24.6 Verify navigation structure is logical and discoverable
  - [ ] 24.7 Verify terminology is consistent across all docs
  - [ ] 24.8 Verify best practices sections are comprehensive

- [ ] 25.0 Final Review and Validation (Priority: HIGH)
  - [ ] 25.1 Review all breaking changes are documented
  - [ ] 25.2 Review all new integration guides are complete
  - [ ] 25.3 Review all new features are documented
  - [ ] 25.4 Review all existing docs are updated for v0.20.0
  - [ ] 25.5 Review cross-references are implemented across all new content
  - [ ] 25.6 Review navigation hierarchy is updated
  - [ ] 25.7 Final review of all new files
  - [ ] 25.8 Final review of all updated files
