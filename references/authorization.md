# Authorization Reference

Technical reference for Bknd v0.20.0 authorization system: Guards, Roles, Permissions, Policies, and row-level security.

## Core Concepts

### Architecture Overview

Bknd's authorization is a layered system:

```
Guard (evaluator)
  └── Roles (permission containers)
        └── Permissions (discrete operations)
              └── Policies (conditional logic + filters)
```

- **Guard**: Central evaluator that checks permissions against user context
- **Role**: Named container grouping permissions with default behavior
- **Permission**: Discrete operation (e.g., `data.entity.read`)
- **Policy**: Conditional rules with allow/deny/filter effects

### Enabling Authorization

```typescript
import { defineConfig } from "bknd";

export default defineConfig({
  auth: {
    enabled: true,
    guard: { enabled: true },  // Enable authorization
    roles: {
      // Role definitions here
    },
  },
});
```

---

## Roles

### Role Definition

```typescript
{
  auth: {
    roles: {
      admin: {
        implicit_allow: true,  // Allow all by default
      },
      editor: {
        implicit_allow: false,
        permissions: [
          "data.entity.read",
          "data.entity.create",
          "data.entity.update",
        ],
      },
      viewer: {
        permissions: ["data.entity.read"],
        is_default: true,  // Applied when no role assigned
      },
    },
  },
}
```

### Role Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `permissions` | `string[]` or `RolePermission[]` | `[]` | Permissions granted to role |
| `is_default` | `boolean` | `false` | Use when user has no role |
| `implicit_allow` | `boolean` | `false` | Allow all unless explicitly denied |

### Role Resolution

1. User's `role` field checked against defined roles
2. If no match, default role (`is_default: true`) used
3. If no default role, access denied

```typescript
// User with explicit role
const user = { id: 1, email: "admin@example.com", role: "admin" };

// User with no role - uses default
const guest = { id: 2, email: "guest@example.com", role: null };
```

---

## Permissions

### Built-in Data Permissions

| Permission | Filterable | Context | Purpose |
|------------|------------|---------|---------|
| `data.entity.read` | Yes | `entity`, `id?` | Read entity records |
| `data.entity.create` | Yes | `entity` | Create new records |
| `data.entity.update` | Yes | `entity`, `id?` | Update existing records |
| `data.entity.delete` | Yes | `entity`, `id?` | Delete records |
| `data.database.sync` | No | - | Sync database schema |
| `data.raw.query` | No | - | Execute raw queries |
| `data.raw.mutate` | No | - | Execute raw mutations |

### Permission Syntax

Simple string format:
```typescript
{
  roles: {
    editor: {
      permissions: [
        "data.entity.read",
        "data.entity.create",
      ],
    },
  },
}
```

Extended format with policies:
```typescript
{
  roles: {
    editor: {
      permissions: [
        {
          permission: "data.entity.read",
          effect: "allow",
          policies: [/* Policy definitions */],
        },
      ],
    },
  },
}
```

### Permission with Effect

| Effect | Description |
|--------|-------------|
| `allow` | Grant permission (default) |
| `deny` | Explicitly deny permission |

```typescript
{
  permissions: [
    { permission: "data.entity.read", effect: "allow" },
    { permission: "data.entity.delete", effect: "deny" },
  ],
}
```

---

## Policies

Policies add conditional logic to permissions.

### Policy Structure

```typescript
{
  description?: string,       // Human-readable description
  condition?: ObjectQuery,    // When policy applies
  effect: "allow" | "deny" | "filter",
  filter?: ObjectQuery,       // Row-level filter (for effect: "filter")
}
```

### Policy Effects

| Effect | Purpose | Use Case |
|--------|---------|----------|
| `allow` | Grant access when condition met | Conditional access |
| `deny` | Block access when condition met | Override allows |
| `filter` | Apply query filter to results | Row-level security |

### Condition Syntax

Conditions use object query syntax with operators:

```typescript
// Simple equality
{ entity: "posts" }

// Comparison operators
{ age: { $gte: 18 } }

// Variable placeholders (@variable)
{ "@user.id": "@owner_id" }
```

**Supported Operators:**
| Operator | Description |
|----------|-------------|
| `$eq` | Equal |
| `$ne` | Not equal |
| `$gt` | Greater than |
| `$gte` | Greater than or equal |
| `$lt` | Less than |
| `$lte` | Less than or equal |
| `$in` | In array |
| `$nin` | Not in array |

### Variable Placeholders

Use `@variable` syntax to reference runtime context:

| Placeholder | Description |
|-------------|-------------|
| `@user.id` | Current user's ID |
| `@user.email` | Current user's email |
| `@user.role` | Current user's role |
| `@entity` | Current entity name |
| `@id` | Current record ID |

---

## Row-Level Security (RLS)

Implement data-level access control using filter policies.

### Basic RLS Pattern

Users can only read their own records:

```typescript
{
  roles: {
    user: {
      permissions: [
        {
          permission: "data.entity.read",
          effect: "allow",
          policies: [
            {
              description: "Users can only read own records",
              effect: "filter",
              filter: { user_id: "@user.id" },
            },
          ],
        },
      ],
    },
  },
}
```

### Entity-Specific RLS

Different filters per entity:

```typescript
{
  permissions: [
    {
      permission: "data.entity.read",
      effect: "allow",
      policies: [
        // Posts: filter by author
        {
          condition: { entity: "posts" },
          effect: "filter",
          filter: { author_id: "@user.id" },
        },
        // Comments: filter by user
        {
          condition: { entity: "comments" },
          effect: "filter",
          filter: { user_id: "@user.id" },
        },
      ],
    },
  ],
}
```

### Public vs Private Records

```typescript
{
  permissions: [
    {
      permission: "data.entity.read",
      effect: "allow",
      policies: [
        // Public posts: no filter
        {
          condition: { entity: "posts" },
          effect: "filter",
          filter: {
            $or: [
              { public: true },
              { author_id: "@user.id" },
            ],
          },
        },
      ],
    },
  ],
}
```

---

## Common Patterns

### Admin Role (Full Access)

```typescript
{
  roles: {
    admin: {
      implicit_allow: true,  // Allow everything by default
    },
  },
}
```

### Read-Only Role

```typescript
{
  roles: {
    viewer: {
      implicit_allow: false,
      permissions: ["data.entity.read"],
    },
  },
}
```

### CRUD Role with RLS

```typescript
{
  roles: {
    user: {
      permissions: [
        // Read: own records only
        {
          permission: "data.entity.read",
          effect: "allow",
          policies: [{
            effect: "filter",
            filter: { user_id: "@user.id" },
          }],
        },
        // Create: allowed (will set user_id via trigger/plugin)
        { permission: "data.entity.create", effect: "allow" },
        // Update: own records only
        {
          permission: "data.entity.update",
          effect: "allow",
          policies: [{
            effect: "filter",
            filter: { user_id: "@user.id" },
          }],
        },
        // Delete: own records only
        {
          permission: "data.entity.delete",
          effect: "allow",
          policies: [{
            effect: "filter",
            filter: { user_id: "@user.id" },
          }],
        },
      ],
    },
  },
}
```

### Entity-Based Permissions

```typescript
{
  roles: {
    content_editor: {
      permissions: [
        // Full access to posts and comments
        {
          permission: "data.entity.read",
          effect: "allow",
          policies: [{
            condition: { entity: { $in: ["posts", "comments"] } },
            effect: "allow",
          }],
        },
        {
          permission: "data.entity.create",
          effect: "allow",
          policies: [{
            condition: { entity: { $in: ["posts", "comments"] } },
            effect: "allow",
          }],
        },
        {
          permission: "data.entity.update",
          effect: "allow",
          policies: [{
            condition: { entity: { $in: ["posts", "comments"] } },
            effect: "allow",
          }],
        },
        // No delete access
      ],
    },
  },
}
```

### Anonymous/Guest Access

```typescript
{
  roles: {
    anonymous: {
      is_default: true,  // Applied when not logged in
      implicit_allow: false,
      permissions: [
        // Read-only public content
        {
          permission: "data.entity.read",
          effect: "allow",
          policies: [{
            condition: { entity: "posts" },
            effect: "filter",
            filter: { public: true },
          }],
        },
      ],
    },
  },
}
```

---

## Guard API

### Checking Permissions (Server-Side)

```typescript
import { getApi } from "bknd";

export async function handler(request: Request, app) {
  const api = getApi(app);
  const guard = app.modules.get("auth").guard;
  const user = await api.auth.resolveAuthFromRequest(request);

  // Check if permission granted (throws on denied)
  try {
    guard.granted(
      entityRead,           // Permission object
      { role: user?.role }, // User context
      { entity: "posts" }   // Permission context
    );
    // Access granted
  } catch (error) {
    // Access denied - error is GuardPermissionsException
    return new Response("Forbidden", { status: 403 });
  }
}
```

### Getting Filters for Queries

```typescript
const guard = app.modules.get("auth").guard;

// Get filter policies for a permission
const result = guard.filters(
  entityRead,
  { role: "user", id: 123 },
  { entity: "posts" }
);

// Apply filter to your query
const posts = await api.data.readMany("posts", {
  where: result.merge({ status: "published" }),
});

// Or check if records match filters
const allowed = result.matches(records, { throwOnError: false });
```

### Guard Methods

| Method | Description |
|--------|-------------|
| `granted(permission, context, permContext)` | Check permission, throws if denied |
| `filters(permission, context, permContext)` | Get filter policies for RLS |
| `isEnabled()` | Check if guard is enabled |
| `getUserRole(user)` | Get user's role or default |
| `getDefaultRole()` | Get the default role |

---

## Error Handling

### GuardPermissionsException

Thrown when permission denied:

```typescript
{
  name: "PermissionsException",
  code: 403,
  message: "Permission \"data.entity.read\" not granted",
  permission: "data.entity.read",
  policy: { /* policy that denied */ },
  description: "Role \"viewer\" does not have required permission"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Permission does not exist" | Unknown permission name | Check permission spelling |
| "User has no role" | No role and no default | Set `is_default: true` on a role |
| "Role does not have required permission" | Missing permission | Add permission to role |
| "Policy condition unmet" | Policy denied access | Review policy conditions |

### REST API Error Response

```json
{
  "error": "PermissionsException",
  "message": "Permission \"data.entity.delete\" not granted",
  "permission": "data.entity.delete",
  "description": "Role \"viewer\" does not have required permission"
}
```

---

## Configuration Reference

### Full Auth Config with Authorization

```typescript
{
  auth: {
    enabled: true,
    guard: {
      enabled: true,
      context: {},  // Additional context for policy evaluation
    },
    default_role_register: "user",  // Role assigned on registration
    roles: {
      admin: {
        implicit_allow: true,
      },
      user: {
        implicit_allow: false,
        permissions: [
          "data.entity.read",
          {
            permission: "data.entity.create",
            effect: "allow",
          },
          {
            permission: "data.entity.update",
            effect: "allow",
            policies: [{
              effect: "filter",
              filter: { user_id: "@user.id" },
            }],
          },
          {
            permission: "data.entity.delete",
            effect: "allow",
            policies: [{
              effect: "filter",
              filter: { user_id: "@user.id" },
            }],
          },
        ],
      },
      anonymous: {
        is_default: true,
        permissions: ["data.entity.read"],
      },
    },
  },
}
```

### Role Schema

```typescript
type RoleConfig = {
  permissions?: (string | RolePermissionConfig)[];
  is_default?: boolean;
  implicit_allow?: boolean;
};

type RolePermissionConfig = {
  permission: string;
  effect?: "allow" | "deny";
  policies?: PolicyConfig[];
};

type PolicyConfig = {
  description?: string;
  condition?: ObjectQuery;
  effect?: "allow" | "deny" | "filter";
  filter?: ObjectQuery;
};
```

---

## Security Checklist

**Configuration:**
- [ ] Enable guard: `guard: { enabled: true }`
- [ ] Set a default role for unauthenticated users
- [ ] Use `implicit_allow: false` for non-admin roles
- [ ] Apply RLS filters for user-specific data

**Permissions:**
- [ ] Grant minimum necessary permissions per role
- [ ] Use entity conditions for entity-specific access
- [ ] Test all role/permission combinations

**Row-Level Security:**
- [ ] Filter user data by `user_id` or ownership field
- [ ] Handle public vs private records explicitly
- [ ] Test RLS filters with different user contexts

**Production:**
- [ ] Verify admin role is properly protected
- [ ] Ensure sensitive operations require authentication
- [ ] Audit permission assignments regularly
