---
description: Add email/password authentication with role-based permissions in 20 minutes
---

# Add Authentication with Permissions

In this tutorial, you'll add email/password authentication with role-based access control (RBAC) to your Bknd API. You'll learn how to:

- Configure password-based authentication
- Create roles with different permission levels
- Protect API endpoints with permissions
- Test authentication from your React app

## Prerequisites

- Complete [Build Your First API](/getting-started/build-your-first-api.md) tutorial
- 20 minutes

## Step 1: Enable Auth Module

Update your `bknd.config.ts` to enable authentication with password strategy:

```typescript
import type { ViteBkndConfig } from "bknd/adapter/vite";
import { boolean, em, entity, text } from "bknd";
import { secureRandomString } from "bknd/utils";

const schema = em({
  todos: entity("todos", {
    title: text(),
    done: boolean(),
  }),
});

export default {
  connection: {
    url: "file:data.db",
  },
  config: {
    data: schema.toJSON(),
    auth: {
      enabled: true,
      jwt: {
        issuer: "my-first-api",
        secret: secureRandomString(64),
      },
      strategies: {
        password: {
          type: "password",
          enabled: true,
          config: {
            hashing: "sha256",
          },
        },
      },
      roles: [
        {
          name: "admin",
          permissions: ["*"],
        },
        {
          name: "user",
          permissions: [
            "data.entity.read",
            "data.entity.create",
          ],
        },
        {
          name: "guest",
          is_default: true,
          permissions: [
            "data.entity.read",
          ],
        },
      ],
    },
  },
} satisfies ViteBkndConfig;
```

**What's happening:**
- `enabled: true` activates the auth module
- `jwt.secret` signs authentication tokens
- `password` strategy enables email/password login and registration
- Roles define three permission levels: admin (full access), user (read/create), guest (read only)

## Step 2: Create Your First User

**UNKNOWN: This section requires more research.**

Based on available documentation, you have several options for creating users:

**What I know:**
- You can use the CLI: `npx bknd user create`
- You can create users programmatically using `app.module.auth.createUser()`
- The seed option in config can create users on first boot

**What I don't know:**
- Whether the Admin UI has a user creation interface
- Exact CLI command behavior and prompts
- How to assign roles during user creation

For now, create a user programmatically using the seed option:

```typescript
export default {
  connection: {
    url: "file:data.db",
  },
  config: {
    // ... auth config from Step 1
  },
  options: {
    seed: async (ctx) => {
      await ctx.app.module.auth.createUser({
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      });

      await ctx.app.module.auth.createUser({
        email: "user@example.com",
        password: "user123",
        role: "user",
      });
    },
  },
} satisfies ViteBkndConfig;
```

**Note:** The seed function runs only once when the database is empty.

## Step 3: Test Authentication

Update your React component to include login functionality:

```typescript
import { Api } from "bknd/client";
import { useState } from "react";

const api = new Api();

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { data } = await api.auth.login({ email, password });
    setUser(data);
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); login(); }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
}

export default App;
```

The Api client automatically:
- Stores JWT tokens in cookies
- Includes authentication headers in requests
- Handles token refresh automatically

## Step 4: Protect Endpoints

**UNKNOWN: This section requires more research.**

Bknd automatically protects built-in data endpoints with permissions defined in your roles. However, you may want to:

**What I know:**
- Built-in CRUD endpoints (`/api/data/entity/*`) are automatically protected
- The Guard system enforces permissions via `permission()` middleware
- DataController shows how permissions are applied to data operations

**What I don't know:**
- How to protect custom routes created via plugins
- Exact syntax for using `permission()` middleware in custom controllers
- Whether custom routes need manual Guard setup

For now, test that built-in endpoints are protected:

```bash
# Try creating a todo as guest (should fail - 403)
curl -X POST http://localhost:5174/api/data/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "done": false}'

# Login as user
curl -X POST http://localhost:5174/api/auth/password/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "user123"}'

# Create todo as user (should succeed - 201)
curl -X POST http://localhost:5174/api/data/todos \
  -H "Content-Type: application/json" \
  -H "Cookie: <session_cookie_from_login>" \
  -d '{"title": "Test", "done": false}'
```

## Step 5: Understand Permission Flow

Here's how Bknd evaluates permissions:

```
Request → Auth Middleware → Extract User Role → Guard
  ↓
Check Permission
  ↓
Has Role?
  ├─ No → Use Default Role (guest)
  └─ Yes → Check Role Permissions
      ↓
  Role has Permission?
    ├─ No → Throw GuardPermissionsException (403)
    └─ Yes → Check Policies
        ↓
        All Policies Allow?
          ├─ No → Throw Exception (403)
          └─ Yes → Allow Request
```

### Permission Types

| Permission | Admin | User | Guest |
|------------|--------|-------|-------|
| `data.entity.read` | ✅ | ✅ | ✅ |
| `data.entity.create` | ✅ | ✅ | ❌ |
| `data.entity.update` | ✅ | ❌ | ❌ |
| `data.entity.delete` | ✅ | ❌ | ❌ |
| `*` (all) | ✅ | ❌ | ❌ |

## Step 6: Advanced: Custom Permissions

Create custom permissions for specific business rules:

```typescript
import { Permission } from "auth/authorize/Permission";
import { s } from "bknd/utils";

// Define custom permission
const publishPost = new Permission(
  "posts.publish",
  s.object({
    entity: s.string(),
    id: s.number(),
  })
);

// Add to admin role
{
  name: "editor",
  permissions: [
    { permission: "data.entity.read" },
    { permission: "data.entity.create" },
    { permission: "data.entity.update" },
    { permission: publishPost }, // Custom permission
  ],
}
```

**Note:** Custom permissions require plugin setup to register them with the Guard. The exact implementation is currently unclear from available documentation.

## Testing Checklist

Use this checklist to verify your setup:

- [ ] Auth module enabled and running
- [ ] Password strategy configured
- [ ] Three roles defined (admin, user, guest)
- [ ] Seed creates users successfully
- [ ] Login endpoint (`/api/auth/password/login`) works
- [ ] Register endpoint (`/api/auth/password/register`) works
- [ ] Guests can read but not write todos
- [ ] Users can read and create todos
- [ ] Admins can perform all operations
- [ ] JWT tokens are stored in cookies
- [ ] Logout clears authentication

## Troubleshooting

### "Auth is not enabled"

Ensure `auth.enabled: true` in your config.

### "Password strategy not configured"

Add password strategy configuration under `strategies.password`.

### Permission denied (403) errors

1. Check user has a role assigned
2. Verify role has required permission
3. Review policy conditions if using custom policies
4. Debug user context: `console.log(c.get("auth"))`

### Users not created by seed

Delete `data.db` file to force seed to run again:

```bash
rm data.db
npm run dev
```

## Next Steps

- Learn about [Public Access with Guard](/how-to-guides/permissions/public-access-guard.md) - Configure guest access
- Explore [Data Permissions and RLS](/reference/auth-module#rls) - Row-level security
- Read [Permission System](/reference/auth-module#permissions) - Advanced authorization patterns
- Complete [Deploy to Production](/getting-started/deploy-to-production.md) - Launch your app

## Related Guides

- [Create First User](/how-to-guides/auth/create-first-user.md) - User creation methods (Admin UI, CLI, programmatic)
- [Build Your First API](/getting-started/build-your-first-api.md) - Complete onboarding tutorial
- [Auth Module Reference](/reference/auth-module.md) - Complete authentication configuration
- [Seed Database](/how-to-guides/data/seed-database.md) - Seed users and roles with seed function

## What We Learned

In this tutorial, you learned:
- How to configure password-based authentication
- How to define roles with permission levels
- How Bknd's Guard system protects endpoints
- **What needs more documentation:** Custom route protection, Admin UI user creation, custom permission registration

## Known Limitations

This tutorial has gaps due to incomplete documentation:

1. **Admin UI user creation:** Exact workflow unknown
2. **Custom route protection:** Syntax unclear for protecting plugin-created routes
3. **Custom permission registration:** Exact method unknown (likely via `onBoot` hook)

If you have experience with these features, please contribute to this documentation.
