---
name: permissions
description: Use when implementing authorization, access control, RBAC, role-based permissions, guards, policies, row-level security, guest access, or protecting API endpoints. Covers Guard system, roles, permissions, policies, and data filtering.
---

# Permissions and Access Control

Bknd provides a comprehensive authorization system built on Guard, roles, permissions, and policies. This system controls who can access what in your application.

## What You'll Learn

- Configure the Guard and roles
- Define permissions with allow, deny, and filter effects
- Use policies for row-level security
- Implement guest access for public endpoints
- Filter data based on user context

## Core Concepts

Bknd's authorization follows this hierarchy:

```
Guard (evaluates)
  └─> Roles (group permissions)
      └─> Permissions (define what's allowed)
          └─> Policies (conditional logic)
```

- **Guard**: Evaluates permissions against user context
- **Roles**: Group permissions and define default behavior
- **Permissions**: Grant access with allow, deny, or filter effects
- **Policies**: Add conditional logic to permissions

## Enabling Authorization

The Guard is automatically enabled when you enable auth:

```typescript
import { em, entity, text, boolean } from "bknd";

const schema = em({
  posts: entity("posts", {
    title: text().required(),
    content: text(),
    published: boolean(),
  }),
});

export default {
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      jwt: {
        issuer: "my-app",
      },
      roles: [
        {
          name: "guest",
          is_default: true,
          implicit_allow: false,
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
          ],
        },
      ],
    },
  },
};
```

## Defining Roles

Roles group permissions together and set default behavior:

```typescript
{
  name: "admin",
  is_default: false,
  implicit_allow: true,
  permissions: [],
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Unique role identifier |
| `is_default` | boolean | Assigned to users without explicit role |
| `implicit_allow` | boolean | Allow all permissions (security risk) |
| `permissions` | array | List of permissions for this role |

## Permission Effects

Permissions define what's allowed with three effects:

### Allow Effect

Grants access when conditions are met:

```typescript
{
  permission: "entityRead",
  effect: "allow",
  policies: [
    {
      condition: { entity: "posts" },
      effect: "allow",
    },
  ],
}
```

### Deny Effect

Revokes access (takes precedence over allow):

```typescript
{
  permission: "entityDelete",
  effect: "deny",
  policies: [
    {
      condition: { entity: "posts" },
      effect: "deny",
    },
  ],
}
```

### Filter Effect

Filters data based on query criteria (row-level security):

```typescript
{
  permission: "entityRead",
  effect: "allow",
  policies: [
    {
      condition: { entity: "posts" },
      effect: "filter",
      filter: { author_id: "@user.id" },
    },
  ],
}
```

## Common Patterns

### Public Read, Authenticated Write

```typescript
{
  auth: {
    enabled: true,
    roles: [
      {
        name: "guest",
        is_default: true,
        implicit_allow: false,
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
        ],
      },
      {
        name: "user",
        is_default: false,
        implicit_allow: false,
        permissions: [
          {
            permission: "entityCreate",
            effect: "allow",
            policies: [
              {
                condition: { entity: "posts" },
                effect: "allow",
              },
            ],
          },
          {
            permission: "entityUpdate",
            effect: "allow",
            policies: [
              {
                condition: { entity: "posts" },
                effect: "filter",
                filter: { author_id: "@user.id" },
              },
            ],
          },
        ],
      },
    ],
  },
}
```

### User-Own Data Pattern

Users can only read and modify their own data:

```typescript
{
  name: "user",
  permissions: [
    {
      permission: "entityRead",
      effect: "allow",
      policies: [
        {
          condition: { entity: "posts" },
          effect: "filter",
          filter: { author_id: "@user.id" },
        },
      ],
    },
    {
      permission: "entityUpdate",
      effect: "allow",
      policies: [
        {
          condition: { entity: "posts" },
          effect: "filter",
          filter: { author_id: "@user.id" },
        },
      ],
    },
    {
      permission: "entityDelete",
      effect: "allow",
      policies: [
        {
          condition: { entity: "posts" },
          effect: "filter",
          filter: { author_id: "@user.id" },
        },
      ],
    },
  ],
}
```

### Multi-Tenant Isolation

Each tenant sees only their data:

```typescript
{
  name: "user",
  permissions: [
    {
      permission: "entityRead",
      effect: "allow",
      policies: [
        {
          condition: { entity: "*" },
          effect: "filter",
          filter: { tenant_id: "@user.tenant_id" },
        },
      ],
    },
  ],
}
```

## Policy Variables

Policies support dynamic variable substitution using `@variable` syntax:

### Available Variables

| Variable | Source | Example |
|----------|--------|---------|
| `@user.id` | Authenticated user's ID | `@user.id` |
| `@user.role` | User's role name | `@user.role` |
| `@user.*` | Any user property | `@user.email`, `@user.tenant_id` |
| `@ctx.*` | Guard config context | Custom context variables |

### Example: User-Owned Data

```typescript
filter: {
  author_id: "@user.id",
}
```

### Example: Time-Based Access

```typescript
filter: {
  start_date: { $lte: "@ctx.now" },
  end_date: { $gte: "@ctx.now" },
}
```

### Example: Multi-Tenant with Public Content

```typescript
filter: {
  $or: [
    { published: true },
    { tenant_id: "@user.tenant_id" },
  ],
}
```

## Data Permissions

Bknd provides built-in permissions for data operations:

| Permission | Description | Filterable |
|------------|-------------|------------|
| `entityRead` | Read entity data | Yes |
| `entityCreate` | Create new entity records | No |
| `entityUpdate` | Update entity records | Yes |
| `entityDelete` | Delete entity records | Yes |

Filterable permissions support the `filter` effect for row-level security.

## Schema Permissions

Schema operations are protected by system permissions:

```typescript
{
  permission: "system.schema.read",
  effect: "allow",
  policies: [],
}
```

Protects:
- `GET /api/system/schema` - Get current schema
- `GET /api/data/schema` - Get data schema

## Testing Permissions

Create test users to verify access control:

```typescript
import { createBknd } from "bknd";

const app = await createBknd({
  connection: { url: "file:test.db" },
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      roles: [
        // Your roles configuration
      ],
    },
  },
});

// Create test data
await app.em.mutator("posts").insertMany([
  { title: "Public Post", published: true },
  { title: "Private Post", published: false },
]);

// Test as guest (no authentication)
const guestPosts = await app.em.repository("posts").findMany({});
console.log("Guest sees:", guestPosts); // Only published posts

// Create authenticated user context
const userContext = {
  user: { id: 1, email: "user@example.com", role: "user" },
};

// Test as authenticated user
const userPosts = await app.em.repository("posts").findMany(
  {},
  { auth: userContext }
);
```

## DOs and DON'Ts

**DO:**
- Use `implicit_allow: false` for production roles (require explicit permissions)
- Use `filter` effect for row-level security
- Test with both guest and authenticated contexts
- Define `is_default` role for unauthenticated access
- Use policy filters for complex access rules

**DON'T:**
- Use `implicit_allow: true` unless you truly need all access
- Forget to set `is_default: true` for guest role
- Mix allow and deny in the same permission (deny takes precedence)
- Skip testing edge cases (what happens with null user context?)
- Hardcode user IDs in filters (use `@user.id` instead)

## Common Issues

**Guests can't access anything:**
- Ensure `auth.enabled: true` (required for Guard)
- Check `is_default: true` is set on a role
- Verify `implicit_allow: false` (explicit permissions required)

**Users accessing protected data:**
- Check `filter` conditions match your data structure
- Verify policy variables (`@user.id`) are resolving correctly
- Ensure no `implicit_allow: true` roles are assigned

**Public endpoints returning 403:**
- Verify guest role has the required permission
- Check policy conditions are met
- Debug with `console.log(ctx.get("auth"))` to see user context

## Next Steps

- **[Auth](auth)** - Configure authentication strategies
- **[Data Schema](data-schema)** - Define your data model
- **[Query](query)** - Learn the query system
