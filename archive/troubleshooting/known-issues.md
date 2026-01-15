---
title: Known Issues & Workarounds
description: Active bugs and their workarounds in Bknd
---

# Known Issues & Workarounds

This page tracks currently active bugs in Bknd and provides workarounds where available. These issues are tracked in the [GitHub issue tracker](https://github.com/bknd-io/bknd/issues).

## Critical Issues

### Timestamps Plugin Indexing Bug

**Issue:** [#325](https://github.com/bknd-io/bknd/issues/325)

**Status:** Open (December 2025)

**Problem:**
When you try to index `created_at` or `updated_at` fields that are automatically added by the `timestamps` plugin, you encounter a "Field not found" error that causes server crashes:

```typescript
// This will fail with "Field not found"
import { em, entity, text, timestamps } from "bknd";

const schema = em(
  {
    posts: entity("posts", {
      title: text().required(),
      content: text(),
    }, {
      plugins: [timestamps()], // Adds created_at, updated_at
    }),
  },
  ({ index }, { posts }) => {
    // ❌ This crashes: "Field not found: created_at"
    index(posts).on(["created_at"]);
  },
);
```

**Root Cause:**
Race condition between plugin system and index initialization. The timestamps plugin applies fields after index definitions are processed, so the index system can't find the fields.

**Workarounds:**

1. **Don't index timestamp fields** - If you need ordering by `created_at`, use the field in queries without an index:
   ```typescript
   // This works without index
   const posts = await em.repo("posts").findMany({
     sort: { by: "created_at", dir: "desc" }
   });
   ```

2. **Add timestamp fields manually** - Instead of using the plugin, define the fields directly:
   ```typescript
   const schema = em(
     {
       posts: entity("posts", {
         title: text().required(),
         content: text(),
         created_at: timestamp(),
         updated_at: timestamp(),
       }),
     },
     ({ index }, { posts }) => {
       // ✅ This works
       index(posts).on(["created_at"]);
     },
   );
   ```

3. **Use database-level indexing** - Create the index directly in the database after schema is created:
   ```sql
   CREATE INDEX idx_posts_created_at ON posts(created_at);
   ```

## Validation Issues

### Password Length Validation Inconsistency

**Issue:** [#318](https://github.com/bknd-io/bknd/issues/318)

**Status:** Open (December 2025)

**Problem:**
Users can sign up with passwords shorter than 8 characters, but then cannot login with those same passwords. This creates a confusing user experience where signup succeeds but login fails.

**Root Cause:**
Inconsistent validation rules between signup and login endpoints. The signup endpoint has a different password validation than the login endpoint, or password hashing introduces a constraint that's not checked during signup.

**Workarounds:**

1. **Client-side validation** - Enforce password requirements in your frontend before calling the API:
   ```typescript
   function validatePassword(password: string) {
     if (password.length < 8) {
       throw new Error("Password must be at least 8 characters");
     }
     // Add more validation as needed
   }
   ```

2. **Use password complexity requirements** - Enforce stronger passwords in your UI:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character

3. **Provide clear error messages** - When login fails, guide users to reset their password:
   ```typescript
   try {
     await api.auth.login({ email, password });
   } catch (error) {
     if (error.message.includes("password")) {
       alert("Login failed. If you signed up recently, try resetting your password.");
     }
   }
   ```

**Note:** The CLI user creation command (`npx bknd user create`) only validates minimum 3 characters, which is even less restrictive than the signup endpoint.

**Future Enhancement:**
The community has requested configurable password validation in Bknd configuration:
```typescript
// Not yet available - requested feature
config: {
  auth: {
    passwordValidation: {
      minLength: 8,
      pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    },
  },
}
```

## UI Issues

### Admin UI Route 404

**Issue:** [#216](https://github.com/bknd-io/bknd/issues/216)

**Status:** Open (since July 2025, updated December 2025)

**Problem:**
The Admin UI sidebar has a persistent routing bug where navigation links return 404 errors. Users report clicking on sidebar menu items and encountering "Not Found" errors, especially after refreshing the page.

**Workarounds:**

1. **Use the main Admin UI entry point** - Access the Admin UI at the root path (`/_admin` or `/admin` depending on your config) and navigate from there
2. **Avoid direct URL navigation** - Don't bookmark or share specific Admin UI URLs
3. **Refresh the page** - If you encounter a 404, try refreshing the page before navigating again
4. **Check your Admin UI route configuration** - Ensure your basepath is correct:
   ```typescript
   // In your Admin UI component
   <Admin config={{ basepath: "/admin" }} />
   ```

## Environment-Specific Issues

### xdg-open Crash on Headless Systems

**Issue:** [#300](https://github.com/bknd-io/bknd/issues/300)

**Status:** Open (December 2025)

**Problem:**
On headless systems (servers without a display, Docker containers, CI/CD environments), CLI commands that attempt to open a browser crash with an `xdg-open` error. This affects automated workflows and server deployments.

**Workarounds:**

1. **Set environment variable** - Disable automatic browser opening:
   ```bash
   export BROWSER=none
   npx bknd create my-app
   ```

2. **Use CI-friendly flags** - Check if your CLI command has a `--no-browser` or `--headless` flag:
   ```bash
   # Check if this flag is available
   npx bknd create --help
   ```

3. **Run in non-interactive mode** - Provide all required flags to avoid prompts:
   ```bash
   npx bknd create my-app --yes --template bun
   ```

## Documentation Gaps

These aren't bugs, but areas where documentation is unclear or missing:

### Missing `await app.build()` Documentation

Several users have reported confusion about when to call `await app.build()`. The API requires this call before the app can process requests, but this isn't clearly documented in all integration guides.

**Solution:** Always call `await app.build()` after creating an app and before using it:
```typescript
const app = createApp({ /* config */ });
await app.build(); // Required!
return app.server.fetch(request);
```

### Unclear Schema Naming Convention

**Issue:** [#304](https://github.com/bknd-io/bknd/issues/304)

**Problem:**
Users are unsure whether to use `snake_case` or `camelCase` for entity and field names. Some examples use one style, others use the other.

**Solution:** Use **camelCase** for entity and field names in your schema. This is the recommended convention:
```typescript
// ✅ Recommended
const schema = em({
  posts: entity("posts", {
    title: text(),
    createdAt: timestamp(),
  }),
});

// ❌ Avoid
const schema = em({
  posts: entity("posts", {
    title: text(),
    created_at: timestamp(),
  }),
});
```

## How to Report Issues

If you encounter a bug not listed here:

1. **Search existing issues** - Check the [GitHub issue tracker](https://github.com/bknd-io/bknd/issues) to avoid duplicates
2. **Include reproduction steps** - Provide clear steps to reproduce the bug
3. **Share environment details** - Include runtime version, Bknd version, database type
4. **Include error messages** - Copy the full error stack trace
5. **Join the community** - For quick help, join the [Discord server](https://discord.gg/952SFk8Tb8)

Example issue report:
```
**Issue:** Timestamps plugin prevents indexing created_at field
**Reproduction:**
1. Create entity with timestamps plugin
2. Try to index created_at field
3. Server crashes with "Field not found"

**Environment:**
- Bknd version: 0.19.0
- Runtime: Node.js 22
- Database: SQLite

**Error:**
Error: Field not found: created_at
  at IndexBuilder.build (app/src/data/indexing/IndexBuilder.ts:42)
```

## Related Resources

- [GitHub Issues](https://github.com/bknd-io/bknd/issues) - Track and report bugs
- [Discord Community](https://discord.gg/952SFk8Tb8) - Real-time help and discussions
- [Troubleshooting FAQ](/common-issues) - Solutions to common problems
