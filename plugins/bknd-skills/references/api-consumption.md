# API Consumption Reference

Technical reference for Bknd v0.20.0 TypeScript SDK, REST API endpoints, React integration, and custom endpoints.

## SDK Setup

### Browser/Frontend

```typescript
import { Api } from "bknd";

const api = new Api({
  host: "https://api.example.com",
  storage: localStorage,  // Token persistence
  onAuthStateChange: (state) => {
    console.log("Auth changed:", state.user);
  },
});
```

### With Explicit Token

```typescript
const api = new Api({
  host: "https://api.example.com",
  token: "your-jwt-token",
});
```

### From Request (Server-Side)

```typescript
const api = new Api({
  request: req,  // Extracts token from headers/cookies
});
```

---

## Api Class Structure

```typescript
class Api {
  system: SystemApi;   // System operations
  data: DataApi;       // CRUD operations
  auth: AuthApi;       // Authentication
  media: MediaApi;     // File uploads/downloads

  // Auth state
  getAuthState(): AuthState;
  getUser(): TApiUser | null;
  isAuthenticated(): boolean;
  isAuthVerified(): boolean;
  verifyAuth(): Promise<void>;
  updateToken(token?: string, opts?): void;
}

type AuthState = {
  token?: string;
  user?: TApiUser;
  verified: boolean;
};
```

---

## API Options

```typescript
type ApiOptions = {
  host?: string;              // Backend URL
  token?: string;             // JWT token
  storage?: StorageInterface; // Token persistence
  onAuthStateChange?: (state: AuthState) => void;
  fetcher?: ApiFetcher;       // Custom fetch implementation
  verbose?: boolean;          // Debug logging
  verified?: boolean;         // Trust token without verification
  credentials?: RequestCredentials;  // 'include' for cookies

  // Sub-API options
  data?: {
    queryLengthLimit?: number;   // Default: 1000
    defaultQuery?: { limit?: number };
  };
  auth?: { ... };
  media?: { ... };
};
```

### Storage Interface

```typescript
interface StorageInterface {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}
```

---

## Token Transport

Bknd supports three token transport methods:

| Method | Header | When Used |
|--------|--------|-----------|
| `header` | `Authorization: Bearer <token>` | Default for explicit tokens |
| `cookie` | `Cookie: auth=<token>` | When token found in cookies |
| `none` | N/A | User object passed directly |

```typescript
// Check current transport
console.log(api.token_transport);  // "header" | "cookie" | "none"
```

---

## Module APIs

### DataApi

See `references/data-operations.md` for full CRUD documentation.

```typescript
api.data.readOne(entity, id, query?)
api.data.readMany(entity, query?)
api.data.createOne(entity, data)
api.data.createMany(entity, data[])
api.data.updateOne(entity, id, data)
api.data.updateMany(entity, where, update)
api.data.deleteOne(entity, id)
api.data.deleteMany(entity, where)
api.data.count(entity, where?)
api.data.exists(entity, where?)
```

### AuthApi

See `references/authentication.md` for auth strategies.

```typescript
api.auth.login(strategy, credentials)
api.auth.register(credentials)
api.auth.logout()
api.auth.me()
```

### MediaApi

See `references/files-media.md` for upload handling.

```typescript
api.media.upload(file, options?)
api.media.getUrl(path)
```

---

## REST API Endpoints

### Base Paths

| Module | Base Path |
|--------|-----------|
| Data | `/api/data` |
| Auth | `/api/auth` |
| Media | `/api/media` |
| System | `/api/system` |

### Data Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/data/:entity` | Read many |
| POST | `/api/data/:entity/query` | Read many (complex) |
| GET | `/api/data/:entity/:id` | Read one |
| GET | `/api/data/:entity/:id/:reference` | Read related |
| POST | `/api/data/:entity` | Create one/many |
| PATCH | `/api/data/:entity/:id` | Update one |
| PATCH | `/api/data/:entity` | Update many |
| DELETE | `/api/data/:entity/:id` | Delete one |
| DELETE | `/api/data/:entity` | Delete many |
| POST | `/api/data/:entity/fn/count` | Count |
| POST | `/api/data/:entity/fn/exists` | Exists check |

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login/:strategy` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auth/:strategy/redirect` | OAuth redirect |
| GET | `/api/auth/:strategy/callback` | OAuth callback |

### Media Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/media/upload` | Upload file |
| GET | `/api/media/:path` | Serve file |

---

## Response Format

### SDK Response Object

```typescript
interface ResponseObject<T> {
  ok: boolean;         // Success status
  res: Response;       // Raw Response object
  body: any;           // Parsed response body
  data: T;             // Extracted data
  meta?: {             // Pagination info
    total: number;
    limit: number;
    offset: number;
  };
}
```

### Usage Pattern

```typescript
const response = await api.data.readMany("posts");

if (response.ok) {
  console.log(response.data);  // Post[]
  console.log(response.meta);  // { total, limit, offset }
} else {
  console.error("Failed:", response.body);
}
```

---

## React Integration

### BkndBrowserApp

```tsx
import { BkndBrowserApp } from "bknd/adapter/browser";

function App() {
  return (
    <BkndBrowserApp config={bkndConfig}>
      <YourApp />
    </BkndBrowserApp>
  );
}
```

### useApp Hook

```tsx
import { useApp } from "bknd/adapter/browser";

function MyComponent() {
  const { app, api, user, isLoading } = useApp();

  if (isLoading) return <Loading />;

  return <div>Hello, {user?.name}</div>;
}
```

### SWR Integration Pattern

```tsx
import useSWR from "swr";
import { useApp } from "bknd/adapter/browser";

function usePosts(query = {}) {
  const { api } = useApp();

  const fetcher = async () => {
    const { ok, data } = await api.data.readMany("posts", query);
    if (!ok) throw new Error("Failed to fetch posts");
    return data;
  };

  return useSWR(["posts", query], fetcher);
}
```

### Cache Key Generation

```typescript
// Module key
const dataKey = api.data.key();  // "/api/data"

// Query-specific key
const postsKey = await api.data
  .readMany("posts", { limit: 10 })
  .key({ search: true });  // ["posts", { limit: 10 }]

// Use in SWR
const { data } = useSWR(postsKey, () => api.data.readMany("posts"));
```

---

## Custom Endpoints (HTTP Triggers)

Create custom API endpoints using Flows with HTTP triggers.

### Basic HTTP Trigger

```typescript
import { Flow, HttpTrigger, LogTask } from "bknd";

const myFlow = new Flow("my-endpoint", [
  new LogTask({ message: "Hello from custom endpoint!" }),
]);

myFlow.setTrigger(
  new HttpTrigger({
    path: "/api/custom/hello",
    method: "GET",
  })
);
```

### HTTP Trigger Options

```typescript
type HttpTriggerOptions = {
  path: string;       // URL path (must start with /)
  method?: string;    // HTTP method (default: "GET")
  respondWith?: string; // Task name for response
  async?: boolean;    // Fire-and-forget (default: false)
};
```

### Accessing Request Data

```typescript
import { Flow, FunctionTask, HttpTrigger } from "bknd";

const flow = new Flow("process-data", [
  new FunctionTask({
    name: "process",
    handler: async (input) => {
      // input contains the Request object
      const body = await input.json();
      return { processed: body.value * 2 };
    },
  }),
]);

flow.setTrigger(
  new HttpTrigger({
    path: "/api/custom/process",
    method: "POST",
    respondWith: "process",  // Return this task's output
  })
);
```

### Registering Flows

```typescript
import { App } from "bknd";

const app = new App({
  flows: {
    flows: [myFlow, processFlow],
  },
});
```

### Flow Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/flow` | List all flows |
| GET | `/flow/:name` | Get flow info |
| GET | `/flow/:name/run` | Manual execution |
| * | Custom trigger path | HTTP trigger endpoint |

---

## Event Triggers

Trigger flows from internal events:

```typescript
import { Flow, EventTrigger, LogTask } from "bknd";

const onUserCreated = new Flow("on-user-created", [
  new LogTask({ message: "New user: {{input.data.email}}" }),
]);

onUserCreated.setTrigger(
  new EventTrigger({
    event: "data:users:created",  // Entity event
  })
);
```

### Event Names

| Event | Description |
|-------|-------------|
| `data:{entity}:created` | Record created |
| `data:{entity}:updated` | Record updated |
| `data:{entity}:deleted` | Record deleted |
| `auth:login` | User logged in |
| `auth:register` | User registered |

---

## Plugins for Custom Routes

Register routes via plugin hooks:

```typescript
import { createPlugin } from "bknd";

const myPlugin = createPlugin({
  name: "my-plugin",

  onServerInit: (server) => {
    server.get("/api/custom/stats", async (c) => {
      return c.json({ users: 100, posts: 500 });
    });

    server.post("/api/custom/webhook", async (c) => {
      const body = await c.req.json();
      // Process webhook...
      return c.json({ received: true });
    });
  },
});
```

---

## CORS Configuration

```typescript
const app = new App({
  server: {
    cors: {
      origin: ["https://myapp.com", "http://localhost:3000"],
      credentials: true,
    },
  },
});
```

---

## Error Handling

### SDK Error Pattern

```typescript
const { ok, data, body } = await api.data.readOne("posts", 999);

if (!ok) {
  // body contains error details
  console.error(body.error?.message);
  return;
}

// data is valid
console.log(data.title);
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |

---

## Common Patterns

### API Wrapper Service

```typescript
class PostsService {
  constructor(private api: Api) {}

  async list(page = 1, pageSize = 20) {
    const { ok, data, meta } = await this.api.data.readMany("posts", {
      where: { status: "published" },
      sort: { created_at: "desc" },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    if (!ok) throw new Error("Failed to fetch posts");

    return {
      posts: data,
      total: meta.total,
      pages: Math.ceil(meta.total / pageSize),
    };
  }

  async get(id: number) {
    const { ok, data } = await this.api.data.readOne("posts", id, {
      with: ["author", "comments"],
    });

    if (!ok) throw new Error("Post not found");
    return data;
  }
}
```

### Auth State React Hook

```tsx
function useAuth() {
  const { api } = useApp();
  const [user, setUser] = useState(api.getUser());

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = api.options.onAuthStateChange = (state) => {
      setUser(state.user ?? null);
    };

    // Verify auth on mount
    api.verifyAuth();

    return () => { api.options.onAuthStateChange = undefined; };
  }, [api]);

  return {
    user,
    isAuthenticated: !!user,
    login: (email, password) => api.auth.login("password", { email, password }),
    logout: () => api.auth.logout(),
  };
}
```

### Optimistic Updates

```typescript
async function togglePublish(postId: number, currentStatus: boolean) {
  // Optimistic UI update
  updateUI(postId, { published: !currentStatus });

  try {
    await api.data.updateOne("posts", postId, {
      published: !currentStatus,
    });
  } catch (error) {
    // Revert on failure
    updateUI(postId, { published: currentStatus });
    throw error;
  }
}
```

---

## Debugging

### Verbose Mode

```typescript
const api = new Api({
  host: "https://api.example.com",
  verbose: true,  // Log all requests
});
```

### CLI Route Inspection

```bash
bknd debug routes
```

Lists all registered HTTP routes with methods.

---

## Best Practices

1. **Always check `ok`** - SDK responses may fail silently
2. **Use storage for tokens** - Enables auth persistence across sessions
3. **Handle auth state changes** - Update UI when auth changes
4. **Use query keys for caching** - SDK provides `.key()` for SWR/React Query
5. **Prefer SDK over raw fetch** - Type safety and token handling
6. **Use flows for webhooks** - HTTP triggers are idiomatic for custom endpoints
