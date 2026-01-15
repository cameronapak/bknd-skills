---
name: querying-with-bknd
description: Helps build type-safe queries using Bknd's Repository-based query system. Supports filtering with operators, relations, sorting, pagination, and field selection. Use when building queries with em.repo(), writing where conditions, or optimizing query performance.
---

# Querying with Bknd

Bknd provides a type-safe query builder on top of Kysely. All queries start with **Repository** and support filtering, relations, sorting, pagination, and field selection.

## Quick Start

```typescript
// Get repository
const userRepo = em.repo('User');

// Three main methods
await userRepo.findId(1);                    // Single by primary key
await userRepo.findOne({ id: 1 });           // Single by condition
await userRepo.findMany({ limit: 10 });      // Multiple with options
```

## Repository Query Configuration

```typescript
interface RepoQuery {
  where?: WhereQuery;              // Filter conditions
  limit?: number;                  // Default 10
  offset?: number;                 // Default 0
  sort?: string | SortConfig;      // 'id' | '-id' | { by: 'id', dir: 'asc'|'desc' }
  select?: string[];               // ['id', 'name'] - pick fields
  with?: Record<string, RepoQuery>; // Preload relations
  join?: string[];                 // Explicit joins
}
```

## Where Operators

### Comparison
```typescript
{ id: 1 }                        // Equal
{ id: { $eq: 1 } }               // Equal (explicit)
{ status: { $ne: 'active' } }    // Not equal
{ age: { $gt: 18 } }             // Greater than
{ age: { $gte: 18 } }            // Greater than or equal
{ age: { $lt: 65 } }             // Less than
{ age: { $lte: 65 } }            // Less than or equal
```

### Range & Null
```typescript
{ created: { $between: ['2024-01-01', '2024-12-31'] } }
{ deletedAt: { $isnull: true } }  // IS NULL
{ deletedAt: { $isnull: false } } // IS NOT NULL
```

### Arrays & Like
```typescript
{ status: { $in: ['active', 'pending'] } }
{ status: { $notin: ['deleted'] } }
{ title: { $like: 'guide*' } }    // Wildcard: * → %
```

### Compound
```typescript
// AND (default, multiple fields)
{ status: 'active', age: { $gte: 18 } }

// OR
{ $or: { status: 'active', role: 'admin' } }
```

## Auto-Join Filtering

Filter by related entity fields using dot notation—Bknd auto-joins:

```typescript
// Filter comments by post title (auto-joins posts)
await em.repo('comments').findMany({
  where: { 'posts.title': 'My Post' }
});

// Filter by multiple relations
await em.repo('comments').findMany({
  where: {
    'posts.title': { $like: '*Tutorial*' },
    'author.status': 'active'
  }
});
```

**Triggers:** Related entity exists + field exists on related entity + dot notation used. Issues warning if joined field not indexed.

## Common Patterns

### Basic Filter & Sort
```typescript
const users = await em.repo('User').findMany({
  where: { status: 'active' },
  sort: '-createdAt',  // Descending
  limit: 20
});
```

### Eager Load Relations
```typescript
const users = await em.repo('User').findMany({
  limit: 10,
  with: {
    posts: {
      limit: 5,
      sort: '-createdAt',
      where: { status: 'published' }
    }
  }
});
```

### Nested Relations
```typescript
const data = await em.repo('User').findMany({
  with: {
    posts: {
      with: {
        comments: {
          where: { approved: { $isnull: false } }
        }
      }
    }
  }
});
```

### Partial Field Selection
```typescript
const lightUsers = await em.repo('User').findMany({
  select: ['id', 'name', 'email'],
  limit: 100
});
```

### Complex Query
```typescript
const users = await em.repo('User').findMany({
  where: {
    status: 'active',
    createdAt: { $gte: '2024-01-01' }
  },
  sort: { by: 'postsCount', dir: 'desc' },
  select: ['id', 'name', 'postsCount'],
  limit: 20,
  offset: 0
});
```

## API Parameters

Pass query config via URL:

```
/api/users?limit=10&sort=-createdAt&where={"status":"active"}
```

Auto-converts:
- `limit=10` → number
- `select=id,name` → `['id', 'name']`
- `sort=-createdAt` → `{ by: 'createdAt', dir: 'desc' }`
- `with=posts,comments` → `{ posts: {}, comments: {} }`
- `where={"status":"active"}` → JSON object

## Performance Tips

### Indexing
```typescript
const users = entity('users', {
  email: text().unique().index(),  // For login
  status: text().index(),          // For filters
  createdAt: timestamp().index(),  // For ranges
});
```

### Optimize Auto-Join
```typescript
// ❌ Auto-join loads all post columns
const comments = await em.repo('comments').findMany({
  where: { 'posts.title': 'My Post' }
});

// ✅ Use explicit select for control
const comments = await em.repo('comments').findMany({
  join: ['posts'],
  select: ['id', 'content', 'posts.title'],
  where: { 'posts.title': 'My Post' }
});
```

### Reasonable Limits
```typescript
// ✅ Good page size
await em.repo('posts').findMany({ limit: 20 });

// ❌ Performance risk
await em.repo('posts').findMany({ limit: 10000 });
```

## Type Safety

Queries have full TypeScript support. IDE catches:
- Non-existent fields
- Wrong operator usage
- Invalid sort directions

```typescript
userRepo.findMany({
  where: {
    status: 'active',       // ✅ Exists
    nonExistentField: 1     // ❌ Type error
  }
});
```
