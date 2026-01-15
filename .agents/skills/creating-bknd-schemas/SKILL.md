---
name: creating-bknd-schemas
description: Explains in-depth how to define schemas, entities, relationships, constraints, and indexes in Bknd. Use when learning Bknd schema design or comparing with Drizzle/Prisma patterns.
---

# Creating Bknd Schemas

Comprehensive guide to building schemas in Bknd, including entities, fields, relationships, constraints, and database configurations.

## Schema Fundamentals

Bknd schemas use the **`em()` (entity manager)** API to define your data models. Unlike Prisma (declarative) or Drizzle (explicit), Bknd offers a **lightweight, composable approach** with automatic primary keys and relationships.

### Basic Pattern

```typescript
const schema = em({
  entityName: entity("table_name", {
    fieldName: fieldType().options(),
  }),
});
```

**Key Features:**
- Primary key `id` auto-added (never specify manually)
- Fields defined with method chaining
- Relationships defined separately in callback function
- Constraints & indexes applied in final callback

---

## Building Entities

### 1. Basic Table with Primary Key

Bknd **automatically creates an `id` primary key**—no manual declaration needed.

```typescript
const schema = em({
  users: entity("users", {
    // Primary key "id" is automatically added
    name: text().required(),
    age: number(),
  }),
});
```

**vs Drizzle:**
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),  // Explicit
  name: text('name').notNull(),
  age: integer('age'),
});
```

**vs Prisma:**
```prisma
model User {
  id   Int    @id @default(autoincrement())
  name String
  age  Int?
}
```

---

## Field Types

All field types support method chaining and configuration options:

```typescript
// Optional text
bio: text()

// Required text
name: text().required()

// With length constraint
slug: text({ maxLength: 100 }).required()

// With default value
role: text({ default_value: "user" })
```

**Available field types:**
- `text()` - Strings with validation
- `number()` - Integers/decimals with constraints
- `boolean()` - True/false values
- `date()` - Dates and datetimes
- `enumm()` - Predefined options
- `json<T>()` - Type-safe JSON
- `media()` - Multiple file uploads
- `medium()` - Single file upload

→ See [reference/field-types.md](reference/field-types.md) for complete configuration options for each type.

---

## Required vs Optional

| Pattern | Meaning |
|---------|---------|
| `field: text()` | Optional (nullable) |
| `field: text().required()` | Required (NOT NULL) |
| `field: text({ default_value: "x" })` | Optional with default |

**Example:**
```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),           // NOT NULL
    bio: text(),                       // NULL allowed
    email: text().required(),          // NOT NULL
    age: number(),                     // NULL allowed
  }),
});
```

---

## Relationships

Relationships are defined in a **second callback function** after all entities.

### Many-to-One (Foreign Key)

One post belongs to one user:

```typescript
const schema = em(
  {
    users: entity("users", {
      name: text().required(),
    }),
    posts: entity("posts", {
      title: text().required(),
    }),
  },
  ({ relation }, { users, posts }) => {
    relation(posts).manyToOne(users);
    // Foreign key "user_id" is automatically created on posts
  },
);
```

### Many-to-Many

Posts and tags (with implicit junction table):

```typescript
const schema = em(
  {
    posts: entity("posts", {
      title: text().required(),
    }),
    tags: entity("tags", {
      name: text().required(),
    }),
  },
  ({ relation }, { posts, tags }) => {
    relation(posts).manyToMany(tags);
    // Junction table "posts_tags" auto-created
  },
);
```

### Polymorphic Relations

Comments can belong to different entity types (posts OR videos):

```typescript
relation(comments).polyToMany([posts, videos], {
  type_field: "commentable_type",
  id_field: "commentable_id"
});
```

→ See [reference/relations.md](reference/relations.md) for all relation types (one-to-one, many-to-many with extra fields, cascade options, self-referential).

---

## Constraints & Indexes

Constraints and indexes are applied using the callback function's `index()` and `unique()` helpers.

### Unique Constraints

Single field unique:

```typescript
const schema = em(
  {
    users: entity("users", {
      username: text().required(),
      email: text().required(),
    }),
  },
  ({ index }, { users }) => {
    // Chained unique constraints
    index(users).on(["username"], true).on(["email"], true);
  },
);
```

**Parameters:**
- `["fieldName"]` - field(s) to index
- `true` - makes it unique
- Chaining allows multiple constraints

### Regular Indexes (for performance)

```typescript
const schema = em(
  {
    posts: entity("posts", {
      author: text().required(),
      created_at: text().required(),
    }),
  },
  ({ index }, { posts }) => {
    // Composite index on two fields
    index(posts).on(["author", "created_at"]);
  },
);
```

### Multiple Constraints

```typescript
({ index }, { users, posts }) => {
  // Users: unique email and username
  index(users)
    .on(["email"], true)
    .on(["username"], true);
  
  // Posts: composite index
  index(posts).on(["author", "created_at"]);
}
```

---

## Default Values

### Field-Level Defaults

```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),
    is_active: boolean({ default_value: true }),
    role: text({ default_value: "user" }),
    visits: number({ default_value: 0 }),
  }),
});
```

### Timestamp Defaults

Use the **timestamps plugin** instead of field options:

```typescript
// bknd.config.ts
import { timestamps } from "bknd/plugins";

export default {
  options: {
    plugins: [
      timestamps({
        entities: ["users", "posts"],
        setUpdatedOnCreate: true,  // Update updatedAt on creation
      })
    ],
  }
} satisfies BkndConfig;
```

This adds `createdAt` and `updatedAt` to specified entities automatically.

---

## Complete Example: Blog Schema

```typescript
import { em, entity, text, number, boolean, enumm, json } from "bknd/schema";

const schema = em(
  {
    users: entity("users", {
      name: text().required(),
      email: text().required(),
      bio: text(),
      is_active: boolean({ default_value: true }),
      role: text({ default_value: "user" }),
    }),
    
    posts: entity("posts", {
      title: text().required(),
      slug: text({ max_length: 100 }).required(),
      content: text().required(),
      status: enumm({ enum: ["draft", "published", "archived"] }),
      views: number({ default_value: 0 }),
      metadata: json({ default_value: {} }),
    }),
    
    tags: entity("tags", {
      name: text().required(),
      description: text(),
    }),
    
    comments: entity("comments", {
      content: text().required(),
      is_approved: boolean({ default_value: false }),
    }),
  },
  ({ relation, index }, { users, posts, tags, comments }) => {
    // Relationships
    relation(posts).manyToOne(users);        // posts.user_id → users.id
    relation(comments).manyToOne(posts);     // comments.post_id → posts.id
    relation(comments).manyToOne(users);     // comments.user_id → users.id
    relation(posts).manyToMany(tags);        // posts_tags junction table
    
    // Constraints & Indexes
    index(users)
      .on(["email"], true)                   // email unique
      .on(["name"]);                         // name index
    
    index(posts)
      .on(["slug"], true)                    // slug unique
      .on(["user_id", "status"]);            // composite index
    
    index(tags).on(["name"], true);          // unique tag names
    
    index(comments).on(["post_id", "is_approved"]);
  }
);

export default schema;
```

---

## Comparison Summary

### Syntax Quick Reference

| Feature | Bknd | Drizzle | Prisma |
|---------|------|---------|--------|
| Primary Key | Auto `id` | `serial().primaryKey()` | `@id` |
| Required Field | `.required()` | `.notNull()` | No suffix |
| Optional Field | No method | No method | `?` |
| Default | `{ default_value: x }` | `.default(x)` | `@default(x)` |
| Unique | `index().on([], true)` | `unique().on()` | `@unique` |
| Composite Index | `index().on([])` | `index().on()` | `@@index([])` |
| Foreign Key | `relation().manyToOne()` | `.references()` | `@relation()` |
| Many-to-Many | `relation().manyToMany()` | Junction explicit | `@relation()` implicit |

### When to Use Bknd for Schemas

✅ **Best for:**
- Rapid prototyping and POCs
- Field-level validation needed
- Runtime schema modifications
- Minimal boilerplate
- Cleanest code

❌ **Consider alternatives if:**
- Multi-database support needed (use Drizzle)
- Complex migrations required (use Prisma)
- Explicit control preferred (use Drizzle)

---

## Common Patterns

### Soft Deletes

```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),
    deleted_at: text(),  // NULL = not deleted
  }),
});
```

Query: Filter where `deleted_at IS NULL`

### Audit Trail

```typescript
const schema = em({
  audit_logs: entity("audit_logs", {
    entity_type: text().required(),
    entity_id: number().required(),
    action: enumm({ enum: ["create", "update", "delete"] }),
    changes: json(),
    created_by: number(),
  }),
});
```

### Multi-Tenancy

```typescript
const schema = em(
  {
    tenants: entity("tenants", {
      name: text().required(),
    }),
    users: entity("users", {
      name: text().required(),
    }),
  },
  ({ relation }, { tenants, users }) => {
    relation(users).manyToOne(tenants);
  }
);
```

---

## Type Safety

Bknd provides full TypeScript inference for schemas:

```typescript
// Get entity field types
type UserFields = InferEntityFields<typeof usersEntity>;

// Get complete database schema type
type DB = typeof schema.DB;

// Type-safe queries
const user = await schema.proto.repository("users").findOne({
  where: { email: "john@example.com" }  // ✅ Fully typed
});
```

→ See [reference/type-inference.md](reference/type-inference.md) for type utilities, query patterns, and generic wrappers.

---

## Reference Documentation

- [reference/field-types.md](reference/field-types.md) - Complete field configuration options
- [reference/relations.md](reference/relations.md) - All relation types with examples
- [reference/type-inference.md](reference/type-inference.md) - TypeScript integration and type utilities
- [reference/schema.md](file:///Users/cameronpak/Projects/supplemental-bknd-docs/reference/schema.md) - Side-by-side comparisons with Drizzle/Prisma
