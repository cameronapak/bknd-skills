# PRD: Documentation Updates for Bknd v0.20.0

## Introduction/Overview

This PRD outlines the structural and organizational updates needed for the supplemental-bknd-docs repository to align with Bknd v0.20.0. The documentation must support active users in migrating breaking changes and provide comprehensive coverage of new features including Email OTP, Plunk email driver, SvelteKit adapter, and Browser/SQLocal support.

**Timeline:** Urgent - 1-2 weeks
**Primary Audience:** Active users requiring migration guidance
**Scope:** Structural organization and planning only (defer actual content creation)

## Goals

1. **Immediate (Week 1):** Complete migration guidance for breaking changes (Postgres package merge)
2. **Parallel (Week 1-2):** Add integration guides for SvelteKit and Browser/SQLocal
3. **Parallel (Week 1-2):** Document Email OTP and Plunk email driver with best practices
4. **Throughout:** Update existing docs with v0.20.0 minor features and improvements
5. **Outcome:** Comprehensive documentation structure ready for content population

## Section 1: Files to Update

### 1.1 Breaking Change: Postgres Package Merge

**Impact:** `@bknd/postgres` package no longer exists; functionality merged into main `bknd` package via `pgPostgres` and `postgresJs`

**Files Requiring Updates:**

#### `/docs/architecture-and-concepts/how-bknd-works.md`
- **Line 250:** Update PostgreSQL adapter reference
  - Current: `| PostgreSQL | postgresJs() | node-postgres |`
  - Change to: Clarify `pgPostgres()` and `postgresJs()` are now available from `bknd` package
  - Add note: "As of v0.20.0, PostgreSQL adapters are part of the main `bknd` package"

#### `/docs/how-to-guides/setup/integrations/nextjs.md`
- **Section: Deployment → Environment Variables**
  - Update PostgreSQL connection example to use `pgPostgres` or `postgresJs` from main package
  - Add migration note: "If you were using `@bknd/postgres`, the adapter is now available from `bknd`"

#### `/docs/getting-started/deploy-to-production.md`
- **Section: Database Configuration**
  - Add PostgreSQL adapter selection guidance
  - Document `pgPostgres()` vs `postgresJs()` trade-offs
  - Include code examples showing both adapters

#### All Integration Guides (Next.js, Vite+React, React Router, Astro, Bun/Node):
- Add section: "PostgreSQL Adapter Options"
- Show adapter imports from `bknd` package
- Document configuration differences between `pgPostgres` and `postgresJs`

### 1.2 Auth Module Updates

**Impact:** New configuration options (default_role_register, password minLength), new logout method, new SDK method (readOneBy)

**Files Requiring Updates:**

#### `/docs/reference/auth-module.md`
- **Section: JWT Configuration table** - Add `default_role_register` configuration option
- **Section: Password Strategy** - Add `minLength` configuration (line 139-142 reference hardcoded validation)
  - Update: "Password Requirements - Minimum 8 characters (configurable via `minLength`)"
- **Section: API Endpoints** - Document logout method behavior
- **Section: API Endpoints table** - Add new endpoints if any
- **Update entire document** to reflect configurable password validation

#### `/docs/reference/data-module.md`
- **Section: Repository API** - Add `readOneBy(where)` method documentation
- **Section: findOne(where)** - Add note about `readOneBy` as alternative for specific use cases
- **Provide code examples** comparing `readOneBy` vs `findOne`

#### `/docs/reference/react-sdk-reference.md`
- **Section: API Methods** - Add `auth.logout()` method
- **Section: useAuth hook** - Add logout method to the hook API table
- **Update examples** to include logout usage

### 1.3 Config and Hybrid Mode Improvements

**Impact:** Improved hybrid mode, reader returns objects, sync_required flag, better config handling

**Files Requiring Updates:**

#### `/docs/how-to-guides/setup/choose-your-mode.md`
- **Section: Hybrid Mode** - Update to document v0.20.0 improvements
  - Reader returns objects (not just strings)
  - `sync_required` flag behavior
  - Better config handling
- **Section: Using Mode Helpers** - Update code examples for v0.20.0 API
- **Section: Recommended Workflow** - Clarify sync behavior with new flags

#### `/docs/getting-started/build-your-first-api.md`
- **Section: Step 2: Configure Bknd with Schema** - Update hybrid mode configuration
- **Add note** about sync_required flag in production deployments

### 1.4 Repository Auto-Join

**Impact:** Automatic joins when filtering related entities (e.g., `{"author.name": "John"}`)

**Files Requiring Updates:**

#### `/docs/reference/data-module.md`
- **Section: Query System** - Document auto-join behavior
- **Section: Filtering** - Add examples of related entity filtering
- **Section: findMany options** - Document `with` parameter optimization
- **Add warning** about performance implications of auto-joins

#### `/docs/reference/query-system.md`
- **Section: Filtering** - Add auto-join examples
- **Section: Performance** - Add auto-join considerations
- **Document query plan** for auto-joined queries

#### `/docs/how-to-guides/data/entity-media-relationships.md`
- **Add section:** "Automatic Join Filtering"
- Provide examples of filtering by related entity fields
- Document when auto-join is triggered

### 1.5 MCP in Admin Navigation

**Impact:** MCP (Model Context Protocol) accessible from main nav, route-aware

**Files Requiring Updates:**

#### `/docs/architecture-and-concepts/how-bknd-works.md`
- **Section: Admin UI** - Add MCP navigation documentation
- **Section: Request Lifecycle** - Document MCP route handling

#### `/docs/reference/schema.md`
- **Section: Admin Configuration** - Add MCP navigation settings
- **Add example** of customizing MCP route

#### All Integration Guides:
- **Section: Admin UI** - Update to mention MCP navigation
- **Add note** about route-aware MCP access

### 1.6 MediaAPI Overwrite Parameter

**Impact:** `uploadToEntity` now supports `overwrite` parameter

**Files Requiring Updates:**

#### `/docs/reference/data-module.md`
- **Section: Mutator API** - Update `uploadToEntity` method signature
- **Add overwrite parameter** documentation
- **Provide examples** showing overwrite vs. error behavior

#### `/docs/how-to-guides/data/entity-media-relationships.md`
- **Section: Media Upload** - Add overwrite parameter example
- **Document behavior** when overwrite is true/false

### 1.7 License Change

**Impact:** License changed to Apache 2.0

**Files Requiring Updates:**

#### `/README.md`
- **Section: Description** - Update to mention Apache 2.0 license
- **Section: Licensing** - Add Apache 2.0 information

#### `/docs/index.md`
- **Section: Official Resources** - Update license mention if present

### 1.8 Schema Permissions

**Impact:** Schema endpoints behind schema permission

**Files Requiring Updates:**

#### `/docs/reference/auth-module.md`
- **Section: Roles and Permissions** - Add schema permission documentation
- **Section: Permissions table** - Add schema-related permissions
- **Provide examples** of schema permission configuration

#### `/docs/reference/schema.md`
- **Section: Schema Security** - Add permission requirements
- **Document endpoint protection** for schema operations

### 1.9 Deprecated Content to Remove

**No deprecated content found** - The documentation does not reference the removed `@bknd/postgres` package as a separate installation, so no removals are needed.

## Section 2: New Documentation to Create

### 2.1 Migration Guide: Postgres Package Change (CRITICAL - Week 1)

**File Path:** `/docs/migration-guides/postgres-package-merge.md`

**Purpose:** Guide users migrating from `@bknd/postgres` to main `bknd` package

**Structure:**
1. **Overview** - What changed and why
2. **Breaking Changes** - List of breaking changes
3. **Migration Steps**
   - Update imports (remove `@bknd/postgres`, use `bknd`)
   - Update adapter configuration
   - Update connection strings
4. **Adapter Comparison** - `pgPostgres()` vs `postgresJs()`
   - When to use each
   - Configuration differences
   - Performance characteristics
5. **Code Examples** - Before/after comparisons
6. **Troubleshooting** - Common migration issues

**Cross-references:**
- Link to `/docs/reference/auth-module.md` (if auth affected)
- Link to integration guides for framework-specific adapter usage

### 2.2 SvelteKit Integration Guide (Week 1-2)

**File Path:** `/docs/how-to-guides/setup/integrations/sveltekit.md`

**Purpose:** Complete guide for first-class SvelteKit support

**Structure:**
1. **Overview** - SvelteKit adapter capabilities
2. **Installation**
   - CLI starter: `npx bknd create -i sveltekit`
   - Manual installation
3. **Configuration**
   - `bknd.config.ts` setup
   - SvelteKit-specific options
4. **API Setup**
   - API route configuration
   - Load functions integration
5. **Server-Side Data Fetching**
   - Using `+page.server.ts`
   - Using `+layout.server.ts`
6. **Admin UI**
   - Integration with SvelteKit pages
7. **Client-Side with SDK**
   - Svelte stores integration
   - `useAuth` equivalent in SvelteKit
8. **Type Safety**
   - TypeScript integration
   - Type generation
9. **Deployment**
   - Vercel deployment
   - Edge runtime considerations
10. **Examples** - Complete app examples

**Cross-references:**
- Link to `/docs/reference/data-module.md` (API usage)
- Link to `/docs/reference/auth-module.md` (authentication)
- Link to `/docs/how-to-guides/setup/integrations/framework-comparison.md`

**Navigation placement:**
- Add to Integration Guides group in `docs.json`
- Position after React Router, before Cloudflare Workers

### 2.3 Browser/SQLocal Integration (Week 1-2)

**File Path:** `/docs/how-to-guides/setup/integrations/browser-sqlocal.md`

**Purpose:** Guide for running Bknd in browser with SQLocal

**Structure:**
1. **Overview**
   - What is Browser mode
   - What is SQLocal
   - Use cases (local development, offline apps, demos)
2. **Installation**
   - Dependencies required
   - SQLocal setup
3. **Configuration**
   - `BkndBrowserApp` usage
   - `OpfsStorageAdapter` configuration
   - Database file location
4. **Getting Started**
   - Basic browser setup
   - Loading existing databases
   - Persisting data
5. **Features Available**
   - Data operations (CRUD)
   - Relationships
   - Query system
   - Limitations (no auth, no real API)
6. **Admin UI**
   - Browser-based Admin UI
   - Access and configuration
7. **Use Cases**
   - Offline-first applications
   - Local development without backend
   - Prototyping and demos
8. **Data Migration**
   - Exporting from browser to production
   - Importing production schema
9. **Limitations**
   - No server-side code execution
   - No auth plugins
   - Performance considerations
10. **Examples** - Complete browser app

**Cross-references:**
- Link to `/docs/reference/data-module.md` (available data operations)
- Link to `/docs/how-to-guides/setup/choose-your-mode.md` (mode selection)

**Navigation placement:**
- Add to Integration Guides group in `docs.json`
- Position after Docker (last integration guide)

### 2.4 Email OTP Authentication Guide (Week 1-2)

**File Path:** `/docs/how-to-guides/auth/email-otp.md`

**Purpose:** Complete guide for passwordless authentication via email OTP

**Structure:**
1. **Overview**
   - What is Email OTP
   - Benefits (no passwords, improved security)
   - How it works (OTP generation, delivery, verification)
2. **Configuration**
   - Enabling Email OTP plugin
   - TTL (time-to-live) configuration
   - Template customization
   - Auto-invalidation settings
3. **Email Provider Setup**
   - Resend configuration (existing)
   - Plunk configuration (new - see section 2.5)
   - Provider comparison
4. **User Flow**
   - Request OTP
   - Receive email
   - Verify OTP
   - Auto-invalidation after use
5. **API Endpoints**
   - Request OTP endpoint
   - Verify OTP endpoint
   - Resend OTP endpoint
6. **SDK Integration**
   - React SDK hooks for Email OTP
   - Example components
7. **Security Considerations**
   - OTP strength
   - Rate limiting
   - Brute force protection
   - OTP expiration
8. **Customization**
   - Email templates
   - OTP length and characters
   - Custom validation logic
9. **Troubleshooting**
   - OTP not received
   - OTP expired
   - Rate limiting issues
10. **Best Practices** (see Section 5 for outline)

**Cross-references:**
- Link to `/docs/reference/auth-module.md` (auth configuration)
- Link to `/docs/how-to-guides/auth/create-first-user.md` (user management)
- Link to Plunk guide (section 2.5)

**Navigation placement:**
- Add to Authentication group in `docs.json`
- Position after `/docs/how-to-guides/permissions/public-access-guard.md`

### 2.5 Plunk Email Driver Guide (Week 1-2)

**File Path:** `/docs/how-to-guides/integrations/plunk-email.md`

**Purpose:** Complete guide for using Plunk as email provider

**Structure:**
1. **Overview**
   - What is Plunk
   - Why use Plunk (alternatives to Resend)
   - Features and benefits
2. **Installation**
   - Plunk SDK installation
   - API key setup
3. **Configuration**
   - Email driver configuration
   - Plunk-specific settings
   - Environment variables
4. **Integration with Email OTP**
   - Configure Plunk for OTP emails
   - Template setup
5. **Integration with Password Auth**
   - Configure Plunk for password reset emails
   - Configure Plunk for verification emails
6. **Email Templates**
   - Default templates
   - Custom templates
   - Template variables
7. **Testing**
   - Test email sending
   - Debug email delivery
8. **Best Practices** (see Section 5 for outline)
9. **Comparison: Plunk vs Resend**
   - Features comparison
   - Pricing comparison
   - When to use each
10. **Examples** - Complete email integration

**Cross-references:**
- Link to `/docs/how-to-guides/auth/email-otp.md` (Email OTP)
- Link to `/docs/reference/auth-module.md` (email configuration)
- Link to Resend documentation (existing provider)

**Navigation placement:**
- Create new group "Integrations" under "How-to Guides"
- Or add to "Authentication" group as it's auth-related
- Recommend: Add to "Integrations" group with other third-party integrations

### 2.6 Updated Configuration Reference (Week 2)

**File Path:** `/docs/reference/configuration.md` (NEW FILE)

**Purpose:** Centralized reference for all configuration options

**Structure:**
1. **Overview** - Configuration file structure
2. **Top-level Options**
   - `connection` - database connection
   - `config` - app configuration
   - `options` - runtime options
3. **Connection Configuration**
   - Database URL formats
   - Adapter options (`pgPostgres`, `postgresJs`)
   - Browser configuration (`BkndBrowserApp`)
4. **Config Sections**
   - `data` - entities and fields
   - `auth` - authentication strategies and options
   - `media` - file upload settings
   - `admin` - Admin UI settings
5. **Auth Configuration** (comprehensive)
   - JWT settings
   - Cookie settings
   - Strategies (password, OAuth, email OTP)
   - Roles and permissions
   - Email providers (Resend, Plunk)
6. **Options**
   - `mode` (db, code, hybrid)
   - `seed` functions
   - `manager` options
7. **New in v0.20.0**
   - `default_role_register`
   - Password `minLength`
   - MCP navigation
   - Hybrid mode improvements
8. **Environment Variables**
   - List of all supported env vars
   - Default values
9. **Examples** - Complete configuration files
10. **Migration Notes** - Changes from previous versions

**Cross-references:**
- Link to all reference docs (auth, data, schema)
- Link to `/docs/how-to-guides/setup/choose-your-mode.md`
- Link to migration guides

**Navigation placement:**
- Add to Reference group in `docs.json`
- Position first (before auth-module)

## Section 3: Structure & Organization

### 3.1 File Structure

```
docs/
├── index.md
├── migration-guides/                          # NEW DIRECTORY
│   └── postgres-package-merge.md              # NEW FILE
├── getting-started/
│   ├── build-your-first-api.md
│   ├── add-authentication.md
│   └── deploy-to-production.md
├── how-to-guides/
│   ├── setup/
│   │   ├── choose-your-mode.md
│   │   └── integrations/
│   │       ├── nextjs.md
│   │       ├── vite-react.md
│   │       ├── react-router.md
│   │       ├── astro.md
│   │       ├── bun-node.md
│   │       ├── cloudflare-workers.md
│   │       ├── aws-lambda.md
│   │       ├── docker.md
│   │       ├── sveltekit.md                   # NEW FILE
│   │       └── browser-sqlocal.md             # NEW FILE
│   ├── auth/
│   │   ├── create-first-user.md
│   │   ├── public-access-guard.md
│   │   └── email-otp.md                       # NEW FILE
│   ├── data/
│   │   ├── seed-database.md
│   │   ├── entity-media-relationships.md
│   │   └── schema-ids-vs-uuids.md
│   ├── permissions/
│   │   └── public-access-guard.md
│   └── integrations/                          # NEW DIRECTORY (optional)
│       └── plunk-email.md                     # NEW FILE
├── architecture-and-concepts/
│   ├── what-is-bknd.md
│   └── how-bknd-works.md
├── reference/
│   ├── configuration.md                       # NEW FILE
│   ├── auth-module.md
│   ├── data-module.md
│   ├── react-sdk-reference.md
│   ├── entity-manager-api.md
│   ├── orm.md
│   ├── query-system.md
│   └── schema.md
└── troubleshooting/
    ├── common-issues.md
    └── known-issues.md
```

### 3.2 Naming Conventions

- **Migration guides:** Use `[feature]-migration.md` or specific name like `postgres-package-merge.md`
- **Integration guides:** Use `[framework].md` (lowercase, hyphenated) - e.g., `sveltekit.md`, `browser-sqlocal.md`
- **Feature guides:** Use `[feature].md` (lowercase, hyphenated) - e.g., `email-otp.md`, `plunk-email.md`
- **Reference docs:** Use `[topic].md` (lowercase, hyphenated) - e.g., `configuration.md`
- Maintain consistency with existing naming: `kebab-case.md`

### 3.3 Navigation Hierarchy (docs.json)

**Updated Navigation Structure:**

```json
{
  "navigation": {
    "groups": [
      {
        "group": "Migration Guides",
        "pages": [
          "migration-guides/postgres-package-merge"
        ]
      },
      {
        "group": "Getting Started",
        "pages": [
          "index",
          "onboarding-flow",
          "architecture-and-concepts/what-is-bknd",
          "getting-started/build-your-first-api",
          "getting-started/add-authentication",
          "getting-started/deploy-to-production"
        ]
      },
      {
        "group": "How-to Guides",
        "pages": [
          {
            "group": "Setup",
            "pages": [
              "how-to-guides/setup/choose-your-mode",
              {
                "group": "Integrations",
                "pages": [
                  "how-to-guides/setup/integrations/nextjs",
                  "how-to-guides/setup/integrations/vite-react",
                  "how-to-guides/setup/integrations/react-router",
                  "how-to-guides/setup/integrations/sveltekit",
                  "how-to-guides/setup/integrations/astro",
                  "how-to-guides/setup/integrations/bun-node",
                  "how-to-guides/setup/integrations/cloudflare-workers",
                  "how-to-guides/setup/integrations/aws-lambda",
                  "how-to-guides/setup/integrations/docker",
                  "how-to-guides/setup/integrations/browser-sqlocal"
                ]
              }
            ]
          },
          {
            "group": "Authentication",
            "pages": [
              "how-to-guides/auth/create-first-user",
              "how-to-guides/auth/email-otp",
              "how-to-guides/permissions/public-access-guard"
            ]
          },
          {
            "group": "Integrations",
            "pages": [
              "how-to-guides/integrations/plunk-email"
            ]
          },
          {
            "group": "Data",
            "pages": [
              "how-to-guides/data/seed-database",
              "how-to-guides/data/entity-media-relationships",
              "how-to-guides/data/schema-ids-vs-uuids"
            ]
          }
        ]
      },
      {
        "group": "Architecture & Concepts",
        "pages": [
          "architecture-and-concepts/what-is-bknd",
          "architecture-and-concepts/how-bknd-works"
        ]
      },
      {
        "group": "Reference",
        "pages": [
          "reference/configuration",
          "reference/auth-module",
          "reference/data-module",
          "reference/react-sdk-reference",
          "reference/entity-manager-api",
          "reference/orm",
          "reference/query-system",
          "reference/schema"
        ]
      },
      {
        "group": "Troubleshooting",
        "pages": [
          "troubleshooting/common-issues",
          "troubleshooting/known-issues"
        ]
      },
      {
        "group": "Comparisons",
        "pages": [
          "comparisons/bknd-comparison-pocketbase"
        ]
      }
    ]
  }
}
```

### 3.4 Cross-References

**Create a cross-reference matrix for new content:**

| New File | Should Link To | Should Be Linked From |
|----------|---------------|----------------------|
| `migration-guides/postgres-package-merge.md` | Integration guides (Next.js, etc.), configuration reference | `index.md`, integration guides, deploy-to-production |
| `how-to-guides/setup/integrations/sveltekit.md` | Reference docs (auth, data), framework comparison | `index.md`, framework comparison |
| `how-to-guides/setup/integrations/browser-sqlocal.md` | Reference docs (data module), choose-your-mode | `index.md`, choose-your-mode |
| `how-to-guides/auth/email-otp.md` | Auth module reference, Plunk guide, create-first-user | `index.md`, add-authentication, auth module reference |
| `how-to-guides/integrations/plunk-email.md` | Email OTP guide, auth module reference | `index.md`, email-otp guide |
| `reference/configuration.md` | All reference docs, how-to guides | `index.md`, all getting-started guides |

**Existing files to add links:**

1. `/docs/index.md`
   - Add link to Migration Guides (new group) in "Getting Started" section
   - Add Email OTP link to "Authentication & Permissions" section
   - Add SvelteKit to "Integration Guides"
   - Add Browser/SQLocal to "Integration Guides"

2. `/docs/how-to-guides/setup/integrations/framework-comparison.md`
   - Add SvelteKit comparison row
   - Add Browser mode row (with SQLocal)
   - Update comparison matrix

3. `/docs/getting-started/add-authentication.md`
   - Add section: "Alternatives to Password Auth"
   - Link to Email OTP guide

4. `/docs/reference/auth-module.md`
   - Add section: "Email OTP Strategy" (or link to separate guide)
   - Add "See Also: Email OTP Guide"

5. `/docs/how-to-guides/setup/choose-your-mode.md`
   - Add Browser mode to decision tree
   - Add Browser mode to deployment approaches

### 3.5 Version Documentation Strategy

**Recommendation:** Create a `/docs/releases/` directory for version-specific notes

```
docs/
└── releases/
    └── v0.20.0-release-notes.md
```

**Content of v0.20.0-release-notes.md:**
- Quick summary of all changes
- Links to migration guides
- Links to new feature documentation
- Changelog format

**Cross-reference:** Link from `index.md` to release notes

## Section 4: Implementation Priorities

Given the **urgent 1-2 week timeline** and the need to support active users in migration, prioritize as follows:

### Week 1: Critical Path (Must Complete)

**Priority 1: Breaking Change Migration (Day 1-2)**
1. ✅ Create `/docs/migration-guides/postgres-package-merge.md`
2. ✅ Update `/docs/architecture-and-concepts/how-bknd-works.md` (line 250)
3. ✅ Update `/docs/how-to-guides/setup/integrations/nextjs.md` (PostgreSQL section)
4. ✅ Update `/docs/getting-started/deploy-to-production.md` (database config)
5. ✅ Update `docs.json` to add Migration Guides group

**Priority 2: Auth Module Updates (Day 2-3)**
1. ✅ Update `/docs/reference/auth-module.md` (new config options, logout, readOneBy)
2. ✅ Update `/docs/reference/data-module.md` (readOneBy method)
3. ✅ Update `/docs/reference/react-sdk-reference.md` (logout method)

**Priority 3: Integration Guides - SvelteKit (Day 3-4)**
1. ✅ Create `/docs/how-to-guides/setup/integrations/sveltekit.md`
2. ✅ Update `docs.json` to include SvelteKit guide
3. ✅ Update `/docs/how-to-guides/setup/integrations/framework-comparison.md`
4. ✅ Add SvelteKit link to `/docs/index.md`

### Week 2: Parallel Work (Can Be Done Simultaneously)

**Priority 4: New Features (Day 5-7)**
1. ✅ Create `/docs/how-to-guides/auth/email-otp.md`
2. ✅ Create `/docs/how-to-guides/integrations/plunk-email.md`
3. ✅ Update `docs.json` to include new guides
4. ✅ Update `/docs/index.md` with new links

**Priority 5: Browser/SQLocal Support (Day 5-7)**
1. ✅ Create `/docs/how-to-guides/setup/integrations/browser-sqlocal.md`
2. ✅ Update `docs.json` to include Browser guide
3. ✅ Update `/docs/index.md` with Browser mode link

**Priority 6: Minor Features & Improvements (Day 6-9)**
1. ✅ Update `/docs/how-to-guides/setup/choose-your-mode.md` (hybrid mode improvements)
2. ✅ Update `/docs/reference/data-module.md` (auto-join documentation)
3. ✅ Update `/docs/reference/query-system.md` (auto-join examples)
4. ✅ Update `/docs/how-to-guides/data/entity-media-relationships.md` (auto-join + overwrite)
5. ✅ Update `/docs/architecture-and-concepts/how-bknd-works.md` (MCP navigation)
6. ✅ Update `/docs/reference/schema.md` (schema permissions)
7. ✅ Update `/docs/reference/auth-module.md` (schema permissions)
8. ✅ Update `/README.md` (Apache 2.0 license)

**Priority 7: Consolidated Reference (Day 8-10)**
1. ✅ Create `/docs/reference/configuration.md` (centralized config reference)
2. ✅ Update `docs.json` to include configuration reference
3. ✅ Add cross-links from existing docs to new config reference

**Priority 8: Release Notes & Polish (Day 9-10)**
1. ✅ Create `/docs/releases/v0.20.0-release-notes.md`
2. ✅ Review all cross-references
3. ✅ Update navigation hierarchy if needed
4. ✅ Final review of all new files

### Deferred (Post-Launch)

- Enhanced examples for complex features
- Video tutorials or interactive demos
- Migration scripts or tools
- Performance benchmarking guides
- Advanced customization guides

### Dependencies

**Blockers:**
- Migration guide must be complete before any PostgreSQL documentation updates
- Auth module updates should be done before Email OTP guide
- Configuration reference should be created after all other docs are updated

**Parallel Opportunities:**
- SvelteKit and Browser/SQLocal guides can be written simultaneously (different authors)
- Email OTP and Plunk guides can be written simultaneously
- Minor feature updates across multiple files can be done in parallel

## Section 5: Best Practices (Email OTP & Plunk)

This section outlines what content should be covered in the best practices sections of the Email OTP and Plunk guides. **Do not write the actual content.**

### 5.1 Email OTP Best Practices

**Structure to be covered:**

1. **Security Best Practices**
   - OTP generation: length, character set, entropy
   - TTL configuration: recommended values vs. user experience trade-offs
   - Rate limiting: prevent brute force attacks
   - OTP storage: hashing vs. plain text (recommendation)
   - OTP uniqueness: preventing collision attacks
   - Session management: after OTP verification
   - Auto-invalidation: why and when to use

2. **User Experience Best Practices**
   - OTP delivery time expectations
   - Clear user instructions in email templates
   - Error messages: generic vs. specific
   - Resend flow: cooldown period and limits
   - Mobile vs. desktop UX considerations
   - Copy-paste convenience (auto-focus on input field)
   - Accessibility: screen reader support

3. **Email Deliverability Best Practices**
   - Subject line optimization
   - Email template design (plain text vs. HTML)
   - SPF/DKIM/DMARC configuration
   - Avoiding spam filters
   - Testing deliverability across providers (Gmail, Outlook, etc.)
   - Handling bounced emails
   - Monitoring delivery rates

4. **Configuration Best Practices**
   - TTL settings: balancing security and UX
   - OTP length vs. memorability
   - Character set selection (digits-only vs. alphanumeric)
   - Resend limits and cooldown periods
   - Custom domain usage for email
   - Template localization (i18n support)

5. **Performance Best Practices**
   - Caching OTP generation results
   - Async email sending (don't block on email delivery)
   - Database indexing for OTP lookups
   - Queue management for high-volume OTP requests
   - Monitoring OTP generation rates

6. **Monitoring and Logging**
   - What to log: OTP requests, deliveries, verifications, failures
   - Sensitive data: what NOT to log (actual OTP values)
   - Metrics to track: success rate, delivery time, resend rate
   - Alert thresholds: abnormal OTP generation, delivery failures
   - Audit trails: for compliance

7. **Compliance Considerations**
   - GDPR: user consent for email communications
   - Data retention: how long to keep OTP logs
   - User rights: opt-out from OTP emails
   - Regional restrictions: SMS OTP alternatives for regulated markets
   - Accessibility compliance (WCAG)

8. **Migration from Password Auth**
   - Hybrid auth: support both password and OTP during transition
   - Migrating existing users to OTP
   - Handling user pushback
   - Security implications of dual auth methods

9. **Troubleshooting Common Issues**
   - OTP not received (checklist)
   - OTP expired before use
   - Rate limiting blocking legitimate users
   - Email provider downtime
   - User confusion about OTP process

10. **Testing Strategies**
    - Unit tests: OTP generation and validation logic
    - Integration tests: email delivery mocking
    - E2E tests: complete OTP flow
    - Load testing: high-volume OTP generation
    - Security testing: brute force, timing attacks

### 5.2 Plunk Email Provider Best Practices

**Structure to be covered:**

1. **Setup and Configuration Best Practices**
   - API key management: storage, rotation, scoped keys
   - Environment variable naming conventions
   - Organization/team setup in Plunk dashboard
   - Billing and quota monitoring
   - Sandbox vs. production separation

2. **Email Template Best Practices**
   - Template organization in Plunk dashboard
   - Dynamic variables: naming, validation, documentation
   - Reusable template components
   - A/B testing: subject lines, content, timing
   - Mobile-responsive design
   - Dark mode support
   - Plain text fallbacks

3. **Deliverability Best Practices**
   - Domain authentication (SPF, DKIM, DMARC)
   - Sender reputation management
   - Warming up new domains
   - Monitoring bounce rates
   - Handling unsubscribes and complaints
   - IP warming (if applicable)
   - Feedback loop processing

4. **Performance Best Practices**
   - Batch sending: grouping emails for efficiency
   - Async sending: non-blocking API calls
   - Retry strategies: exponential backoff, max retries
   - Queue management for high-volume sending
   - Webhooks: processing events asynchronously
   - Rate limiting: respecting Plunk API limits

5. **Cost Optimization**
   - Understanding Plunk pricing tiers
   - Monitoring usage vs. quota
   - Email size optimization
   - Template caching
   - Free tier limitations and upgrade triggers

6. **Security Best Practices**
   - API key permissions (least privilege)
   - Webhook signature verification
   - Data masking in logs
   - Preventing email injection attacks
   - Secure handling of email content
   - Compliance with data protection laws

7. **Monitoring and Analytics**
   - Key metrics to track: delivery rate, open rate, click rate, bounce rate
   - Setting up dashboards in Plunk dashboard
   - Custom event tracking
   - Real-time alerts for failures
   - A/B testing analytics
   - Geographic delivery analysis

8. **Integration Best Practices**
   - Webhook configuration: endpoints, retry policy, timeout
   - Event handling: tracking events (delivered, opened, clicked, bounced)
   - Error handling: retry logic, fallback providers
   - Transaction ID tracking for debugging
   - Idempotent sending (prevent duplicates)
   - Testing in sandbox mode

9. **Troubleshooting Common Issues**
   - Emails not delivered (checklist: domain health, content, recipients)
   - API rate limits exceeded
   - Template rendering errors
   - Webhook delivery failures
   - Formatting issues across email clients
   - Locale-specific problems

10. **Migration from Other Providers**
    - Resend to Plunk migration: differences, equivalent features
    - SendGrid/Mailgun to Plunk: migration considerations
    - Data migration: unsubscribes, templates, logs
    - Dual-sending during transition
    - Cost comparison

11. **Advanced Features**
    - Webhook event types and handling
    - Custom domain configuration
    - Multi-tenant setups
    - White-labeling options
    - Custom tracking parameters
    - Automated drip campaigns

12. **Compliance and Legal**
    - GDPR: consent management, data deletion requests
    - CAN-SPAM Act: compliance requirements
    - Unsubscribe mechanisms: mandatory and recommended
    - Data retention: email logs, metadata
    - Privacy policy updates

## Success Metrics

### Documentation Completeness

- [ ] All breaking changes documented (Migration guide created)
- [ ] All new integration guides created (SvelteKit, Browser/SQLocal)
- [ ] All new features documented (Email OTP, Plunk, etc.)
- [ ] All existing docs updated for v0.20.0 changes
- [ ] Cross-references implemented across all new content
- [ ] Navigation hierarchy updated in `docs.json`

### Migration Readiness

- [ ] Postgres package migration guide is clear and actionable
- [ ] Code examples for migration are accurate
- [ ] Troubleshooting section covers common migration issues
- [ ] All PostgreSQL adapter usage updated across docs

### User Experience

- [ ] Navigation structure is logical and discoverable
- [ ] Cross-references make related content easy to find
- [ ] Best practices sections are comprehensive (not just written)
- [ ] Examples are realistic and copy-pasteable
- [ ] Terminology is consistent across all docs

### Quality Assurance

- [ ] All links verify (no broken links)
- [ ] Code examples are syntactically correct
- [ ] Configuration options are accurate
- [ ] No contradictory information between docs
- [ ] File structure follows established conventions

## Open Questions

1. **Email OTP Implementation Details:**
   - What is the exact API for requesting OTPs? (Need bknd source or examples)
   - What is the exact TTL range and default value?
   - What template variables are available for OTP emails?
   - Is OTP generation rate-limited? If so, what are the limits?

2. **Plunk Integration Details:**
   - What is the exact configuration syntax for Plunk as email provider?
   - Are there Plunk-specific options vs. generic email provider options?
   - How does Plunk compare feature-wise with Resend?
   - Are there any known limitations when using Plunk?

3. **Browser/SQLocal Implementation:**
   - What is the exact API for `BkndBrowserApp`?
   - What is the exact configuration for `OpfsStorageAdapter`?
   - How do you persist data to file system from browser?
   - What are the exact limitations of browser mode?

4. **SvelteKit Adapter:**
   - What is the exact adapter import path for SvelteKit?
   - Are there SvelteKit-specific config options?
   - How does SvelteKit's load system integrate with Bknd?
   - What is the pattern for type generation in SvelteKit?

5. **Hybrid Mode Improvements:**
   - What exactly does "reader returns objects" mean? Return type?
   - What triggers the `sync_required` flag?
   - What are the "better config handling" improvements?
   - How does the sync behavior change from v0.19.x?

6. **Auto-Join Behavior:**
   - What are the exact conditions for auto-join to trigger?
   - Are there performance implications or best practices?
   - Can auto-join be disabled or controlled?
   - Does auto-join work with deeply nested relationships?

7. **MCP Navigation:**
   - What is MCP exactly? (Model Context Protocol - need more context)
   - How does MCP integrate with Admin UI navigation?
   - What are the configuration options for MCP?
   - Is MCP a first-class feature or experimental?

8. **Documentation Content:**
   - Should we include code snippets from bknd source code examples?
   - What is the target audience technical level for Email OTP guide?
   - How much detail should best practices sections have?
   - Should we include comparison tables with other frameworks/tools?

9. **Implementation Priorities:**
   - Are any of the v0.20.0 features experimental or unstable?
   - Should we document features that are marked as experimental?
   - Is there a beta release we should document separately?

10. **Release Coordination:**
    - When is the official v0.20.0 release?
    - Are there any breaking changes beyond the Postgres package merge?
    - Should we wait for official release notes before finalizing docs?
    - Is there a bknd team member we should consult for technical details?

## Conclusion

This PRD provides a comprehensive structural plan for updating the supplemental-bknd-docs repository to align with Bknd v0.20.0. The plan prioritizes breaking changes (Postgres package merge) to support active user migration, while also providing coverage for all new features.

**Key Deliverables:**
- 1 migration guide
- 4 new integration guides (SvelteKit, Browser/SQLocal, Email OTP, Plunk)
- 1 new configuration reference
- Updates to 10+ existing documentation files
- Reorganized navigation hierarchy
- Comprehensive cross-references

**Recommended Next Steps:**
1. Review and approve this PRD
2. Resolve open questions with bknd team or source code research
3. Begin Week 1 priority tasks (migration guide, auth updates)
4. Assign parallel work for Week 2 (new feature guides)
5. Implement best practices content for Email OTP and Plunk
6. Conduct quality assurance and link verification
7. Prepare for v0.20.0 release announcement

**Success Criteria:**
All documentation is updated within 2 weeks, with migration guidance available at release time and comprehensive coverage of new features following shortly after.
