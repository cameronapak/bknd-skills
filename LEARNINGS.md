# Learnings

## Task 1.3: "Choose Your Mode" Decision Tree

### Bknd Mode Terminology
- **UI-only mode** (default): Configuration stored in database (`__bknd` config table), managed through Admin UI. Internally referred to as "db mode" in `options.mode: "db"`.
- **Code-only mode**: Configuration from initial config object, immutable. `options.mode: "code"`.
- **Hybrid mode**: Combine both - visual dev (db mode) + code production (code mode) with automatic mode switching.

### CLI Commands
- Export config: `npx bknd config --out appconfig.json` (not `export` subcommand)
- Export secrets: `npx bknd secrets --out .env.local --format env`
- Generate types: `npx bknd types --out bknd-types.d.ts`
- Sync database: `npx bknd sync --force`

### Mode Helpers
Bknd provides `code()` and `hybrid()` helpers from `bknd/modes` that:
- Automatically sync config, types, and secrets
- Handle mode switching automatically in hybrid mode
- Skip config validation in production for performance
- Require `writer` (and `reader` for hybrid) adapters for syncing

### Schema Syncing
In Code-only mode, schema changes require manual syncing with `npx bknd sync --force`. The `--force` flag is required for schema mutations.

## Task 1.5: "Create First User" Guide

### Key Discovery: Multiple User Creation Methods

Bknd provides three distinct ways to create users, each suited for different use cases:

1. **Admin UI**: Visual method (exact workflow unclear - requires testing)
2. **CLI**: Best for initial setup and admin users (`npx bknd user create`)
3. **Programmatic**: For application code (App.createUser, UserPool, EntityManager)

### CLI User Creation Details

The CLI command `npx bknd user create` is well-documented in source code:
- Location: `app/src/cli/commands/user.ts`
- Prompts for: role (optional), email, password
- Validates email format and password length (min 3 characters)
- Returns success message: "Created user: {email}"
- Requires auth enabled and password strategy configured

Additional CLI commands available:
- `npx bknd user update` - Update user password
- `npx bknd user token` - Generate JWT token (Node.js only, not Bun)

### Programmatic User Creation Patterns

Three levels of programmatic control:

1. **Helper method** (simplest):
   ```typescript
   app.createUser({ email, password, role })
   ```

2. **UserPool** (more control):
   ```typescript
   auth.userPool.create("password", { email, strategy_value, role })
   ```

3. **EntityManager** (full control, but requires manual password hashing):
   ```typescript
   em.repo("users").insertOne({ email, strategy, strategy_value })
   ```

### Important Implementation Details

- **Password hashing**: When using EntityManager directly, you must hash passwords using the configured PasswordStrategy
- **strategy_value field**: This field stores the hashed password (for password strategy) or other auth identifiers
- **UserPool.toggleStrategyValueVisibility()**: Internal method that temporarily exposes hidden fields during user creation
- **Role assignment**: Users store role as a string field, not a relation to a separate Role entity

### Auth Configuration Requirements

For user creation to work, auth module needs:
- `enabled: true`
- At least one strategy configured (password, oauth, custom_oauth)
- Entity name defaults to "users" but can be customized

### Unknown Areas Requiring Testing

1. **Admin UI user creation**: Exact workflow unclear - need to test actual UI to document properly
2. **Custom user fields**: How to add custom fields to user entity (beyond default email/role)
3. **OAuth user creation**: How users are created through OAuth providers
4. **Password validation**: Production-ready password requirements (CLI only validates length >= 3)

### Documentation Pattern: Be Explicit About Unknowns

When API/feature behavior is unclear based on available documentation:
- Create a dedicated "What we don't know" section
- Use clear TODO markers
- Provide workarounds if possible
- Encourage community contributions to fill gaps

Example from "Create First User" guide:
```
**Status**: ⚠️ Unable to confirm exact workflow

**What we know:**
- Admin UI is accessible at `/admin` by default
- The Admin UI can manage data including users

**What we don't know:**
- Exact location of user creation in Admin UI
- Required fields in the Admin UI form

**TODO**: This section needs to be updated after testing...
```

### Source Code Locations

Key files for understanding user creation:
- `app/src/cli/commands/user.ts` - CLI user commands
- `app/src/auth/AppUserPool.ts` - UserPool implementation
- `app/src/auth/auth-schema.ts` - Auth configuration schema
- `app/src/auth/auth-entities.ts` - User entity definition

### Next Steps for Better Documentation

1. Test Admin UI user creation to fill unknown details
2. Document custom user field configuration
3. Add examples for OAuth user creation
4. Document password validation best practices for production
5. Create comparison table showing when to use each user creation method

## Task 1.1: "Build Your First API" Tutorial

### Critical Gap: Admin UI Entity Creation Workflow

The most significant finding is that the official documentation does not provide clear steps for creating entities in the Admin UI. The `/extending/admin` documentation focuses on **customizing** the Admin UI (headers, footers, actions, field rendering) but not on the **basic workflow** of creating entities and fields.

### What We Know

1. **Vite Integration Setup**: Complete and documented
   - `bknd.config.ts` configuration for Vite
   - `server.ts` with `serve()` from `bknd/adapter/vite`
   - `vite.config.ts` with `devServer()` plugin
   - Adding `<Admin withProvider />` to render the UI

2. **SDK Usage**: Well-documented at `/usage/sdk`
   - `Api` class initialization
   - `api.data.readMany`, `createOne`, `updateOne`, `deleteOne`
   - `api.auth.login`, `register`, `logout`, `me`
   - `api.media.upload`, `download`, `listFiles`

3. **CLI Commands**: Well-documented at `/usage/cli`
   - `npx bknd run` - start instance
   - `npx bknd types` - generate types
   - `npx bknd config --out file.json` - export config
   - `npx bknd user create` - create users (see Task 1.5 learnings)

4. **Auth Module Configuration**: Partially documented
   - Enable auth in `bknd.config.ts`:
     ```typescript
     config: {
       auth: {
         enabled: true,
         jwt: { issuer: "app-name" }
       }
     }
     ```
   - User creation methods documented in Task 1.5

### What We Don't Know (Critical Gaps)

1. **Admin UI Entity Creation Workflow**:
   - Where is the "Create Entity" button/menu?
   - What field types are available in the UI? (Text, Number, Boolean, Date, Enum, JSON, JSONSchema)
   - How do you set field properties (required, unique, default value)?
   - How do you create relationships between entities in the UI?
   - Is there a schema preview or validation before saving?

2. **Admin UI User Management**:
   - How do you create the first admin user through the Admin UI (not CLI)?
   - Is there a special "Setup" flow for initial user creation?
   - What permissions/roles can you assign through the UI?

3. **Initial Setup Flow**:
   - Does the Admin UI guide you through first-time setup?
   - Is there a "Getting Started" wizard in the UI?

### Documentation Pattern: "What We Don't Know" Sections

For complex topics where official documentation is incomplete, use this structure:

```markdown
## Step X: [Topic]

**UNKNOWN: This section requires more research.**

**What I know:**
- Fact 1 with source
- Fact 2 with source

**What I don't know:**
- Critical missing detail 1
- Critical missing detail 2

**Workaround:** If available, provide alternative approach
**TODO:** What needs to be researched next
```

This pattern:
- Is honest about documentation gaps
- Provides the information we do have
- Makes it clear what's missing
- Doesn't mislead users
- Encourages community contributions

### Vite + React Integration Details

The Vite integration is well-documented at `/integration/vite`:
- Requires `@hono/vite-dev-server` dependency
- Node.js 22+ required
- Uses custom dev server plugin for hot reloading
- Default port is 5174 (not 5173)
- API available at `/api/*` routes
- Admin UI available at root `/`

### Type Generation

CLI command `npx bknd types` generates `bknd-types.d.ts` with:
- `BkndEntity<T>` - Selectable (read)
- `BkndEntityCreate<T>` - Insertable (create)
- `BkndEntityUpdate<T>` - Updateable (update)
- Global module augmentation for type safety

Must include in `tsconfig.json`:
```json
{
  "include": ["bknd-types.d.ts"]
}
```

### Test Checklist Pattern

Create `.test.md` files alongside tutorials to validate each step. The checklist should:
- Mark testable steps with checkboxes
- Clearly mark "CANNOT TEST" sections where we don't know the workflow
- Include "Known Issues" section
- Note what prevents complete testing

### Source Code Locations for Future Research

To fill the gaps, investigate these files:
- `app/src/ui/admin/` - Admin UI React components (look for entity creation)
- `app/src/ui/components/` - Reusable UI components
- `examples/` - Integration examples (may have workflows)
- `app/src/modules/ModuleManager.ts` - Module system understanding

### Recommendation: Test-Driven Documentation

For the next tutorial iteration:
1. Run `npx bknd run` to start actual instance
2. Follow the tutorial steps in a fresh environment
3. Document what actually works vs what the docs say
4. Update tutorial with verified steps
5. Identify where docs need improvement upstream

This approach ensures accuracy and reveals gaps that pure documentation reading cannot.

## Task 1.6: Set up Documentation Structure

### Mintlify Configuration: docs.json

Mintlify uses `docs.json` as the primary configuration file (replaced `mint.json`). This file controls:

**Required Properties:**
- `name` - Documentation site name
- `logo` - Light/dark logo variants
- `favicon` - Site favicon
- `colors` - Primary, light, dark colors for theming
- `navigation` - Complete navigation structure

**Navigation Structure:**
- `groups` - Main sidebar sections with icons
- Nested `groups` within `groups` - Multi-level organization
- `pages` - Array of file paths (relative to docs root)
- Top-level `groups` are always expanded
- Nested `groups` have optional `expanded: false` to collapse by default

**Directory Organization:**
Based on Mintlify docs, organize by documentation types:
- `getting-started/` - Tutorials (15 min step-by-step)
- `how-to-guides/` - Task-oriented guides with subdirectories
- `architecture-and-concepts/` - Explanations of how Bknd works
- `reference/` - API/module documentation
- `troubleshooting/` - FAQ and known issues
- `comparisons/` - Bknd vs alternatives

**Key Files Required:**
- `docs.json` - Navigation configuration
- Logo files in `logo/` directory
- MDX files for each page (not markdown)
- Frontmatter in each page with `title` and `description`

**Navigation Best Practices:**
1. Keep main sections to ~5-7 top-level groups
2. Nest related guides under logical subgroups
3. Use consistent ordering across docs
4. Add stub pages for planned content to visualize structure

**Unknown Areas:**
- How to add custom icons for navigation groups
- Whether to use `.mdx` or `.md` (Mintlify docs mention `.mdx`)
- Meta.json vs frontmatter configuration
- OpenAPI integration for API reference section

### Mintlify CLI Commands

Based on quickstart docs:
- `npm i -g mint` - Install CLI globally (requires Node.js v20.17+)
- `mint dev` - Preview documentation locally at `http://localhost:3000`
- Web editor available at `mintlify.com/editor` for browser-based editing
- Automatic deployment on git push when GitHub App installed

### Critical Insight: Bknd Doesn't Use Mintlify

After reviewing Bknd repository's `docs/source.config.ts`, Bknd uses **Fumadocs** (not Mintlify) for their official documentation:
- Uses `fumadocs-mdx/config` and related packages
- Custom configuration with remark/rehype plugins
- Next.js-based documentation site
- MDX support with twoslash for TypeScript examples

**Implication:**
Our supplemental docs can use Mintlify independently of Bknd's official docs. The structure I created (`docs.json`) is correct for a Mintlify-based site that complements the official documentation.

## Task 2.1: "Enable Public Access with Guard" Guide

### Key Discovery: Guest Access Through Default Roles

Bknd provides a robust system for public (unauthenticated) access through the Guard authorization system and role-based access control (RBAC):

**How Guest Access Works:**
1. Guard checks user context for `role` property
2. If no explicit role, falls back to **default role** (configured with `is_default: true`)
3. If no default role exists, user has no role (cannot access anything with Guard enabled)
4. Default role permissions determine what unauthenticated users can access

### Role Configuration Properties

Based on `app/src/auth/authorize/Role.ts` and `app/src/auth/auth-schema.ts`:

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `name` | string | required | Identifies the role |
| `is_default` | boolean | false | Assigned to users without explicit roles |
| `implicit_allow` | boolean | false | Allows all unspecified permissions (use with caution) |
| `permissions` | RolePermission[] | [] | Permissions and policies for this role |

### Permission System Architecture

The Guard system consists of four layers:
1. **Permissions** - Define actionable rights (e.g., `entityRead`, `entityCreate`)
2. **Policies** - Apply contextual rules with three effects: `allow`, `deny`, `filter`
3. **Roles** - Aggregate permissions into logical groups
4. **Guard** - Enforces authorization checks at runtime

### Built-in Permissions

From `app/src/auth/auth-permissions.ts`:

**Auth Permissions (non-filterable):**
- `createUser` - Create new users
- `testPassword` - Test password validity
- `changePassword` - Change user passwords
- `createToken` - Generate authentication tokens

**Data Permissions (all filterable):**
- `entityRead` - Read entity records
- `entityCreate` - Create entity records
- `entityUpdate` - Update entity records
- `entityDelete` - Delete entity records

### Policy Effects

Policies support three distinct effects for controlling access:

| Effect | Behavior | Use Case |
|--------|----------|----------|
| `allow` | Grants access when condition is met | Explicit permission grant |
| `deny` | Revokes access (takes precedence) | Security overrides |
| `filter` | Filters data based on query criteria | Row-level security (RLS) |

### Guest Access Configuration Pattern

**Best practice configuration for guest access:**

```typescript
roles: [
  {
    name: "guest",
    is_default: true,
    implicit_allow: false, // Explicit permissions required
    permissions: [
      {
        permission: "entityRead",
        effect: "allow",
        policies: [
          {
            condition: { entity: "posts" },
            effect: "filter",
            filter: { published: true }, // Only see published posts
          },
        ],
      },
      // No entityCreate/entityUpdate/entityDelete permissions
    ],
  },
]
```

### Firebase vs Bknd Comparison

Key architectural differences in access control:

| Aspect | Firebase | Bknd |
|--------|----------|------|
| **Access Control Model** | Security Rules (rule-first) | Guard + Roles (role-first) |
| **Public Access** | `allow read, write: if true` | Default role with permissions |
| **Granularity** | Rule-based conditions | Role-based with policy conditions |
| **Configuration** | Security Rules language | TypeScript/JSON in code |
| **Type Safety** | Limited (string-based) | Strong (typed permissions) |
| **Testing** | Firebase Emulator | Programmatic `granted()`/`filters()` |
| **RLS** | Yes, via rules | Yes, via filter policies |
| **Compilation** | Deploy-time | Build-time (code mode) |

### Guard Methods

From `app/src/auth/authorize/Guard.ts`:

**`granted(permission, context, contextData?)`**
- Throws `GuardPermissionsException` if access denied
- Checks role exists and has permission
- Evaluates all policies in role permission
- Supports `implicit_allow` for trusted roles

**`filters(permission, context, contextData?)`**
- Returns RLS filter objects for data queries
- Merges user filters with policy filters
- Supports `merge()` method to combine filters
- Provides `matches()` method to test objects against filters

### Common Access Patterns

**1. Public Read, Private Write:**
```typescript
{
  permissions: [
    {
      permission: "entityRead",
      effect: "allow",
      policies: [
        {
          condition: { entity: "posts" },
          effect: "filter",
          filter: { published: true },
        },
      ],
    },
    // No create/update/delete permissions
  ],
}
```

**2. Tenant Isolation:**
```typescript
{
  permissions: [
    {
      permission: "entityRead",
      effect: "allow",
      policies: [
        {
          condition: { entity: "posts" },
          effect: "filter",
          filter: {
            $or: [
              { published: true }, // Public posts
              { tenant_id: "$user.id" }, // User's own posts
            ],
          },
        },
      ],
    },
  ],
}
```

**3. Time-Limited Access:**
```typescript
{
  permissions: [
    {
      permission: "entityRead",
      effect: "allow",
      policies: [
        {
          condition: {
            entity: "events",
            now: { $lte: "date" }, // Can only see past events
          },
          effect: "allow",
        },
      ],
    },
  ],
}
```

### Testing Guest Access

**Test pattern for verifying guest behavior:**

```typescript
// Create unauthenticated context
const guestContext = { user: null };

// Test permission check
guard.granted(entityRead, guestContext, { entity: "posts" });

// Test RLS filtering
const filters = guard.filters(entityRead, guestContext, { entity: "posts" });
const query = filters.merge({}); // Merge with user's query
```

### Unknown Areas Requiring Research

1. **Firebase Rule Translation**: Complete mapping of Firebase security rules to Bknd Guard policies
2. **Policy Variable Substitution**: How `$user.id`, `$ctx.prop` variable substitution works in filter policies
3. **Multi-Entity Policies**: Whether policies can span multiple entities or are entity-scoped
4. **Performance Impact**: Performance characteristics of policy evaluation vs Firebase rules
5. **Policy Debugging**: Tools or methods for debugging why policies match/don't match

### Documentation Pattern: Comparison Tables

When comparing Bknd to alternatives (like Firebase):
- Focus on architectural differences, not feature lists
- Highlight why Bknd's approach is better/worse for specific use cases
- Provide concrete examples showing equivalent functionality
- Be honest about trade-offs (Firebase has mature ecosystem, Bknd is younger)

### Best Practices for Guest Access

1. **Always use `implicit_allow: false`** for guest roles
2. **Combine with `published`/`public` fields** for easy public/private distinction
3. **Test with null user context** to verify guest behavior
4. **Use policy filters** instead of `implicit_allow` for complex rules
5. **Document public endpoints** clearly for API consumers
6. **Monitor access patterns** to identify unintended exposure

### Source Code Locations

Key files for understanding Guard and RBAC:
- `app/src/auth/authorize/Guard.ts` - Core authorization engine
- `app/src/auth/authorize/Role.ts` - Role implementation
- `app/src/auth/authorize/Permission.ts` - Permission definition
- `app/src/auth/authorize/Policy.ts` - Policy implementation
- `app/src/auth/auth-schema.ts` - Auth module configuration schema
- `app/src/auth/auth-permissions.ts` - Built-in permissions
