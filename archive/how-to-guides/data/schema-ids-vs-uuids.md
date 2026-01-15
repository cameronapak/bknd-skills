---
description: Understanding Bknd's primary key formats and when to use each one.
---

Bknd supports two primary key formats for your entities: **integer IDs** and **UUIDs**. This guide explains the differences, trade-offs, and how to configure each format for your use case.

## Overview

| Format | Type | Example | Default |
|--------|------|---------|---------|
| Integer | Auto-incrementing number | `1`, `2`, `3` | ✅ Yes |
| UUID | UUID v7 string | `01912345-6789-abcd-ef01-23456789abcd` | ❌ No |

By default, Bknd uses **integer IDs** for all entities, which provides simplicity and performance for most applications. UUIDs are available when you need globally unique identifiers, especially important for distributed systems or when you want to expose IDs publicly.

## When to Use Integer IDs

**Use integer IDs when:**
- You're building a single-instance application
- Performance is critical (smaller keys = faster queries)
- You don't need globally unique identifiers
- You prefer sequential IDs for easier debugging and ordering
- You're working with a local database (SQLite, PostgreSQL)

**Benefits:**
- **Smaller storage**: 4-8 bytes per row vs 36 bytes for UUIDs
- **Better performance**: Faster indexing and joins
- **Sequential**: Makes debugging and ordering natural
- **Database native**: Leverages database's built-in auto-increment

**Example:**
```typescript
// Default configuration (integer IDs)
import { createApp, em, entity, text, number } from "bknd";

const schema = em({
  posts: entity("posts", {
    title: text().required(),
    views: number(),
  }),
});
// Posts will have IDs: 1, 2, 3, ...
```

## When to Use UUIDs

**Use UUIDs when:**
- You need globally unique identifiers across multiple databases/instances
- You're building a distributed system or multi-tenant application
- You expose IDs to end users (URLs, API responses)
- You want to prevent enumeration attacks (can't guess next ID)
- You're syncing data across multiple systems
- You're planning for future database migration or sharding

**Benefits:**
- **Globally unique**: No collision risk across databases
- **Public-facing**: Safe to expose in URLs without revealing information
- **Decentralized**: Can generate IDs without coordinating with database
- **Future-proof**: Easy to migrate or shard databases later

**Example:**
```typescript
// Configure entity to use UUIDs
import { createApp, em, entity, text } from "bknd";

const schema = em({
  posts: entity("posts", {
    title: text().required(),
  }, {
    primary_format: "uuid", // Configure this entity to use UUIDs
  }),
});
// Posts will have IDs like: 01912345-6789-abcd-ef01-23456789abcd
```

## Configuration Methods

### 1. Per-Entity Configuration

Configure the primary key format when defining each entity:

```typescript
import { em, entity, text } from "bknd";

const schema = em({
  // Integer IDs (default)
  users: entity("users", {
    username: text().required(),
  }),

  // UUIDs for public-facing entities
  posts: entity("posts", {
    title: text().required(),
  }, {
    primary_format: "uuid",
  }),

  // UUIDs for secure entities
  api_keys: entity("api_keys", {
    name: text().required(),
  }, {
    primary_format: "uuid",
  }),
});
```

### 2. Global Configuration

Set the default format for all entities in your app configuration:

```typescript
import { createApp } from "bknd";

const app = createApp({
  config: {
    data: {
      default_primary_format: "uuid", // All entities use UUIDs by default
      entities: {
        // Individual entities can override
        internal_logs: {
          fields: {
            message: { type: "text", required: true },
          },
          config: {
            primary_format: "integer", // Override for this entity
          },
        },
      },
    },
  },
});
```

### 3. Explicit Primary Field Definition

For complete control, you can explicitly define the primary field:

```typescript
import { createApp, em, entity, text, PrimaryField } from "bknd";

const schema = em({
  users: entity("users", {
    id: new PrimaryField("id", { format: "uuid" }), // Explicit UUID primary
    username: text().required(),
  }),
});
```

## Trade-offs

| Aspect | Integer IDs | UUIDs |
|--------|-------------|-------|
| **Storage** | 4-8 bytes | 36 bytes (string) |
| **Index Performance** | ⚡ Faster | Slightly slower |
| **Readability** | Easy to remember | Hard to remember |
| **URLs** | `/posts/123` | `/posts/01912345-6789-abcd-ef01-23456789abcd` |
| **Security** | Can enumerate IDs | Prevents enumeration |
| **Distribution** | Centralized (database) | Decentralized |
| **Migration** | Requires coordination | Easier to merge/shard |

## Technical Implementation

Bknd uses **UUID v7** for its UUID implementation. UUID v7 combines:
- **Timestamp component**: Provides time-based ordering (unlike random UUIDs)
- **Random component**: Ensures uniqueness
- **Sortable**: Unlike UUID v4, UUID v7 maintains chronological order

This makes UUID v7 ideal for:
- Distributed systems that need both uniqueness and ordering
- Time-series data where order matters
- Database indexes (more efficient than random UUIDs)

## Practical Examples

### Mixed Approach

Most applications benefit from a mixed approach:

```typescript
import { em, entity, text, number } from "bknd";

const schema = em({
  // Internal - use integers
  users: entity("users", {
    email: text().required(),
  }),

  // Public-facing - use UUIDs
  posts: entity("posts", {
    slug: text().required(),
    title: text().required(),
  }, {
    primary_format: "uuid",
  }),

  // Shared resources - use UUIDs
  documents: entity("documents", {
    filename: text().required(),
  }, {
    primary_format: "uuid",
  }),
});
```

### API Keys Example

```typescript
const schema = em({
  api_keys: entity("api_keys", {
    name: text().required(),
    key: text().required(), // Separate field for the actual key
    user_id: number(), // Reference to user
  }, {
    primary_format: "uuid", // Use UUID for the key's ID
  }),
});

// Result: api_keys table has UUID primary keys
// - ID: 01912345-6789-abcd-ef01-23456789abcd
// - name: "Production Key"
// - key: "sk_live_xxxxx"
// - user_id: 123
```

## Migration Considerations

### Changing from Integer to UUID

If you need to migrate existing data:

1. **Add a new UUID column** to your entity
2. **Migrate existing data** by generating UUIDs for each row
3. **Update foreign keys** to reference the new UUID
4. **Drop the old integer column** after confirming everything works

```typescript
// Migration strategy
// 1. Add new field temporarily
const schema = em({
  posts: entity("posts", {
    title: text().required(),
    uuid_id: text(), // Temporary field for migration
  }),
});

// 2. Generate UUIDs for existing records (via migration script)
// 3. Switch to UUID format
const updatedSchema = em({
  posts: entity("posts", {
    title: text().required(),
  }, {
    primary_format: "uuid",
  }),
});
```

**Note:** This is a complex operation. Always backup your database before migrations.

## Best Practices

### Recommended Approach for Different Applications

**Single-tenant SaaS:**
```typescript
// Use integer IDs internally, UUIDs for customer-facing resources
config: {
  data: {
    default_primary_format: "integer",
    entities: {
      customers: { primary_format: "uuid" },
      invoices: { primary_format: "uuid" },
      // Internal entities keep integer IDs
    },
  },
}
```

**Multi-tenant SaaS:**
```typescript
// Use UUIDs everywhere for easy data isolation
config: {
  data: {
    default_primary_format: "uuid",
  },
}
```

**Mobile/Edge Apps:**
```typescript
// Use UUIDs for offline-first synchronization
config: {
  data: {
    default_primary_format: "uuid",
  },
}
```

### Security Considerations

When using integer IDs in public APIs:

```typescript
// ❌ Bad: Exposes internal structure
GET /api/users/123
// Users can enumerate: 124, 125, 126...

// ✅ Good: Use UUIDs for public endpoints
GET /api/posts/01912345-6789-abcd-ef01-23456789abcd
// Prevents enumeration
```

## Conclusion

Choose your primary key format based on your application's needs:

- **Start with integer IDs** for simplicity and performance
- **Switch to UUIDs** when you need global uniqueness or public-facing IDs
- **Mix both approaches** for optimal results (internal = integers, public = UUIDs)

The decision is reversible, but planning ahead saves migration effort. Consider your current needs and future growth when making this choice.
