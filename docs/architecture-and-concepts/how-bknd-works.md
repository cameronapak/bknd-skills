# How Bknd Works: Request Lifecycle & Architecture

Understanding how requests flow through Bknd is essential for building efficient applications and troubleshooting issues effectively. This document explains the complete request lifecycle, from initialization to response.


Before processing requests, Bknd goes through several initialization phases:

### 1. App Creation and Configuration

The `App` class is the core coordinator that manages all framework components:

```typescript
import { createApp } from "bknd";

const config = {
  /* module configurations */
} satisfies BkndConfig;

const app = createApp(config);
```

The configuration includes:
- **Data module** - Schema definition and database connection
- **Auth module** - Strategies, JWT settings, user pool
- **Media module** - Storage adapters and transformations
- **Flows module** - Workflow definitions and triggers
- **Server module** - API routes and middleware

### 2. Build Process

The `build()` method initializes all modules and establishes database connections:

```typescript
await app.build();
```

During this phase:
- Database schema is created or migrated
- Modules are registered and initialized
- Event handlers are attached
- **First boot detection** - If database is empty, seed function executes and `AppFirstBoot` event is emitted

### 3. Ready State

Once built, the app enters the `Ready` state and can handle requests:
- **Ready → HandlingRequest** - When an HTTP request arrives
- **HandlingRequest → RequestProcessed** - After processing completes

## HTTP Request Lifecycle

### 1. Request Reception

Bknd's server (based on Hono) receives the incoming HTTP request:

```
Client → [Framework Adapter] → [Bknd Server]
```

The adapter layer handles framework-specific details:
- **Next.js** - API routes (`/api/[[...bknd]]/route.ts`)
- **Bun/Node** - Native HTTP server
- **Cloudflare Workers** - Request/Response handlers
- **Vite/Astro** - Standalone server integration

Example adapter pattern (Next.js):

```typescript
export async function GET(request: Request) {
  const app = await getApp();
  return app.server.fetch(request);
}
```

### 2. App.fetch() Entry Point

The request is forwarded to `app.fetch(request)`, which:
1. Creates an `Api` instance with request context (headers, origin)
2. Passes the request through middleware chain
3. Routes to appropriate controller
4. Returns the HTTP response

### 3. Middleware Chain

Request flows through registered middleware:
- **Authentication middleware** - Validates JWT tokens
- **Permission middleware** - Checks access rights
- **Custom middleware** - User-defined logic

### 4. Controller Execution

Controllers handle business logic and interact with modules:
- **AuthController** - Authentication and authorization
- **DataController** - CRUD operations and queries
- **MediaController** - File uploads and transformations
- **FlowsController** - Workflow triggers and executions

### 5. Database Interaction

Controllers use the `EntityManager` to interact with the database:

```
Controller → EntityManager → Database Connection → Database
```

### 6. Response Generation

After processing, the controller returns a response that:
- Is serialized to JSON (or appropriate format)
- Includes appropriate status codes
- Sets HTTP headers (including authentication cookies if applicable)

## Authentication Flow

Bknd uses a strategy-based authentication system with JWT tokens.

### Registration Flow

```
Client → AuthController → Authenticator → Strategy → UserPool → Database
```

**Step-by-step:**

1. **Client submits registration** - POST to `/api/auth/register`
2. **AuthController receives request** - Routes to registration handler
3. **Authenticator coordinates** - Resolves appropriate strategy
4. **Strategy validates** - Verifies credentials (email/password, OAuth, etc.)
5. **UserPool creates user** - Inserts user record into database
6. **JWT generation** - Authenticator creates signed JWT token
7. **Response sent** - Returns user profile and JWT (sets secure cookie)

### Login Flow

```
Client → AuthController → Authenticator → Strategy → UserPool → JWT → Response
```

**Step-by-step:**

1. **Client submits login** - POST to `/api/auth/login`
2. **AuthController receives request** - Routes to login handler
3. **Authenticator coordinates** - Resolves appropriate strategy
4. **Strategy validates** - Verifies credentials against user pool
5. **UserPool retrieves user** - Fetches user from database
6. **JWT generation** - Authenticator creates signed JWT token:
   ```typescript
   jwt(user, extraClaims?) {
     // Creates signed JWT with user profile and optional claims
     return jwt.sign(
       { ...user, ...extraClaims },
       this.config.jwt.secret,
       { algorithm: "HS256", expiresIn: this.config.jwt.expires }
     );
   }
   ```
7. **Response sent** - Returns user profile and JWT (sets secure cookie)

### JWT Token Verification

On subsequent requests:

1. **Request arrives with JWT** - In `Authorization: Bearer <token>` header or cookie
2. **Authenticator validates token** - Verifies signature and expiration
3. **User context attached** - User profile is attached to request context
4. **Request proceeds** - Authenticated user context available to controllers and middleware

## Permission Evaluation

Bknd implements a comprehensive permission system combining RBAC (Role-Based Access Control) and RLS (Row-Level Security).

### Permission System Architecture

```
User → Role → Permissions + Policies → Guard → Access Decision
```

**Components:**

- **Permission** - Named granular action (e.g., `posts.create`, `posts.read`)
- **Policy** - Conditional logic for permission (e.g., "own content only")
- **Role** - Collection of permissions with optional policies
- **Guard** - Enforcement mechanism that evaluates permissions in context

### Permission Evaluation Flow

**For API endpoint access:**

1. **Guard middleware intercepts** - `permission()` middleware checks endpoint access
2. **User role retrieved** - Guard fetches user's role from user profile
3. **Permission lookup** - Guard finds permission in role's permission collection
4. **Policy evaluation** - If permission has policies, evaluate them against context
5. **Access decision** - Allow or deny based on permission and policy results

**For data operations (RLS):**

1. **Data controller intercepts** - Before query or mutation
2. **Filter generation** - Guard generates WHERE clause filters based on permissions
3. **Query execution** - Filters applied to ensure user only sees/edits authorized data
4. **Response** - Only authorized records returned

### Example: Post CRUD with Permissions

```typescript
// Define permissions
const createPost = new Permission("posts.create");
const readPost = new Permission("posts.read", { filterable: true });
const updatePost = new Permission("posts.update", { filterable: true });
const deletePost = new Permission("posts.delete", { filterable: true });

// Define policy for own content only
const ownContentPolicy = new Policy({
  name: "own-content",
  check: (context: PermissionContext) => {
    return context.user.id === context.resource.userId;
  },
});

// Define role with permissions and policies
const authorRole = new Role("author", {
  permissions: [
    { permission: "posts.create" },
    { permission: "posts.read" },
    { permission: "posts.update", policies: [ownContentPolicy] },
    { permission: "posts.delete", policies: [ownContentPolicy] },
  ],
});

// Apply to route
hono.get("/api/data/posts", permission("posts.read"), async (c) => {
  // RLS filter automatically applied: WHERE userId = current_user_id
  return c.json(await em.posts.findMany());
});
```

## Database Interaction Pattern

### Connection Management

Bknd supports multiple database backends through adapters:

| Database | Adapter | Connection Type |
|----------|---------|-----------------|
| SQLite (node) | `nodeSqlite()` | `DatabaseSync` (node:sqlite) |
| SQLite (Bun) | `bunSqlite()` | `Database` (bun:sqlite) |
| PostgreSQL | `postgresJs()` | `node-postgres` |
| Cloudflare D1 | Built-in | D1 binding |
| Turso/LibSQL | Built-in | HTTP client |

### Transaction Handling

**Connection-dependent behavior:**

| Database | Batching | Transaction Behavior | Isolation Level |
|----------|------------|---------------------|------------------|
| PostgreSQL | Enabled by default | All queries in `executeQueries()` wrapped in single transaction | Uses PostgreSQL's default (Read Committed) |
| SQLite | Disabled by default | No automatic transactions for batched queries | SERIALIZABLE |

**PostgreSQL transactions:**

PostgreSQL connections override `executeQueries()` to wrap multiple queries in a transaction:

```typescript
// From PostgresConnection.ts
override async executeQueries<O extends ConnQuery[]>(...qbs: O): Promise<ConnQueryResults<O>> {
   return this.kysely.transaction().execute(async (trx) => {
      return Promise.all(qbs.map((q) => trx.executeQuery(q)));
   }) as any;
}
```

**Key characteristics:**
- Atomic execution of batched queries with automatic rollback on errors
- Uses database connection pooling via `postgres-js`
- Supports Kysely's `.setIsolationLevel()` API (if you override method)
- Batching improves performance for multiple operations

**SQLite transactions:**

SQLite connections do NOT override `executeQueries()`, meaning batched queries execute independently:

```typescript
// From Connection.ts (base class)
async executeQueries<O extends ConnQuery[]>(...qbs: O): Promise<ConnQueryResults<O>> {
   return Promise.all(qbs.map(async (q) => await this.kysely.executeQuery(q)));
}
```

**Key characteristics:**
- Each query executes independently (no implicit transaction wrapping)
- SERIALIZABLE isolation by default (highest level)
- In rollback mode (default): Exclusive lock during writes blocks all reads
- In WAL mode: Snapshot isolation with concurrent reads/writes

### SQLite WAL Mode Configuration

SQLite's **Write-Ahead Logging (WAL)** mode provides significant performance benefits by allowing concurrent reads and writes.

**How to enable WAL mode:**

**Node.js SQLite:**
```typescript
import { nodeSqlite, type NodeBkndConfig } from "bknd/adapter/node";

export default {
  connection: nodeSqlite({
    url: "file:data.db",
    onCreateConnection: (db) => {
      db.exec("PRAGMA journal_mode = WAL;");
    },
  }),
} satisfies NodeBkndConfig;
```

**Bun SQLite:**
```typescript
import { bunSqlite, type BunBkndConfig } from "bknd/adapter/bun";

export default {
  connection: bunSqlite({
    url: "file:data.db",
    onCreateConnection: (db) => {
      db.run("PRAGMA journal_mode = WAL;");
    },
  }),
} satisfies BunBkndConfig;
```

**WAL mode benefits:**
- **Concurrent reads and writes** - Multiple readers can access database while writer writes
- **Snapshot isolation** - Readers see consistent snapshot from start of transaction
- **Better performance** - Reduces disk I/O by appending changes to WAL file
- **Persistent** - Unlike other journal modes, WAL mode setting persists in database

**Trade-offs:**
- Slightly more complex file management (WAL + .db-wal + .db-shm files)
- Requires file locking support (works on most modern file systems)
- Not supported in all SQLite configurations (edge runtimes, some constraints)

**For reads:**
1. Open connection
2. Execute query with applied filters (RLS)
3. Return results
4. Close connection

**For writes:**
1. Open transaction (automatic for single operations, manual for multi-step)
2. Validate request against schema
3. Execute mutation
4. Emit `EntityChanged` event
5. Commit transaction (automatic on success, rollback on error)
6. Close connection

**Manual transactions:**

You can explicitly control transactions using Kysely's transaction API:

```typescript
await db.transaction().execute(async (trx) => {
  const user = await trx.insertInto('users')
    .values({ email, password })
    .returning('id')
    .executeTakeFirst();
  
  const profile = await trx.insertInto('profiles')
    .values({ userId: user.id, name })
    .execute();
  
  // Both inserts succeed or both fail (atomic)
});
```

**PostgreSQL connection pooling:**

PostgreSQL connections (via `postgres-js`) maintain a pool of connections:
- Automatically managed by `postgres-js` driver
- Connection returned to pool after query completes
- Configurable via connection string parameters
- No explicit pooling for SQLite (single file, single connection process)

## Event System

Bknd's event system enables decoupled, reactive code:

### Key Application Events

| Event | Trigger | Purpose |
|-------|---------|---------|
| `AppFirstBoot` | Database is empty on first run | Initial data seeding |
| `AppBuiltEvent` | Build process completes | Post-build initialization |
| `AppConfigUpdatedEvent` | Any module configuration changes | React to config updates |
| `AppRequest` | Incoming HTTP request | Request-level logging/tracking |

### Data Events

| Event | Trigger | Purpose |
|-------|---------|---------|
| `EntityCreated` | New entity inserted | Post-creation processing |
| `EntityUpdated` | Entity modified | Change tracking, notifications |
| `EntityDeleted` | Entity removed | Cleanup, cascade actions |

### Example: Reacting to User Creation

```typescript
app.on('user-created', async (event) => {
  // Send welcome email
  await sendEmail(event.data.email, 'welcome-template');

  // Create user profile
  await em.profiles.create({
    userId: event.data.id,
    createdAt: new Date(),
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Use Code Mode in production** - Eliminates database config lookups
2. **Enable database indices** - Speed up common query patterns
3. **Cache JWT verification** - Avoid repeated token parsing
4. **Batch operations** - Use `createMany` instead of multiple `create` calls
5. **Selective queries** - Use `select` to limit returned fields

### Mode Performance Comparison

| Mode | Config Lookup | Type Generation | Performance |
|------|---------------|-----------------|-------------|
| UI Mode | Database (per request) | Dynamic | Slowest |
| Hybrid Mode | Database (dev), Code (prod) | Synced | Balanced |
| Code Mode | In-memory (once) | Static | Fastest |

## Unknown Details

The following aspects are not fully documented in available resources:

1. **Query optimization internals** - How does the query builder optimize SQL generation?
2. **Event propagation order** - What is the guaranteed order of event handler execution?
3. **Error propagation** - How do errors flow through the middleware chain?
4. **Caching strategies** - Are there any built-in caching mechanisms for frequently accessed data?
6. **PostgreSQL connection pool tuning** - How to configure pool size and timeout settings?

For detailed implementation questions, refer to the source code or consult the Bknd community.

## Related Documentation

- [What is Bknd?](./what-is-bknd.md) - Core concepts and architecture
- [Auth Module Reference](../reference/auth-module.md) - Complete authentication documentation
- [Data Module Reference](../reference/data-module.md) - Complete data module documentation
- [Enable Public Access with Guard](../how-to-guides/permissions/public-access-guard.md) - Permission setup guide
- [Add Auth with Permissions](../getting-started/add-authentication.md) - Authentication tutorial
