# Schema Modeling Reference

Technical reference for Bknd v0.20.0 schema definition, field types, and relationship patterns.

## Core Concepts

### Schema Definition with `em()`

The `em()` function creates a schema definition object:

```typescript
import { em, entity, text, boolean } from "bknd";

const schema = em({
  todos: entity("todos", {
    title: text().required(),
    done: boolean(),
  }),
});

// Extract types for type safety
type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}
```

**Important:** `em()` returns a schema object with `toJSON()`, `entities`, `proto` - NOT a queryable EntityManager. For runtime queries, use `api.data.*` methods.

### Entity Definition

```typescript
entity(name: string, fields: Record<string, Field>, options?: EntityOptions)
```

**EntityOptions:**
- `primary_format`: `"integer"` | `"uuid"` (default: `"integer"`)

```typescript
entity("users", {
  email: text().required(),
}, {
  primary_format: "uuid",
})
```

Every entity automatically gets:
- `id` field (primary key, format depends on `primary_format`)

---

## Field Types

| Type | Import | DB Type | Key Options |
|------|--------|---------|-------------|
| `text` | `text` | `text` / `varchar` | `minLength`, `maxLength`, `pattern` |
| `number` | `number` | `integer` / `double` | `minimum`, `maximum`, `multipleOf` |
| `boolean` | `boolean` | `boolean` | `default_value` |
| `date` | `date` | `timestamp` | `default_value` |
| `enumm` | `enumm` | `text` | `enum` (array/object), `default_value` |
| `json` | `json` | `json` / `text` | `default_value` |
| `jsonschema` | `jsonschema` | `json` / `text` | `schema` (JSON Schema) |
| `media` | `media` | `text` | `entity`, `min_items`, `max_items`, `mime_types` |

**Note:** Enum field is `enumm()` (double 'm') to avoid JavaScript reserved keyword.

### Text Field

```typescript
import { text } from "bknd";

entity("users", {
  // Basic
  name: text(),

  // Required
  email: text().required(),

  // With validation
  username: text({
    minLength: 3,
    maxLength: 50,
    pattern: "^[a-z0-9_]+$",
  }).required(),

  // Unique constraint
  slug: text().unique(),

  // With default
  status: text({ default_value: "pending" }),
})
```

### Number Field

```typescript
import { number } from "bknd";

entity("products", {
  // Basic
  quantity: number(),

  // With validation
  price: number({
    minimum: 0,
    maximum: 99999.99,
  }).required(),

  // Integer with step
  rating: number({
    minimum: 1,
    maximum: 5,
    multipleOf: 1,
  }),
})
```

### Boolean Field

```typescript
import { boolean } from "bknd";

entity("users", {
  // Basic (defaults to false)
  active: boolean(),

  // With default true
  subscribed: boolean({ default_value: true }),
})
```

### Date Field

```typescript
import { date } from "bknd";

entity("events", {
  // Basic
  start_date: date().required(),

  // Optional with default
  created_at: date({ default_value: "now" }),
})
```

### Enum Field

```typescript
import { enumm } from "bknd";

entity("posts", {
  // Array syntax
  status: enumm({
    enum: ["draft", "published", "archived"],
    default_value: "draft",
  }).required(),

  // Object syntax (key-value mapping)
  priority: enumm({
    enum: {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
    },
    default_value: "MEDIUM",
  }),
})
```

### JSON Field

```typescript
import { json } from "bknd";

entity("users", {
  // Untyped JSON
  metadata: json(),

  // Typed JSON (TypeScript only, no runtime validation)
  preferences: json<{
    theme: "light" | "dark";
    notifications: boolean;
  }>(),

  // With default
  settings: json<string[]>({
    default_value: [],
  }),
})
```

### JSON Schema Field

For runtime-validated JSON:

```typescript
import { jsonschema } from "bknd";

entity("webhooks", {
  payload: jsonschema({
    type: "object",
    properties: {
      event: { type: "string" },
      timestamp: { type: "number" },
      data: { type: "object" },
    },
    required: ["event", "timestamp"],
  }),
})
```

### Media Field

```typescript
import { media } from "bknd";

entity("posts", {
  // Single file
  cover_image: media({ entity: "posts" }),

  // Multiple files with constraints
  gallery: media({
    entity: "posts",
    min_items: 1,
    max_items: 10,
    mime_types: ["image/jpeg", "image/png", "image/webp"],
  }),
})
```

---

## Field Modifiers

All field types support these chainable methods:

| Method | Description |
|--------|-------------|
| `.required()` | Field cannot be null |
| `.unique()` | Creates unique constraint |
| `.default(value)` | Sets default value |
| `.references(target)` | Creates foreign key (number fields only) |

```typescript
entity("users", {
  email: text().required().unique(),
  role: text().default("user"),
  org_id: number().references("organizations.id"),
})
```

---

## Relationships

Relationships are defined in the second argument to `em()`:

```typescript
const schema = em(
  {
    // Entity definitions
  },
  ({ relation, index }, entities) => {
    // Relationship and index definitions
  }
);
```

### Many-to-One

Child belongs to one parent:

```typescript
const schema = em(
  {
    users: entity("users", { email: text().required() }),
    posts: entity("posts", { title: text().required() }),
  },
  ({ relation }, { users, posts }) => {
    relation(posts).manyToOne(users);
  }
);
```

**Auto-generated:** `users_id` foreign key on `posts` table

**Custom field name:**

```typescript
relation(posts).manyToOne(users, {
  mappedBy: "author",  // Creates author_id instead of users_id
});
```

### One-to-One

Exclusive 1:1 relationship:

```typescript
const schema = em(
  {
    users: entity("users", { email: text().required() }),
    profiles: entity("profiles", { bio: text() }),
  },
  ({ relation }, { users, profiles }) => {
    relation(profiles).oneToOne(users);
  }
);
```

**Note:** One-to-one cannot use `$set` operator (maintains exclusivity).

### Many-to-Many

Junction table created automatically:

```typescript
const schema = em(
  {
    posts: entity("posts", { title: text().required() }),
    tags: entity("tags", { name: text().required() }),
  },
  ({ relation }, { posts, tags }) => {
    relation(posts).manyToMany(tags);
  }
);
```

**Auto-generated:** `posts_tags` junction table with `posts_id` and `tags_id`

**Custom junction table:**

```typescript
relation(users).manyToMany(courses, {
  connectionTable: "enrollments",
}, {
  // Extra fields on junction table
  enrolled_at: date(),
  completed: boolean(),
});
```

### Self-Referencing

Entity references itself:

```typescript
const schema = em(
  {
    categories: entity("categories", { name: text().required() }),
  },
  ({ relation }, { categories }) => {
    relation(categories).manyToOne(categories, {
      inversedBy: "children",
      mappedBy: "parent",
    });
  }
);
```

### Alternative: Direct Foreign Key

Instead of `relation()`, use `.references()`:

```typescript
const schema = em({
  users: entity("users", { email: text().required() }),
  posts: entity("posts", {
    title: text().required(),
    author_id: number().references("users.id"),
  }),
});
```

---

## Indices

### Simple Index

```typescript
const schema = em(
  {
    users: entity("users", { email: text().required() }),
  },
  ({ index }, { users }) => {
    index(users).on(["email"]);
  }
);
```

### Unique Index

```typescript
index(users).on(["email"], true);  // Second param = unique
```

### Composite Index

```typescript
index(posts).on(["author_id", "status"]);
```

### Chained Indices

```typescript
index(users)
  .on(["email"], true)      // Unique
  .on(["username"], true)   // Unique
  .on(["created_at"]);      // Non-unique
```

---

## JSON Config Format

For Database Mode or REST API configuration:

```typescript
{
  data: {
    entities: {
      users: {
        fields: {
          id: { type: "primary" },
          email: {
            type: "text",
            config: {
              required: true,
              label: "Email Address",
            },
          },
          role: {
            type: "enum",
            config: {
              enum: ["admin", "user", "guest"],
              default_value: "user",
            },
          },
        },
      },
    },
    relations: {
      posts_author: {
        type: "many-to-one",
        source: { entity: "posts" },
        target: { entity: "users" },
      },
    },
    indices: {
      users_email_unique: {
        entity: "users",
        fields: ["email"],
        unique: true,
      },
    },
  },
}
```

---

## Type Generation

### Extract Types from Schema

```typescript
const schema = em({
  users: entity("users", {
    email: text().required(),
    name: text(),
  }),
});

type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}

// Now you get typed queries:
// api.data.readMany<"users">("users", { ... })
```

### CLI Type Generation

```bash
npx bknd types
```

Generates type definitions from current database schema.

---

## Common Patterns

### Timestamps

Use the timestamps plugin or add manually:

```typescript
entity("posts", {
  title: text().required(),
  created_at: date({ default_value: "now" }),
  updated_at: date(),
})
```

### Soft Delete

```typescript
entity("posts", {
  title: text().required(),
  deleted_at: date(),
})

// Query non-deleted:
api.data.readMany("posts", {
  where: { deleted_at: { $isnull: true } },
});
```

### Polymorphic References

Manual approach with type discriminator:

```typescript
entity("comments", {
  body: text().required(),
  commentable_type: enumm({ enum: ["post", "video"] }).required(),
  commentable_id: number().required(),
})
```

### UUID Primary Keys

```typescript
entity("sessions", {
  token: text().required(),
}, {
  primary_format: "uuid",
})
```

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Entity names | Plural, lowercase | `users`, `blog_posts` |
| Field names | snake_case | `first_name`, `created_at` |
| Foreign keys | `{target}_id` | `user_id`, `category_id` |
| Junction tables | `{source}_{target}` | `posts_tags` |
| Indices | `{entity}_{fields}_{type}` | `users_email_unique` |

---

## API Reference

### Field Constructor Options

**TextField:**
```typescript
{
  required?: boolean;
  default_value?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;  // Regex
  label?: string;
  description?: string;
  hidden?: boolean;
  virtual?: boolean;
}
```

**NumberField:**
```typescript
{
  required?: boolean;
  default_value?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}
```

**EnumField:**
```typescript
{
  required?: boolean;
  enum: string[] | Record<string, string>;
  default_value?: string;
}
```

**JsonSchemaField:**
```typescript
{
  required?: boolean;
  schema: JSONSchema;  // JSON Schema object
  default_value?: any;
}
```

### Relation Options

**ManyToOne / OneToOne:**
```typescript
{
  mappedBy?: string;    // Field name on source
  inversedBy?: string;  // Field name on target (for inverse navigation)
}
```

**ManyToMany:**
```typescript
{
  connectionTable?: string;  // Custom junction table name
}
```
