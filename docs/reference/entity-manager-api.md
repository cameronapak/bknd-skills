# EntityManager API Reference

The EntityManager is the central interface for all data operations in Bknd. It manages entities, relations, indices, and provides access to Repository and Mutator instances for querying and mutating data.

## Table of Contents

- [Getting Started](#getting-started)
- [EntityManager Methods](#entitymanager-methods)
- [Repository API](#repository-api)
- [Mutator API](#mutator-api)
- [Query System](#query-system)
- [Event Hooks](#event-hooks)

## Getting Started

The EntityManager is typically accessed through the `App` instance:

```typescript
import { App } from "bknd";
import { Entity, PrimaryField, TextField } from "bknd/data/fields";

// Create entities
const userEntity = new Entity("users", [
  new PrimaryField(),
  new TextField("email", { required: true }),
  new TextField("name"),
]);

const postEntity = new Entity("posts", [
  new PrimaryField(),
  new TextField("title", { required: true }),
  new TextField("content"),
]);

// Initialize app
const app = new App({
  entities: {
    users: userEntity,
    posts: postEntity,
  },
  // ... other config
});

// Access EntityManager
await app.build();
const em = app.ctx.em;
```

## EntityManager Methods

### `entity(name)`

Get an entity by name.

```typescript
const entity = em.entity("users");
console.log(entity.name); // "users"
console.log(entity.fields); // Array of field definitions
```

**Parameters:**
- `name: Entity | string` - Entity instance or entity name

**Returns:** `Entity`

**Throws:** `EntityNotDefinedException` if entity doesn't exist

**Silent mode:**
```typescript
// Returns undefined instead of throwing
const entity = em.entity("unknown", true);
```

### `repo(name, options?)`

Get a Repository instance for querying data.

```typescript
const repo = em.repo("users");
const result = await repo.findMany({ limit: 10 });
console.log(result.data); // Array of user records
```

**Parameters:**
- `name: Entity | string` - Entity to query
- `options?: RepositoryOptions` - Options:
  - `silent?: boolean` - Suppress warnings
  - `includeCounts?: boolean` - Include count metadata
  - `emgr?: EventManager` - Custom event manager

**Returns:** `Repository<DB, EntityName>`

### `repository(name, options?)`

Alias for `repo()`. Same functionality.

### `mutator(name)`

Get a Mutator instance for creating, updating, and deleting data.

```typescript
const mutator = em.mutator("users");

// Create a user
const result = await mutator.insertOne({
  email: "user@example.com",
  name: "John Doe",
});

console.log(result.data.id); // New user ID
```

**Parameters:**
- `name: Entity | string` - Entity to mutate

**Returns:** `Mutator<DB, EntityName>`

### `hasEntity(name)`

Check if an entity exists.

```typescript
if (em.hasEntity("users")) {
  console.log("Users entity is registered");
}
```

**Parameters:**
- `name: Entity | string` - Entity to check

**Returns:** `boolean`

### `hasIndex(name)`

Check if an index exists.

```typescript
if (em.hasIndex("idx_user_email")) {
  console.log("Email index exists");
}
```

**Parameters:**
- `name: string | EntityIndex` - Index to check

**Returns:** `boolean`

### `relationsOf(entityName)`

Get all relations for an entity.

```typescript
const relations = em.relationsOf("posts");
relations.forEach(relation => {
  console.log(`${relation.type}: ${relation.target.entity.name}`);
});
```

**Parameters:**
- `entityName: string` - Entity name

**Returns:** `EntityRelation[]`

### `relationOf(entityName, reference)`

Get a specific relation by reference name.

```typescript
const relation = em.relationOf("posts", "author");
console.log(relation.type); // e.g., "many-to-one"
```

**Parameters:**
- `entityName: string` - Entity name
- `reference: string` - Relation reference name

**Returns:** `EntityRelation | undefined`

### `hasRelations(entityName)`

Check if entity has any relations.

```typescript
if (em.hasRelations("posts")) {
  console.log("Posts entity has relations");
}
```

**Parameters:**
- `entityName: string` - Entity name

**Returns:** `boolean`

### `relatedEntitiesOf(entityName)`

Get all entities that are related to this entity.

```typescript
const related = em.relatedEntitiesOf("posts");
// Returns: [users_entity, categories_entity, ...]
```

**Parameters:**
- `entityName: string` - Entity name

**Returns:** `Entity[]`

### `relationReferencesOf(entityName)`

Get all relation reference names for an entity.

```typescript
const refs = em.relationReferencesOf("posts");
// Returns: ["author", "category", "tags", ...]
```

**Parameters:**
- `entityName: string` - Entity name

**Returns:** `string[]`

### `addEntity(entity)`

Register an entity with the EntityManager.

```typescript
em.addEntity(new Entity("comments", [
  new PrimaryField(),
  new TextField("content"),
]));
```

**Parameters:**
- `entity: Entity` - Entity to add

**Throws:** `Error` if entity already exists

### `addRelation(relation)`

Register a relation between entities.

```typescript
import { ManyToOneRelation } from "bknd/data/relations";

const relation = new ManyToOneRelation(posts, users, {
  reference: "author",
});

em.addRelation(relation);
```

**Parameters:**
- `relation: EntityRelation` - Relation to add

**Throws:** `Error` if relation already exists

### `addIndex(index, force?)`

Register an index for an entity.

```typescript
import { EntityIndex, TextField, NumberField } from "bknd/data/fields";

const index = new EntityIndex({
  entity: users,
  name: "idx_user_email",
  unique: true,
  fields: [new TextField("email")],
});

em.addIndex(index);
```

**Parameters:**
- `index: EntityIndex` - Index to add
- `force?: boolean` - Throw error if index exists (default: false, silently skips)

### `getIndicesOf(entity)`

Get all indices for an entity.

```typescript
const indices = em.getIndicesOf("users");
indices.forEach(index => {
  console.log(`${index.name}: ${index.unique ? 'unique' : 'non-unique'}`);
});
```

**Parameters:**
- `entity: Entity | string` - Entity to get indices for

**Returns:** `EntityIndex[]`

### `getIndexedFields(entity)`

Get indexed fields for an entity (including primary field and relation fields).

```typescript
const fields = em.getIndexedFields("users");
// Returns: [primaryField, ...relationFields, ...indexedFields]
```

**Parameters:**
- `entity: Entity | string` - Entity to get indexed fields for

**Returns:** `Field[]`

### `hydrate(entityName, data)`

Transform raw database rows into hydrated entity data with proper field types.

```typescript
const rawRows = [
  { id: 1, email: "user@example.com", name: "John" },
];

const hydrated = em.hydrate("users", rawRows);
// Returns properly typed and transformed entity data
```

**Parameters:**
- `entityName: string` - Entity name
- `data: EntityData[]` - Raw data from database

**Returns:** `EntityData[]`

### `ping()`

Test database connection.

```typescript
const isConnected = await em.ping();
if (isConnected) {
  console.log("Database connection is alive");
}
```

**Returns:** `Promise<boolean>`

### `schema()`

Get the SchemaManager for schema operations.

```typescript
const schemaManager = em.schema();
await schemaManager.sync(); // Sync schema to database
```

**Returns:** `SchemaManager`

### `clear()`

Clear all entities, relations, and indices from the EntityManager.

```typescript
em.clear();
// EntityManager is now empty
```

**Returns:** `this` (for chaining)

### `fork()`

Create a new EntityManager instance without the EventManager. Useful for operations inside event handlers to avoid infinite loops.

```typescript
const forked = em.fork();
// forked has same entities/relations/indices but no event manager
```

**Returns:** `EntityManager`

### `toJSON()`

Get a JSON representation of the EntityManager (entities, relations, indices).

```typescript
const json = em.toJSON();
console.log(json.entities);
console.log(json.relations);
console.log(json.indices);
```

**Returns:** `{ entities: object, relations: object, indices: object }`

## Repository API

The Repository provides a fluent API for querying data with type safety.

### `findMany(options?)`

Find multiple records with optional filtering, sorting, and pagination.

```typescript
const result = await em.repo("posts").findMany({
  where: { published: true },
  sort: { by: "created_at", dir: "desc" },
  limit: 10,
  offset: 0,
  select: ["id", "title", "created_at"],
});

console.log(result.data); // Array of posts
```

**Parameters:**
- `options?: Partial<RepoQuery>` - Query options:
  - `where?: WhereQuery` - Filter conditions
  - `sort?: { by: string; dir?: "asc" | "desc" }` - Sort order
  - `limit?: number` - Max results (default: 10)
  - `offset?: number` - Skip results
  - `select?: string[]` - Fields to return
  - `with?: Record<string, RepoQuery>` - Include relations
  - `join?: string[]` - Join relations

**Returns:** `Promise<RepositoryResult<EntityData[]>>`

### `findOne(where, options?)`

Find a single record.

```typescript
const result = await em.repo("users").findOne(
  { email: "user@example.com" },
  { select: ["id", "name"] }
);

console.log(result.data?.name); // "John Doe"
```

**Parameters:**
- `where: WhereQuery` - Filter condition (required)
- `options?: Partial<Omit<RepoQuery, "where" | "limit" | "offset">` - Other options

**Returns:** `Promise<RepositoryResult<EntityData | undefined>>`

### `findId(id, options?)`

Find a record by primary key ID.

```typescript
const result = await em.repo("users").findId(123);
console.log(result.data); // User with id=123 or undefined
```

**Parameters:**
- `id: PrimaryFieldType` - Primary key value
- `options?: Partial<Omit<RepoQuery, "where" | "limit" | "offset">` - Additional options

**Returns:** `Promise<RepositoryResult<EntityData | undefined>>`

### `findManyByReference(id, reference, options?)`

Find related records through a relation.

```typescript
// Find all posts by a specific user
const result = await em.repo("posts").findManyByReference(
  123, // user_id
  "author" // relation reference
);

console.log(result.data); // Array of posts by user 123
```

**Parameters:**
- `id: PrimaryFieldType` - Primary key of source entity
- `reference: string` - Relation reference name
- `options?: Partial<Omit<RepoQuery, "limit" | "offset">` - Query options

**Returns:** `Promise<RepositoryResult<EntityData[]>>`

### `count(where?)`

Count records matching conditions.

```typescript
const result = await em.repo("posts").count({ published: true });
console.log(result.data.count); // Number of published posts
```

**Parameters:**
- `where?: WhereQuery` - Filter conditions

**Returns:** `Promise<RepositoryResult<{ count: number }>>`

### `exists(where)`

Check if any record matches conditions.

```typescript
const result = await em.repo("users").exists({ email: "user@example.com" });
console.log(result.data.exists); // true or false
```

**Parameters:**
- `where: WhereQuery` - Filter conditions (required)

**Returns:** `Promise<RepositoryResult<{ exists: boolean }>>`

## Mutator API

The Mutator provides methods for creating, updating, and deleting records.

### `insertOne(data)`

Insert a single record.

```typescript
const result = await em.mutator("users").insertOne({
  email: "user@example.com",
  name: "John Doe",
});

console.log(result.data.id); // New user ID
console.log(result.data.email); // "user@example.com"
```

**Parameters:**
- `data: Input` - Data to insert (excludes `id` field)

**Returns:** `Promise<MutatorResult<EntityData>>`

**Events:**
- `MutatorInsertBefore` - Before insertion (allows data modification)
- `MutatorInsertAfter` - After insertion (includes changed data)

### `insertMany(data)`

Insert multiple records.

```typescript
const result = await em.mutator("users").insertMany([
  { email: "user1@example.com", name: "User 1" },
  { email: "user2@example.com", name: "User 2" },
  { email: "user3@example.com", name: "User 3" },
]);

console.log(result.data); // Array of inserted users
```

**Parameters:**
- `data: Input[]` - Array of data to insert

**Returns:** `Promise<MutatorResult<EntityData[]>>`

### `updateOne(id, data)`

Update a single record by ID.

```typescript
const result = await em.mutator("users").updateOne(123, {
  name: "Jane Doe",
});

console.log(result.data.name); // "Jane Doe"
```

**Parameters:**
- `id: PrimaryFieldType` - Primary key of record to update
- `data: Partial<Input>` - Fields to update

**Returns:** `Promise<MutatorResult<EntityData>>`

**Events:**
- `MutatorUpdateBefore` - Before update (allows data modification)
- `MutatorUpdateAfter` - After update (includes changed data)

### `updateWhere(data, where)`

Update multiple records matching conditions.

```typescript
const result = await em.mutator("posts").updateWhere(
  { published: false }, // data to update
  { author_id: 123 }   // where condition
);

console.log(result.data); // Array of updated posts
```

**Parameters:**
- `data: Partial<Input>` - Fields to update
- `where: WhereQuery` - Filter conditions (required)

**Returns:** `Promise<MutatorResult<EntityData[]>>`

### `deleteOne(id)`

Delete a single record by ID.

```typescript
const result = await em.mutator("users").deleteOne(123);
console.log(result.data); // Deleted user data
```

**Parameters:**
- `id: PrimaryFieldType` - Primary key of record to delete

**Returns:** `Promise<MutatorResult<EntityData>>`

**Events:**
- `MutatorDeleteBefore` - Before deletion
- `MutatorDeleteAfter` - After deletion (includes deleted data)

### `deleteWhere(where)`

Delete multiple records matching conditions.

```typescript
const result = await em.mutator("posts").deleteWhere({
  published: false,
});

console.log(result.data); // Array of deleted posts
```

**Parameters:**
- `where: WhereQuery` - Filter conditions (required)

**Returns:** `Promise<MutatorResult<EntityData[]>>`

## Query System

Bknd provides a powerful query system for filtering, sorting, and selecting data.

### Where Clauses

Use operators to build complex filter conditions:

```typescript
// Simple equality
{ email: "user@example.com" }

// Not equal
{ status: { $ne: "deleted" } }

// Greater than / less than
{ age: { $gte: 18 } }

// Between range
{ price: { $between: [10, 100] } }

// In array
{ category: { $in: ["tech", "news"] } }

// Like (wildcard *)
{ title: { $like: "Hello*" } }

// Is null
{ deleted_at: { $isnull: true } }

// AND (implicit)
{ status: "active", published: true }

// OR
{
  $or: [
    { status: "active" },
    { featured: true }
  ]
}

// Complex nested
{
  $or: [
    { status: { $eq: "active" } },
    { featured: { $eq: true } }
  ]
}
```

### Sort Options

```typescript
// Ascending (default)
{ sort: { by: "created_at" } }

// Descending
{ sort: { by: "created_at", dir: "desc" } }
```

### Pagination

```typescript
// First 10 records
{ limit: 10, offset: 0 }

// Next page
{ limit: 10, offset: 10 }
```

### Select Fields

```typescript
// Only specific fields
{ select: ["id", "title", "created_at"] }

// All fields (default)
{ select: [] } // or omit select option
```

### Include Relations

```typescript
// Include single relation
{
  with: {
    author: {} // Include full author object
  }
}

// Include relation with nested query
{
  with: {
    author: {
      select: ["id", "name"], // Only specific fields
      where: { active: true }  // Filter related records
    }
  }
}

// Nested relations
{
  with: {
    author: {
      with: {
        posts: {
          limit: 5
        }
      }
    }
  }
}

// Multiple relations
{
  with: {
    author: {},
    category: {},
    tags: {
      limit: 10
    }
  }
}
```

### Join Relations

```typescript
// Join for filtering on related fields
{
  join: ["author"],
  where: { "author.name": "John" }
}

// Multiple joins
{
  join: ["author", "category"],
  where: {
    "author.name": "John",
    "category.name": "Tech"
  }
}
```

### Relation Mutations with $set and $create

When inserting or updating, you can use special operators for relations:

```typescript
// Set existing related record
await em.mutator("posts").insertOne({
  title: "New Post",
  author: { $set: { id: 123 } } // Set author_id to 123
});

// Create and relate new record
await em.mutator("posts").insertOne({
  title: "New Post",
  author: { $create: { email: "new@example.com", name: "New User" } }
});
```

**Note:** `$set` validates that the referenced record exists. `$create` creates the related record atomically in the same transaction.

## Event Hooks

Bknd provides hooks that fire during data operations. Use these for logging, validation, or side effects.

### Mutator Events

```typescript
import { Mutator } from "bknd/data/entities";

// Register event listener
em.emgr.on(Mutator.Events.MutatorInsertBefore, async (event) => {
  console.log("Before insert:", event.entity.name, event.data);

  // Modify data before insertion
  event.data.created_at = new Date().toISOString();
});

em.emgr.on(Mutator.Events.MutatorInsertAfter, async (event) => {
  console.log("After insert:", event.data);
});

em.emgr.on(Mutator.Events.MutatorUpdateBefore, async (event) => {
  console.log("Before update:", event.entityId, event.data);
});

em.emgr.on(Mutator.Events.MutatorUpdateAfter, async (event) => {
  console.log("After update:", event.data);
});

em.emgr.on(Mutator.Events.MutatorDeleteBefore, async (event) => {
  console.log("Before delete:", event.entityId);
});

em.emgr.on(Mutator.Events.MutatorDeleteAfter, async (event) => {
  console.log("After delete:", event.data);
});
```

### Repository Events

```typescript
import { Repository } from "bknd/data/entities";

em.emgr.on(Repository.Events.RepositoryFindManyBefore, async (event) => {
  console.log("Before findMany:", event.entity.name, event.options);
});

em.emgr.on(Repository.Events.RepositoryFindManyAfter, async (event) => {
  console.log("After findMany:", event.data.length, "records");
});

em.emgr.on(Repository.Events.RepositoryFindOneBefore, async (event) => {
  console.log("Before findOne:", event.entity.name, event.options);
});

em.emgr.on(Repository.Events.RepositoryFindOneAfter, async (event) => {
  console.log("After findOne:", event.data);
});
```

### Event Data Modification

You can modify data in "before" events by returning the modified data:

```typescript
em.emgr.on(Mutator.Events.MutatorInsertBefore, async (event) => {
  // Add timestamp
  const modified = {
    ...event.data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Return modified data (it will be used for insertion)
  return modified;
});
```

## Best Practices

1. **Use transactions** for complex operations that need atomicity
2. **Validate input** before passing to mutator methods
3. **Use indexes** for frequently queried fields (check console warnings)
4. **Leverage relations** with `with` instead of manual queries
5. **Use pagination** for large datasets (`limit` + `offset`)
6. **Subscribe to events** for cross-cutting concerns (logging, caching)
7. **Use `fork()`** inside event handlers to avoid infinite loops
8. **Type safety** - Use generated types from `npx bknd types`

## Unknown Areas

The following areas require additional research:

- **Transaction management**: How to execute multiple operations atomically?
- **Bulk operations optimization**: Performance characteristics of `insertMany`/`updateWhere`/`deleteWhere`
- **Relation mutation limitations**: Which relation types support `$create` and `$set`?
- **Event error handling**: What happens when event listeners throw errors?
- **Custom field types**: How to create custom field types with proper validation?
- **Advanced query patterns**: Subqueries, aggregations, complex joins

## Source Code

- `app/src/data/entities/EntityManager.ts` - Core EntityManager implementation
- `app/src/data/entities/query/Repository.ts` - Repository implementation
- `app/src/data/entities/mutation/Mutator.ts` - Mutator implementation
- `app/src/data/entities/query/WhereBuilder.ts` - Where clause builder
- `app/src/data/entities/query/WithBuilder.ts` - Relation loading
