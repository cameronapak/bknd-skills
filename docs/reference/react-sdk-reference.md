---
title: React SDK Reference
description: Complete reference for React hooks and components provided by bknd/client
---

# React SDK Reference

The Bknd React SDK (`bknd/client`) provides hooks and components for building React applications that interact with Bknd. All components are built on top of the [TypeScript SDK](/reference/sdk) and use [SWR](https://swr.vercel.app) for caching and state management.

## Setup

Wrap your application with `ClientProvider` to enable all hooks:

```tsx
import { ClientProvider } from "bknd/client";

export default function App() {
  return (
    <ClientProvider baseUrl="https://your-backend.com">
      {/* your app */}
    </ClientProvider>
  );
}
```

## Hooks

### `useAuth()`

Provides authentication state and helper functions.

```tsx
import { useAuth } from "bknd/client";

export default function AuthComponent() {
  const { user, verified, login, logout } = useAuth();

  if (!user) {
    return (
      <button onClick={async () => {
        await login({ email: "user@example.com", password: "password" });
      }}>
        Login
      </button>
    );
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Parameters:**
- `options?: { baseUrl?: string }` - Override base URL for auth operations

**Returns:**
| Property | Type | Description |
|----------|-------|-------------|
| `data` | `Partial<AuthState>` | Full auth state |
| `user` | `SafeUser \| undefined` | Current authenticated user |
| `token` | `string \| undefined` | JWT token |
| `verified` | `boolean` | Whether token has been verified |
| `login` | `(data: { email, password }) => Promise<AuthResponse>` | Login with password strategy |
| `register` | `(data: { email, password }) => Promise<AuthResponse>` | Register with password strategy |
| `logout` | `() => Promise<void>` | Logout and invalidate all caches |
| `verify` | `() => Promise<void>` | Verify current token is valid |
| `setToken` | `(token: string) => void` | Manually set auth token |

**Usage Notes:**
- `login` and `register` automatically update auth state and store token
- `logout` clears token and invalidates all SWR cache entries
- `verify` checks if current token is still valid with the server
- Auth state changes propagate to all components using `useAuth`

### `useEntity()`

CRUD operations for entities without caching.

```tsx
import { useState, useEffect } from "react";
import { useEntity } from "bknd/client";

export default function TodoItem({ id }: { id: number }) {
  const [data, setData] = useState();
  const { read, update, _delete } = useEntity("todos", id);

  useEffect(() => {
    read().then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <span>{data.title}</span>
      <button onClick={async () => {
        await update({ done: !data.done });
      }}>Toggle</button>
      <button onClick={async () => {
        await _delete();
      }}>Delete</button>
    </div>
  );
}
```

**Parameters:**
- `entity: string` - Entity name (e.g., `"todos"`, `"posts"`)
- `id?: number \| string` - Optional ID for single-entity operations

**Returns:**
| Property | Type | Description |
|----------|-------|-------------|
| `create` | `(input) => Promise<Response>` | Create new entity |
| `read` | `(query?) => Promise<Response>` | Read entity/entities |
| `update` | `(input, id?) => Promise<Response>` | Update entity |
| `_delete` | `(id?) => Promise<Response>` | Delete entity |

**Behavior:**
- With `id`: `read` returns single entity, `update` and `_delete` don't require `id` parameter
- Without `id`: `read` returns array of entities, `update` and `_delete` require `id` parameter

### `useEntityQuery()`

CRUD operations with automatic caching using SWR.

```tsx
import { useEntityQuery } from "bknd/client";

export default function TodoList() {
  const { data: todos, create, update, _delete, isLoading } = useEntityQuery(
    "todos",
    undefined, // no id = list mode
    {
      limit: 10,
      sort: "-id",
    }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const title = e.currentTarget.elements.title.value;
        await create({ title, done: false });
      }}>
        <input name="title" placeholder="New todo" />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={!!todo.done}
              onChange={async () => {
                await update({ done: !todo.done }, todo.id);
              }}
            />
            <span>{todo.title}</span>
            <button onClick={() => _delete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `entity` | `string` | Entity name |
| `id?` | `number \| string` | Optional ID for single-entity mode |
| `query?` | `RepoQueryIn` | Query parameters (limit, offset, sort, where, with) |
| `options?` | `SWRConfiguration & { enabled?, revalidateOnMutate? }` | SWR options |

**Query Parameters:**
| Property | Type | Default | Description |
|----------|-------|---------|-------------|
| `limit` | `number` | `10` | Max results to return |
| `offset` | `number` | `0` | Skip N results |
| `sort` | `string \| string[]` | `"id"` | Sort field(s), prefix with `-` for descending |
| `where` | `object` | - | Filter conditions |
| `with` | `string[]` | - | Relations to include |

**Options:**
| Property | Type | Default | Description |
|----------|-------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable fetching |
| `revalidateOnMutate` | `boolean` | `true` | Revalidate after mutations |
| `keepPreviousData` | `boolean` | `true` | Keep old data while loading new |
| `revalidateOnFocus` | `boolean` | `false` | Revalidate on window focus |

**Returns:**

**SWR Properties:**
| Property | Type | Description |
|----------|-------|-------------|
| `data` | `Entity \| Entity[]` | Entity or list of entities |
| `error` | `Error` | Error if failed |
| `isLoading` | `boolean` | Initial loading state |
| `isValidating` | `boolean` | Revalidating state |

**CRUD Actions (with auto-revalidation):**
| Property | Type | Description |
|----------|-------|-------------|
| `create` | `(input) => Promise<Response>` | Create entity |
| `update` | `(input, id?) => Promise<Response>` | Update entity |
| `_delete` | `(id?) => Promise<Response>` | Delete entity |

**Cache Management:**
| Property | Type | Description |
|----------|-------|-------------|
| `mutate` | `(id?) => Promise<void>` | Manual revalidation |
| `mutateRaw` | `SWRResponse["mutate"]` | Direct SWR mutate |
| `key` | `string` | Cache key |
| `api` | `Api["data"]` | Direct API access |

**Mutation Behavior:**
- All mutations (`create`, `update`, `_delete`) automatically revalidate queries for that entity
- Set `revalidateOnMutate: false` to disable auto-revalidation
- Use `mutateRaw` for optimistic updates

### `useApiQuery()`

Query any API endpoint with caching.

```tsx
import { useApiQuery } from "bknd/client";

export default function CommentList() {
  const { data, isLoading } = useApiQuery(
    (api) => api.data.readMany("comments", { limit: 20 })
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.map((comment) => (
        <li key={comment.id}>{comment.content}</li>
      ))}
    </ul>
  );
}
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `(api: Api) => FetchPromise<Data>` | Function that returns API promise |
| `options?` | `SWRConfiguration & { enabled?, refine? }` | SWR options |

**Options:**
| Property | Type | Description |
|----------|-------|-------------|
| `enabled` | `boolean` | Enable/disable fetching |
| `refine` | `(data) => R` | Transform response data |

**Returns:**
All SWR properties plus:
| Property | Type | Description |
|----------|-------|-------------|
| `promise` | `FetchPromise` | The fetch promise |
| `key` | `string` | Cache key |
| `api` | `Api` | API instance |

### `useInvalidate()`

Manual cache invalidation utility.

```tsx
import { useInvalidate } from "bknd/client";

export default function RefreshButton() {
  const invalidate = useInvalidate();

  return (
    <button onClick={async () => {
      // Invalidate all comments queries
      await invalidate("/data/comments");

      // Or invalidate using API selector
      await invalidate((api) => api.data.readMany("comments"));
    }}>
      Refresh
    </button>
  );
}
```

**Parameters:**
- `key?: string \| (api: Api) => FetchPromise` - Cache key or API selector
- `options?: { exact?: boolean }` - Match exactly if true

**Returns:**
- `Promise<void>` - Resolves when invalidation complete

### `useEntityMutate()`

Mutation actions without fetching data.

```tsx
import { useEntityMutate } from "bknd/client";

export default function QuickAdd({ onCreated }: { onCreated: () => void }) {
  const { create, mutate } = useEntityMutate("todos");

  const handleClick = async () => {
    await create({ title: "New todo", done: false });
    await mutate(); // manually update cache
    onCreated();
  };

  return <button onClick={handleClick}>Quick Add Todo</button>;
}
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `entity` | `string` | Entity name |
| `id?` | `number \| string` | Optional ID |
| `options?` | `SWRConfiguration` | SWR options |

**Returns:**
| Property | Type | Description |
|----------|-------|-------------|
| `create` | `(input) => Promise<Response>` | Create entity |
| `update` | `(input, id?) => Promise<Response>` | Update entity |
| `_delete` | `(id?) => Promise<Response>` | Delete entity |
| `mutate` | `(id?, data) => Promise<void>` | Local cache update |

### `useApi()`

Access the API instance directly.

```tsx
import { useApi } from "bknd/client";

export default function SystemStatus() {
  const api = useApi();

  const checkStatus = async () => {
    const health = await api.system.health();
    console.log("Health:", health);
  };

  return <button onClick={checkStatus}>Check Health</button>;
}
```

**Parameters:**
- `host?: string` - Override base URL

**Returns:**
- `Api` - Full API instance with `data`, `auth`, `media`, `system` modules

## Components

### `AuthForm`

Pre-built authentication form component.

```tsx
import { AuthForm } from "bknd/elements";

export default function LoginPage() {
  return (
    <AuthForm
      action="login"
      auth={{
        basepath: "/api/auth",
        strategies: {
          password: { type: "password" },
          google: {
            type: "oauth",
            config: {
              clientId: "your-client-id",
              clientSecret: "your-secret",
            },
          },
        },
      }}
      buttonLabel="Sign In"
    />
  );
}
```

**Props:**
| Property | Type | Default | Description |
|----------|-------|---------|-------------|
| `action` | `"login" \| "register"` | required | Form action |
| `method` | `"POST" \| "GET"` | `"POST"` | HTTP method |
| `auth` | `Partial<AppAuthSchema>` | - | Auth configuration |
| `buttonLabel` | `string` | `"Sign in"` | Submit button text |
| `className` | `string` | - | Custom classes |

### `Media.Dropzone`

File upload dropzone component with progress tracking.

```tsx
import { Media } from "bknd/elements";
import { useApi } from "bknd/client";

export default function UploadComponent() {
  const api = useApi();

  return (
    <Media.Dropzone
      getUploadInfo={async (file) => {
        const info = await api.media.getUploadInfo(file.path);
        return { url: info.url, headers: info.headers };
      }}
      handleDelete={async (file) => {
        return await api.media.deleteFile(file.path);
      }}
      maxItems={5}
      allowedMimeTypes={["image/*", "application/pdf"]}
      autoUpload
      onUploadedAll={(files) => {
        console.log("All uploaded:", files);
      }}
    >
      {({ files, actions }) => (
        <div>
          {files.map((file) => (
            <div key={file.path}>
              {file.state === "uploading" && (
                <div>Progress: {Math.round(file.progress * 100)}%</div>
              )}
              {file.state === "uploaded" && (
                <div>{file.name}</div>
              )}
              <button onClick={() => actions.deleteFile(file)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </Media.Dropzone>
  );
}
```

**Props:**
| Property | Type | Description |
|----------|-------|-------------|
| `getUploadInfo` | `(file) => { url, headers?, method? }` | Get upload endpoint info |
| `handleDelete` | `(file) => Promise<boolean>` | Delete file handler |
| `initialItems` | `FileState[]` | Pre-loaded files |
| `maxItems` | `number` | Maximum files |
| `allowedMimeTypes` | `string[]` | Allowed file types |
| `overwrite` | `boolean` | Overwrite existing files |
| `autoUpload` | `boolean` | Upload automatically |
| `flow` | `"start" \| "end"` | Add to start or end |
| `onRejected` | `(files) => void` | Rejected files callback |
| `onDeleted` | `(file) => void` | Deleted callback |
| `onUploaded` | `(file) => void` | Uploaded callback |
| `onUploadedAll` | `(files) => void` | All uploaded callback |
| `onClick` | `(file) => void` | Click handler |
| `placeholder` | `{ show?, text? }` | Placeholder config |
| `footer` | `ReactNode` | Custom footer |
| `children` | `ReactNode \| (props) => ReactNode` | Custom render |

**File States:**
- `"pending"` - Waiting to upload
- `"uploading"` - Currently uploading
- `"uploaded"` - Successfully uploaded
- `"failed"` - Upload failed
- `"initial"` - Pre-loaded
- `"deleting"` - Deleting

### `NativeForm`

Auto-configured form component.

```tsx
import { NativeForm } from "bknd/elements";

export default function PostForm() {
  return (
    <NativeForm
      method="POST"
      action="/api/data/posts"
      validateOn="change"
      className="flex flex-col gap-4"
    >
      <div>
        <label htmlFor="title">Title</label>
        <input type="text" name="title" required />
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <textarea name="content" required />
      </div>
      <button type="submit">Create Post</button>
    </NativeForm>
  );
}
```

**Props:**
All standard `<form>` attributes plus:
| Property | Type | Description |
|----------|-------|-------------|
| `validateOn` | `"change" \| "submit"` | When to validate |

## Best Practices

### Authentication Patterns

**SPA with localStorage:**
```tsx
<ClientProvider baseUrl="https://api.example.com" storage={window.localStorage}>
  <App />
</ClientProvider>
```

**SPA with cookies (same domain):**
```tsx
<ClientProvider baseUrl="https://example.com" credentials="include">
  <App />
</ClientProvider>
```

**Full-stack embedded:**
```tsx
// Server-side
const api = app.getApi({ request });
const user = api.getUser();

// Client-side
<ClientProvider user={user}>
  <App />
</ClientProvider>
```

### Cache Management

1. Use `useEntityQuery` for data that needs caching
2. Use `useEntity` for one-off operations
3. Call `mutate()` after mutations to keep UI in sync
4. Use `useInvalidate` for manual cache refresh

### Error Handling

All CRUD operations throw `UseEntityApiError` on failure:

```tsx
import { UseEntityApiError } from "bknd/client";

try {
  await create({ title: "New" });
} catch (error) {
  if (error instanceof UseEntityApiError) {
    console.error("API Error:", error.response);
  }
}
```

## Type Safety

The React SDK is fully typed. Import types from `"bknd"`:

```tsx
import type { DB, RepoQueryIn } from "bknd";

// Entity types are auto-generated
type Post = DB["posts"];

// Query types
const query: RepoQueryIn = {
  limit: 10,
  where: { published: true },
};
```

## See Also

- [TypeScript SDK Reference](/reference/sdk) - Low-level API reference
- [React Integration Guide](/how-to-guides/setup/integrations/react) - Setup examples
- [Vite + React Guide](/how-to-guides/setup/integrations/vite-react) - Complete tutorial

## Related Guides

- [Build Your First API](../getting-started/build-your-first-api.md) - Hands-on React tutorial
- [Add Authentication with Permissions](../getting-started/add-authentication.md) - Auth with React hooks
- [Deploy to Production](../getting-started/deploy-to-production.md) - Production React deployment
- [Next.js Integration](../how-to-guides/setup/integrations/nextjs.md) - React in Next.js
- [React Router Integration](../how-to-guides/setup/integrations/react-router.md) - Loader/Action pattern
