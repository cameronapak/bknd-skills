# Data Operations Reference

Technical reference for Bknd v0.20.0 CRUD operations, filtering, pagination, and bulk operations.

## API Methods Overview

| Method | Description | HTTP Equivalent |
|--------|-------------|-----------------|
| `readOne(entity, id, query)` | Get single record by ID | `GET /api/data/:entity/:id` |
| `readOneBy(entity, query)` | Get single record by query | `GET /api/data/:entity` (limit=1) |
| `readMany(entity, query)` | Get multiple records | `GET /api/data/:entity` |
| `readManyByReference(entity, id, ref, query)` | Get related records | `GET /api/data/:entity/:id/:ref` |
| `createOne(entity, input)` | Insert single record | `POST /api/data/:entity` |
| `createMany(entity, input[])` | Insert multiple records | `POST /api/data/:entity` (array body) |
| `updateOne(entity, id, input)` | Update single record | `PATCH /api/data/:entity/:id` |
| `updateMany(entity, where, update)` | Update matching records | `PATCH /api/data/:entity` |
| `deleteOne(entity, id)` | Delete single record | `DELETE /api/data/:entity/:id` |
| `deleteMany(entity, where)` | Delete matching records | `DELETE /api/data/:entity` |
| `count(entity, where)` | Count matching records | `POST /api/data/:entity/fn/count` |
| `exists(entity, where)` | Check if records exist | `POST /api/data/:entity/fn/exists` |

---

## SDK Client Setup

```typescript
import { Api } from "bknd";

const api = new Api({
  host: "http://localhost:8080",
  storage: localStorage,  // For token persistence
});

// With authentication token
api.updateToken("your-jwt-token");
```

---

## Read Operations

### Read One by ID

```typescript
const { ok, data } = await api.data.readOne("users", 1);

// With field selection
const { data } = await api.data.readOne("users", 1, {
  select: ["id", "email", "name"],
});

// With relation loading
const { data } = await api.data.readOne("posts", 1, {
  with: ["author", "comments"],
});
```

### Read One by Query

```typescript
const { data } = await api.data.readOneBy("users", {
  where: { email: { $eq: "user@example.com" } },
});
```

### Read Many

```typescript
const { data, meta } = await api.data.readMany("posts", {
  where: { status: { $eq: "published" } },
  sort: { created_at: "desc" },
  limit: 20,
  offset: 0,
});

// meta contains pagination info
console.log(meta.total, meta.limit, meta.offset);
```

### Read Related Records

```typescript
// Get posts by user ID
const { data } = await api.data.readManyByReference("users", 1, "posts", {
  sort: { created_at: "desc" },
  limit: 10,
});
```

---

## Query Parameters

### RepoQueryIn Interface

```typescript
type RepoQueryIn = {
  where?: WhereClause;
  sort?: SortClause;
  limit?: number;
  offset?: number;
  select?: string[];
  with?: WithClause;
  join?: string[];
};
```

### Field Selection

```typescript
// Select specific fields only
const { data } = await api.data.readMany("users", {
  select: ["id", "email", "name"],
});
```

### Sorting

```typescript
// Object syntax
{ sort: { created_at: "desc" } }
{ sort: { name: "asc", created_at: "desc" } }

// String syntax (prefix with - for descending)
{ sort: "-created_at" }
{ sort: "name,-created_at" }
```

### Pagination

```typescript
// Page 1 (records 0-19)
{ limit: 20, offset: 0 }

// Page 2 (records 20-39)
{ limit: 20, offset: 20 }

// Page N
{ limit: pageSize, offset: (page - 1) * pageSize }
```

**Default limit:** 10 (configurable via `defaultQuery` option)

---

## Filtering (Where Clause)

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal | `{ status: { $eq: "active" } }` |
| `$ne` | Not equal | `{ status: { $ne: "deleted" } }` |
| `$gt` | Greater than | `{ age: { $gt: 18 } }` |
| `$gte` | Greater or equal | `{ score: { $gte: 80 } }` |
| `$lt` | Less than | `{ price: { $lt: 100 } }` |
| `$lte` | Less or equal | `{ quantity: { $lte: 10 } }` |

### String Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$like` | SQL LIKE (case-sensitive) | `{ title: { $like: "%hello%" } }` |
| `$ilike` | LIKE (case-insensitive) | `{ title: { $ilike: "%hello%" } }` |
| `$startswith` | Starts with | `{ name: { $startswith: "John" } }` |
| `$endswith` | Ends with | `{ email: { $endswith: "@gmail.com" } }` |
| `$contains` | Contains substring | `{ bio: { $contains: "developer" } }` |

### Array Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$in` | In array | `{ id: { $in: [1, 2, 3] } }` |
| `$nin` | Not in array | `{ type: { $nin: ["archived", "deleted"] } }` |

### Null Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$isnull` | Is NULL | `{ deleted_at: { $isnull: true } }` |
| `$isnull: false` | Is NOT NULL | `{ published_at: { $isnull: false } }` |

### Implicit $eq

Shorthand when using equality:

```typescript
// These are equivalent
{ where: { status: "active" } }
{ where: { status: { $eq: "active" } } }
```

### Logical Operators

**AND (implicit):**
```typescript
{
  where: {
    status: { $eq: "published" },
    created_at: { $gte: "2024-01-01" },
  }
}
```

**OR:**
```typescript
{
  where: {
    $or: [
      { status: { $eq: "published" } },
      { featured: { $eq: true } },
    ]
  }
}
```

**Combined AND/OR:**
```typescript
{
  where: {
    category: { $eq: "news" },
    $or: [
      { status: { $eq: "published" } },
      { author_id: { $eq: currentUserId } },
    ]
  }
}
```

---

## Loading Relations

### With Clause

```typescript
// Simple - load relations
{ with: "author" }
{ with: ["author", "comments"] }
{ with: "author,comments" }

// Nested with subquery options
{
  with: {
    author: {
      select: ["id", "name", "avatar"],
    },
    comments: {
      where: { approved: { $eq: true } },
      sort: { created_at: "desc" },
      limit: 10,
      with: ["user"],  // Nested loading
    },
  }
}
```

### Join vs With

| Feature | `join` | `with` |
|---------|--------|--------|
| Query method | SQL JOIN | Separate queries |
| Return structure | Flat | Nested |
| Use case | Filter by related fields | Load related data |
| Performance | Single query | Multiple queries |
| Can sort by | Joined fields | Each relation separately |

**Join example (filter by related field):**
```typescript
const { data } = await api.data.readMany("posts", {
  join: ["author"],
  where: {
    "author.role": { $eq: "admin" },
  },
  sort: "-author.created_at",
});
```

**With example (load nested data):**
```typescript
const { data } = await api.data.readMany("posts", {
  with: {
    author: { select: ["id", "name"] },
  },
});
// data[0].author.name
```

---

## Create Operations

### Create One

```typescript
const { ok, data } = await api.data.createOne("users", {
  email: "new@example.com",
  name: "New User",
});

if (ok) {
  console.log("Created:", data.id);
}
```

### Create Many (Bulk Insert)

```typescript
const { ok, data } = await api.data.createMany("posts", [
  { title: "Post 1", status: "draft" },
  { title: "Post 2", status: "draft" },
  { title: "Post 3", status: "draft" },
]);

// data is array of created records
```

### Create with Relations

Use `$set` to link to existing related records:

```typescript
// Create post linked to existing author
const { data } = await api.data.createOne("posts", {
  title: "New Post",
  author: { $set: 1 },  // Link to user ID 1
});

// Many-to-many: link to multiple tags
const { data } = await api.data.createOne("posts", {
  title: "New Post",
  tags: { $set: [1, 2, 3] },  // Link to tag IDs
});
```

---

## Update Operations

### Update One

```typescript
const { ok, data } = await api.data.updateOne("posts", 1, {
  title: "Updated Title",
  status: "published",
});
```

### Update Many (Bulk Update)

```typescript
// Update all matching records
const { ok, data } = await api.data.updateMany(
  "posts",
  { status: { $eq: "draft" } },  // where clause (required)
  { status: "archived" },         // update values
);
```

### Update Relations

```typescript
// Change linked record
const { data } = await api.data.updateOne("posts", 1, {
  author: { $set: 2 },  // Change author to user ID 2
});

// Unlink (set to null)
const { data } = await api.data.updateOne("posts", 1, {
  author: { $unset: true },
});

// Many-to-many: add to existing
const { data } = await api.data.updateOne("posts", 1, {
  tags: { $add: [4, 5] },
});

// Many-to-many: remove specific
const { data } = await api.data.updateOne("posts", 1, {
  tags: { $remove: [2] },
});

// Many-to-many: replace all
const { data } = await api.data.updateOne("posts", 1, {
  tags: { $set: [1, 3, 5] },
});
```

---

## Delete Operations

### Delete One

```typescript
const { ok, data } = await api.data.deleteOne("posts", 1);
```

### Delete Many (Bulk Delete)

```typescript
// Delete all matching records
const { ok, data } = await api.data.deleteMany("posts", {
  status: { $eq: "archived" },
  created_at: { $lt: "2023-01-01" },
});
```

**Warning:** `where` is required - prevents accidental delete-all.

---

## Utility Methods

### Count

```typescript
const { data } = await api.data.count("posts", {
  status: { $eq: "published" },
});

console.log(data.count);  // number
```

### Exists

```typescript
const { data } = await api.data.exists("users", {
  email: { $eq: "test@example.com" },
});

if (data.exists) {
  // Record exists
}
```

---

## Server-Side (Seed Functions)

Use `ctx.em.mutator()` for server-side operations in seed functions:

```typescript
options: {
  seed: async (ctx) => {
    // Bulk insert
    await ctx.em.mutator("todos").insertMany([
      { title: "Task 1", done: false },
      { title: "Task 2", done: true },
    ]);

    // Single insert
    await ctx.em.mutator("users").insertOne({
      email: "admin@example.com",
      role: "admin",
    });
  },
}
```

---

## REST API Endpoints

### Base Path

`/api/data`

### Endpoint Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/data/:entity` | Read many |
| POST | `/api/data/:entity/query` | Read many (complex queries) |
| GET | `/api/data/:entity/:id` | Read one |
| GET | `/api/data/:entity/:id/:reference` | Read related |
| POST | `/api/data/:entity` | Create one/many |
| PATCH | `/api/data/:entity/:id` | Update one |
| PATCH | `/api/data/:entity` | Update many |
| DELETE | `/api/data/:entity/:id` | Delete one |
| DELETE | `/api/data/:entity` | Delete many |
| POST | `/api/data/:entity/fn/count` | Count |
| POST | `/api/data/:entity/fn/exists` | Exists check |

### Query String Format

```
GET /api/data/posts?limit=20&offset=0&sort=-created_at&where={"status":"published"}
```

Complex queries auto-switch to POST when URL exceeds `queryLengthLimit` (default: 1000 chars).

---

## Response Format

### Success Response

```typescript
{
  ok: true,
  data: { ... } | [ ... ],  // Single object or array
  meta: {
    total: 100,
    limit: 20,
    offset: 0,
  }
}
```

### Error Response

```typescript
{
  ok: false,
  error: {
    message: "Error description",
    code: "ERROR_CODE",
  }
}
```

---

## Common Patterns

### Pagination Helper

```typescript
async function paginate<T>(
  entity: string,
  page: number,
  pageSize: number,
  query: Omit<RepoQueryIn, "limit" | "offset"> = {}
) {
  const { data, meta } = await api.data.readMany(entity, {
    ...query,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    data,
    page,
    pageSize,
    total: meta.total,
    totalPages: Math.ceil(meta.total / pageSize),
  };
}
```

### Soft Delete Pattern

```typescript
// "Delete" by setting timestamp
await api.data.updateOne("posts", id, {
  deleted_at: new Date().toISOString(),
});

// Query non-deleted
await api.data.readMany("posts", {
  where: { deleted_at: { $isnull: true } },
});
```

### Upsert Pattern

```typescript
async function upsert(entity: string, where: object, data: object) {
  const { data: existing } = await api.data.readOneBy(entity, { where });

  if (existing) {
    return api.data.updateOne(entity, existing.id, data);
  }

  return api.data.createOne(entity, data);
}
```

### Transaction-like Batch

Bknd doesn't have explicit transactions, but you can batch related operations:

```typescript
// Create user and profile together
const { data: user } = await api.data.createOne("users", {
  email: "user@example.com",
});

const { data: profile } = await api.data.createOne("profiles", {
  user: { $set: user.id },
  bio: "Hello!",
});
```

---

## SDK Configuration

```typescript
const api = new Api({
  host: "https://api.example.com",

  // Data module options
  data: {
    queryLengthLimit: 2000,  // Switch to POST above this
    defaultQuery: {
      limit: 25,  // Default page size
    },
  },
});
```

---

## Type Safety

### With Generated Types

```typescript
import { Api } from "bknd";
import type { DB } from "./generated-types";

const api = new Api({ host: "..." });

// Typed queries
const { data } = await api.data.readMany<"users">("users", {
  where: { email: { $eq: "test@example.com" } },
});

// data is typed as DB["users"][]
```

### DB Interface Augmentation

```typescript
const schema = em({
  users: entity("users", { ... }),
});

type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}
```
