## Complete Schema Comparison

### bknd Schema (Your Example)

```typescript
import { createApp, em, entity, text, number } from "bknd";

const schema = em(
  {
    posts: entity("posts", {
      title: text().required(),
      slug: text().required(),
      content: text(),
      views: number(),
    }),
    comments: entity("comments", {
      content: text(),
    }),
  },
  ({ relation, index }, { posts, comments }) => {
    relation(comments).manyToOne(posts);
    index(posts).on(["title"]).on(["slug"], true);
  },
);

type Database = (typeof schema)["DB"];
```

### Prisma Schema

```prisma
// schema.prisma

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  slug      String    @unique
  content   String?
  views     Int       @default(0)
  comments  Comment[]
  
  @@index([title])
  @@unique([slug])
}

model Comment {
  id        Int    @id @default(autoincrement())
  content   String?
  post      Post   @relation(fields: [postId], references: [id])
  postId    Int
  
  @@index([postId])
}
```

### Drizzle Schema

```typescript
import { pgTable, serial, text, integer, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content'),
  views: integer('views').default(0),
}, (table) => ({
  titleIdx: index('title_idx').on(table.title),
  slugUnique: unique('slug_unique').on(table.slug),
}));

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content'),
  postId: integer('post_id').references(() => posts.id),
});

export const postsRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
}));
```

---

## Feature-by-Feature Comparison

### 1. Entity/Model Definition

| Aspect | bknd | Prisma | Drizzle |
|--------|------|--------|---------|
| **Syntax** | Helper functions | Custom DSL | TypeScript objects |
| **Primary Key** | Auto-added `id` | Explicit `@id` | Explicit `.primaryKey()` |
| **Required Fields** | `.required()` chain | No `?` suffix | `.notNull()` |
| **Optional Fields** | No `.required()` | `?` suffix | No `.notNull()` |
| **Default Values** | Field config option | `@default(...)` | `.default(...)` |
| **Field Types** | Functions (`text()`, `number()`) | Primitives (`String`, `Int`) | Functions (`text()`, `integer()`) |

**Examples:**

```typescript
// bknd
title: text().required()        // Required
content: text()                 // Optional

// Prisma
title String                     // Required
content String?                  // Optional

// Drizzle
title: text('title').notNull()  // Required
content: text('content')         // Optional
```

### 2. Relations Definition

| Aspect | bknd | Prisma | Drizzle |
|--------|------|--------|---------|
| **Location** | Separate callback | Embedded in models | Separate `relations()` calls |
| **Syntax** | Fluent chained | Array notation | Fluent chained |
| **Foreign Key** | Auto-generated | Explicit | Explicit |
| **Cascade** | Via config | `@relation` options | Via references |

**Examples:**

```typescript
// bknd
relation(comments).manyToOne(posts)
// Creates comments.post_id automatically

// Prisma
model Comment {
  post  Post   @relation(fields: [postId], references: [id])
  postId Int
}

// Drizzle
postId: integer('post_id').references(() => posts.id)
// Plus separate relations() definition
```

### 3. Indices Definition

| Aspect | bknd | Prisma | Drizzle |
|--------|------|--------|---------|
| **Location** | Separate callback | In model block | In table function |
| **Syntax** | Chained `.on()` | `@@index` | `index().on()` |
| **Unique** | Boolean argument | `@@unique` | `unique().on()` |
| **Composite** | Array argument | Array argument | Array argument |

**Examples:**

```typescript
// bknd - Chained indices
index(posts).on(["title"]).on(["slug"], true);
// Unique index on slug

// Prisma
model Post {
  @@index([title])
  @@unique([slug])
}

// Drizzle - In table function
pgTable('posts', {
  // fields...
}, (table) => ({
  titleIdx: index('title_idx').on(table.title),
  slugUnique: unique('slug_unique').on(table.slug),
}));
```

### 4. Type Inference

| Aspect | bknd | Prisma | Drizzle |
|--------|------|--------|---------|
| **Inference Method** | `["DB"]` property | Generated `PrismaClient` | Inferred from table objects |
| **Types Generated** | TypeScript types | Full client + types | Table types |
| **Setup Required** | Automatic | `prisma generate` | Automatic |

**Examples:**

```typescript
// bknd
type Database = (typeof schema)["DB"];
// { posts: { id: number; title: string; ... }, ... }

// Prisma
// Generated automatically after running prisma generate
// Types: Post, Comment, Prisma.PostCreateInput, etc.

// Drizzle
// Inferred from table objects
type Post = typeof posts.$inferSelect;
type NewPost = typeof posts.$inferInsert;
```

### 5. Schema Modification

| Aspect | bknd | Prisma | Drizzle |
|--------|------|--------|---------|
| **Runtime Changes** | Yes (db mode) | No | No |
| **Storage** | JSON in DB or code | Schema file | Code only |
| **Hot Reload** | Yes | No | No |
| **Versioning** | Built-in | Via migrations | Via migrations |

---

## Syntax Verbosity Comparison

### bknd
```typescript
const schema = em({
  posts: entity("posts", {
    title: text().required(),
    slug: text().required(),
    content: text(),
    views: number(),
  }),
  comments: entity("comments", {
    content: text(),
  }),
}, ({ relation, index }, { posts, comments }) => {
  relation(comments).manyToOne(posts);
  index(posts).on(["title"]).on(["slug"], true);
});
```
**Characters:** ~280  
**Lines:** 12

### Prisma
```prisma
model Post {
  id        Int       @id @default(autoincrement())
  title     String
  slug      String    @unique
  content   String?
  views     Int       @default(0)
  comments  Comment[]
  @@index([title])
}

model Comment {
  id      Int    @id @default(autoincrement())
  content String?
  post    Post   @relation(fields: [postId], references: [id])
  postId  Int
  @@index([postId])
}
```
**Characters:** ~260  
**Lines:** 14

### Drizzle
```typescript
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content'),
  views: integer('views').default(0),
}, (table) => ({
  titleIdx: index('title_idx').on(table.title),
  slugUnique: unique('slug_unique').on(table.slug),
}));

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content'),
  postId: integer('post_id').references(() => posts.id),
});

export const postsRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
}));
```
**Characters:** ~490  
**Lines:** 20

**Winner for brevity:** Prisma ≈ bknd > Drizzle

---

## Key Architectural Differences

### 1. Relation Handling

**bknd:**
- Relations defined in separate callback
- Foreign keys auto-generated
- [`relation()`](app/src/data/prototype/index.ts#L217-L264) helper returns chained methods
- Clean separation of concerns

**Prisma:**
- Relations embedded in models with `[]` syntax
- Foreign keys explicit on the owning side
- More intuitive for many-to-many

**Drizzle:**
- Relations defined separately via `relations()` function
- Foreign keys explicit in table definition
- Most verbose but most explicit

### 2. Index Handling

**bknd:**
- Chained `.on()` for multiple indices
- Boolean flag for uniqueness
- [`index()`](app/src/data/prototype/index.ts#L266-L279) helper returns chained methods
- Can define multiple indices in one chain

**Prisma:**
- `@@index` and `@@unique` blocks
- Very readable
- Composite indices via arrays

**Drizzle:**
- Indices defined in table function's second parameter
- Need to name each index
- Most control but most verbose

### 3. Type System

**bknd:**
- Types inferred from schema via `["DB"]` property
- [InferEntityFields](app/src/data/prototype/index.ts#L357-L364) and [Schema](app/src/data/prototype/index.ts#L413-L413) types
- No generation step needed
- Clean and automatic

**Prisma:**
- Full type ecosystem generated
- `Post`, `PostCreateInput`, `PostUpdateInput`, etc.
- Requires CLI generation
- Most comprehensive types

**Drizzle:**
- Inferred via `$inferSelect` and `$inferInsert`
- No generation step
- Good balance of inference and explicitness

---

## Advantages and Disadvantages

### bknd

**Advantages:**
✅ Clean separation (entities, relations, indices)  
✅ Auto-generated foreign keys  
✅ Fluent chained API  
✅ Type inference without generation  
✅ Runtime schema modification (db mode)  
✅ Field-level metadata (validation, UI hints)  
✅ Chained definitions for relations/indices  

**Disadvantages:**
❌ Custom API to learn (not standard)  
❌ Less tooling support than Prisma  
❌ Requires understanding of helper functions  

### Prisma

**Advantages:**
✅ Declarative and readable  
✅ Excellent auto-completion  
✅ Rich type ecosystem  
✅ Mature tooling and ecosystem  
✅ Migration system is excellent  

**Disadvantages:**
❌ Schema file format to learn  
❌ No runtime schema changes  
❌ Requires generation step  
❌ Less explicit SQL control  

### Drizzle

**Advantages:**
✅ Pure TypeScript (no DSL)  
✅ Maximum SQL control  
✅ No generation step  
✅ Multiple dialect support  
✅ Excellent performance  

**Disadvantages:**
❌ Most verbose  
❌ Relations defined separately  
❌ Indices defined separately  
❌ More boilerplate  

---

## Which Should You Choose?

### Choose bknd if:
- You want clean separation of concerns
- You need runtime schema modification
- You're building a platform where users define schemas
- You like fluent chained APIs
- You want field-level validation and UI metadata
- You need multi-runtime support

### Choose Prisma if:
- You want the best developer experience
- You don't need runtime schema changes
- You prefer declarative syntax
- You want comprehensive generated types
- You value mature tooling and ecosystem

### Choose Drizzle if:
- You want maximum SQL control
- You dislike DSLs and generated code
- You prefer pure TypeScript
- Performance is critical
- You need multiple database dialects

---

## Summary Table

| Feature | bknd | Prisma | Drizzle |
|---------|------|--------|---------|
| **Primary Key** | Auto `id` | Explicit `@id` | Explicit `.primaryKey()` |
| **Required Fields** | `.required()` | No `?` | `.notNull()` |
| **Relations** | Separate callback | Embedded models | Separate `relations()` |
| **Foreign Keys** | Auto-generated | Explicit | Explicit |
| **Indices** | Chained `.on()` | `@@index` | Table function parameter |
| **Type Inference** | `["DB"]` property | Generated | `$inferSelect` |
| **Runtime Changes** | ✅ Yes | ❌ No | ❌ No |
| **Syntax Verbosity** | Low | Low | High |
| **Learning Curve** | Medium | Low | Medium |

---

## Next Steps

Explore more aspects of each:

[Entity Relationships](15-entity-relationships)
[Database Indices](16-database-indices)
[Schema Constructor and Validation](17-schema-constructor-and-validation)
