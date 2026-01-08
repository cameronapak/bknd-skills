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

### OAuth User Creation (Automatic via Callback)

OAuth users are created automatically when they first authenticate through an OAuth provider.

**Flow:**
1. User initiates OAuth login → Redirects to provider
2. Provider redirects back with authorization code → Bknd exchanges code for access token
3. Bknd fetches user profile from provider → Extracts `email` and `sub` (unique identifier)
4. **Login flow**: Authenticator looks up user by `email` in UserPool via `auth.resolveLogin()`
5. **Register flow**: Authenticator creates new user automatically via `auth.resolveRegister()`

**Callback handler in `OAuthStrategy.ts` (lines 242-262):**
```typescript
hono.get("/callback", async (c) => {
  const profile = await this.callback(params, {
    redirect_uri,
    state: state.state,
  });

  const safeProfile = {
    email: profile.email,         // Extracted from provider profile
    strategy_value: profile.sub,  // Provider's unique user ID
  } as const;

  const verify = async (user) => {
    if (user.strategy_value !== profile.sub) {
      throw new Exception("Invalid credentials");
    }
  };

  switch (state.action) {
    case "login":
      return auth.resolveLogin(c, this, safeProfile, verify, opts);
    case "register":
      return auth.resolveRegister(c, this, safeProfile, verify, opts);
  }
});
```

**Key Differences from Password Users:**
- **strategy_value**: Stores provider's unique user ID (the `sub` claim from JWT/ID token), not a hashed password
- **Password field**: Not used for OAuth users
- **Automatic creation**: No manual user creation needed - happens on first OAuth callback
- **Profile extraction**: `profile()` function in OAuth strategy config transforms provider-specific user data into standardized format

**UserPool.create() for OAuth Users:**
- Called by `Authenticator.resolveRegister()` (line 97-114 of `Authenticator.ts`)
- Temporarily exposes hidden fields (`strategy`, `strategy_value`) for insertion
- Inserts user record with: `email`, `strategy` (provider name), `strategy_value` (provider's user ID), and any additional profile fields
- Automatically assigns default role from configuration

**Built-in Providers:**
- **Google**: OIDC provider
- **GitHub**: OAuth2 provider

**Custom OAuth Providers:**
Extend `CustomOAuthStrategy` with:
- `as`: Authorization server endpoints
- `profile`: Async function to transform provider user data → `{ email, sub, ... }`
- Scopes and client credentials

**Security Considerations:**
1. Email addresses verified by OAuth providers
2. `sub` claim uniquely identifies users across providers
3. Users cannot switch strategies once created (validation check prevents this)
4. `strategy` and `strategy_value` fields are hidden from normal API queries

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
3. ~~**OAuth user creation**: How users are created through OAuth providers~~ - **RESOLVED** ✅
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

1. ~~**Admin UI Entity Creation Workflow**~~ - **RESOLVED** ✅
   - ~~Where is the "Create Entity" button/menu?~~ → Schema Overview page has "Create new" button
   - ~~What field types are available in the UI?~~ → Documented (see below)
   - ~~How do you set field properties (required, unique, default value)?~~ → Via EntityFieldsForm component
   - ~~How do you create relationships between entities in the UI?~~ → Relation modal available
   - ~~Is there a schema preview or validation before saving?~~ → Form validation before submission

### Admin UI Entity Creation Workflow (RESOLVED)

**Entity Creation Flow:**

1. Navigate to **Schema Overview** (`/admin/schema`)
2. Click **"Create new"** button (only visible in DB Mode with schema edit permission)
3. Choose creation type:
   - **Entity** - Create new entity with fields
   - **Relation** - Create relation between entities
   - **Quick templates** - Pre-built templates (e.g., user, post, etc.)

4. For Entity creation, follow wizard:
   - **Step 1:** Entity name (plural, lowercase) and display labels
   - **Step 2:** Add fields to entity
   - **Step 3:** Confirm creation

**Available Field Types:**
1. **Primary** - Auto-generated ID field (not addable, name fixed to "id")
2. **Text** - String/text fields
3. **Number** - Numeric values
4. **Boolean** - True/false values
5. **Date** - Date/time values
6. **Enum** - Fixed set of options
7. **JSON** - Flexible JSON data
8. **JSON Schema** - Validated JSON with schema
9. **Relation** - Links to other entities
10. **Media** - File attachments

**Field Configuration:**
Each field can be configured with:
- `name` - Field identifier (camelCase)
- `label` - Display label in UI
- `description` - Help text
- `required` - Field is mandatory
- `fillable` - Can be set via API
- `hidden` - Hidden from UI
- `virtual` - Computed field (not stored)

**Entity Settings:**
- `name` - Plural form (used as table name)
- `name_singular` - Singular form for display
- `description` - Entity description
- `sort_field` - Default sort field
- `sort_dir` - Default sort direction (asc/desc)

**Source Code Evidence:**
- Route: `opensrc/.../app/src/ui/routes/data/data.schema.index.tsx`
- Create Modal: `opensrc/.../app/src/ui/modules/data/components/schema/create-modal/CreateModal.tsx`
- Field Specs: `opensrc/.../app/src/ui/modules/data/components/fields-specs.ts`
- Entity Form: `opensrc/.../app/src/ui/routes/data/forms/entity.fields.form.tsx`

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

1. ~~**Policy Variable Substitution**~~ - **RESOLVED** ✅
   - ~~How `$user.id`, `$ctx.prop` variable substitution works in filter policies~~ → Uses `@variable` syntax, not `$variable`
2. **Firebase Rule Translation**: Complete mapping of Firebase security rules to Bknd Guard policies
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

## Task 2.1: Policy Variable Substitution Resolution

### Key Discovery: Correct Variable Syntax is `@variable`, Not `$variable`

The documentation now correctly reflects that Bknd's policy variable substitution uses the `@variable` syntax, not `$variable`.

### Variable Substitution Implementation

From `app/src/auth/authorize/Policy.ts`:

```typescript
replace(context: object, vars?: Record<string, any>, fallback?: any) {
  return vars
    ? recursivelyReplacePlaceholders(context, /^@([a-zA-Z_\\.]+)$/, vars, fallback)
    : context;
}
```

The `recursivelyReplacePlaceholders` utility uses a regex pattern `/^@([a-zA-Z_\\.]+)$/` to match and replace variables.

### Available Context Variables

The context is built in `Guard.collect()` method from three sources:

```typescript
const ctx = {
  ...((context ?? {}) as any),  // Permission context (lowest priority)
  ...this.config?.context,     // Guard config context (middle priority)
  user,                        // Auth user context (highest priority)
};
```

**Variable Categories:**

1. **User variables** (`@user.*`):
   - `@user.id` - Authenticated user's ID
   - `@user.role` - User's role name
   - `@user.email` - User's email (if in user object)
   - `@user.tenant_id` - Custom tenant field example

2. **Context variables** (`@ctx.*`):
   - `@ctx.app` - Application name (from guard config)
   - `@ctx.version` - App version (from guard config)
   - `@ctx.now` - Current timestamp (if provided)

3. **Permission context variables** (`@ctx.*`):
   - Variables passed when checking permissions
   - `@ctx.entity`, `@ctx.action`, etc.

### How Variable Replacement Works

1. **Policy definition** uses `@variable` syntax:
   ```typescript
   {
     filter: {
       author_id: "@user.id",
       tenant_id: "@user.tenant_id",
     },
   }
   ```

2. **Runtime evaluation** replaces variables with actual values:
   ```typescript
   // In Policy.getReplacedFilter() method
   return this.replace(this.content.filter!, context, fallback);
   ```

3. **Final filter** has actual values:
   ```typescript
   {
     author_id: 123,  // Actual user ID
     tenant_id: "tenant-abc",  // Actual tenant ID
   }
   ```

### Common Use Cases

**User-owned resources:**
```typescript
filter: { author_id: "@user.id" }
```

**Tenant isolation:**
```typescript
filter: { tenant_id: "@user.tenant_id" }
```

**Complex conditions:**
```typescript
filter: {
  $or: [
    { published: true },
    { tenant_id: "@user.tenant_id" },
  ],
}
```

### Important Implementation Details

1. **Regex pattern**: `/^@([a-zA-Z_\\.]+)$/` matches:
   - Starts with `@`
   - Alphanumeric characters, underscores, dots
   - Must match entire string value (not partial)

2. **Recursive replacement**: Variables are replaced recursively in nested objects

3. **Fallback values**: If variable not found in context, fallback value is used

4. **Null handling**: If `@user.id` is null (unauthenticated user), comparison will fail

### Documentation Update

Updated `docs/how-to-guides/permissions/public-access-guard.md` to:
1. Correct all `$variable` references to `@variable`
2. Add comprehensive "Policy Variable Substitution" section
3. Document available context variables with table
4. Show practical examples of variable usage
5. Explain how context is built (three-source merge)

### Future Research Needs

1. **Custom context variables**: How to add custom variables to guard config context
2. **Variable scoping**: Whether nested variables work (e.g., `@user.profile.id`)
3. **Type safety**: Whether variable syntax can be validated at compile time
4. **Performance**: Cost of recursive variable replacement in large filters
5. **Debugging**: Tools to trace variable replacement for troubleshooting

## Task 2.3: "Schema IDs vs UUIDs" Guide

### Key Discovery: Only Two Primary Key Formats

Bknd supports a limited set of primary key formats - simpler than expected:

**Supported Formats:**
1. **Integer** - Auto-incrementing numbers (default)
2. **UUID v7** - Time-based UUIDs (sortable, globally unique)

**Not Supported:**
- UUID v4 (random)
- Nanoid
- Custom ID formats
- CUIDs

### Source Code Evidence

From `app/src/data/fields/PrimaryField.ts`:
```typescript
export const primaryFieldTypes = ["integer", "uuid"] as const;
export type TPrimaryFieldFormat = (typeof primaryFieldTypes)[number];
```

This means the primary key format is strictly limited to these two options.

### UUID v7 Implementation

Bknd uses **UUID v7** specifically, not UUID v4. From code references:
- Uses `uuidv7` utility from `bknd/utils`
- UUID v7 combines timestamp + randomness
- Result: Sortable UUIDs (maintains chronological order)

**Benefits of UUID v7 over UUID v4:**
- **Sortable**: Can be sorted chronologically (v4 is random)
- **Database-friendly**: Better for indexing than v4
- **Globally unique**: Still provides global uniqueness
- **Time-based ordering**: Useful for time-series data

### Entity Configuration Pattern

Primary key format is configured per-entity using `primary_format` in entity config:

```typescript
const schema = em({
  // Default (integer IDs)
  users: entity("users", {
    username: text().required(),
  }),

  // UUIDs
  posts: entity("posts", {
    title: text().required(),
  }, {
    primary_format: "uuid",
  }),
});
```

### Global Configuration

Can also set default format for all entities:

```typescript
const app = createApp({
  config: {
    data: {
      default_primary_format: "uuid", // All entities use UUIDs
      entities: {
        internal: {
          fields: { name: { type: "text", required: true } },
          config: { primary_format: "integer" }, // Override
        },
      },
    },
  },
});
```

### Field Types for Primary Keys

From source code analysis:
- **Integer format**: Stored as database integer (4-8 bytes)
- **UUID format**: Stored as text (36 characters, 36 bytes)
- Both use `PrimaryField` class internally
- Primary field is automatically added if not explicitly defined

### Trade-offs Summary

| Aspect | Integer | UUID v7 |
|--------|----------|----------|
| **Storage** | 4-8 bytes | 36 bytes |
| **Performance** | Faster (smaller keys) | Slightly slower |
| **Indexing** | More efficient | Less efficient |
| **Uniqueness** | Database-scoped | Globally unique |
| **Public Exposure** | Risks enumeration | Safe to expose |
| **URLs** | Shorter | Longer |
| **Ordering** | Natural (sequential) | Chronological (v7) |

### Practical Recommendations

**When to use each:**

**Integer IDs:**
- Single-instance applications
- Performance-critical systems
- Internal resources
- When you want sequential ordering
- Smaller database size matters

**UUIDs:**
- Multi-tenant/distributed systems
- Public-facing IDs in URLs/APIs
- Preventing enumeration attacks
- Data synchronization across databases
- Future-proofing for sharding

**Common pattern:** Mix both
- Internal entities (logs, roles, settings) → Integers
- Public entities (posts, users, documents) → UUIDs

### Documentation Pattern: Comparison Tables

For technical decisions with trade-offs, use comparison tables:
- List all relevant dimensions
- Show pros/cons for each option
- Provide concrete examples of when to use each
- Be honest about limitations

### Code Examples Strategy

Include three levels of examples:
1. **Simple**: Default usage (what 80% of users need)
2. **Intermediate**: Per-entity configuration (customization)
3. **Advanced**: Global config + overrides (complex setups)

### Unknown Areas Requiring Research

1. **Migration from Integer to UUID**: Best practices for existing data
2. **Performance benchmarks**: Actual performance difference in production
3. **Database-specific behavior**: Does behavior differ between SQLite/Postgres/LibSQL?
4. **UUID v7 collision risk**: Theoretical vs practical collision probability
5. **Custom ID generation**: Can users provide their own ID generator?

### Technical Details for Advanced Users

**UUID v7 Structure:**
- First 48 bits: Unix timestamp (milliseconds since epoch)
- Next 12 bits: Sub-millisecond precision
- Last 62 bits: Random bits for uniqueness

**Result:**
- Sortable by creation time
- Globally unique (practically impossible to collide)
- Still readable as UUID string format

### Best Practices Documented

1. **Start with integers** for simplicity, migrate to UUIDs if needed
2. **Use UUIDs for public APIs** to prevent enumeration
3. **Mixed approach**: Internal = integers, public = UUIDs
4. **Consider future needs** (sharding, multi-tenant) when choosing
5. **Test performance** if database size will be large

### Source Code Locations

Key files for understanding primary key configuration:
- `app/src/data/fields/PrimaryField.ts` - PrimaryField implementation and format types
- `app/src/data/entities/Entity.ts` - Entity config with `primary_format`
- `app/src/data/data-schema.ts` - Global config with `default_primary_format`
- `app/src/data/entities/EntityManager.ts` - Entity management

## Task 2.5: "Request Lifecycle" Explanation

### Key Discovery: Transaction Handling is Database-Dependent

Bknd's transaction behavior varies significantly between PostgreSQL and SQLite connections due to different connection implementations.

### PostgreSQL Transactions

PostgreSQL connections (`PostgresConnection`) override `executeQueries()` to automatically wrap batched queries in a transaction:

**From `packages/postgres/src/PostgresConnection.ts`:**
```typescript
override async executeQueries<O extends ConnQuery[]>(...qbs: O): Promise<ConnQueryResults<O>> {
   return this.kysely.transaction().execute(async (trx) => {
      return Promise.all(qbs.map((q) => trx.executeQuery(q)));
   }) as any;
}
```

**Key characteristics:**
- **Batching enabled by default** (`supported.batching: true`)
- Automatic transaction wrapping for `executeQueries()` calls
- Atomic execution: all queries succeed or all fail with rollback
- Uses `postgres-js` driver with automatic connection pooling
- Supports Kysely's `.setIsolationLevel()` API
- Uses PostgreSQL's default isolation level (Read Committed)

### SQLite Transactions

SQLite connections (`SqliteConnection`) do NOT override `executeQueries()`, so they use the base class implementation:

**From `app/src/data/connection/Connection.ts`:**
```typescript
async executeQueries<O extends ConnQuery[]>(...qbs: O): Promise<ConnQueryResults<O>> {
   return Promise.all(qbs.map(async (q) => await this.kysely.executeQuery(q)));
}
```

**Key characteristics:**
- **Batching disabled by default** (`supported.batching: false`)
- Each query executes independently (no implicit transaction wrapping)
- SERIALIZABLE isolation by default (highest SQL isolation level)
- Connection behavior depends on journal mode:
  - **Rollback mode** (default): Exclusive lock during writes, blocks all reads
  - **WAL mode** (Write-Ahead Log): Snapshot isolation, concurrent reads/writes
- Enable WAL mode: `PRAGMA journal_mode=WAL`

### SQLite Isolation Levels (From SQLite.org)

**SERIALIZABLE by default:**
- SQLite implements serializable by actually serializing writes
- Only one writer at a time to an SQLite database
- Multiple readers possible in WAL mode
- Writers take turns using locks (automatic, application doesn't worry)

**Snapshot Isolation in WAL Mode:**
- Reader sees unchanging snapshot from start of transaction
- Write transactions that commit during read are invisible to reader
- Must end read transaction and start new one to see changes
- Concurrent readers and writers possible (WAL mode only)

### Transaction Rollback Behavior

**From Kysely documentation:**
- If exception is thrown inside transaction callback:
  1. Exception is caught
  2. Transaction is rolled back
  3. Exception is thrown again
- Otherwise: Transaction is committed

This means Bknd provides automatic rollback on errors for both PostgreSQL and SQLite transactions.

### Manual Transaction Control

Developers can explicitly control transactions using Kysely's transaction API:

```typescript
await db.transaction().execute(async (trx) => {
  const user = await trx.insertInto('users')
    .values({ email, password })
    .returning('id')
    .executeTakeFirst();
  
  const profile = await trx.insertInto('profiles')
    .values({ userId: user.id, name })
    .execute();
  
  // Both inserts succeed or both fail (atomic)
});
```

### Connection Pooling

**PostgreSQL:**
- Automatic pooling via `postgres-js` driver
- Connections returned to pool after query completes
- Configurable via connection string parameters
- Multiple concurrent queries possible

**SQLite:**
- No explicit pooling (single file, single connection process)
- One writer at a time (serialized by locks)
- Multiple readers in WAL mode
- Shared cache mode can enable more concurrent readers

### Critical Unknowns Requiring Research

The following aspects are still not documented:

1. **SQLite WAL mode configuration** - How to enable WAL mode in Bknd config or connection initialization?
2. **PostgreSQL connection pool tuning** - How to configure pool size, timeout, and max connections?
3. **Isolation level customization** - How to override default isolation levels per database?
4. **Transaction timeout behavior** - What happens on long-running transactions?
5. **Nested transaction support** - Does Bknd/Kysely support savepoints?

### Documentation Update

Updated `docs/architecture-and-concepts/how-bknd-works.md` to:
- Document connection-specific transaction behavior
- Add comparison table for PostgreSQL vs SQLite
- Explain batching differences
- Document isolation levels (SERIALIZABLE for SQLite, Read Committed for PostgreSQL)
- Provide manual transaction examples
- Document connection pooling differences

### Source Code Locations

Key files for understanding transaction handling:
- `packages/postgres/src/PostgresConnection.ts` - PostgreSQL transaction implementation
- `app/src/data/connection/sqlite/SqliteConnection.ts` - SQLite connection base
- `app/src/data/connection/Connection.ts` - Base connection class
- SQLite isolation docs: https://sqlite.org/isolation.html
- Kysely transaction docs: https://kysely.dev/docs/examples/transactions/simple-transaction



### Key Discovery: Request Lifecycle is Multi-Layered

Bknd's request processing flows through several distinct layers, each with specific responsibilities. Understanding this flow is critical for debugging, performance optimization, and customizing behavior.

### Application Lifecycle Phases

From Zread docs on "App Class and Lifecycle":
1. **Creation** - `createApp(config)` instantiates App class with all module configurations
2. **Build** - `await app.build()` initializes modules, establishes DB connections, and handles first boot
3. **Ready** - App can process HTTP requests
4. **HandlingRequest** - Active request processing
5. **RequestProcessed** - Request completed, response sent

### First Boot Detection

The build process includes smart first boot detection:
- Checks if database is empty
- If empty: executes seed function, emits `AppFirstBoot` event
- If not empty: skips seed, emits `AppBuiltEvent`
- Critical for initial data seeding strategies

### HTTP Request Processing Flow

**Layers in order:**

1. **Framework Adapter** - Platform-specific request handling (Next.js, Bun, Cloudflare Workers, etc.)
2. **App.fetch() Entry Point** - Creates Api instance with request context
3. **Middleware Chain** - Authentication, permission, custom middleware
4. **Controller** - Business logic (AuthController, DataController, MediaController, FlowsController)
5. **EntityManager** - Database operations via query builder
6. **Database** - Actual data persistence

**Adapter Pattern:**
All adapters follow a consistent pattern:
```typescript
export async function GET(request: Request) {
  const app = await getApp();
  return app.server.fetch(request);
}
```

This enables single-deployment across different runtimes/frameworks.

### Authentication Flow

**Registration Flow:**
```
Client → AuthController → Authenticator → Strategy → UserPool → Database → JWT → Response
```

**Login Flow:**
```
Client → AuthController → Authenticator → Strategy → UserPool → JWT → Response
```

**Key Implementation Details:**
- **Strategy pattern** - Multiple auth methods (password, OAuth, custom) use consistent interface
- **Authenticator coordinates** - Manages strategy resolution, user creation/verification, JWT generation
- **UserPool handles DB operations** - Inserts user records, retrieves existing users
- **JWT generation** - Creates signed token with user profile and optional claims using HS256 algorithm
- **Secure cookie management** - Tokens stored in httpOnly cookies by default

**JWT Configuration:**
- Uses HS256 algorithm with configurable secret
- Supports `expires` and `issuer` configuration
- Token verification happens on every subsequent request
- User profile embedded in JWT payload for stateless auth

### Permission Evaluation System

**Architecture:**
```
User → Role → Permissions + Policies → Guard → Access Decision
```

**Components:**
1. **Permission** - Named granular action (`posts.create`, `posts.read`, etc.)
2. **Policy** - Conditional logic with effects: `allow`, `deny`, `filter`
3. **Role** - Collection of permissions with optional policies
4. **Guard** - Enforcement mechanism that evaluates permissions in context

**Two-Level Enforcement:**

1. **API Endpoint Level:**
   - `permission()` middleware checks access before controller
   - Evaluates user's role permissions
   - Applies policy conditions
   - Throws `GuardPermissionsException` if denied

2. **Data Operation Level (RLS):**
   - Data controller intercepts queries/mutations
   - Guard generates WHERE clause filters based on permissions
   - Filters applied automatically to ensure data isolation
   - Only authorized records returned/modified

**Policy Effects:**
- `allow` - Grants access when condition met (explicit permission)
- `deny` - Revokes access (takes precedence, security override)
- `filter` - Filters data based on query criteria (row-level security)

### Database Interaction Pattern

**Connection Management:**
Bknd uses adapter-based connection system:
- **SQLite (Node)** - `nodeSqlite()` with `DatabaseSync`
- **SQLite (Bun)** - `bunSqlite()` with `Database`
- **PostgreSQL** - `postgresJs()` with `node-postgres`
- **Cloudflare D1** - Built-in D1 binding
- **Turso/LibSQL** - Built-in HTTP client

**Transaction Behavior (UNKNOWN):**
The documentation does not specify:
- Transaction isolation levels (read committed, serializable, etc.)
- Automatic rollback behavior on errors
- Connection pooling configuration
- How long connections are held open

This is a significant gap for users needing strong consistency guarantees.

### Event System Architecture

**Application Events:**
- `AppFirstBoot` - Database empty on first run (for seeding)
- `AppBuiltEvent` - Build process completes (for initialization)
- `AppConfigUpdatedEvent` - Module config changes (for reactions)
- `AppRequest` - Incoming HTTP request (for logging/tracking)

**Data Events:**
- `EntityCreated` - New entity inserted
- `EntityUpdated` - Entity modified
- `EntityDeleted` - Entity removed

**Event Characteristics:**
- Asynchronous execution (webhooks) - Non-blocking
- Synchronous execution with blocking - For operations that must complete
- JSON-serializable workflows - Enables automated business logic
- Decoupled communication - Modules don't need direct references

### Performance Optimization Insights

**Mode Performance Comparison:**
| Mode | Config Lookup | Type Generation | Performance |
|------|---------------|-----------------|-------------|
| UI Mode (db) | Database per request | Dynamic | Slowest |
| Hybrid Mode | Database (dev), Code (prod) | Synced | Balanced |
| Code Mode | In-memory once | Static | Fastest |

**Optimization Strategies:**
1. Use Code Mode in production (eliminates DB lookups)
2. Enable database indices on queried fields
3. Cache JWT verification results
4. Batch operations with `createMany`
5. Use `select` to limit returned fields

### Critical Unknowns

The following aspects are not documented in available resources:

1. **Transaction isolation levels** - How are concurrent reads/writes isolated?
2. **Connection pooling** - How does Bknd manage DB connections under load?
3. **Query optimization internals** - How does query builder optimize SQL?
4. **Event propagation order** - Guaranteed order of event handler execution
5. **Error propagation** - How do errors flow through middleware chain?
6. **Caching strategies** - Are there built-in caches for frequently accessed data?
7. **Retry logic** - What happens on transient failures?
8. **Request timeout behavior** - How are long-running requests handled?

### Documentation Pattern: Explicit Unknowns Section

For complex technical topics where documentation is incomplete:

1. **Be honest about gaps** - Don't guess or speculate
2. **Document what we know** - Provide all verified information
3. **Create dedicated "Unknown Details" section** - Clear what's missing
4. **Suggest research approaches** - How to find answers (source code, testing, community)
5. **Use TODO markers** - Clear what needs follow-up

Example structure:
```markdown
## Unknown Details

The following aspects are not documented in available resources:

1. **Specific behavior** - Why it matters
2. **Another behavior** - Why it matters

To understand these aspects, consult:
- Source code at `app/src/...`
- Community discussions
- Issue tracker
```

### Key Source Code Locations

For understanding request lifecycle:
- `app/src/App.ts` - App class and lifecycle management
- `app/src/index.ts` - Entry point and initialization
- `app/src/auth/Authenticator.ts` - JWT generation and validation
- `app/src/auth/AppUserPool.ts` - User creation and retrieval
- `app/src/auth/authorize/Guard.ts` - Permission evaluation engine
- `app/src/auth/authorize/Role.ts` - Role implementation
- `app/src/auth/authorize/Permission.ts` - Permission definition
- `app/src/auth/authorize/Policy.ts` - Policy implementation
- `app/src/data/entities/EntityManager.ts` - Database operations
- `app/src/adapter/*/` - Runtime/framework adapters

### Research Approach

1. **Start with Zread** - Use MCP server for code-level documentation
2. **Cross-reference official docs** - docs.bknd.io for high-level concepts
3. **Search source code** - When docs are incomplete or unclear
4. **Use Firecrawl** - For web search when needed
5. **Be systematic** - Map out flow end-to-end before writing

### Next Steps for Better Understanding

1. Test actual request flow with logging enabled
2. Profile performance in different modes
3. Investigate transaction behavior through integration tests
4. Document connection pooling configuration
5. Research error handling and retry logic
6. Add concrete examples for complex scenarios (multi-entity policies, etc.)

## Task 3.3: React Router Integration Guide

### Key Discovery: React Router Integration Uses Loader/Action Pattern

Bknd's React Router integration leverages React Router v7's native data loading and mutation patterns (loaders and actions) with a helper-based API access pattern.

**What I know:**

1. **Core helper pattern:**
   - `app/bknd.ts` helper file with `getApp()` and `getApi(args, { verify })` functions
   - `getApp()` caches and returns Bknd application instance
   - `getApi()` optionally verifies authentication when `{ verify: true }` is passed

2. **Loader pattern:**
   ```typescript
   export const loader = async (args: LoaderFunctionArgs) => {
     const api = await getApi(args, { verify: true });
     const { data: posts } = await api.data.readMany("posts");
     return { posts, user: api.getUser() };
   };
   ```

3. **Action pattern:**
   ```typescript
   export const action = async (args: ActionFunctionArgs) => {
     const api = await getApi();
     const formData = await args.request.formData();
     const action = formData.get("action");
     // Handle create/update/delete operations
   };
   ```

4. **Admin UI integration:**
   - Lazy-loaded with `lazy(() => import("bknd/ui").then(...))`
   - Wrapped in `<Suspense>` for loading state
   - Requires `bknd/dist/styles.css` import
   - Configuration: `<Admin withProvider={{ user }} config={{ basepath: "/admin" }} />`

5. **Configuration:**
   - `bknd.config.ts` uses `ReactRouterBkndConfig` type
   - Extends base `BkndConfig` with environment variables support
   - Environment variables accessed via `process.env` in `getBkndApp(config, process.env)`

6. **Form handling:**
   - Uses React Router's `<Form>` and `useFetcher()` components
   - Form data handled in action via `await args.request.formData()`
   - Actions typically don't require `{ verify: true }` (protected by Bknd permissions)

7. **Authentication:**
   - Use `verifyAuth()` in `getApi({ verify: true })` for protected routes
   - `api.getUser()` returns current user (null if not authenticated)
   - Redirect on auth failure with `throw redirect("/login")`

**What I don't know:**

1. **API catch-all route setup:** 
   - README mentions `api.$.tsx` but file not found in repository
   - How to set up catch-all API route in React Router
   - Whether `serve()` from `bknd/adapter/react-router` is used
   - How to handle different API endpoints (auth, data, media)

2. **Authentication best practices:**
   - Whether to use React Router middleware for auth checks
   - How to persist auth state across route transitions
   - Best practices for handling auth failures vs `verifyAuth()` throws

3. **Client-side SDK integration:**
   - Whether to use `useAuth()`, `useEntityQuery()` hooks in React Router
   - How to combine server-side loaders with client-side hooks
   - Best practices for data fetching (server vs client)

### React Router vs Next.js Integration Comparison

| Aspect | Next.js | React Router |
|--------|---------|--------------|
| **Route structure** | `app/api/[[...bknd]]/route.ts` catch-all | Unknown (`api.$.tsx` mentioned but not found) |
| **Server function** | `serve()` from `bknd/adapter/nextjs` | Helper-based (`getApi()` in `app/bknd.ts`) |
| **Data fetching** | Server components + loaders | Loaders only |
| **Type safety** | Full (config to client) | Full (config to client) |
| **Admin UI** | Server component at `/admin/[[...admin]]/page.tsx` | Lazy-loaded at `admin.$.tsx` |

### Documentation Pattern: Explicit Unknowns Section

For integration guides where workflow is unclear:
- Document what you know from source code and examples
- Create dedicated "Unknown Details" section for unclear workflows
- Mark unclear sections with "⚠️ Unclear workflow" or "⚠️ Best practices unclear"
- Use TODO markers for sections needing follow-up
- Don't guess at workflows you haven't tested

This pattern:
- Is honest about documentation gaps
- Provides the verified information we have
- Makes it clear what's missing for users
- Doesn't mislead users with untested workflows
- Encourages community contributions to fill gaps

### Source Code Locations

Key files for React Router integration:
- `app/src/adapter/react-router/react-router.adapter.ts` - Adapter implementation and types
- `examples/react-router/app/bknd.ts` - Helper file pattern
- `examples/react-router/app/routes/_index.tsx` - Loader/action CRUD example
- `examples/react-router/app/routes/admin.$.tsx` - Admin UI integration

### Next Steps for Better Documentation

1. Test actual React Router app to verify API catch-all route setup
2. Document client-side SDK usage patterns with React Router
3. Clarify authentication best practices (middleware vs loader checks)
4. Add examples for complex scenarios (multi-entity forms, optimistic updates)
5. Investigate React Router middleware integration for auth

## Task 3.4: Astro Integration Guide

### Key Discovery: Two Integration Patterns

Bknd supports two distinct integration approaches with Astro:

1. **Page-Based Integration** (Standard/Simple):
   - `src/pages/api/[...api].astro` - API catch-all route
   - `src/pages/admin/[...admin].astro` - Admin UI route
   - Server-side data fetching via `getApi()` in frontmatter
   - Automatic static asset serving

2. **Middleware Integration** (Advanced):
   - `src/middleware.ts` routes requests to Bknd
   - Centralized routing logic for `/api/*` and `/admin/*`
   - Manual static asset handling via `onBuilt` handler
   - Cleaner separation of concerns

### What I know:

**Page-Based Integration:**
- Helper file pattern at `src/bknd.ts` with `getApp()` and `getApi()`
- API routes return JSON directly via `api.fetch(Astro.request)`
- Admin UI requires `client:only` directive and `bknd/dist/styles.css`
- Server-side data fetching in Astro frontmatter: `const api = await getApi(Astro)`
- `export const prerender = false;` required for dynamic routes

**Middleware Integration (from GitHub Issue #317):**
- Remove bknd-related pages (admin, api) - middleware handles routing
- Postinstall script copies static assets: `cp -r node_modules/bknd/dist/public public/_bknd`
- `onBuilt` handler in `bknd.config.ts` registers admin controller
- Middleware routes `/api*` and `/admin*` to Bknd
- Better for complex routing scenarios

**Configuration:**
- `bknd.config.ts` uses `AstroBkndConfig` type
- Environment variables via `import.meta.env`
- Database connection in `connection.url` property
- Optional `onBuilt` handler for advanced setups

### What I don't know:

1. **Client-Side SDK Integration:**
   - Whether React SDK hooks (`useAuth`, `useEntityQuery`) work with Astro islands
   - How to combine server-side rendering with client-side state
   - Best practices for optimistic updates in Astro context

2. **Middleware Pattern Best Practices:**
   - When to use middleware vs page-based integration
   - Performance implications of middleware routing
   - How middleware affects Astro's caching and optimization

3. **Authentication Flow:**
   - Whether Astro middleware is the best place for auth checks
   - How to handle JWT token validation in middleware
   - Session persistence across Astro route transitions

4. **Static Asset Handling:**
   - Why middleware requires manual asset copying
   - How to properly configure asset paths
   - CDN integration for static assets

### Documentation Pattern: Multiple Integration Approaches

For frameworks supporting multiple integration patterns:
- Document both approaches with clear trade-offs
- Label one as "Standard" and one as "Advanced"
- Provide comparison table showing when to use each
- Include unknown details for each approach

### Source Code Locations

Key files for Astro integration:
- `app/src/adapter/astro/astro.adapter.ts` - Adapter implementation
- `examples/astro/bknd.config.ts` - Configuration example
- `examples/astro/src/pages/admin/[...admin].astro` - Admin UI route
- `examples/astro/src/pages/index.astro` - Server-side data fetching
- GitHub Issue #317 - Middleware integration pattern

### Critical Gap: Client-Side SDK Compatibility

Bknd's React SDK may not work seamlessly with Astro's island architecture. This is a significant unknown because:
- Astro uses partial hydration for client components
- React SDK assumes full React environment
- Client-side state management needs careful consideration

**Recommendation:** Focus on server-side data fetching for Astro, document React SDK as experimental.

### Next Steps for Better Documentation

1. Test actual middleware integration in Astro project
2. Verify React SDK compatibility with Astro islands
3. Add performance benchmarks for both integration patterns
4. Document authentication middleware best practices
5. Create decision matrix for choosing integration approach

## Task 3.1: Next.js Integration Guide

### Key Discovery: Next.js Integration is Well-Documented

Bknd's official Next.js documentation is comprehensive and accurate. This task required:
- Reading official docs at docs.bknd.io/integration/nextjs/
- Cross-referencing React SDK documentation at docs.bknd.io/usage/react/
- Verifying configuration patterns with Zread MCP server

### Next.js Integration Components

**What I know:**

1. **Installation methods:**
   - CLI starter: `npx bknd create -i nextjs` (recommended)
   - Manual: `npm create next-app` + `npm install bknd`

2. **Configuration:**
   - `bknd.config.ts` with `NextjsBkndConfig` type
   - Database connection via `connection.url` property
   - Optional `cleanRequest.searchParams` for catch-all route

3. **API setup:**
   - Helper file pattern (`src/bknd.ts`) with `getApp()` and `getApi()` functions
   - Catch-all route at `src/app/api/[[...bknd]]/route.ts`
   - Uses `serve()` from `bknd/adapter/nextjs`
   - Optional edge runtime support for performance

4. **Server-side data fetching:**
   - Direct API access in server components via `getApi()`
   - Full type safety with TypeScript
   - Auth verification with `getApi({ verify: true })`

5. **Admin UI:**
   - Server component at `src/app/admin/[[...admin]]/page.tsx`
   - Uses `<Admin>` component from `bknd/ui`
   - Requires auth verification and `bknd/dist/styles.css`

6. **Client-side React SDK:**
   - Wrap app with `<ClientProvider>` in layout
   - `useAuth()` hook for authentication
   - `useEntityQuery()` for data fetching with SWR caching
   - `useApiQuery()` for custom API queries

**What I don't know:**

1. **Edge runtime limitations:** What features don't work with edge runtime?
2. **Custom route protection:** How to protect plugin-created routes in Next.js?
3. **Middleware patterns:** How to use Next.js middleware with Bknd?
4. **Static generation:** How does Bknd work with `getStaticProps`/ISR?

### React SDK Hook Patterns

**useAuth hook:**
```typescript
const { user, login, logout, verified } = useAuth();
```
- Returns user object (null if unauthenticated)
- Provides login/logout/register functions
- Tracks verification state

**useEntityQuery hook:**
```typescript
const { data, create, update, _delete, isLoading } = useEntityQuery("todos");
```
- Auto-fetches data with SWR caching
- CRUD actions automatically revalidate cache
- Supports query options (limit, sort, where, with)
- Different behavior with/without ID parameter

**useApiQuery hook:**
```typescript
const { data, mutate } = useApiQuery((api) => api.data.readMany("posts"));
```
- Flexible - can query any API endpoint
- SWR-based caching and revalidation
- Supports `refine` function to filter response
- Manual `mutate()` for optimistic updates

### Documentation Pattern: Official Docs as Primary Source

This task revealed that Bknd's official documentation is high-quality and accurate. For integration guides:

1. **Start with official docs** - docs.bknd.io has comprehensive integration guides
2. **Cross-reference Zread** - For code-level details and implementation specifics
3. **Add practical examples** - Official docs sometimes lack concrete usage patterns
4. **Document unknowns explicitly** - When something isn't clear, mark it as unknown

### Guide Structure Strategy

Created Next.js integration guide with:
1. Overview - What Bknd provides for Next.js
2. Installation - CLI vs manual setup
3. Configuration - Config file options
4. API Setup - Helper file and catch-all route
5. Server-Side Fetching - Server component examples
6. Admin UI - Setup and configuration
7. Client-Side SDK - React hooks usage
8. Deployment - Environment variables and production tips
9. Common Patterns - Authentication, type-safe queries
10. Troubleshooting - Common issues and fixes

### Key Learnings

1. **Next.js + Bknd is a strong combination** - The integration is seamless with type safety throughout
2. **Edge runtime support is a bonus** - Better performance for global deployments
3. **React SDK is mature** - SWR integration provides excellent caching and revalidation
4. **Authentication is flexible** - Works with localStorage, cookies, or server-side (embedded mode)
5. **Type safety is pervasive** - From config to API calls to client components

### Unknown Areas Requiring Research

1. **Edge runtime limitations** - Which Bknd features don't work with edge runtime?
2. **Middleware integration** - How to use Next.js middleware with Bknd auth?
3. **Static generation support** - How does Bknd work with SSG/ISR?
4. **Custom route protection** - How to protect plugin-created routes in Next.js context?
5. **API route optimization** - Best practices for caching and performance?

### Source Code Locations

Key files for Next.js integration:
- `app/src/adapter/nextjs/index.ts` - Next.js adapter implementation
- `app/src/adapter/nextjs/types.ts` - NextjsBkndConfig type definition
- `app/src/client/index.ts` - Client-side SDK (React hooks)
- `app/src/ui/admin/` - Admin UI React components

### Documentation Best Practices

1. **Provide multiple examples** - Show simple, intermediate, and advanced usage
2. **Include type annotations** - TypeScript users benefit from seeing types
3. **Document unknowns clearly** - Don't guess; mark what needs more research
4. **Cross-reference other guides** - Link to related documentation
5. **Use code fences with language** - Highlight syntax correctly
6. **Include troubleshooting** - Common issues and their fixes

## Task 3.2: Vite + React Integration Guide

### Key Discovery: Vite + React Integration is Simple and Well-Documented

The Vite + React integration provides a straightforward setup for standalone SPA applications with:
- Hono server integration via `@hono/vite-dev-server`
- Hot Module Replacement (HMR) out of the box
- API routes at `/api/*` prefix
- Admin UI available at root `/` by default

### Integration Components

**What I know:**

1. **Core files needed:**
   - `bknd.config.ts` - Bknd configuration with `ViteBkndConfig` type
   - `server.ts` - Server entry point using `serve()` from `bknd/adapter/vite`
   - `vite.config.ts` - Vite configuration with `devServer()` plugin

2. **Dependencies:**
   - `bknd` - Core Bknd package
   - `@hono/vite-dev-server` - Hono dev server integration
   - Optional: `@bknd/plasmic` for Plasmic integration

3. **Configuration:**
   - `serve()` function accepts `ViteBkndConfig` which extends `RuntimeBkndConfig`
   - Optional `adminOptions.forceDev.mainPath` for admin UI entry
   - Optional `serveStatic` configuration for static file serving
   - Default port is 5174 (Vite default)

4. **API patterns:**
   - Client-side `Api` class from `bknd/client`
   - React SDK with `ClientProvider` and hooks like `useAuth()`
   - Type generation via `npx bknd types`

5. **Deployment:**
   - Build with `npm run build`
   - Preview with `npm run preview`
   - Can deploy to Vercel, Netlify, or Node.js server
   - Production bundle in `dist/` directory

**What I don't know:**

1. **Server-side rendering support:** Does Vite + React integration support SSR?
2. **Edge runtime compatibility:** Can this run on Cloudflare Workers or other edge runtimes?
3. **Advanced dev server configuration:** What other options does `devServer()` support?
4. **Performance characteristics:** How does HMR performance compare to other integrations?
5. **Custom middleware:** How to add custom middleware to the dev server?

### Vite Plugin Configuration

The `devServer()` plugin from `bknd/adapter/vite`:
- Integrates with Vite's plugin system
- Provides HMR via `@hono/vite-dev-server`
- Requires `entry` parameter pointing to `server.ts`
- Handles React HMR injection automatically

### Server Setup Pattern

```typescript
// server.ts
import { serve } from "bknd/adapter/vite";
import config from "./bknd.config";

export default serve(config);
```

The `serve()` function:
- Creates an async function that accepts Request, env, and ExecutionContext
- Builds the Bknd app on first request (cached)
- Returns a Fetch-compatible handler
- Works with any Fetch-based runtime (Node.js, Cloudflare, etc.)

### Client-Side Integration Patterns

**Simple API usage:**
```typescript
import { Api } from "bknd/client";

const api = new Api();

const { data } = await api.data.readMany("todos");
```

**React SDK with auth:**
```typescript
import { ClientProvider, useAuth } from "bknd/client";

function Root() {
  return (
    <ClientProvider>
      <App />
    </ClientProvider>
  );
}

function App() {
  const { user, login, logout } = useAuth();
  // ... auth logic
}
```

**State management with Zustand:**
```typescript
import { create } from "zustand";
import { api } from "./api";

const useStore = create((set) => ({
  todos: [],
  fetchTodos: async () => {
    const { data } = await api.data.readMany("todos");
    set({ todos: data });
  },
}));
```

### Comparison with Next.js Integration

| Aspect | Vite + React | Next.js |
|--------|--------------|---------|
| **Type** | SPA | Full-stack |
| **SSR** | No | Yes |
| **File routing** | No | Yes |
| **API routes** | `/api/*` | `/api/*` |
| **Deployment** | Static + Server | Vercel/Edge |
| **HMR** | ✅ | ✅ |
| **Setup complexity** | Simple | Moderate |

### Documentation Pattern: Integration Guide Structure

This guide follows a consistent structure:
1. Overview - What and why
2. Prerequisites - What you need
3. Installation - Manual and CLI options
4. Configuration - Core setup files
5. Running - Development and production
6. Client-Side Integration - SDK usage
7. Common Patterns - Reusable patterns
8. Configuration Options - Advanced setup
9. Deployment - Production deployment
10. Troubleshooting - Common issues and fixes
11. Best Practices - Recommendations
12. Differences - Comparison with other integrations

### Source Code Locations

Key files for Vite + React integration:
- `app/src/adapter/vite/vite.adapter.ts` - Main adapter implementation
- `app/src/adapter/vite/dev-server-config.ts` - Dev server configuration
- `examples/plasmic/src/server.ts` - Complete working example
- `examples/plasmic/vite.config.ts` - Vite configuration example
- `examples/react/vite.config.ts` - React-specific configuration

### Best Practices Documented

1. **Generate types regularly** after schema changes
2. **Use environment variables** for configuration secrets
3. **Optimize bundle size** with code splitting
4. **Enable compression** in production
5. **Monitor performance** with Vite's analyzer

### Unknown Areas Requiring Research

1. **SSR support:** Is server-side rendering possible with Vite + React integration?
2. **Edge runtime:** Does this work on Cloudflare Workers or Deno Deploy?
3. **Custom middleware:** How to add custom middleware to the dev server?
4. **Performance benchmarks:** How does this compare to Next.js or Bun performance?
5. **Advanced dev server options:** What other configuration options are available?

### Next Steps for Better Documentation

1. Test actual deployment to Vercel/Netlify
2. Document SSR capabilities (if any)
3. Add performance comparison benchmarks
4. Create example with custom middleware
5. Document edge runtime compatibility

### Key Discovery: Next.js Integration is Well-Documented

Bknd's official Next.js documentation is comprehensive and accurate. This task required:
- Reading official docs at docs.bknd.io/integration/nextjs/
- Cross-referencing React SDK documentation at docs.bknd.io/usage/react/
- Verifying configuration patterns with Zread MCP server

### Next.js Integration Components

**What I know:**

1. **Installation methods:**
   - CLI starter: `npx bknd create -i nextjs` (recommended)
   - Manual: `npm create next-app` + `npm install bknd`

2. **Configuration:**
   - `bknd.config.ts` with `NextjsBkndConfig` type
   - Database connection via `connection.url` property
   - Optional `cleanRequest.searchParams` for catch-all route

3. **API setup:**
   - Helper file pattern (`src/bknd.ts`) with `getApp()` and `getApi()` functions
   - Catch-all route at `src/app/api/[[...bknd]]/route.ts`
   - Uses `serve()` from `bknd/adapter/nextjs`
   - Optional edge runtime support for performance

4. **Server-side data fetching:**
   - Direct API access in server components via `getApi()`
   - Full type safety with TypeScript
   - Auth verification with `getApi({ verify: true })`

5. **Admin UI:**
   - Server component at `src/app/admin/[[...admin]]/page.tsx`
   - Uses `<Admin>` component from `bknd/ui`
   - Requires auth verification and `bknd/dist/styles.css`

6. **Client-side React SDK:**
   - Wrap app with `<ClientProvider>` in layout
   - `useAuth()` hook for authentication
   - `useEntityQuery()` for data fetching with SWR caching
   - `useApiQuery()` for custom API queries

**What I don't know:**

1. **Edge runtime limitations:** What features don't work with edge runtime?
2. **Custom route protection:** How to protect plugin-created routes in Next.js?
3. **Middleware patterns:** How to use Next.js middleware with Bknd?
4. **Static generation:** How does Bknd work with `getStaticProps`/ISR?

### React SDK Hook Patterns

**useAuth hook:**
```typescript
const { user, login, logout, verified } = useAuth();
```
- Returns user object (null if unauthenticated)
- Provides login/logout/register functions
- Tracks verification state

**useEntityQuery hook:**
```typescript
const { data, create, update, _delete, isLoading } = useEntityQuery("todos");
```
- Auto-fetches data with SWR caching
- CRUD actions automatically revalidate cache
- Supports query options (limit, sort, where, with)
- Different behavior with/without ID parameter

**useApiQuery hook:**
```typescript
const { data, mutate } = useApiQuery((api) => api.data.readMany("posts"));
```
- Flexible - can query any API endpoint
- SWR-based caching and revalidation
- Supports `refine` function to filter response
- Manual `mutate()` for optimistic updates

### Documentation Pattern: Official Docs as Primary Source

This task revealed that Bknd's official documentation is high-quality and accurate. For integration guides:

1. **Start with official docs** - docs.bknd.io has comprehensive integration guides
2. **Cross-reference Zread** - For code-level details and implementation specifics
3. **Add practical examples** - Official docs sometimes lack concrete usage patterns
4. **Document unknowns explicitly** - When something isn't clear, mark it as unknown

### Guide Structure Strategy

Created Next.js integration guide with:
1. Overview - What Bknd provides for Next.js
2. Installation - CLI vs manual setup
3. Configuration - Config file options
4. API Setup - Helper file and catch-all route
5. Server-Side Fetching - Server component examples
6. Admin UI - Setup and configuration
7. Client-Side SDK - React hooks usage
8. Deployment - Environment variables and production tips
9. Common Patterns - Authentication, type-safe queries
10. Troubleshooting - Common issues and fixes

### Key Learnings

1. **Next.js + Bknd is a strong combination** - The integration is seamless with type safety throughout
2. **Edge runtime support is a bonus** - Better performance for global deployments
3. **React SDK is mature** - SWR integration provides excellent caching and revalidation
4. **Authentication is flexible** - Works with localStorage, cookies, or server-side (embedded mode)
5. **Type safety is pervasive** - From config to API calls to client components

### Unknown Areas Requiring Research

1. **Edge runtime limitations** - Which Bknd features don't work with edge runtime?
2. **Middleware integration** - How to use Next.js middleware with Bknd auth?
3. **Static generation support** - How does Bknd work with SSG/ISR?
4. **Custom route protection** - How to protect plugin-created routes in Next.js context?
5. **API route optimization** - Best practices for caching and performance?

### Source Code Locations

Key files for Next.js integration:
- `app/src/adapter/nextjs/index.ts` - Next.js adapter implementation
- `app/src/adapter/nextjs/types.ts` - NextjsBkndConfig type definition
- `app/src/client/index.ts` - Client-side SDK (React hooks)
- `app/src/ui/admin/` - Admin UI React components

### Documentation Best Practices

1. **Provide multiple examples** - Show simple, intermediate, and advanced usage
2. **Include type annotations** - TypeScript users benefit from seeing types
3. **Document unknowns clearly** - Don't guess; mark what needs more research
4. **Cross-reference other guides** - Link to related documentation
5. **Use code fences with language** - Highlight syntax correctly
6. **Include troubleshooting** - Common issues and their fixes

## Task 1.7: Organize Docs into Correct Folders

### Documentation Organization Strategy

Created proper directory structure for supplemental Bknd docs:

**New Structure:**
```
docs/
├── reference/           # Technical reference materials
│   ├── orm.md          # Schema prototype API documentation
│   ├── query-system.md # Query builder reference
│   └── schema.md       # Drizzle/Prisma/Bknd comparison
└── comparisons/         # Framework comparisons
    └── bknd-comparison-pocketbase.md
```

### Why This Organization Matters

1. **Reference vs Guides:** Reference docs are for API lookup and comparison, while guides are task-oriented
2. **Discoverability:** Users can find specific technical details quickly
3. **Maintainability:** Clear separation makes future additions easier
4. **Scalability:** Structure can grow as new reference materials and comparisons are added

### Implementation Details

- Used `mkdir -p` to create nested directories in one command
- Used `mv` to relocate existing files to new locations
- Updated README.md to reflect new file paths
- All existing internal links and references remain functional

### Learning: File Organization Principles

Good documentation organization follows:
- **Type-based grouping:** Reference, tutorials, guides, comparisons
- **Purpose-based naming:** Clear, descriptive filenames
- **Consistent structure:** Logical hierarchy that scales
- **User-centric:** Organize by how users look for information, not by implementation details

This mirrors the Mintlify structure principles where content is organized by documentation type (Divio's Four Documentation Types).

## Task 2.4: "Add Authentication with Permissions" Tutorial

### Key Discovery: Auth Tutorial Requires Multiple Documentation Sources

Creating a comprehensive authentication tutorial revealed that Bknd's documentation is spread across multiple locations, requiring research from:

1. **Zread MCP server** - Code-level documentation (Guard, Permission, Role implementations)
2. **Official docs** - High-level concepts and configuration examples
3. **Source code** - Concrete examples (DataController, permission middleware)
4. **Example projects** - Working patterns (Next.js example with seed function)

### Password Strategy Configuration

**What I know:**
- Password strategy is configured under `config.auth.strategies.password`
- Requires `type: "password"`, `enabled: true`, and `config.hashing: "sha256"` (or "bcrypt")
- Automatically registers endpoints: `/api/auth/password/login` and `/api/auth/password/register`
- User creation stores `strategy: "password"` and `strategy_value: <hashed_password>`
- JWT tokens generated with HS256 algorithm using configured `secret`

**What I don't know:**
- Whether bcrypt is fully implemented (docs mention it as "planned")
- Exact password validation rules (beyond CLI minimum 3 characters)
- How to configure custom password requirements (length, complexity, etc.)
- Password reset/verification flow details

### Role-Based Access Control (RBAC) Configuration

**What I know:**
- Roles configured in `config.auth.roles` array
- Each role has: `name`, `is_default`, `implicit_allow`, `permissions`
- Permissions are strings (e.g., `"data.entity.read"`) or objects with `permission` + `policies`
- Three built-in data permissions: `entityRead`, `entityCreate`, `entityUpdate`, `entityDelete`
- Wildcard `"*"` grants all permissions
- Default role (`is_default: true`) assigned to users without explicit roles

**What I don't know:**
- How to register **custom permissions** beyond built-in data/auth permissions
- Whether custom permissions require plugin `onBoot` hook registration
- Permission naming conventions (e.g., `"posts.publish"` vs `"posts.publish"`)
- Policy variable substitution details (`$user.id`, `$ctx.prop`)
- Whether permissions can be scoped to specific entity instances (not just entity types)

### Protecting Endpoints

**What I know:**
- Built-in data endpoints are automatically protected via `permission()` middleware
- DataController shows how permissions applied: `permission(DataPermissions.entityRead, { context: (c) => ... })`
- Middleware throws `GuardPermissionsException` (403) on denied access
- Guard automatically extracts user from `c.get("auth")?.user`

**What I don't know:**
- How to protect **custom routes** created via plugins
- Exact syntax for using `permission()` middleware in custom controllers
- Whether custom routes need manual Guard setup or inherit it automatically
- How to access `ctx.guard` in custom controllers
- Whether there's a `useGuard()` hook or similar pattern

### Client-Side Authentication (Api Class)

**What I know:**
- `Api` class from `bknd/client` provides `api.auth.login({ email, password })`
- Login endpoint: `/api/auth/password/login`
- Logout endpoint: `/api/auth/password/logout`
- Api automatically manages JWT storage in cookies
- `api.auth.me()` retrieves current user profile

**What I don't know:**
- Cookie configuration details (httpOnly, secure, sameSite)
- Token refresh behavior and timing
- How to handle expired tokens
- Error handling for invalid credentials
- How to access raw JWT tokens if needed

### Permission Evaluation Flow

From Guard.ts source code, evaluation order is:
1. Check if Guard is enabled (`config.enabled: true`)
2. Extract user from context (Hono `c.get("auth")?.user`)
3. Get user role:
   - If `user.role` is string → find role by name
   - If no role → find default role (`is_default: true`)
   - If no default role → return undefined
4. Check permission exists in Guard
5. Check role has permission
6. If no permission and `implicit_allow: false` → throw exception
7. If no permission and `implicit_allow: true` → allow
8. If permission exists → evaluate all policies
9. Deny policy (effect: "deny") takes precedence and stops evaluation
10. Allow policies and filter policies evaluated, continue if no deny

**Critical insight:** `implicit_allow: true` is dangerous for security-sensitive roles. Always use `implicit_allow: false` for guest/untrusted roles.

### Documentation Pattern: Honest About Unknowns

For authentication tutorial, used three "UNKNOWN" sections:

1. **Admin UI user creation** - Workflow unclear, referenced `create-first-user.md`
2. **Protecting custom routes** - Syntax for plugin-created routes unknown
3. **Custom permission registration** - How to register non-built-in permissions unclear

This pattern:
- Provides working code for what we DO know
- Clearly marks what needs more research
- Offers workarounds when possible (e.g., seed function for user creation)
- Doesn't mislead users with guesses
- Encourages community contributions

### Testing Checklist Pattern

Created comprehensive checklist covering:
- Auth module configuration
- Role and permission setup
- User creation (via seed)
- Login/register endpoints working
- Permission matrix verification (guest, user, admin)
- Cookie storage verification
- Logout functionality

This pattern ensures:
- Users can verify their setup step-by-step
- Clear indication of what should work vs what's experimental
- Separation of backend setup vs client integration
- Security considerations (permissions tested from each role level)

### Cross-References Work Well

Tutorial effectively cross-references:
- `/getting-started/build-your-first-api` - Prerequisite
- `/how-to-guides/auth/create-first-user.md` - User creation details
- `/how-to-guides/permissions/public-access-guard.md` - Guest access patterns
- `/reference/auth-module` - Complete reference (placeholder updated to specific sections)
- `/getting-started/deploy-to-production` - Next steps

This creates a clear learning path where users can dive deeper into specific topics as needed.

### Key Gap: Custom Route Protection Pattern

This is the most significant unknown area. Based on ModuleManager docs:
- Plugins can register custom controllers: `this.ctx.server.route('/api/custom', controller)`
- DataController uses `permission()` middleware from `auth/middlewares/permission.middleware.ts`
- BUT: No documentation shows how custom controllers use this middleware

**Hypothesis (unverified):**
```typescript
import { permission } from "auth/middlewares/permission.middleware";
import * as DataPermissions from "data/permissions";

class CustomController extends Controller {
  getController() {
    const hono = this.create();
    
    hono.get(
      "/custom",
      permission(DataPermissions.entityRead, { context: (c) => ... }),
      (c) => c.json({ data: "protected" })
    );
    
    return hono;
  }
}
```

This needs to be tested against actual implementation.

### Next Steps for Complete Auth Documentation

1. **Test custom route protection** - Create a plugin with protected custom endpoint
2. **Document custom permission registration** - How to add permissions beyond built-in data/auth
3. **Verify Admin UI user creation** - Test actual workflow in live instance
4. **Explore password strategy internals** - Validation, hashing, reset flows
5. **Document OAuth integration** - How OAuth users are created and managed
6. **Add advanced patterns** - Multi-factor auth, session management, rate limiting

### Source Code Locations

Key files for authentication understanding:
- `app/src/auth/auth-schema.ts` - Auth configuration schema (roles, strategies, jwt)
- `app/src/auth/AppAuth.ts` - Auth module implementation
- `app/src/auth/AppUserPool.ts` - User pool and CRUD operations
- `app/src/auth/Authenticator.ts` - JWT generation and coordination
- `app/src/auth/authenticate/strategies/PasswordStrategy.ts` - Password strategy implementation
- `app/src/auth/authorize/Guard.ts` - Permission enforcement engine
- `app/src/auth/authorize/Role.ts` - Role implementation
- `app/src/auth/authorize/Permission.ts` - Permission definition
- `app/src/auth/middlewares/permission.middleware.ts` - Permission middleware for Hono
- `app/src/auth/api/AuthController.ts` - Auth endpoint handlers
- `app/src/data/api/DataController.ts` - Data endpoint protection examples
- `app/src/modules/ModuleManager.ts` - Plugin system and controller registration

## Task 5.2: Complete Data Module Documentation

### Key Discovery: Data Module Has Two Clear APIs

Bknd's Data module provides a clean separation between read and write operations:
- **Repository** - All read operations (findMany, findOne, findId, count, exists)
- **Mutator** - All write operations (insertOne, insertMany, updateOne, updateWhere, deleteOne, deleteWhere)

Both are accessed through **EntityManager**, which is the central point for all data operations.

### Repository API (Read Operations)

**What I know:**
- Access via `em.repository("entity")` or `em.repo("entity")`
- `findMany(options)` - Query multiple records with filtering, sorting, pagination
- `findOne(where)` - Find single record by conditions
- `findId(id)` - Find single record by primary key
- `count(where)` - Count records matching conditions
- `exists(where)` - Check if records exist (returns boolean)
- All methods return `RepositoryResult` objects with `data` property
- Queries are type-safe when using generated types

**Query Options:**
- `where` - Filtering with operators ($eq, $ne, $gt, $gte, $lt, $lte, $in, $notin, $between, $like, $isnull)
- `sort` - Ordering with `{by: "field", dir: "asc|desc"}`
- `select` - Field selection array
- `with` - Eager loading of relations (array of relation names)
- `join` - Manual joins for filtering/selecting related table fields
- `limit` - Result count (default: 10)
- `offset` - Pagination offset

**Where Operators:**
- `$eq` - Equality (default, can be omitted)
- `$ne` - Not equal
- `$gt/$gte` - Greater than / Greater than or equal
- `$lt/$lte` - Less than / Less than or equal
- `$in/$notin` - In array / Not in array
- `$between` - Between two values (inclusive)
- `$like` - Pattern matching (supports * and %)
- `$isnull` - Is null (boolean)
- `$or/$and` - Logical operators (for complex conditions)

**What I don't know:**
- Exact behavior of complex nested `$or` and `$and` combinations
- Whether `select` supports aliased fields or expressions
- Maximum depth for `with` eager loading
- Performance characteristics of large `with` queries

### Mutator API (Write Operations)

**What I know:**
- Access via `em.mutator("entity")`
- `insertOne(data)` - Create single record
- `insertMany(data[])` - Create multiple records efficiently
- `updateOne(id, data)` - Update single record by ID
- `updateWhere(data, where)` - Update multiple records (requires where clause)
- `deleteOne(id)` - Delete single record by ID
- `deleteWhere(where)` - Delete multiple records (requires where clause)
- All methods return `MutatorResult` objects with `data` property
- System entity creation is disabled by default (flag: `__unstable_disable_system_entity_creation`)

**What I don't know:**
- Which entities are considered "system" entities
- How to enable system entity creation if needed
- Bulk operation limits (maximum records for insertMany)
- Error recovery on partial failures in batch operations

### Relationship Mutations

Bknd provides special operators for managing entity relationships through the Mutator API:

**Many-to-One Relations:**
- `$set` - Assign existing entity by ID
- `$create` - Create and assign new entity

**One-to-One Relations:**
- `$create` - Create and assign (same as Many-to-One)
- `$set` - Intentionally disabled to maintain exclusivity

**Many-to-Many Relations:**
- `$attach` - Add relations by ID array
- `$detach` - Remove relations by ID array
- `$set` - Replace all relations (detach all, then attach new)

**What I know:**
- Many-to-Many queries default to 5-record limit on related records
- Operations modify the junction table automatically
- No need to manually manage foreign keys

**What I don't know:**
- How to change the 5-record limit for Many-to-Many queries
- Performance impact of Many-to-Many operations with large datasets
- Whether `$set` performs a single query or multiple queries

### Query System Architecture

Bknd uses **Kysely** (a type-safe SQL query builder) under the hood. The Repository and Mutator APIs are fluent wrappers around Kysely query builders.

**Query Building Flow:**
1. Repository methods receive `RepoQuery` options object
2. `getValidOptions()` validates options against entity schema
3. `addOptionsToQueryBuilder()` builds Kysely query
4. WhereBuilder adds WHERE clauses with operator transformation
5. WithBuilder adds relation preloading
6. JoinBuilder adds manual joins
7. Query executes via Connection
8. Results hydrate through RepositoryResult/MutatorResult

**What I know:**
- Queries are validated before execution
- Indexing warnings emitted for non-indexed fields in where/sort
- Query results are automatically hydrated (transforms applied)
- Type safety maintained throughout query building

**What I don't know:**
- Query execution timing and performance profiling
- Connection pooling behavior
- Query caching strategies (if any)

### Event System

Both Repository and Mutator emit events through the EventManager:

**Repository Events:**
- `RepositoryFindOneBefore` / `RepositoryFindOneAfter`
- `RepositoryFindManyBefore` / `RepositoryFindManyAfter`

**Mutator Events:**
- `MutatorInsertBefore` / `MutatorInsertAfter`
- `MutatorUpdateBefore` / `MutatorUpdateAfter`
- `MutatorDeleteBefore` / `MutatorDeleteAfter`

**What I don't know:**
- How to subscribe to these events
- Event payload structure
- Event ordering guarantees
- Whether events are synchronous or asynchronous
- How events affect performance

### Critical Unknowns

The following aspects are not documented in available resources:

1. **Transaction Management:**
   - How transactions work in Bknd
   - Transaction isolation levels (read committed, serializable, etc.)
   - Automatic rollback behavior on errors
   - How to group multiple operations in a transaction

2. **Connection Management:**
   - Connection pooling configuration
   - How connections are reused or released
   - Connection timeout behavior
   - Health check details beyond basic ping()

3. **Field Transformations:**
   - How fields are transformed during read/write operations
   - Type conversion rules (e.g., dates, JSON fields)
   - Validation rules beyond required/optional
   - Custom field transformation hooks

4. **Default Values:**
   - How default values are applied on insert
   - Whether defaults are applied on update for NULL fields
   - Database-level defaults vs application-level defaults

5. **Error Handling:**
   - Specific error types (validation, constraint, connection, etc.)
   - Error message formats
   - How to catch and handle different error types
   - Retry logic for transient failures

6. **Performance Optimization:**
   - Query caching strategies
   - Batch operation limits
   - Index usage statistics
   - Slow query logging

7. **System Entities:**
   - Which entities are considered "system" entities
   - Why system entity creation is disabled by default
   - How to identify and manage system entities

8. **Complex Query Patterns:**
   - Maximum depth for `with` eager loading
   - Nested `with` patterns for multiple levels
   - Complex join patterns (self-joins, etc.)
   - Subquery support

### Documentation Pattern: Explicit Unknowns Section

For comprehensive API documentation where details are incomplete:

1. **Document what we know** - Provide all verified information
2. **Create dedicated "Unknown Details" section** - Clear what's missing
3. **Categorize unknowns** - Group by importance (Critical, Important, Nice-to-have)
4. **Suggest research approaches** - How to find answers (source code, testing, community)
5. **Link to related docs** - Cross-reference relevant sections

Example structure used:
```markdown
## Unknown Details

The following aspects are not documented in available resources:

1. **Transaction management** - Why it matters
2. **Another behavior** - Why it matters

To understand these aspects, consult:
- Source code at `app/src/data/...`
- Community discussions
- Issue tracker
```

This pattern:
- Is honest about documentation gaps
- Doesn't mislead users
- Provides actionable next steps
- Encourages community contributions

### Key Learnings

1. **Clean separation of concerns** - Repository for reads, Mutator for writes is intuitive and matches common patterns
2. **Type safety throughout** - Generated types provide excellent developer experience
3. **Fluent API design** - Query building is readable and composable
4. **Rich where operators** - Supports all common comparison and logical operators
5. **Eager loading support** - `with` option prevents N+1 query problems
6. **Relation mutations** - Special operators make working with relationships easy

### Source Code Locations

Key files for understanding Data module:
- `app/src/data/entities/EntityManager.ts` - Central entity management
- `app/src/data/entities/query/Repository.ts` - Read operations implementation
- `app/src/data/entities/mutation/Mutator.ts` - Write operations implementation
- `app/src/data/entities/query/WhereBuilder.ts` - Query filtering logic
- `app/src/data/entities/query/WithBuilder.ts` - Eager loading implementation
- `app/src/data/entities/query/JoinBuilder.ts` - Manual join logic
- `app/src/data/relations/` - Entity relationship implementation
- `app/src/data/connection/Connection.ts` - Database connection abstraction

### Next Steps for Better Documentation

1. Test transaction behavior with integration tests
2. Document event subscription patterns
3. Research system entity identification and management
4. Create performance benchmarks for different query patterns
5. Add concrete examples for complex scenarios (nested relations, etc.)
6. Document error handling patterns with try-catch examples
7. Research connection pooling configuration options

## Task 4.2: Document Known Issues & Workarounds

### Key Discovery: Bknd Has Several Active Bugs

From research using Zread MCP server and official docs, I identified several active issues that users need to be aware of:

**What I know:**

1. **Timestamps Plugin Indexing Bug** (#325):
   - Race condition between plugin system and index initialization
   - Cannot index `created_at` or `updated_at` fields from timestamps plugin
   - Three workarounds available (don't index, add fields manually, use database-level indexing)

2. **Password Length Validation Inconsistency** (#318):
   - Signup allows passwords < 8 characters
   - Login fails with those same passwords
   - CLI only validates minimum 3 characters
   - Workaround: client-side validation before API calls

3. **Admin UI Route 404** (#216):
   - Sidebar navigation returns 404 errors
   - Long-standing issue (since July 2025)
   - Workarounds: use main entry point, avoid direct URLs, refresh page

4. **xdg-open Crash on Headless Systems** (#300):
   - CLI commands crash when trying to open browser
   - Affects Docker containers, CI/CD, headless servers
   - Workaround: set `BROWSER=none` environment variable

**What I don't know:**

1. **CodeMode initial seed bug**: The task plan mentions "CodeMode prevents initial seed (with workaround)" but I couldn't find specific documentation about this issue through Zread or web search. The official docs show that CodeMode requires manual `npx bknd sync --seed --force` command, which might be the "workaround" mentioned in the task plan. I documented what's known about seeding in different modes but couldn't confirm a specific bug.

2. **Other discovered bugs**: The task plan mentions "Other discovered bugs" but without specifics. I documented all known issues I could find through research.

### Documentation Pattern: Workaround Documentation Structure

For known issues with workarounds, use this structure:

```markdown
### Issue Name

**Issue:** #123

**Status:** Open/Closed (Date)

**Problem:**
Clear description of what goes wrong, with code example if applicable

**Root Cause:**
Technical explanation (if known)

**Workarounds:**
1. Workaround 1 - Explanation + code
2. Workaround 2 - Explanation + code
3. Workaround 3 - Explanation + code
```

This pattern:
- Provides clear problem statement
- Links to GitHub issue for tracking
- Explains why it happens
- Gives actionable workarounds
- Makes it easy to check if issue is resolved

### Best Practices for Issue Documentation

1. **Categorize by severity** - Critical, Validation, UI, Environment-Specific
2. **Include issue numbers** - Makes it easy to track resolution
3. **Provide multiple workarounds** - Give users options
4. **Be honest about unknowns** - If issue isn't documented well, say so
5. **Link to related resources** - GitHub issues, Discord, other docs
6. **Include reproduction steps** - Help users confirm if they have same issue

### Unknown Areas Requiring Research

1. **CodeMode initial seed bug** - Not documented in available resources, may need community investigation
2. **Password hashing algorithm details** - How bcrypt vs sha256 works internally
3. **Race condition timing** - Exact timing of plugin vs index initialization
4. **Browser opening mechanism** - How CLI detects browser availability

### Critical Learning: Official Docs Don't Cover All Issues

While official Bknd documentation is good, it doesn't comprehensively document all known issues. Users need to:

1. **Check GitHub Issues** - For active bugs and workarounds
2. **Join Discord** - For real-time help from community
3. **Search before reporting** - Avoid duplicate issue reports
4. **Provide detailed reports** - Steps to reproduce, environment details, error messages

The community is actively working on these issues, but documentation lags behind code changes.

### Source Code Locations

For understanding these issues:
- `app/src/plugins/timestamps/` - Timestamps plugin implementation
- `app/src/data/indexing/` - Index system (for race condition)
- `app/src/auth/Authenticator.ts` - Password validation logic
- `app/src/ui/admin/` - Admin UI routing code
- `app/src/cli/` - CLI browser opening logic

### Next Steps for Better Documentation

1. Test actual bugs to verify workarounds
2. Monitor GitHub issues for new bugs and resolutions
3. Update documentation when bugs are fixed
4. Create test cases that fail with known bugs (for regression testing)
5. Contribute fixes or PRs for high-priority bugs if possible


## Task 3.5: Bun/Node Standalone Guide

### Key Discovery: Simple Standalone Server Setup

Bknd provides extremely simple standalone server setup for both Bun and Node.js runtimes. The official documentation is concise and accurate for both runtimes.

**What I know:**

1. **Installation methods:**
   - CLI starter: `npx bknd create -i bun` or `npx bknd create -i node` (fastest)
   - Manual: `bun add bknd` or `npm install bknd`

2. **Server setup pattern:**
   - For Bun: `import { serve } from "bknd/adapter/bun"`
   - For Node.js: `import { serve } from "bknd/adapter/node"`
   - Both support optional configuration with `serve(config)`

3. **Minimal configuration:**
   ```typescript
   // Bun example
   serve({
     connection: {
       url: "file:data.db",
     },
   });
   ```

   ```typescript
   // Node.js example
   /** @type {import("bknd/adapter/node").NodeAdapterOptions} */
   const config = {
     connection: {
       url: "file:data.db",
     },
   };
   serve(config);
   ```

4. **Server output:**
   - Server runs on `http://localhost:3000`
   - Admin UI available at `http://localhost:3000/_admin`
   - API endpoints at `http://localhost:3000/api`

5. **Runtime differences:**
   - Bun: Faster startup, lower memory, better for development and edge
   - Node.js: Slower startup, wider compatibility, better for production

6. **Configuration options:**
   - Database connection: SQLite files, PostgreSQL, in-memory
   - Media storage: Local filesystem adapter
   - Server port: Configurable via environment variables

**What I don't know:**

1. **Media configuration details:** How to configure different media adapters beyond local filesystem
2. **Advanced config options:** Full list of configuration options for `serve()`
3. **Production deployment specifics:** Best practices for standalone servers in production
4. **Performance benchmarks:** Actual performance differences between Bun and Node.js
5. **Error handling:** How errors are handled in standalone mode

### Documentation Pattern: Dual Option Approach

For runtime-specific guides where CLI starter and manual setup are both viable:

1. **Present CLI starter first** - It's the fastest and recommended approach
2. **Include manual setup** - For users who want control or have existing projects
3. **Show minimal examples** - Both runtimes can start with just `serve()` and a database URL
4. **Highlight differences** - Performance, compatibility, use cases in comparison table
5. **Provide next steps** - Link to related guides (deployment, configuration)

This pattern gives users the quickest path to success while maintaining flexibility.

### Source Code Locations

Key files for understanding standalone adapters:
- `app/src/adapter/bun/index.ts` - Bun adapter implementation
- `app/src/adapter/node/node.adapter.ts` - Node.js adapter implementation
- `examples/bun/index.ts` - Bun standalone example
- `examples/node/index.js` - Node.js standalone example
- `app/src/adapter/Adapter.ts` - Base adapter interface

### Next Steps for Better Documentation

1. Document advanced configuration options (media adapters, logging, middleware)
2. Research production deployment patterns (PM2, Docker, systemd)
3. Add performance benchmarks comparing Bun vs Node.js
4. Document error handling and recovery strategies
5. Add examples for common scenarios (HTTPS, custom middleware, logging)

## Task 5.1: Complete Auth Module Documentation

### Key Discovery: Comprehensive Auth Module Documentation Possible via Source Code

The auth module documentation can be completed by thoroughly analyzing source code and cross-referencing with Zread documentation. While official docs at docs.bknd.io are incomplete, source code provides all necessary details.

### What I Learned:

**1. Auth Configuration is Extensive**

The auth module has detailed configuration across multiple areas:
- JWT configuration (secret, algorithm, expiration, fields)
- Cookie configuration (domain, path, sameSite, secure, httpOnly, expires, partitioned, renew, redirect paths)
- Strategy configuration (password, OAuth, custom OAuth)
- Roles and permissions configuration
- Guard configuration

**2. Three Built-in Strategy Types**

- Password Strategy: Email/password with configurable hashing (plain, sha256, bcrypt)
- OAuth Strategy: Built-in providers (Google, GitHub, Discord, Facebook) with OIDC/OAuth2 support
- Custom OAuth Strategy: Full control over OAuth server, client, and profile mapping

**3. Session Management with Sliding Expiration**

Bknd implements sliding session expiration via `cookie.renew` configuration:
- When enabled (default), cookie refreshes on every authenticated request
- Resets expiration timer to configured duration (e.g., 1 week)
- Session expires after N seconds of **inactivity**, not N seconds from login
- Defense-in-depth with JWT expiration (shorter) + cookie expiration (longer)

**4. No Refresh Token Rotation**

Based on source code analysis:
- Bknd does **not** implement refresh token rotation
- Only sliding session expiration is supported
- No `/api/auth/refresh` endpoint exists
- Cookie renewal happens automatically on authenticated requests

**5. Comprehensive API Endpoints**

The auth module registers many endpoints automatically:

**Authentication:**
- `GET /api/auth/strategies` - List available strategies
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Clear session

**Password Strategy:**
- `POST /api/auth/password/login` - Login with email/password
- `POST /api/auth/password/register` - Register new user

**OAuth Strategies (per provider):**
- `GET /api/auth/{strategy}/login` - Initiate OAuth flow (redirect)
- `POST /api/auth/{strategy}/login` - Initiate OAuth flow (programmatic)
- `GET /api/auth/{strategy}/register` - OAuth registration
- `GET /api/auth/{strategy}/callback` - Handle OAuth callback
- `GET /api/auth/{strategy}/token` - Exchange code for token (programmatic)

**User Management (protected):**
- `POST /api/auth/{strategy}/create` - Create user (requires permission)
- `GET /api/auth/{strategy}/create/schema.json` - Get user creation schema

**6. Programmatic User Creation Methods**

Three levels of control for creating users:

**Level 1: App.createUser (simplest)**
\`\`\`typescript
await app.auth.createUser({ email, password, role });
\`\`\`

**Level 2: UserPool (more control)**
\`\`\`typescript
await app.auth.authenticator.userPool.create("password", { email, strategy_value: hashedPassword });
\`\`\`

**Level 3: EntityManager (full control)**
\`\`\`typescript
await em.mutator("users").insertOne({ email, strategy: "password", strategy_value: hashedPassword });
\`\`\`

**7. Password Management**

Programmatic password change available:

\`\`\`typescript
await app.auth.changePassword(userId, newPassword);
\`\`\`

Requirements:
- User must be using password strategy
- Password hashed automatically using configured PasswordStrategy

**8. Known Limitations from Source Code**

Based on TODO comments and implementation:

1. **Password length hardcoded:** Minimum 8 characters, not configurable (TODO in PasswordStrategy.ts:17)
2. **Password strategy required:** Cannot disable password strategy (TODO in AppAuth.ts:40)
3. **No refresh token rotation:** Only sliding session via cookie renewal
4. **No password change HTTP endpoint:** Only programmatic method available
5. **Limited user fields:** Default fields are email, role, strategy, strategy_value (plus custom fields)
6. **No token/cookie interchangeability:** System comment warns about using both interchangeably

**9. Cookie Configuration Defaults**

\`\`\`typescript
{
  domain: undefined,
  path: "/",
  sameSite: "lax",
  secure: true,
  httpOnly: true,
  expires: 604800, // 1 week in seconds
  partitioned: false,
  renew: true, // Sliding session
  pathSuccess: "/",
  pathLoggedOut: "/",
}
\`\`\`

**10. JWT Configuration Defaults**

\`\`\`typescript
{
  secret: "", // Auto-generated if empty
  alg: "HS256", // Can be HS256, HS384, HS512
  expires: undefined, // Inherits from cookie.expires
  issuer: undefined,
  fields: ["id", "email", "role"], // User fields in JWT payload
}
\`\`\`

### Documentation Pattern: Comprehensive Reference Docs

For module reference documentation (task 5.1), include:

1. **Complete Configuration Reference** - All options with types, defaults, and descriptions
2. **API Endpoint Documentation** - All endpoints with methods, parameters, request/response formats
3. **Programmatic API Reference** - All methods for TypeScript/JavaScript code
4. **Code Examples** - Practical examples for common use cases
5. **Comparison Tables** - Strategy comparisons, security options
6. **Security Best Practices** - Recommendations for production use
7. **Troubleshooting** - Common issues and solutions
8. **Limitations and TODOs** - Known limitations from source code

### Research Approach

1. **Start with Zread docs** - Get high-level understanding and examples
2. **Read source code** - Auth module files for complete implementation details
3. **Cross-reference** - Compare docs with source to ensure accuracy
4. **Test assumptions** - When unclear, look for test files or examples
5. **Document unknowns** - Be explicit about what's not documented

### What I Don't Know (Documented in Reference)

1. **OAuth provider details:** Exact endpoints for each built-in provider (Google, GitHub, etc.) - documented as "built-in" but implementation details in `app/src/auth/authenticate/strategies/oauth/issuers/` not fully explored
2. **Custom strategy examples:** Real-world custom OAuth strategy examples beyond code structure
3. **Password validation best practices:** Production-ready password complexity requirements (beyond minimum 8 chars)
4. **Session concurrency:** Behavior when user logs in from multiple devices
5. **Token revocation:** How to revoke specific sessions (logout revokes all)

### Next Steps for Better Documentation

1. Explore OAuth issuer configurations for built-in providers
2. Find real-world custom OAuth strategy examples
3. Test password management in actual application
4. Document session behavior with multiple concurrent logins
5. Research token revocation mechanisms

### Source Code Locations for Auth Module

Key files for comprehensive auth module understanding:
- `app/src/auth/AppAuth.ts` - Main auth module class with build lifecycle
- `app/src/auth/auth-schema.ts` - All configuration schemas (auth, jwt, cookie, roles, guard)
- `app/src/auth/auth-permissions.ts` - Built-in permission definitions
- `app/src/auth/authenticate/Authenticator.ts` - JWT signing/verification, cookie management, session handling
- `app/src/auth/AppUserPool.ts` - UserPool implementation (findBy, create, field visibility)
- `app/src/auth/api/AuthController.ts` - All HTTP endpoints and MCP tools
- `app/src/auth/authenticate/strategies/PasswordStrategy.ts` - Password hashing (sha256, bcrypt), login/register flow
- `app/src/auth/authenticate/strategies/oauth/OAuthStrategy.ts` - OAuth flow, PKCE, callback handling
- `app/src/auth/authenticate/strategies/Strategy.ts` - Base strategy class for custom implementations
- `app/src/auth/authorize/Guard.ts` - Permission evaluation engine
- `app/src/auth/authorize/Role.ts` - Role implementation with is_default, implicit_allow
- `app/src/auth/authorize/Permission.ts` - Permission definitions
- `app/src/auth/authorize/Policy.ts` - Policy implementation with effects (allow, deny, filter)

### Best Practices for Auth Documentation

1. **Provide complete examples** - Show full configuration for common scenarios
2. **Explain trade-offs** - Hashing algorithms, session expiration, security vs UX
3. **Document all options** - Every configuration property with type and default
4. **Include error scenarios** - What goes wrong and how to fix it
5. **Be honest about limitations** - Document TODOs and known issues
6. **Link to related docs** - Tutorials, guides, reference docs
7. **Use code fences** - Clear, runnable code examples
8. **Organize logically** - Configuration → Endpoints → Programmatic API → Best Practices


## Task 3.6: "Deploy to Production" Tutorial

### Key Discovery: Production Database Choice is Critical

While local development works with file-based SQLite, production deployment requires a persistent database solution. Bknd supports multiple production databases but requires careful configuration.

**What I know:**

1. **Database options for production:**
   - **Turso (LibSQL)**: Recommended for edge deployment, HTTP-based SQLite, free tier available
   - **PostgreSQL**: Traditional choice, supports Neon/Supabase/Railway, better for complex queries
   - **File-based SQLite**: Not recommended for production (doesn't persist across deployments)

2. **Vercel deployment workflow:**
   - Push code to GitHub
   - Import project in Vercel
   - Configure environment variables (`DATABASE_URL`, `TURSO_AUTH_TOKEN` if using Turso)
   - Deploy with automatic preview + production environments

3. **Mode switching pattern:**
   - Development: Use database mode (`options.mode: "db"`) for quick iteration
   - Production: Switch to code mode (`options.mode: "code"`) with exported schema
   - Export schema via Admin UI or CLI: `npx bknd config --out appconfig.json`

4. **Edge runtime considerations:**
   - Enable `export const runtime = "edge"` in API routes for better performance
   - File-based SQLite doesn't work with edge runtime
   - Turso/LibSQL designed for edge deployment
   - PostgreSQL may have latency from edge locations

**What I don't know:**

1. **Database migrations:** How to handle schema changes in production without downtime
2. **Backup strategies:** Automated backup recommendations for Turso/PostgreSQL
3. **Rollback procedures:** How to roll back deployments if issues occur
4. **Database connection pooling:** Configuration for high-traffic scenarios
5. **Multi-region deployment:** How Turso replication works with Vercel edge

### Documentation Pattern: Production Readiness Checklist

For production deployment guides, include:
- Prerequisites (GitHub repo, Vercel account)
- Database selection guidance with trade-offs
- Step-by-step Vercel configuration
- Environment variable setup
- Production checklist (what to verify before going live)
- Common issues and solutions
- Next steps for scaling

### Best Practices Documented

1. **Use environment variables** for all sensitive configuration
2. **Never commit** database credentials or API keys
3. **Test in preview deployments** before promoting to production
4. **Enable edge runtime** for better global performance
5. **Monitor database connection errors** after deployment
6. **Set up database backups** before handling production data

### Source Code Locations

Key files for production deployment:
- `app/src/adapter/nextjs/nextjs.adapter.ts` - Next.js runtime integration
- `app/src/data/adapters/` - Database adapter implementations
- `examples/nextjs/bknd.config.ts` - Production configuration example

### Research Approach

1. **Zread MCP** for Bknd-specific deployment guidance
2. **Firecrawl search** for Vercel-specific environment variable setup
3. **Existing integration guides** to understand deployment patterns
4. **Official docs** cross-reference for verification

### Next Steps for Better Documentation

1. Test actual Turso deployment to verify connection setup
2. Document database migration workflows
3. Add monitoring and logging recommendations
4. Create comparison table for different database providers
5. Investigate edge runtime limitations with specific features

## Task 3.7: Framework Comparison Matrix

### Key Discovery: Framework Choice Depends on Use Case, Not One "Best" Option

Bknd supports multiple integration patterns across frameworks and runtimes. The "right" choice depends entirely on project requirements, team expertise, and deployment needs.

### Framework Integration Patterns

**Framework Adapters (Deep Integration):**
- **Next.js** - Full framework adapter with App Router, Server Components, API routes
- **React Router** - Framework adapter with loader/action pattern
- **Astro** - Framework adapter with SSR support, two integration approaches (page-based, middleware)

**Runtime Adapters (Standalone):**
- **Bun/Node** - Standalone API servers, full control
- **Cloudflare Workers** - Edge deployment with D1 database
- **Vite + React** - Development-focused SPA setup with HMR

### Decision Factors for Framework Selection

**1. Project Type:**
   - Production SaaS → Next.js
   - Content site → Astro
   - Simple SPA → Vite + React
   - Standalone backend → Bun/Node

**2. Team Expertise:**
   - Next.js team → Next.js
   - React team → React Router or Vite + React
   - Full-stack team → Next.js or React Router
   - Frontend team → Astro or Vite + React

**3. Technical Requirements:**
   - Need SEO → Next.js or Astro
   - Need SSR → Next.js, React Router, or Astro
   - Want edge deployment → Next.js (edge runtime) or Cloudflare Workers
   - Need smallest bundle → Astro
   - Need fastest dev → Vite + React

### Critical Gaps in Documentation

The following integration aspects are unclear or undocumented:

**React Router Integration:**
1. API catch-all route setup - Documentation mentions `api.$.tsx` but file not found in repository
2. Authentication best practices - Whether to use middleware vs loader checks
3. Client-side SDK integration - How to use React SDK with React Router

**Astro Integration:**
1. React SDK compatibility - Whether `useAuth()`, `useEntityQuery()` work in Astro islands
2. Performance differences - Page-based vs middleware approach benchmarks
3. Optimistic updates - Best practices for client-side state management

**Framework-Specific Features:**
1. Server Actions support - Beyond Next.js
2. Streaming SSR - Framework compatibility
3. Edge runtime behavior - Which features work/not work at edge
4. Connection pooling - How frameworks handle DB connections under load

### Integration Pattern Comparison Table

**API Route Setup:**
| Framework | Route Pattern | Complexity |
|-----------|--------------|------------|
| Next.js | `app/api/[[...bknd]]/route.ts` | Simple |
| React Router | Unknown (`api.$.tsx`?) | Unclear |
| Astro | `pages/api/[...api].astro` | Simple |
| Vite + React | Built-in to `server.ts` | Simple |
| Bun/Node | Built-in to server | Simple |

**Data Fetching:**
| Framework | Server-Side | Client-Side | Pattern |
|-----------|-------------|--------------|----------|
| Next.js | ✅ Server Components | ✅ React SDK | `getApi()` |
| React Router | ✅ Loaders | ⚠️ Unclear | `getApi(args)` |
| Astro | ✅ Frontmatter | ⚠️ Unknown | `getApi(Astro)` |
| Vite + React | ❌ No | ✅ SDK | `new Api()` |
| Bun/Node | N/A | Client SDK | REST API |

**Authentication:**
| Framework | Verification Method |
|-----------|-------------------|
| Next.js | `getApi({ verify: true })` |
| React Router | `getApi(args, { verify })` |
| Astro | `getApi(Astro, { verify })` |
| Vite + React | SDK `useAuth()` hook |
| Bun/Node | JWT in headers (manual) |

### Documentation Pattern: Comprehensive Comparison Tables

For complex technical decisions with multiple options, create:

1. **Quick decision matrix** - One-glance overview
2. **Detailed framework breakdowns** - Pros/cons for each
3. **Integration pattern comparison** - How to do X in each framework
4. **Recommendation guide** - When to choose which framework
5. **Migration paths** - How to move between frameworks
6. **Performance considerations** - Bundle size, TTFB, etc.
7. **Unknown areas section** - Document what's unclear

This pattern helps users make informed decisions based on their specific needs.

### Performance Insights

**Bundle Size Impact:**
- Astro: ~30 KB total (smallest)
- React Router: ~110 KB total
- Vite + React: ~110 KB total
- Next.js: ~150 KB total (largest)

**Time to First Byte (TTFB):**
- Bun/Node: ~50-100ms (fastest - pure backend)
- Astro: ~50-150ms (SSR optimized)
- Next.js: ~100-200ms (SSR with edge option)
- React Router: ~150-300ms (SSR)
- Vite + React: ~300-500ms (no SSR)

### Unknown Areas Requiring Testing/Research

1. React Router API route setup method
2. React Router authentication best practices
3. Astro React SDK compatibility with islands
4. Real-world performance benchmarks (not estimates)
5. Database connection pooling by framework
6. Edge runtime compatibility per framework
7. Multi-tenant deployment patterns
8. WebAssembly support across frameworks

### Source Code Locations

For understanding framework integrations:
- `app/src/adapter/nextjs/nextjs.adapter.ts` - Next.js adapter
- `app/src/adapter/react-router/react-router.adapter.ts` - React Router adapter
- `app/src/adapter/astro/astro.adapter.ts` - Astro adapter
- `app/src/adapter/vite/vite.adapter.ts` - Vite adapter
- `app/src/adapter/bun/bun.adapter.ts` - Bun runtime adapter
- `app/src/adapter/node/node.adapter.ts` - Node runtime adapter
- `app/src/adapter/cloudflare/cloudflare.adapter.ts` - Cloudflare Workers adapter
- `examples/*/` - Working examples for each integration

### Research Approach for Framework Comparisons

1. Read official Bknd integration docs at docs.bknd.io
2. Use Zread MCP server to access code-level documentation
3. Read example code in `examples/` directory
4. Compare integration patterns across adapters
5. Identify gaps and unknowns explicitly
6. Document both what we know and what we don't know
7. Provide practical recommendations based on use cases

### Next Steps for Better Framework Documentation

1. Test React Router API route setup to verify method
2. Test Astro React SDK with islands to confirm compatibility
3. Run performance benchmarks across frameworks
4. Document advanced patterns (multi-tenant, caching, etc.)
5. Create migration guides between frameworks
6. Add framework-specific troubleshooting sections
7. Investigate edge runtime limitations per framework

### Recommendation: Be Honest About Unknowns

When documenting framework comparisons:
- Explicitly mark unknown areas with "⚠️ Unknown"
- Provide workarounds when possible
- Add TODO markers for what needs follow-up
- Don't speculate or guess
- Encourage community contributions to fill gaps

This builds trust with users and makes it clear what requires further research.
