# Drizzle → Prisma → bknd: Complete Schema Comparison

Here's the complete comparison with all three ORMs for every scenario.

## 1. Basic Table with Primary Key

### Drizzle
```typescript
import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age'),
});
```

### Prisma
```prisma
model User {
  id   Int    @id @default(autoincrement())
  name String
  age  Int?
}
```

### bknd
```typescript
const schema = em({
  users: entity("users", {
    // Primary key "id" is automatically added
    name: text().required(),
    age: number(),
  }),
});
```

---

## 2. Table with Foreign Key

### Drizzle
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
});
```

### Prisma
```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}

model Post {
  id     Int    @id @default(autoincrement())
  title  String
  userId Int
  user   User   @relation(fields: [userId], references: [id])
}
```

### bknd
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

---

## 3. Unique Constraints

### Drizzle
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull(),
}, (table) => ({
  uniqueEmail: unique('unique_email').on(table.email),
  uniqueUsername: unique('unique_username').on(table.username),
}));
```

### Prisma
```prisma
model User {
  id       Int    @id @default(autoincrement())
  username String @unique
  email    String @unique
}
```

### bknd
```typescript
const schema = em(
  {
    users: entity("users", {
      username: text().required(),
      email: text().required(),
    }),
  },
  ({ index }, { users }) => {
    // Chained unique indices
    index(users).on(["username"], true).on(["email"], true);
  },
);
```

---

## 4. Composite Indexes

### Drizzle
```typescript
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  authorCreatedIdx: index('author_created_idx').on(table.author, table.createdAt),
}));
```

### Prisma
```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  author    String
  createdAt DateTime @default(now())
  
  @@index([author, createdAt])
}
```

### bknd
```typescript
const schema = em(
  {
    posts: entity("posts", {
      title: text().required(),
      author: text().required(),
      created_at: text().required(),
    }),
  },
  ({ index }, { posts }) => {
    // Composite index
    index(posts).on(["author", "created_at"]);
  },
);
```

---

## 5. Default Values

### Drizzle
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  isActive: boolean('is_active').default(true),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  visits: integer('visits').default(0),
});
```

### Prisma
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  isActive  Boolean  @default(true)
  role      String   @default("user")
  createdAt DateTime @default(now())
  visits    Int      @default(0)
}
```

### bknd
```typescript
// In your schema:
const schema = em({
  users: entity("users", {
    name: text().required(),
    is_active: boolean({ default_value: true }),
    role: text({ default_value: "user" }),
    visits: number({ default_value: 0 }),
  }),
});

// In bknd.config.ts (recommended for timestamps):
import { timestamps } from "bknd/plugins";

export default {
  options: {
    plugins: [
      timestamps({
        entities: ["users"],
        setUpdatedOnCreate: true,
      })
    ],
  }
} satisfies BkndConfig;
```

---

## 6. Nullable vs Not Null

### Drizzle
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),        // Required
  bio: text('bio'),                    // Optional (no .notNull())
  email: text('email'),                 // Optional
  age: integer('age').notNull(),       // Required
});
```

### Prisma
```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String                      // Required (no ?)
  bio   String?                     // Optional (has ?)
  email String?                     // Optional (has ?)
  age   Int                         // Required (no ?)
}
```

### bknd
```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),           // Required
    bio: text(),                       // Optional (no .required())
    email: text(),                     // Optional (no .required())
    age: number().required(),           // Required
  }),
});
```

---

## 7. One-to-Many Relations

### Drizzle
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
}));
```

### Prisma
```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}

model Post {
  id     Int    @id @default(autoincrement())
  title  String
  userId Int
  user   User   @relation(fields: [userId], references: [id])
}
```

### bknd
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
    // Many-to-one: posts belong to one user
    relation(posts).manyToOne(users);
    // One-to-many is automatically inferred (users has many posts)
  },
);
```

---

## 8. Many-to-Many Relations

### Drizzle
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
});

export const usersToPosts = pgTable('users_to_posts', {
  userId: integer('user_id').notNull().references(() => users.id),
  postId: integer('post_id').notNull().references(() => posts.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ many }) => ({
  users: many(users),
}));
```

### Prisma
```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}

model Post {
  id     Int    @id @default(autoincrement())
  title  String
  users  User[]
}
```

### bknd
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
    // Many-to-many relation creates junction table automatically
    relation(users).manyToMany(posts);
  },
);
```

### bknd (With custom junction fields)
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
    // Many-to-many with additional fields on junction table
    relation(users).manyToMany(posts, {
      connectionTable: "users_posts_custom",
    }, {
      // Additional fields for junction table
      subscribed_at: date(),
    });
  },
);
```

### Prisma (With custom junction fields)
```prisma
model User {
  id    Int           @id @default(autoincrement())
  name  String
  posts UsersToPosts[]
}

model Post {
  id     Int           @id @default(autoincrement())
  title  String
  users  UsersToPosts[]
}

model UsersToPosts {
  id            Int      @id @default(autoincrement())
  userId        Int
  postId        Int
  subscribedAt  DateTime @default(now())
  
  user  User @relation(fields: [userId], references: [id])
  post  Post @relation(fields: [postId], references: [id])
  
  @@unique([userId, postId])
}
```

---

## 9. Self-Referencing Relations (Tree Structures)

### Drizzle
```typescript
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  parentId: integer('parent_id').references((): any => categories.id),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
}));
```

### Prisma
```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String
  parentId Int?
  parent   Category? @relation("CategoryToCategory", fields: [parentId], references: [id])
  children Category[] @relation("CategoryToCategory")
}
```

### bknd
```typescript
const schema = em(
  {
    categories: entity("categories", {
      name: text().required(),
    }),
  },
  ({ relation }, { categories }) => {
    // Self-referencing many-to-one
    relation(categories).manyToOne(categories, {
      inversedBy: "children",
      mappedBy: "parent",
    });
  },
);
```

---

## 10. Enum Types

### Drizzle
```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'user', 'guest']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull(),
});
```

### Prisma
```prisma
enum Role {
  ADMIN
  USER
  GUEST
}

model User {
  id   Int   @id @default(autoincrement())
  name String
  role Role
}
```

### bknd
```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),
    role: enumm({
      enum: ["admin", "user", "guest"],
    }).required(),
  }),
});
```

---

## 11. Arrays

### Drizzle
```typescript
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  tags: text('tags').array(),
});
```

### Prisma
```prisma
model Post {
  id   Int     @id @default(autoincrement())
  tags String[]
}
```

### bknd
```typescript
const schema = em({
  posts: entity("posts", {
    // Arrays can be stored as JSON
    tags: json<string[]>({
      default_value: [],
    }),
  }),
});
```

---

## 12. JSON Columns

### Drizzle
```typescript
import { jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  metadata: jsonb('metadata').$type<{
    preferences: { theme: string; notifications: boolean };
    lastLogin: string;
  }>(),
});
```

### Prisma
```prisma
model User {
  id       Int    @id @default(autoincrement())
  name     String
  metadata Json
}
```

### bknd
```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),
    metadata: json<{
      preferences: { theme: string; notifications: boolean };
      lastLogin: string;
    }>(),
  }),
});
```

---

## 13. Check Constraints

### Drizzle
```typescript
import { pgTable, serial, integer, check } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
}, (table) => ({
  checkPrice: check('check_price', sql`${table.price} >= 0`),
  checkQuantity: check('check_quantity', sql`${table.quantity} >= 0`),
}));
```

### Prisma
```prisma
model Product {
  id       Int  @id @default(autoincrement())
  price    Int
  quantity Int
  
  @@check(raw("price >= 0"))
  @@check(raw("quantity >= 0"))
}
```

### bknd
```typescript
const schema = em({
  products: entity("products", {
    price: number({
      required: true,
      minimum: 0,
    }),
    quantity: number({
      required: true,
      minimum: 0,
    }),
  }),
});
// bknd handles check constraints via field-level validation
```

---

## 14. Complete Complex Example

### Drizzle
```typescript
import { pgTable, serial, text, integer, boolean, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  bio: text('bio'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueEmail: unique('unique_email').on(table.email),
  usernameIdx: index('username_idx').on(table.username),
}));

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').notNull().references(() => users.id),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  authorIdx: index('author_idx').on(table.authorId),
  publishedIdx: index('published_idx').on(table.published),
}));

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const postsToTags = pgTable('posts_to_tags', {
  postId: integer('post_id').notNull().references(() => posts.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  tags: many(tags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(posts),
}));
```

### Prisma
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String
  email     String   @unique
  bio       String?
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  posts     Post[]
  postsTags PostsToTags[]

  @@index([username])
  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  authorId  Int      @map("author_id")
  published Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  author    User     @relation(fields: [authorId], references: [id])
  tags      Tag[]
  postsTags PostsToTags[]

  @@index([authorId])
  @@index([published])
  @@map("posts")
}

model Tag {
  id        Int            @id @default(autoincrement())
  name      String
  posts     Post[]
  postsTags PostsToTags[]

  @@map("tags")
}

model PostsToTags {
  postId     Int     @map("post_id")
  tagId      Int     @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([postId, tagId])
  @@map("posts_to_tags")
}
```

### bknd
```typescript
// In your schema:
const schema = em(
  {
    users: entity("users", {
      username: text().required(),
      email: text().required(),
      bio: text(),
      is_active: boolean({ default_value: true }),
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
  ({ relation, index }, { users, posts, tags }) => {
    // Relations
    relation(posts).manyToOne(users);
    relation(posts).manyToMany(tags);
    
    // Indices
    index(users).on(["email"], true).on(["username"]);
    index(posts).on(["author_id"]).on(["published"]);
  },
);

// In bknd.config.ts (for timestamps):
import { timestamps } from "bknd/plugins";

export default {
  options: {
    plugins: [
      timestamps({
        entities: ["users", "posts"],
        setUpdatedOnCreate: true,
      })
    ],
  }
} satisfies BkndConfig;
```

---

## Complete Mapping Reference Table

| Concept | Drizzle | Prisma | bknd |
|---------|---------|--------|------|
| **Table Definition** | `pgTable('name', {...})` | `model Name {...}` | `entity("name", {...})` |
| **Primary Key** | `serial('id').primaryKey()` | `id Int @id` | Auto-generated `id` |
| **Required Field** | `.notNull()` | `String` (no `?`) | `.required()` |
| **Optional Field** | No `.notNull()` | `String?` | No `.required()` |
| **Default Value** | `.default(value)` | `@default(value)` | `{ default_value: value }` |
| **Foreign Key** | `.references(() => table.id)` | `@relation(fields: [...], references: [...])` | `relation(table).manyToOne(otherTable)` |
| **Unique Constraint** | `unique().on(table.field)` | `@unique` | `index(table).on(["field"], true)` |
| **Index** | `index().on(table.field)` | `@@index([...])` | `index(table).on(["field"])` |
| **Composite Index** | `index().on(table.field1, table.field2)` | `@@index([field1, field2])` | `index(table).on(["field1", "field2"])` |
| **Enum** | `pgEnum('name', [...])` + `enum Name {...}` | `enum Name {...}` + `role Enum` | `enumm({ enum: [...] })` |
| **JSON Column** | `jsonb('field').$type<T>()` | `metadata Json` | `json<T>()` |
| **Array** | `text('field').array()` | `tags String[]` | `json<T[]>()` |
| **Check Constraint** | `check('name', sql...)` | `@@check(raw(...))` | Field validation (`minimum`, etc.) |
| **One-to-Many** | Explicit relations + FK | Embedded arrays | `relation(table).manyToOne(other)` |
| **Many-to-Many** | Junction table + relations | Implicit via arrays | `relation(table).manyToMany(other)` |
| **Self-Reference** | `references((): any => table.id)` | Explicit relations | `relation(table).manyToOne(table)` |

---

## Syntax Comparison Cheat Sheet

### Tables/Models

| Drizzle | Prisma | bknd |
|---------|--------|------|
| `pgTable('users', {...})` | `model User {...}` | `entity("users", {...})` |
| `serial('id').primaryKey()` | `id Int @id` | Auto `id` |
| `text('name').notNull()` | `name String` | `name: text().required()` |
| `text('bio')` | `bio String?` | `bio: text()` |

### Relations

| Drizzle | Prisma | bknd |
|---------|--------|------|
| Manual FK + `relations()` | Arrays + `@relation` | `relation(table).manyToOne(other)` |
| Junction table explicit | Implicit via arrays | `relation(table).manyToMany(other)` |

### Constraints & Indices

| Drizzle | Prisma | bknd |
|---------|--------|------|
| `unique().on(table.field)` | `@unique` | `index(table).on(["field"], true)` |
| `index().on(table.field)` | `@@index([...])` | `index(table).on(["field"])` |
| `check('name', sql...)` | `@@check(raw(...))` | Field validation |

### Defaults & Enums

| Drizzle | Prisma | bknd |
|---------|--------|------|
| `.default(value)` | `@default(value)` | `{ default_value: value }` |
| `pgEnum('name', [...])` | `enum Name {...}` | `enumm({ enum: [...] })` |

---

## Quick Decision Guide

| Use Case | Choose |
|----------|--------|
| **Most readable syntax** | Prisma |
| **Least verbose** | bknd |
| **Most explicit control** | Drizzle |
| **Runtime schema modification** | bknd |
| **Best tooling ecosystem** | Prisma |
| **Multi-database support** | Drizzle |
| **Auto-generated types** | All (Prisma generates, others infer) |
| **Field-level validation** | bknd |
| **Cleanest separation of concerns** | bknd |
| **No build/CLI steps** | bknd or Drizzle |
