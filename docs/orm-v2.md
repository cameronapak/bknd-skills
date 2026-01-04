# How Bknd ORM Works

## Bknd ORM Core Concepts

Bknd ORM uses an **object-oriented entity-driven** design pattern, unlike traditional schema-first approaches, it defines data models through the Entity class.

### Core Architecture Components

**1. Entity**
```typescript
import { Entity, TextField, NumberField } from "bknd";

const userEntity = new Entity("users", [
  new TextField("name"),
  new TextField("email"),
  new NumberField("age")
], {
  name_singular: "User",
  description: "System user entity"
});
```

**2. Field System**
Bknd provides a rich set of field types:
- `PrimaryField` - Primary key field (automatically added by default)
- `TextField`, `NumberField`, `BooleanField`, `DateField`, `EnumField`
- `JsonField`, `JsonSchemaField` - Complex data types
- `VirtualField` - Virtual fields (not persisted to database)

Fields support context-based configuration (fillable, hidden, required), see [Field.ts](app/src/data/fields/Field.ts#L26-L44).

**3. EntityManager**
Unifies management of all entities, relationships, and indexes, providing access to the database:
```typescript
const em = new EntityManager(entities, connection, relations, indices, eventManager);
const userRepository = em.repository("users");
const userMutator = em.mutator("users");
```

See [EntityManager.ts](app/src/data/entities/EntityManager.ts#L40-L46).

**4. Repository**
Provides type-safe query methods:
```typescript
// Query single record
const user = await userRepository.findId(123);

// Conditional query
const users = await userRepository.findMany({
  where: { age: { gt: 18 } },
  limit: 10,
  order: { createdAt: "desc" }
});
```

Supports `findId`, `findOne`, `findMany`, `count`, `exists` and other methods, see [Repository.ts](app/src/data/entities/query/Repository.ts#L279-L376).

**5. Mutator**
Handles data creation, update, and deletion operations.

**6. Relationship System**
Supports four relationship types:
- `ManyToOneRelation` - Many-to-one
- `OneToOneRelation` - One-to-one
- `ManyToManyRelation` - Many-to-many
- `PolymorphicRelation` - Polymorphic relationships

See [relations directory](app/src/data/relations/).

**7. Connection**
An abstraction layer supporting multiple databases:
- SQLite (LibSQL, D1, SQLocal)
- PostgreSQL
- Extensible custom connections

### Configuration-Driven Approach

Bknd also supports defining entities through configuration files without code:

```typescript
// bknd.config.ts
export default {
  data: {
    entities: {
      users: {
        fields: {
          name: { type: "text", config: { required: true } },
          email: { type: "text" }
        }
      }
    }
  }
}
```

See [data-schema.ts](app/src/data/data-schema.ts#L1-L103).

---

## Bknd vs Prisma vs Drizzle Comparison

| Feature | **Bknd ORM** | **Prisma ORM** | **Drizzle ORM** |
|---------|--------------|----------------|-----------------|
| **Design Philosophy** | Object-oriented entity | Schema-first (declarative) | SQL Builder (functional) |
| **Definition Style** | Entity class or config | `schema.prisma` file | Schema object definition |
| **Type Safety** | ✅ Full TypeScript support | ✅ Auto-generated types | ✅ Complete type inference |
| **Query Style** | Repository pattern | Fluent chaining | Fluent SQL building |
| **Relationship Handling** | Built-in four types | Auto-generated fields | Manual relationship definitions |
| **Database Support** | SQLite, PostgreSQL, extensible | Multiple databases (extensive) | Multiple databases (broad) |
| **Migration System** | SchemaManager auto-management | Prisma Migrate | Drizzle Kit |
| **Built-in Features** | Permissions (RLS), Events, UI | None | None |
| **Performance** | Kysely-driven (lightweight) | Generator-based (heavier) | Closest to native SQL |
| **Learning Curve** | Medium | Low | Medium-High |

### Detailed Comparison

**Prisma Characteristics:**
- Highest level of abstraction, auto-generated client
- Great for rapid development, but higher migration cost
- Powerful type inference and IDE support
- Commercial version offers more features

**Drizzle Characteristics:**
- Lightweight, best performance
- Close to native SQL, high flexibility
- Requires manual management of more details
- Suitable for performance-sensitive scenarios

**Bknd Characteristics:**
- **Full-stack solution**: Not just an ORM, includes permissions, authentication, media, and UI
- **Event system**: Supports pre/post-query hooks for business logic extension
- **Flexible definition**: Both code-based and configuration-based definitions
- **Built-in RLS**: Row-level security policies, out-of-the-box
- **Adapter pattern**: Supports multiple runtimes (Bun, Cloudflare Worker, Node.js, Deno)

---

## Recommended Use Cases

**Choose Bknd when:**
- Building complete full-stack applications (need auth, permissions, admin UI)
- Need multi-runtime support
- Want configuration-driven rapid iteration
- Need event-driven architecture

**Choose Prisma when:**
- Beginner-friendly, rapid prototyping
- Team familiar with schema-first pattern
- Don't need extra features, just need an ORM

**Choose Drizzle when:**
- Performance-sensitive applications
- Team has deep SQL understanding
- Need maximum flexibility and SQL control

---

## Next Steps

Deep dive into specific modules:
- [Entity Relationships](15-entity-relationships)
- [Schema Constructor & Validation](17-schema-constructor-and-validation)
- [Querying Data with EntityManager](18-querying-data-with-entitymanager)
- [Data Permissions & RLS](19-data-permissions-and-rls)

Choose a database adapter:
- [SQLite Adapters](20-sqlite-adapters-libsql-d1-sqlocal)
- [PostgreSQL Adapter](21-postgresql-adapter)
- [Custom Database Connections](22-custom-database-connections)

Bknd ORM is a **full-stack-oriented ORM**—it's not just a data access layer, but the core of an entire backend system, integrating data, permissions, events, and UI into one cohesive package, ideal for building modern full-stack applications.
