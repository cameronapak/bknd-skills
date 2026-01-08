---
description: Configure public access using guard for guest users without authentication
---

# Enable Public Access with Guard

Configure guest access using the Guard authorization system to allow unauthenticated users to access specific endpoints while protecting others.

## Overview

Bknd's Guard system provides flexible public access through role-based access control (RBAC). You can create a **guest role** that:
- Automatically applies to unauthenticated users
- Grants specific permissions for public endpoints
- Restricts access to protected resources

This approach gives you fine-grained control over what's publicly accessible without requiring authentication.

## How Guest Access Works

The Guard assigns roles using this priority:
1. **Explicit role** (user has `role` property)
2. **Default role** (if user has no explicit role)
3. **No role** (if no default role configured)

By configuring a default role with appropriate permissions, you control what unauthenticated users can access.

## Comparison: Bknd vs Firebase

| Feature | Bknd | Firebase |
|---------|------|----------|
| **Access Control** | Guard + Roles + Policies | Security Rules |
| **Public Access** | Default role with permissions | `allow read, write: if true` |
| **Granularity** | Role-based with policies | Rule-based conditions |
| **Configuration** | TypeScript/JSON in code | Security Rules language |
| **Testing** | Programmatic `granted()`/`filters()` | Firebase Emulator |

### Key Differences

- **Bknd**: Role-first approach with policy conditions, compiled at build time
- **Firebase**: Rule-first approach with runtime evaluation, requires special syntax
- **Bknd**: Type-safe permissions defined in code
- **Firebase**: String-based rule language with limited type checking

## Step 1: Configure Auth Module

First, enable the auth module and configure a guest role:

```typescript
import { text, boolean, entity, em } from "bknd";

const schema = em({
  posts: entity("posts", {
    title: text(),
    content: text(),
    published: boolean(),
  }),
});

type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}

export default {
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      jwt: {
        issuer: "your-app",
        secret: process.env.JWT_SECRET || "your-secret-key",
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

### Role Configuration Explained

| Property | Value | Purpose |
|----------|-------|---------|
| `name` | `"guest"` | Identifies the role |
| `is_default` | `true` | Assigned to users without explicit roles |
| `implicit_allow` | `false` | Requires explicit permissions |
| `permissions` | Array | Defines what guests can access |

## Step 2: Enable Guard

Ensure the Guard is enabled in your application:

```typescript
// The Guard is automatically enabled when auth.enabled is true
// No additional configuration needed
```

The Guard is automatically initialized and registered when the auth module is enabled.

## Step 3: Test Guest Access

Create a test script to verify guest access:

```typescript
import { createBknd } from "bknd";

const app = await createBknd({
  connection: { url: "file:test.db" },
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      roles: [
        // guest role from Step 1
      ],
    },
  },
});

// Create some test posts
await app.em.mutator("posts").insertMany([
  { title: "Public Post", content: "Visible to everyone", published: true },
  { title: "Draft Post", content: "Only visible to admins", published: false },
]);

// Test guest access (no user context)
const guestContext = { user: null };

// Read posts as guest - should only return published posts
const guestPosts = await app.em.repository("posts").findMany({
  where: {},
});

console.log("Guest can see:", guestPosts); // Only published posts
console.log("Total posts:", await app.em.repository("posts").count()); // All posts
```

## Advanced: Conditional Public Access

### Policy-Based Filtering

Use policies to create complex access rules:

```typescript
roles: [
  {
    name: "guest",
    is_default: true,
    permissions: [
      {
        permission: "entityRead",
        effect: "allow",
        policies: [
          // Public content only
          {
            condition: { entity: "posts" },
            effect: "filter",
            filter: { published: true },
          },
          // Time-limited access
          {
            condition: {
              entity: "events",
              now: { $lte: "date" },
            },
            effect: "allow",
          },
        ],
      },
    ],
  },
]
```

### Multiple Guest Roles

Create different public access levels:

```typescript
roles: [
  {
    name: "guest",
    is_default: true,
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
    name: "trial_user",
    is_default: false,
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
    ],
  },
]
```

## Policy Variable Substitution

Policies support dynamic variable substitution using `@variable` syntax. This enables you to create context-aware access rules.

### Variable Syntax

Variables are replaced at runtime from the authorization context:

```typescript
filter: {
  author_id: "@user.id",  // Current user's ID
  tenant_id: "@user.tenant_id",  // User's tenant
}
```

### Available Context Variables

The authorization context includes:

| Variable | Source | Example |
|----------|--------|---------|
| `@user.id` | Authenticated user's ID | `@user.id` |
| `@user.role` | User's role name | `@user.role` |
| `@user.*` | Any user property | `@user.email`, `@user.tenant_id` |
| `@ctx.*` | Guard config context | Custom context variables |

### How Context Is Built

The context is constructed from three sources (in order of precedence):

1. **User context** - From authentication (`c.get("auth")?.user`)
2. **Permission context** - From permission definition
3. **Guard config context** - From `guard.config.context`

```typescript
// In Guard.collect() method (app/src/auth/authorize/Guard.ts)
const ctx = {
  ...((context ?? {}) as any),  // Permission context
  ...this.config?.context,     // Guard config context
  user,                        // Auth user context
};
```

### Practical Examples

**User-owned data:**
```typescript
filter: {
  author_id: "@user.id",  // Only user's own posts
}
```

**Tenant isolation:**
```typescript
filter: {
  tenant_id: "@user.tenant_id",  // Only user's tenant
}
```

**Multi-tenant with public content:**
```typescript
filter: {
  $or: [
    { published: true },  // Public content
    { tenant_id: "@user.tenant_id" },  // User's tenant
  ],
}
```

**Custom context variables:**
```typescript
// Guard initialization with custom context
const guard = new Guard(
  permissions,
  roles,
  {
    context: {
      app: "myapp",
      version: "1.0",
    },
  },
);

// Policy using custom context
filter: {
  app_name: "@ctx.app",  // "myapp"
}
```

**Time-based conditions:**
```typescript
filter: {
  start_date: { $lte: "@ctx.now" },
  end_date: { $gte: "@ctx.now" },
}
```

## Common Patterns

### Public Read, Private Write

```typescript
{
  name: "guest",
  is_default: true,
  permissions: [
    {
      permission: "entityRead",
      effect: "allow",
      policies: [
        {
          condition: { entity: "*" },
          effect: "filter",
          filter: { published: true },
        },
      ],
    },
    // No entityCreate/entityUpdate/entityDelete permissions
  ],
}
```

### Tenant Isolation for Public

```typescript
{
  name: "guest",
  is_default: true,
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
              { published: true },
              // Note: @user.id will be null for guests, so this won't match
              { tenant_id: "@user.id" },
            ],
          },
        },
      ],
    },
  ],
}
```

## Troubleshooting

### Issue: Guests can't access anything

**Cause**: Guard disabled or no default role

**Solution**:
```typescript
// Ensure auth is enabled
auth: {
  enabled: true, // Required for Guard
}

// Ensure default role exists
roles: [
  {
    name: "guest",
    is_default: true, // Must be true
  },
]
```

### Issue: Guests accessing protected data

**Cause**: `implicit_allow: true` in guest role

**Solution**:
```typescript
roles: [
  {
    name: "guest",
    is_default: true,
    implicit_allow: false, // Explicit permissions required
  },
]
```

### Issue: Public endpoints returning 403

**Cause**: Policy conditions not met

**Solution**: Check policy conditions and filters match your data structure

```typescript
// Debug: Check what user context is being passed
console.log("User context:", ctx.get("auth"));
```

## Best Practices

1. **Use `implicit_allow: false`** for guest roles to require explicit permissions
2. **Combine with `published` fields** to easily distinguish public/private content
3. **Test with empty user context** to verify guest behavior
4. **Use policy filters** for complex access rules instead of `implicit_allow`
5. **Document public endpoints** clearly for API consumers
6. **Monitor access patterns** to identify unintended public exposure

## Related Resources

- [Role-Based Access Control](../reference/auth-module#rbac) - Deep dive into roles and permissions
- [Permission System](../reference/auth-module#permissions) - Understanding permissions and policies
- [Data Permissions and RLS](../reference/auth-module#rls) - Row-level security for data filtering
- [Auth Module Reference](../reference/auth-module) - Complete auth module documentation
