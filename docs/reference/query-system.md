## Bknd Query System

Bknd didn't invent a completely new query language—it built a **type-safe query builder** on top of [Kysely](https://kysely.dev/). The query system consists of three core components:

1. **Repository** - Your query entry point
2. **WhereBuilder** - Builds filter conditions
3. **RepoQuery** - Complete query configuration type

---

## 1. Repository - Query Entry Point

Get a Repository through EntityManager, all queries start here:

```typescript
// Get Repository for an entity
const userRepo = em.repository('User');
// Or shorthand
const userRepo = em.repo('User');

// Three main query methods
await userRepo.findId(1);              // Find single by primary key
await userRepo.findOne({ id: 1 });     // Find single by conditions
await userRepo.findMany({ limit: 10 }); // Find multiple
```

---

## 2. WhereBuilder - Filter Condition Expressions

WhereBuilder supports a clean set of query operators, all field queries are in object form:

### Basic Operators

```typescript
// Equal (direct value or use $eq)
{ id: 1 }                    // id = 1
{ id: { $eq: 1 } }           // id = 1

// Not equal
{ status: { $ne: 'active' } }  // status != 'active'

// Comparisons
{ age: { $gt: 18 } }         // age > 18
{ age: { $gte: 18 } }        // age >= 18
{ age: { $lt: 65 } }         // age < 65
{ age: { $lte: 65 } }        // age <= 65

// Range
{ createdAt: { $between: ['2024-01-01', '2024-12-31'] } }

// Null checks
{ deletedAt: { $isnull: true } }   // IS NULL
{ deletedAt: { $isnull: false } }  // IS NOT NULL

// Arrays
{ status: { $in: ['active', 'pending'] } }     // IN ('active', 'pending')
{ status: { $notin: ['deleted'] } }            // NOT IN ('deleted')

// Fuzzy search
{ name: { $like: 'John*' } }  // LIKE 'John%' (supports * wildcard)
```

### Compound Conditions

```typescript
// AND conditions (multiple fields default to AND)
{ 
  status: 'active',
  age: { $gte: 18 }
}
// WHERE status = 'active' AND age >= 18

// OR conditions
{
  $or: {
    status: 'active',
    role: 'admin'
  }
}
// WHERE status = 'active' OR role = 'admin'
```

---

## 3. RepoQuery - Complete Query Configuration

The complete query object includes these options:

```typescript
interface RepoQuery {
  // Pagination
  limit?: number;      // Default 10
  offset?: number;     // Default 0
  
  // Sorting
  sort?: string | { by: string; dir: 'asc' | 'desc' };
  // 'id'              → ORDER BY id ASC
  // '-id'             → ORDER BY id DESC
  // { by: 'name', dir: 'desc' }
  
  // Field selection
  select?: string[];   // ['id', 'title', 'createdAt']
  
  // Relation queries (preloading)
  with?: Record<string, RepoQuery>;  // Supports nesting
  
  // Join tables (advanced usage)
  join?: string[];
  
  // Filter conditions
  where?: WhereQuery;
}
```

---

## 4. Practical Examples

### Basic Queries

```typescript
// Find active users, sorted by creation time descending
const users = await em.repo('User').findMany({
  where: { status: 'active' },
  sort: '-createdAt',
  limit: 20
});

// Find users aged 18-65
const adults = await em.repo('User').findMany({
  where: { age: { $between: [18, 65] } }
});

// Fuzzy search
const results = await em.repo('Post').findMany({
  where: { title: { $like: '*tutorial*' } },
  limit: 10
});
```

### Relation Queries (with)

```typescript
// Find users with their posts (max 5 per user)
const usersWithPosts = await em.repo('User').findMany({
  limit: 10,
  with: {
    posts: {
      limit: 5,
      sort: '-createdAt',
      where: { status: 'published' }
    }
  }
});

// Nested relations: User → Posts → Comments
const deepQuery = await em.repo('User').findMany({
  with: {
    posts: {
      with: {
        comments: {
          limit: 10,
          where: { approved: { $isnull: false } }
        }
      }
    }
  }
});
```

### Field Selection

```typescript
// Query only needed fields (reduce data transfer)
const lightUsers = await em.repo('User').findMany({
  select: ['id', 'name', 'email'],
  limit: 100
});
```

### Combined Queries

```typescript
// Complex scenario: Find active users, sorted by post count, return partial fields
const activeUsers = await em.repo('User').findMany({
  where: {
    status: 'active',
    createdAt: { $gte: '2024-01-01' }
  },
  sort: { by: 'postsCount', dir: 'desc' },
  select: ['id', 'name', 'postsCount', 'lastLoginAt'],
  limit: 20,
  offset: 0
});
```

---

## 5. Using Through API

Query configuration can be passed directly via URL parameters:

```typescript
// URL: /api/users?limit=10&sort=-createdAt&where={"status":"active"}
// System automatically parses and converts
```

Supported parameter formats:
- `limit=10` or `limit="10"` → auto-converts to number
- `select=id,name` → auto-converts to array `['id', 'name']`
- `sort=-createdAt` → auto-converts to `{ by: 'createdAt', dir: 'desc' }`
- `with=posts,comments` → auto-converts to `{ posts: {}, comments: {} }`
- `where={"status":"active"}` → auto-parses JSON

---

## 6. Type Safety

All queries have complete TypeScript type support:

```typescript
const userRepo = em.repo('User');  // Type auto-inferred

// TypeScript checks if fields exist
userRepo.findMany({
  where: {
    status: 'active',      // ✅ Correct
    nonExistentField: 1    // ❌ Type error
  }
});
```
