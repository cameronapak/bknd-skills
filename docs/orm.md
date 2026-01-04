# How Bknd ORM Works - Schema Prototype API

## The Schema Prototype Pattern

Bknd's schema prototype API provides a **fluent, type-safe interface** for defining your data models. Think of it as a bridge between the declarative simplicity of Prisma and the flexibility of raw code.

---

## Core Building Blocks

### 1. Field Prototypes

Fields are created using factory functions that return prototype objects:

```typescript
import { text, number, boolean, date, enumm, json, media } from "bknd/data";

// Optional field
name: text()

// Required field with chainable .required()
email: text().required()

// With configuration
age: number({ default_value: 0 })
bio: text({ description: "User biography" })
isActive: boolean({ default_value: true })
```

Under the hood, these return a `FieldPrototype` object (see [prototype/index.ts#L71-L109](https://github.com/bknd-io/bknd/blob/main/app/src/data/prototype/index.ts#L71-L109)) that gets converted to actual `Field` instances when the entity is constructed.

### 2. Entity Definition

Define entities using the `entity()` function:

```typescript
import { entity } from "bknd/data";

const users = entity("users", {
  username: text().required(),
  email: text().required(),
  bio: text(),
  age: number({ default_value: 0 }),
  isActive: boolean({ default_value: true }),
}, {
  name_singular: "User",
  description: "Registered users"
});
```

The `entity()` function (see [prototype/index.ts#L182-L190](https://github.com/bknd-io/bknd/blob/main/app/src/data/prototype/index.ts#L182-L190)):
1. Converts all field prototypes to actual `Field` instances
2. Automatically adds a primary `id` field if not specified
3. Creates an `Entity` object with type-safe field definitions

### 3. The `em()` Function - Schema Builder

The `em()` function is the schema orchestrator that brings everything together:

```typescript
import { em } from "bknd/data";

const schema = em(
  // Entities object
  {
    users: entity("users", {
      username: text().required(),
      email: text().required(),
    }),
    posts: entity("posts", {
      title: text().required(),
      content: text(),
      published: boolean({ default_value: false }),
    }),
    tags: entity("tags", {
      name: text().required(),
    }),
  },
  // Relations and indexes callback
  ({ relation, index }, { users, posts, tags }) => {
    // Define relationships
    relation(posts).manyToOne(users);
    relation(posts).manyToMany(tags);
    
    // Define indexes
    index(users).on(["email"], true); // unique
    index(users).on(["username"]);
    index(posts).on(["author_id"]);
    index(posts).on(["published"]);
  }
);
```

The `em()` function (see [prototype/index.ts#L309-L356](https://github.com/bknd-io/bknd/blob/main/app/src/data/prototype/index.ts#L309-L356)):

1. **Creates Proxies** - Wraps `relation()` and `index()` functions in proxies that collect all definitions
2. **Builds EntityManager** - Creates an `EntityManagerPrototype` with all entities, relations, and indices
3. **Returns Type-Safe Schema** - Returns an object with:
   - `DB` - Type-safe database schema for TypeScript
   - `entities` - The entity definitions
   - `relations` - Array of relationship objects
   - `indices` - Array of index objects
   - `proto` - The EntityManager instance
   - `toJSON()` - Serializable schema for config

### 4. Defining Relations

Relations use a fluent, chained API:

```typescript
// Many-to-One (posts belong to users)
relation(posts).manyToOne(users, {
  local_key: "author_id",
  foreign_key: "id",
  cascade: ["delete"]
});

// One-to-One
relation(users).oneToOne(profiles, {
  local_key: "profile_id",
  foreign_key: "id"
});

// Many-to-Many with additional fields
relation(posts).manyToMany(tags, {
  connectionTable: "post_tags"
}, {
  // Additional fields on connection table
  pinnedAt: date()
});

// Polymorphic relations
relation(comments).polyToMany([posts, videos], {
  type_field: "commentable_type",
  id_field: "commentable_id"
});
```

See [prototype/index.ts#L217-L266](https://github.com/bknd-io/bknd/blob/main/app/src/data/prototype/index.ts#L217-L266) for all relation types.

### 5. Defining Indexes

Indexes are defined similarly:

```typescript
// Unique index
index(users).on(["email"], true);

// Composite index
index(posts).on(["author_id", "published"]);

// Multiple indexes
index(users).on(["email"], true).on(["username"]);
```

See [prototype/index.ts#L266-L280](https://github.com/bknd-io/bknd/blob/main/app/src/data/prototype/index.ts#L266-L280).

---

## Type Inference & TypeScript Magic

Bknd's schema prototype provides excellent type safety:

```typescript
// Infer entity field types
type UserFields = InferEntityFields<typeof users>;
// { username: string; email: string; bio?: string; ... }

// Infer full schema (with auto-generated id)
type DB = typeof schema.DB;
// { users: { id: Generated<number>; username: string; ... }; ... }

// Type-safe queries
const userRepo = schema.proto.repository("users");
const users = await userRepo.findMany({
  where: { username: "john" } // Fully typed!
});
```

The type system (see [prototype/index.ts#L357-L414](https://github.com/bknd-io/bknd/blob/main/app/src/data/prototype/index.ts#L357-L414)):
- Infers field types from field prototypes
- Marks optional fields as `undefined | T`
- Auto-generates `id` field types
- Creates complete database schema types

---

## Complete Example

```typescript
import { em, text, number, boolean, date, entity } from "bknd/data";

// Define your schema
const { DB, proto, entities } = em(
  {
    users: entity("users", {
      username: text().required(),
      email: text().required(),
      bio: text(),
      age: number({ default_value: 0 }),
      isActive: boolean({ default_value: true }),
      joinedAt: date({ default_value: () => new Date() }),
    }),
    posts: entity("posts", {
      title: text().required(),
      content: text(),
      published: boolean({ default_value: false }),
      authorId: number().required(), // Created automatically by relation
    }),
    tags: entity("tags", {
      name: text().required(),
    }),
  },
  ({ relation, index }, { users, posts, tags }) => {
    // Posts belong to users
    relation(posts).manyToOne(users);
    
    // Posts have many tags
    relation(posts).manyToMany(tags);
    
    // Indexes
    index(users).on(["email"], true).on(["username"]);
    index(posts).on(["author_id"]).on(["published"]);
  }
);

// Use the schema
const userRepo = proto.repository("users");
const postRepo = proto.repository("posts");

// Create a user
const mutator = proto.mutator("users");
await mutator.create({
  username: "john_doe",
  email: "john@example.com",
});

// Query with relations
const posts = await postRepo.findMany({
  with: ["author", "tags"],
  where: { published: true },
  order: { createdAt: "desc" }
});
```

---

## Bknd vs Prisma vs Drizzle - Schema API Comparison

| Aspect | **Bknd Schema Prototype** | **Prisma** | **Drizzle** |
|--------|---------------------------|------------|-------------|
| **Syntax Style** | Fluent function-based | Schema file | Object-based |
| **Field Definition** | `text().required()` | `String @required` | `text().notNull()` |
| **Relations** | `relation(posts).manyToOne(users)` | `User @relation` | Manual join definitions |
| **Indexes** | `index(users).on(["email"])` | `@@index([email])` | `.index()` |
| **Type Safety** | ✅ Full inference | ✅ Auto-generated | ✅ Manual but complete |
| **Schema Location** | In code | Separate `.prisma` file | In code |
| **Migrations** | SchemaManager auto | Prisma Migrate | Drizzle Kit |
| **Runtime Flexibility** | ✅ High | ❌ Generated only | ✅ High |

### Key Differences

**Prisma:**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  posts     Post[]
  @@index([username])
}
```
- Separate file, declarative
- Most beginner-friendly
- Requires code generation step
- Limited runtime flexibility

**Drizzle:**
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
}, (table) => ({
  usernameIdx: index("username_idx").on(table.username)
}));
```
- Code-based, closest to SQL
- Maximum control
- More verbose
- Manual relation management

**Bknd:**
```typescript
const users = entity("users", {
  username: text().required(),
  email: text().required(),
});
// Relations defined separately in em()
relation(posts).manyToOne(users);
index(users).on(["username"], true);
```
- **Hybrid approach**: Best of both worlds
- Fluent, readable syntax
- Automatic id field generation
- Built-in relation and index management
- Full-stack features (auth, permissions, UI) included

---

## Why Bknd's Schema Prototype?

### Advantages

1. **Developer Experience**
   - Intuitive, readable syntax
   - No separate files or generators
   - Excellent IDE autocomplete

2. **Type Safety**
   - Full TypeScript inference
   - No manual type definitions
   - Compile-time error checking

3. **Flexibility**
   - Mix code and config
   - Dynamic schema generation
   - Runtime modifications

4. **Full-Stack Ready**
   - Auto-generates UI components
   - Built-in permissions
   - API endpoints auto-created

5. **Zero-Config**
   - Automatic migrations
   - Default values and constraints
   - Id field auto-generation

### When to Use

✅ **Choose Bknd Schema Prototype when:**
- Building full-stack applications
- Need rapid development with type safety
- Want auto-generated admin UI
- Need built-in auth and permissions
- Prefer code over configuration files

❌ **Consider alternatives when:**
- Need only a thin ORM layer
- Want maximum SQL control (use Drizzle)
- Separate teams handling schema vs app logic (Prisma)

The Bknd schema prototype API gives you the elegance of Prisma with the power of Drizzle, plus full-stack capabilities that neither provides. It's designed for modern developers who want type safety without sacrificing flexibility.
