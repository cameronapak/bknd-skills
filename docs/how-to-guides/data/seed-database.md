# Seed Database

Seeding allows you to populate your database with initial data on first boot. This is useful for development, testing, and preparing production databases.

## Prerequisites

- Bknd installed and configured
- Database connection established
- Basic understanding of [Bknd configuration](/getting-started/build-your-first-api.md)

## DB Mode (Default)

In `db` mode, seeding is automatic on first boot. The seed function runs only when the database is empty.

### Basic Setup

Add a `seed` function to your `bknd.config.ts`:

```typescript
import { em, entity, text, boolean } from "bknd";

const schema = em({
  posts: entity("posts", {
    title: text().required(),
    content: text(),
    published: boolean().default(false),
  }),
});

export default {
  connection: { url: "file:data.db" },
  config: {
    data: schema.toJSON(),
  },
  options: {
    seed: async (ctx) => {
      // Create initial posts
      await ctx.em.mutator("posts").insertMany([
        { title: "First Post", content: "Welcome!", published: true },
        { title: "Draft Post", content: "Work in progress..." },
      ]);
    },
  },
} satisfies BkndConfig;
```

### Seeding with Relationships

```typescript
import { em, entity, text, systemEntity } from "bknd";

const schema = em({
  posts: entity("posts", {
    title: text().required(),
    content: text(),
  }),
  users: systemEntity("users", {}),
}, ({ relation }, { posts, users }) => {
  relation(posts).manyToOne(users);
});

export default {
  // ... config
  options: {
    seed: async (ctx) => {
      // Create users first
      await ctx.app.module.auth.createUser({
        email: "admin@example.com",
        password: "password123",
      });

      // Then create posts
      await ctx.em.mutator("posts").insertMany([
        { title: "Welcome Post", content: "Hello world!" },
      ]);
    },
  },
};
```

### Event-Based Seeding

Use `AppFirstBoot` event for more complex scenarios:

```typescript
import { createApp } from "bknd";

const app = createApp({
  connection: { url: "file:data.db" },
  config: { /* ... */ },
  options: {
    async onBuilt(app) {
      app.emgr.onEvent(app.constructor.Events.AppFirstBoot, async ({ app }) => {
        await app.module.data.posts.insertMany([
          { title: "Auto-seeded post" },
        ]);
      }, "sync");
    },
  },
});
```

## Code Mode

In `code` mode, the seed function is **not** automatically executed. You must run it manually.

### Manual Seeding

```bash
npx bknd sync --seed --force
```

### Code Mode Configuration

```typescript
export default {
  // ... config
  options: {
    mode: "code",
    seed: async (ctx) => {
      await ctx.em.mutator("posts").insertMany([
        { title: "Manual seed" },
      ]);
    },
  },
};
```

Then run the sync command to execute seeding.

**UNKNOWN**: The exact behavior and workarounds for CodeMode initial seed bugs mentioned in the docs plan are not documented in available sources. I do not have specific information about what the bug is or what the workaround entails.

## Common Patterns

### Conditional Seeding

```typescript
options: {
  seed: async (ctx) => {
    const existing = await ctx.em.findMany("posts", { limit: 1 });
    
    if (existing.data?.length === 0) {
      await ctx.em.mutator("posts").insertMany([
        { title: "Only seed if empty" },
      ]);
    }
  },
}
```

### Environment-Specific Seeding

```typescript
import type { ModuleBuildContext } from "bknd";

const isDev = process.env.NODE_ENV === "development";

export default {
  options: {
    seed: async (ctx: ModuleBuildContext) => {
      if (isDev) {
        // Seed demo data for development
        await ctx.em.mutator("posts").insertMany([
          { title: "Dev Post 1" },
          { title: "Dev Post 2" },
        ]);
      }
    },
  },
};
```

### Bulk Data Import

```typescript
options: {
  seed: async (ctx) => {
    // Import from JSON file
    const data = await import("./seed-data.json");
    
    await ctx.em.mutator("posts").insertMany(data.default);
  },
}
```

## Troubleshooting

**Seed not running in code mode**: Remember to run `npx bknd sync --seed --force` manually.

**Seed runs every time**: In `db` mode, seed only runs on first boot. Delete the database to re-seed.

**Relationship errors**: Ensure referenced entities exist before creating relationships. Seed in dependency order.

**Type errors**: Use `declare module "bknd"` to extend the DB interface for type safety.
