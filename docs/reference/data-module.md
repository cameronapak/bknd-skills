# Data Module

Complete reference for Bknd's Data module, covering CRUD operations, the Repository pattern, Mutator API, query system, and entity relationships.

## Overview

The Data module provides a type-safe, fluent API for database operations through two main interfaces:

- **Repository** - Read operations (query, find, count, exists)
- **Mutator** - Write operations (create, update, delete)

Both are accessed through the **EntityManager**, which manages entities, relations, and database connections.

## Accessing the EntityManager

```typescript
import { createApp } from "bknd";

const app = createApp({
  config: {
    data: {
      entities: {
        users: {
          fields: {
            username: { type: "text", required: true },
            email: { type: "text", required: true },
          },
        },
      },
    },
  },
});

await app.build();

// Access EntityManager
const em = app.data.em;
```

## Repository API (Read Operations)

### Accessing a Repository

```typescript
// Get repository for an entity
const userRepo = em.repository("users");
// or
const userRepo = em.repo("users");
```

### findMany(options)

Query multiple records with filtering, sorting, and pagination.

```typescript
// Basic query (returns default limit of 10)
const users = await userRepo.findMany();

// With filters
const activeUsers = await userRepo.findMany({
  where: { status: "active" }
});

// With sorting
const sortedUsers = await userRepo.findMany({
  sort: { by: "username", dir: "asc" }
});

// With pagination
const paginatedUsers = await userRepo.findMany({
  limit: 20,
  offset: 40
});

// Combined query
const result = await userRepo.findMany({
  where: { status: "active" },
  sort: { by: "created_at", dir: "desc" },
  limit: 50,
  offset: 0
});

// Access data
console.log(result.data);
```

### findOne(where)

Find a single record by conditions.

```typescript
const user = await userRepo.findOne({
  email: "user@example.com"
});

if (user.data) {
  console.log("Found user:", user.data);
} else {
  console.log("User not found");
}
```

### readOneBy(where)

Find a single record by conditions using `findMany` with limit. This is an alternative to `findOne` that provides more control over query options.

```typescript
const user = await userRepo.readOneBy({
  where: { email: "user@example.com" },
  select: ["id", "username", "email"]
});

if (user.data) {
  console.log("Found user:", user.data);
} else {
  console.log("User not found");
}
```

**Note:** `readOneBy` internally uses `findMany` with `limit: 1` and `offset: 0`, returning only the first result. It supports `where`, `select`, `join`, and `with` options, but excludes `limit`, `offset`, and `sort` (these are automatically set).

**When to use readOneBy vs findOne:**
- Use `findOne` for simple queries where you just need to find by ID or basic conditions
- Use `readOneBy` when you need more control over field selection, relations, or joins in a single-record query
- Both methods return the same result structure

### findId(id)

Find a single record by primary key.

```typescript
const user = await userRepo.findId(1);
```

### count(where)

Count records matching conditions.

```typescript
const total = await userRepo.count();
console.log(total.data.count); // Total users

const activeCount = await userRepo.count({ status: "active" });
console.log(activeCount.data.count); // Active users
```

### exists(where)

Check if records exist matching conditions.

```typescript
const userExists = await userRepo.exists({
  email: "user@example.com"
});

console.log(userExists.data.exists); // true or false
```

## Query Options

### Where Clause (Filtering)

Filter results using the `where` option. Supports multiple operators:

```typescript
// Equality (default)
await userRepo.findMany({
  where: { status: "active" }
});

// Not equal
await userRepo.findMany({
  where: { status: { $ne: "deleted" } }
});

// Greater than / Less than
await userRepo.findMany({
  where: { age: { $gt: 18 } }
});

await userRepo.findMany({
  where: { created_at: { $lte: new Date() } }
});

// In array
await userRepo.findMany({
  where: { status: { $in: ["active", "pending"] } }
});

// Between
await userRepo.findMany({
  where: { age: { $between: [18, 65] } }
});

// Pattern matching (supports * and %)
await userRepo.findMany({
  where: { email: { $like: "%@example.com" } }
});

// Is null
await userRepo.findMany({
  where: { deleted_at: { $isnull: true } }
});

// Logical OR
await userRepo.findMany({
  where: {
    $or: [
      { status: "active" },
      { status: "pending" }
    ]
  }
});

// Logical AND (default behavior when multiple fields)
await userRepo.findMany({
  where: {
    status: "active",
    age: { $gt: 18 }
  }
});
```

**Supported Operators:**
- `$eq` - Equality (default, can be omitted)
- `$ne` - Not equal
- `$gt` - Greater than
- `$gte` - Greater than or equal
- `$lt` - Less than
- `$lte` - Less than or equal
- `$in` - Value in array
- `$notin` - Value not in array
- `$between` - Between two values (inclusive)
- `$like` - Pattern matching (`*` or `%` as wildcard)
- `$isnull` - Is null (boolean)

### Sorting

Control result ordering with the `sort` option:

```typescript
// Ascending (default)
await userRepo.findMany({
  sort: { by: "username", dir: "asc" }
});

// Descending
await userRepo.findMany({
  sort: { by: "created_at", dir: "desc" }
});
```

**Direction values:** `"asc"` or `"desc"`

### Field Selection

Control which fields are returned with the `select` option:

```typescript
await userRepo.findMany({
  select: ["id", "username", "email"]
});
```

**UNKNOWN:** Cannot confirm if `select` supports aliased fields or expressions. Documentation shows only simple field names.

### Eager Loading Relations

Preload related entities using the `with` option to avoid N+1 queries:

```typescript
// Load posts with author
await postRepo.findMany({
  with: ["author"]
});

// Load posts with author and comments
await postRepo.findMany({
  with: ["author", "comments"]
});
```

**UNKNOWN:** Cannot confirm maximum depth or complex nesting patterns. Documentation suggests simple relation name arrays.

### Automatic Joins

When filtering by related entity fields, Bknd automatically performs joins to optimize queries. This happens when you use dot notation in your `where` clause.

```typescript
// Filter posts by author's username (auto-join)
const posts = await postRepo.findMany({
  where: { "author.username": "john" }
});

// Filter posts by related entity status
const publishedPosts = await postRepo.findMany({
  where: { "author.status": "active" }
});

// Combine auto-join with manual field selection
const posts = await postRepo.findMany({
  where: { "author.email": "john@example.com" },
  select: ["id", "title", "author.username"]
});
```

**How auto-join works:**
- When you reference a related field (e.g., `"author.username"`), Bknd automatically adds the necessary join
- The join is added to the query behind the scenes, no manual `join` option needed
- Auto-join checks if the related field exists in the relationship before adding the join
- Index warnings are triggered for non-indexed related fields

**Performance Considerations:**
- Auto-joins are convenient but can impact query performance
- Consider using manual `join` with explicit field selection for complex queries
- Always index fields you filter on, including related entity fields
- Use the `with` option for preloading relations instead of relying solely on auto-join

**Example: Manual join for better performance:**

```typescript
// Auto-join (convenient but may load unnecessary data)
const posts = await postRepo.findMany({
  where: { "author.username": "john" }
});

// Manual join (explicit control over selected fields)
const posts = await postRepo.findMany({
  join: ["author"],
  where: { "author.username": "john" },
  select: ["posts.id", "posts.title", "author.username"]
});
```

### Pagination

Control result count with `limit` and `offset`:

```typescript
// Get 10 results starting from position 20
await userRepo.findMany({
  limit: 10,
  offset: 20
});
```

**Default limit:** 10 records

### Manual Joins

Manually join tables using the `join` option:

```typescript
await postRepo.findMany({
  join: ["author"],
  where: { "users.username": "john" },
  select: ["posts.*", "users.username"]
});
```

**Use case:** When you need to filter or select fields from related tables in a single query.

## Mutator API (Write Operations)

### Accessing a Mutator

```typescript
// Get mutator for an entity
const userMutator = em.mutator("users");
```

### insertOne(data)

Create a single record.

```typescript
const newUser = await userMutator.insertOne({
  username: "john_doe",
  email: "john@example.com",
  status: "active"
});

console.log(newUser.data.id); // Auto-generated ID
```

### insertMany(data[])

Create multiple records efficiently.

```typescript
const users = await userMutator.insertMany([
  { username: "john", email: "john@example.com" },
  { username: "jane", email: "jane@example.com" },
  { username: "bob", email: "bob@example.com" },
]);

console.log(users.data); // Array of created users
```

### updateOne(id, data)

Update a single record by ID.

```typescript
const updated = await userMutator.updateOne(1, {
  username: "john_updated",
  status: "active"
});

console.log(updated.data);
```

### updateWhere(data, where)

Update multiple records matching conditions.

```typescript
const updated = await userMutator.updateWhere(
  { status: "inactive" },
  { last_login: { $lt: new Date("2024-01-01") } }
);

console.log(updated.data); // Array of updated records
```

**Note:** Requires a `where` clause. Cannot update all records.

### deleteOne(id)

Delete a single record by ID.

```typescript
const deleted = await userMutator.deleteOne(1);
console.log(deleted.data); // Deleted record
```

### deleteWhere(where)

Delete multiple records matching conditions.

```typescript
const deleted = await userMutator.deleteWhere({
  status: "deleted"
});

console.log(deleted.data); // Array of deleted records
```

**Note:** Requires a `where` clause. Cannot delete all records.

## Relationship Mutations

Bknd provides special operators for managing entity relationships through the Mutator API.

### Many-to-One Relations

Use `$set` or `$create` to manage Many-to-One relationships.

```typescript
// Assign existing entity by ID
await postMutator.updateOne(1, {
  author: { $set: { id: 5 } }
});

// Create and assign new entity
await postMutator.updateOne(1, {
  author: { $create: { username: "new_author" } }
});
```

### One-to-One Relations

Same as Many-to-One, but maintains exclusivity.

```typescript
// Create with relationship
await userMutator.insertOne({
  username: "john",
  settings: { $create: { theme: "dark" } }
});

// Note: $set is intentionally disabled for One-to-One
// to maintain exclusivity
```

### Many-to-Many Relations

Use `$attach`, `$detach`, and `$set` for Many-to-Many relationships.

```typescript
// Attach categories to post
await postMutator.updateOne(1, {
  categories: { $attach: [1, 3, 5] }
});

// Detach specific categories
await postMutator.updateOne(1, {
  categories: { $detach: [3] }
});

// Replace all attached items
await postMutator.updateOne(1, {
  categories: { $set: [2, 4] }
});
```

**Note:** Many-to-Many queries default to a 5-record limit on related records.

### Media Uploads (uploadToEntity)

Upload files directly to entity media fields using the Media API's `uploadToEntity` method.

```typescript
import { createApp } from "bknd";

const app = createApp({
  config: {
    data: {
      entities: {
        posts: {
          fields: {
            title: { type: "text", required: true },
            content: { type: "text" },
          },
        },
      },
    },
  },
});

await app.build();

// Access Media API
const media = app.media;

// Upload file to entity field
const result = await media.uploadToEntity(
  "posts",      // entity name
  1,            // entity ID
  "cover",      // field name
  file          // File object, Buffer, or ReadableStream
);

console.log(result.data); // Uploaded file metadata
```

**uploadToEntity Signature:**

```typescript
await media.uploadToEntity(
  entity: string,
  id: PrimaryFieldType,
  field: string,
  item: File | Buffer | ReadableStream,
  options?: {
    overwrite?: boolean;  // Allow overwriting existing files
    _init?: RequestInit;  // Additional fetch options
    fetcher?: typeof fetch; // Custom fetcher
  }
);
```

**Overwrite Behavior:**

The `overwrite` parameter controls what happens when a file already exists for the entity field:

```typescript
// Default: Error if file exists (overwrite not set)
const result = await media.uploadToEntity("posts", 1, "cover", file);
// Error: File already exists for posts[1].cover

// Allow overwriting existing file
const result = await media.uploadToEntity("posts", 1, "cover", file, {
  overwrite: true
});
// Success: Replaces existing file with new one
```

**Use Cases:**

```typescript
// Upload profile picture for user
await media.uploadToEntity("users", userId, "avatar", avatarFile);

// Update existing cover image (overwrite)
await media.uploadToEntity("posts", postId, "cover", newCoverImage, {
  overwrite: true
});

// Upload document with custom fetch options
await media.uploadToEntity("documents", docId, "file", pdfBuffer, {
  _init: {
    headers: { "X-Custom-Header": "value" }
  }
});
```

**Best Practices:**
- Use `overwrite: false` (default) for one-time uploads to prevent accidental data loss
- Use `overwrite: true` for update operations where replacing existing files is expected
- Always check if file exists before attempting to overwrite
- Use appropriate file sizes and formats based on your use case

## Events

Both Repository and Mutator emit events that can be subscribed to via the EntityManager's EventManager.

### Repository Events

- `RepositoryFindOneBefore` - Before finding a single record
- `RepositoryFindOneAfter` - After finding a single record
- `RepositoryFindManyBefore` - Before finding multiple records
- `RepositoryFindManyAfter` - After finding multiple records

### Mutator Events

- `MutatorInsertBefore` - Before creating a record
- `MutatorInsertAfter` - After creating a record
- `MutatorUpdateBefore` - Before updating a record
- `MutatorUpdateAfter` - After updating a record
- `MutatorDeleteBefore` - Before deleting a record
- `MutatorDeleteAfter` - After deleting a record

**UNKNOWN:** Cannot confirm exact event payload structure, how to subscribe to events, or event ordering guarantees.

## Transaction Management

**UNKNOWN:** The documentation does not specify:
- How transactions work in Bknd
- Transaction isolation levels (read committed, serializable, etc.)
- Automatic rollback behavior on errors
- How to group multiple operations in a transaction

This is a significant gap for users needing strong consistency guarantees.

## Best Practices

### Indexing

Bknd warns when filtering or sorting on non-indexed fields. Always index fields used in queries:

```typescript
const posts = entity("posts", {
  title: text().required(),
  status: text(),
}, {
  indices: [
    { name: "idx_status", fields: ["status"] }
  ]
});
```

### Pagination

Always use `limit` to avoid returning too many records. Default limit is 10.

### Field Selection

Use `select` to limit returned fields and improve query performance:

```typescript
await userRepo.findMany({
  select: ["id", "username"]
});
```

### Eager Loading

Use `with` instead of N+1 queries when loading relationships:

```typescript
// Good (2 queries)
await postRepo.findMany({
  with: ["author"]
});

// Bad (N+1 queries)
const posts = await postRepo.findMany();
for (const post of posts) {
  const author = await post.author;
}
```

### Batch Operations

Use `insertMany` instead of multiple `insertOne` calls for efficiency.

## Unknown Details

The following aspects are not documented in available resources:

1. **Transaction management** - How transactions work, isolation levels, rollback behavior
2. **Event subscription** - How to subscribe to Repository/Mutator events
3. **Field transformations** - How fields are transformed during read/write operations
4. **Default values** - How default values are applied
5. **System entities** - Which entities are considered "system" entities and why creation is disabled
6. **Error handling** - Specific error types and how to handle them
7. **Performance optimization** - Query caching, connection pooling, etc.
8. **Complex `with` queries** - Maximum depth, nested patterns
9. **Aliased fields in `select`** - Support for expressions or aliases
10. **Relation query limits** - Why Many-to-Many has a 5-record limit and how to change it

To understand these aspects, consult:
- Source code in `app/src/data/entities/`
- Community discussions
- Issue tracker
- Example projects

## See Also

- [Entity Relationships](../how-to-guides/data/entity-media-relationships.md) - Working with entity relationships
- [Database Indices](./orm.md) - Indexing for performance
- [Query System](./query-system.md) - Advanced query patterns
- [Schema IDs vs UUIDs](../how-to-guides/data/schema-ids-vs-uuids.md) - Primary key configuration

## Related Guides

- [Build Your First API](../getting-started/build-your-first-api.md) - Learn through hands-on tutorial
- [Seed Database](../how-to-guides/data/seed-database.md) - Populate initial data
- [Choose Your Mode](../how-to-guides/setup/choose-your-mode.md) - Configuration modes overview
- [Entity-Media Relationships](../how-to-guides/data/entity-media-relationships.md) - Media file associations
