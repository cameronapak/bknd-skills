# Bknd Type Inference & TypeScript

Full type safety for schemas, entities, and database queries.

## Type Inference Utilities

### InferEntityFields

Extract the TypeScript type of entity fields.

```typescript
import { InferEntityFields } from "bknd/data";

const usersEntity = entity("users", {
  name: text().required(),
  email: text().required(),
  bio: text(),
  age: number(),
});

type UserFields = InferEntityFields<typeof usersEntity>;
// Result:
// {
//   id: Generated<number>;
//   name: string;
//   email: string;
//   bio: string | null;
//   age: number | null;
// }
```

**Use when:**
- You need the fields type separately
- Building type-safe utilities
- Exporting types for API contracts

---

### Full Schema Type (DB)

The schema object exports a `DB` type with the complete database structure.

```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),
    email: text().required(),
    age: number(),
  }),
  posts: entity("posts", {
    title: text().required(),
    content: text(),
  }),
}, ({ relation }, { users, posts }) => {
  relation(posts).manyToOne(users);
});

type DB = typeof schema.DB;
// Result:
// {
//   users: {
//     id: Generated<number>;
//     name: string;
//     email: string;
//     age: number | null;
//   };
//   posts: {
//     id: Generated<number>;
//     title: string;
//     content: string | null;
//     user_id: number;  // Foreign key auto-added
//   };
// }
```

**Use when:**
- Type-safe database access
- Building database adapters
- Creating type-safe migrations

---

## Type-Safe Queries

### Repository Access

```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),
    email: text().required(),
  }),
});

// Type-safe repository
const userRepo = schema.proto.repository("users");

// Fully typed queries
const user = await userRepo.findOne({
  where: { email: "user@example.com" }  // ✅ Typed: email must be string
});

// Autocomplete and type checking
const users = await userRepo.findMany({
  where: { 
    name: "John"  // ✅ Valid field
    // invalid_field: true  // ❌ TS Error
  },
  order: {
    name: "asc"  // ✅ Valid field
  }
});
```

**Available methods:**
- `findOne(options)` - Single record
- `findMany(options)` - Multiple records
- `count(options)` - Count records
- `exists(options)` - Check existence

---

### Mutations with Type Safety

```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),
    email: text().required(),
  }),
});

const mutator = schema.proto.mutator("users");

// Create with full type checking
const newUser = await mutator.create({
  name: "John",    // ✅ Required field
  email: "j@example.com",  // ✅ Required field
  // age: 30  // ❌ TS Error: not defined on users
});

// Update with type safety
const updated = await mutator.update(userId, {
  email: "newemail@example.com"  // ✅ Typed
});

// Delete
await mutator.delete(userId);
```

---

## Field Type Mapping

How Bknd field types map to TypeScript:

| Field Type | Required | Optional | Generated |
|------------|----------|----------|-----------|
| `text().required()` | `string` | N/A | N/A |
| `text()` | N/A | `string \| null` | N/A |
| `number().required()` | `number` | N/A | N/A |
| `number()` | N/A | `number \| null` | N/A |
| `boolean().required()` | `boolean` | N/A | N/A |
| `boolean()` | N/A | `boolean \| null` | N/A |
| `date().required()` | `Date` | N/A | N/A |
| `date()` | N/A | `Date \| null` | N/A |
| `enumm().required()` | Literal union | N/A | N/A |
| `enumm()` | N/A | Literal union \| null | N/A |
| `json<T>()` | `T` | `T \| null` | N/A |
| `id` (auto) | N/A | N/A | `Generated<number>` |

---

### JSON Field Type Safety

```typescript
// Define shape with generic
metadata: json<{
  theme: "light" | "dark";
  notifications: boolean;
  language: string;
}>({
  default_value: {
    theme: "light",
    notifications: true,
    language: "en"
  }
})

// Usage is fully typed
const user = await userRepo.findOne({ where: { id: 1 } });
user.metadata.theme  // ✅ Autocomplete works
user.metadata.invalid // ❌ TS Error
```

---

## Complete Type-Safe Example

```typescript
import { em, entity, text, number, date, enumm } from "bknd/data";

const schema = em({
  users: entity("users", {
    name: text().required(),
    email: text().required(),
    role: enumm({ enum: ["admin", "user"] }),
    createdAt: date(),
  }),
});

// Extract types
type User = typeof schema.DB["users"];
// {
//   id: Generated<number>;
//   name: string;
//   email: string;
//   role: "admin" | "user" | null;
//   createdAt: Date | null;
// }

// Type-safe service layer
class UserService {
  private repo = schema.proto.repository("users");
  private mutator = schema.proto.mutator("users");

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async create(data: {
    name: string;
    email: string;
    role?: "admin" | "user";
  }): Promise<User> {
    return this.mutator.create({
      name: data.name,
      email: data.email,
      role: data.role || "user",
    });
  }

  async updateRole(
    userId: number,
    role: "admin" | "user"
  ): Promise<User> {
    return this.mutator.update(userId, { role });
  }
}

// Usage is completely type-safe
const service = new UserService();
const user = await service.findByEmail("john@example.com");
if (user) {
  console.log(user.name);  // ✅ Typed
  // console.log(user.invalid); // ❌ TS Error
}
```

---

## Advanced Patterns

### Generic Repository Wrapper

```typescript
class Repository<T> {
  constructor(private schema: typeof schema, private entity: string) {}

  async find(where: Partial<T>): Promise<T[]> {
    const repo = this.schema.proto.repository(this.entity);
    return repo.findMany({ where: where as any });
  }

  async findOne(where: Partial<T>): Promise<T | null> {
    const repo = this.schema.proto.repository(this.entity);
    return repo.findOne({ where: where as any });
  }
}

// Usage
const userRepo = new Repository<User>(schema, "users");
const users = await userRepo.find({ role: "admin" });
```

### Type-Safe Serialization

```typescript
function serialize(user: User): {
  id: number;
  name: string;
  email: string;
} {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

// Only selected fields have types
const serialized = serialize(user);
```
