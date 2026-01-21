# Authentication Reference

Technical reference for Bknd v0.20.0 authentication system: strategies, session management, JWT configuration, and OAuth providers.

## Core Concepts

### Authentication Module

Bknd's auth module provides:
- **Multiple strategies**: Password, OAuth (Google, GitHub), Custom OAuth
- **JWT-based sessions**: Signed tokens stored in secure cookies
- **User management**: Built-in `users` entity with configurable fields
- **Role assignment**: Default role on registration

### Configuration Overview

```typescript
import { defineConfig } from "bknd";

export default defineConfig({
  auth: {
    enabled: true,
    basepath: "/api/auth",        // Auth API base path
    entity_name: "users",          // User entity name
    allow_register: true,          // Enable registration
    default_role_register: "user", // Role assigned on registration
    jwt: { /* JWT config */ },
    cookie: { /* Cookie config */ },
    strategies: { /* Strategy configs */ },
  },
});
```

---

## Strategies

### Password Strategy

Email/password authentication with configurable hashing.

**Config:**
```typescript
{
  auth: {
    enabled: true,
    strategies: {
      password: {
        type: "password",
        enabled: true,
        config: {
          hashing: "sha256",  // "plain" | "sha256" | "bcrypt"
          rounds: 4,          // bcrypt rounds (1-10)
          minLength: 8,       // Minimum password length
        },
      },
    },
  },
}
```

**Hashing Options:**
| Option | Security | Performance | Notes |
|--------|----------|-------------|-------|
| `plain` | None | Fastest | Dev only, never production |
| `sha256` | Good | Fast | Default, suitable for most cases |
| `bcrypt` | Best | Slower | Recommended for high-security apps |

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/password/login` | Login with email/password |
| POST | `/api/auth/password/register` | Register new user |

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### OAuth Strategy (Built-in Providers)

Pre-configured OAuth for Google and GitHub.

**Config:**
```typescript
{
  auth: {
    enabled: true,
    strategies: {
      google: {
        type: "oauth",
        enabled: true,
        config: {
          name: "google",
          client: {
            client_id: "your-google-client-id",
            client_secret: "your-google-client-secret",
          },
        },
      },
      github: {
        type: "oauth",
        enabled: true,
        config: {
          name: "github",
          client: {
            client_id: "your-github-client-id",
            client_secret: "your-github-client-secret",
          },
        },
      },
    },
  },
}
```

**Supported Providers:**
| Provider | Type | Scopes |
|----------|------|--------|
| `google` | OIDC | openid, email, profile |
| `github` | OAuth2 | read:user, user:email |

**OAuth Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/{provider}/login` | Initiate OAuth login (cookie-based) |
| POST | `/api/auth/{provider}/register` | Initiate OAuth registration |
| GET | `/api/auth/{provider}/login` | Get OAuth URL (token-based) |
| GET | `/api/auth/{provider}/callback` | OAuth callback handler |

**OAuth Flow (Cookie Mode):**
1. POST to `/api/auth/google/login`
2. Redirected to Google consent screen
3. Google redirects to `/api/auth/google/callback`
4. User receives auth cookie, redirected to success URL

**OAuth Flow (Token Mode):**
1. GET `/api/auth/google/login` -> returns `{ url, challenge, action }`
2. Redirect user to `url`
3. User completes OAuth
4. Callback returns `{ code }` or auth response with `X-State-Challenge` header

### Custom OAuth Strategy

For OAuth providers not built-in.

**Config:**
```typescript
{
  auth: {
    strategies: {
      slack: {
        type: "custom_oauth",
        enabled: true,
        config: {
          name: "slack",
          type: "oauth2",  // "oauth2" | "oidc"
          client: {
            client_id: "your-slack-client-id",
            client_secret: "your-slack-client-secret",
            token_endpoint_auth_method: "client_secret_post",
          },
          as: {
            issuer: "https://slack.com",
            authorization_endpoint: "https://slack.com/oauth/v2/authorize",
            token_endpoint: "https://slack.com/api/oauth.v2.access",
            userinfo_endpoint: "https://slack.com/api/users.identity",
            scopes_supported: ["openid", "profile", "email"],
          },
          profile: async (info, config, tokenResponse) => ({
            sub: info.user.id,
            email: info.user.email,
          }),
        },
      },
    },
  },
}
```

**Custom OAuth Config:**
| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Strategy identifier |
| `type` | `"oauth2"` \| `"oidc"` | Protocol type |
| `client` | object | OAuth client credentials |
| `as` | object | Authorization server endpoints |
| `profile` | function | Transform user info to profile |

---

## JWT Configuration

JWT tokens are used for stateless authentication.

**Config:**
```typescript
{
  auth: {
    jwt: {
      secret: "your-256-bit-secret",  // Required in production
      alg: "HS256",                    // "HS256" | "HS384" | "HS512"
      expires: 604800,                 // Token expiry in seconds (7 days)
      issuer: "my-app",                // Optional issuer claim
      fields: ["id", "email", "role"], // Fields included in token payload
    },
  },
}
```

**JWT Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `secret` | string | `""` | Signing secret (required for production) |
| `alg` | string | `"HS256"` | Algorithm: HS256, HS384, HS512 |
| `expires` | number | - | Token expiry in seconds |
| `issuer` | string | - | Token issuer claim (iss) |
| `fields` | string[] | `["id", "email", "role"]` | User fields in payload |

**JWT Payload Structure:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "iat": 1705689600,
  "iss": "my-app",
  "exp": 1706294400
}
```

**Security Notes:**
- JWT is base64-encoded, not encrypted - anyone can decode and read payload
- Only include non-sensitive fields (never password, strategy_value)
- Use strong secrets (256-bit minimum recommended)
- Always set `expires` in production

---

## Cookie Configuration

Auth cookies store the signed JWT token.

**Config:**
```typescript
{
  auth: {
    cookie: {
      domain: undefined,       // Cookie domain (undefined = current)
      path: "/",               // Cookie path
      sameSite: "lax",         // "strict" | "lax" | "none"
      secure: true,            // HTTPS only
      httpOnly: true,          // No JavaScript access
      expires: 604800,         // Cookie expiry in seconds (7 days)
      partitioned: false,      // CHIPS partitioning
      renew: true,             // Auto-renew on requests
      pathSuccess: "/",        // Redirect after login
      pathLoggedOut: "/",      // Redirect after logout
    },
  },
}
```

**Cookie Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `domain` | string | - | Cookie domain scope |
| `path` | string | `"/"` | URL path scope |
| `sameSite` | string | `"lax"` | CSRF protection |
| `secure` | boolean | `true` | HTTPS-only flag |
| `httpOnly` | boolean | `true` | Block JS access |
| `expires` | number | `604800` | Expiry (seconds) |
| `renew` | boolean | `true` | Auto-extend expiry |
| `pathSuccess` | string | `"/"` | Post-login redirect |
| `pathLoggedOut` | string | `"/"` | Post-logout redirect |

---

## SDK Usage

### TypeScript/JavaScript Client

**Setup:**
```typescript
import { Api } from "bknd";

const api = new Api({
  host: "https://api.example.com",
  storage: localStorage,  // For token persistence
});
```

**Register:**
```typescript
const { ok, data } = await api.auth.register("password", {
  email: "user@example.com",
  password: "securepassword123",
});

if (ok) {
  console.log("Registered:", data.user);
  // Token automatically stored in localStorage
}
```

**Login:**
```typescript
const { ok, data } = await api.auth.login("password", {
  email: "user@example.com",
  password: "securepassword123",
});

if (ok) {
  console.log("Logged in:", data.user);
}
```

**Get Current User:**
```typescript
const { ok, data } = await api.auth.me();

if (ok && data?.user) {
  console.log("Current user:", data.user);
} else {
  console.log("Not authenticated");
}
```

**Logout:**
```typescript
await api.auth.logout();
```

**OAuth (Browser):**
```typescript
// Get OAuth URL
const { data } = await api.auth.login("google");
// Redirect user to data.url
window.location.href = data.url;
```

### React Hooks

```typescript
import { useAuth } from "@bknd/react";

function AuthComponent() {
  const { user, isLoading, login, logout, register } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return (
      <button onClick={() => login("password", { email, password })}>
        Login
      </button>
    );
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## REST API Endpoints

### Common Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/logout` | Log out (clear cookie) |
| GET | `/api/auth/strategies` | List enabled strategies |

### Authentication Header

For API requests, include JWT in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Or rely on auth cookie for browser requests.

### Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid request body |
| 401 | Invalid credentials |
| 403 | Forbidden (wrong strategy, etc.) |
| 409 | User already exists (registration) |

---

## User Entity

Auth module creates/uses a `users` entity.

**Default Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | primary | User ID |
| `email` | text | User email (identifier) |
| `strategy` | text | Auth strategy used |
| `strategy_value` | text | Hashed password / OAuth sub |
| `role` | text | User role |

**Extend User Entity:**
```typescript
const schema = em({
  users: entity("users", {
    email: text().required().unique(),
    name: text(),
    avatar: text(),
    // Custom fields...
  }),
});
```

**Note:** `strategy` and `strategy_value` are managed by auth system - don't modify directly.

---

## Common Patterns

### Protect Routes by Role

Use guard system (see authorization reference):
```typescript
{
  auth: {
    guard: { enabled: true },
    roles: {
      admin: {
        implicit_allow: true,  // Admin can do everything
      },
      user: {
        implicit_allow: false,
        permissions: [
          { permission: "posts.read", effect: "allow" },
          { permission: "posts.write", effect: "allow" },
        ],
      },
    },
  },
}
```

### Check Auth in Server Code

```typescript
import { getApi } from "bknd";

export async function handler(request: Request, app) {
  const api = getApi(app);
  const user = await api.auth.resolveAuthFromRequest(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // user.id, user.email, user.role available
}
```

### Custom Registration Fields

The default registration only accepts `email` and `password`. For additional fields, use a plugin or create user via data API after registration:

```typescript
// After registration
const { data: authData } = await api.auth.register("password", {
  email,
  password,
});

// Update user with additional fields
await api.data.updateOne("users", authData.user.id, {
  name: "John Doe",
  avatar: "https://...",
});
```

### Multiple Auth Strategies

Enable multiple strategies for flexibility:
```typescript
{
  auth: {
    strategies: {
      password: { type: "password", config: { hashing: "bcrypt" } },
      google: { type: "oauth", config: { name: "google", client: {...} } },
      github: { type: "oauth", config: { name: "github", client: {...} } },
    },
  },
}
```

Users can have only ONE strategy. Once registered with password, cannot OAuth (and vice versa).

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid credentials` | Wrong email/password | Check credentials |
| `User signed up with different strategy` | OAuth user trying password | Use correct strategy |
| `Cannot sign JWT without secret` | Missing JWT secret | Set `auth.jwt.secret` |
| `Profile must have identifier` | Missing email in OAuth | Check OAuth profile mapping |

### SDK Error Handling

```typescript
const result = await api.auth.login("password", { email, password });

if (!result.ok) {
  switch (result.status) {
    case 401:
      console.error("Invalid email or password");
      break;
    case 403:
      console.error("Account uses different login method");
      break;
    default:
      console.error("Login failed:", result.error);
  }
}
```

---

## Security Checklist

**Production Requirements:**
- [ ] Set strong `jwt.secret` (256-bit minimum)
- [ ] Use `hashing: "bcrypt"` for password strategy
- [ ] Set `cookie.secure: true` (HTTPS only)
- [ ] Set `cookie.httpOnly: true` (default)
- [ ] Set `cookie.sameSite: "lax"` or `"strict"`
- [ ] Configure `jwt.expires` (don't leave unlimited)
- [ ] Disable `allow_register` if closed system

**OAuth Requirements:**
- [ ] Use environment variables for client secrets
- [ ] Verify redirect URIs match exactly
- [ ] Use HTTPS for callback URLs

---

## API Reference

### Auth Config Schema

```typescript
type AuthConfig = {
  enabled: boolean;
  basepath?: string;           // Default: "/api/auth"
  entity_name?: string;        // Default: "users"
  allow_register?: boolean;    // Default: true
  default_role_register?: string;
  jwt: JWTConfig;
  cookie: CookieConfig;
  strategies: Record<string, StrategyConfig>;
  guard?: { enabled: boolean };
  roles?: Record<string, RoleConfig>;
};
```

### Strategy Types

```typescript
type PasswordStrategyConfig = {
  type: "password";
  enabled?: boolean;
  config: {
    hashing: "plain" | "sha256" | "bcrypt";
    rounds?: number;      // 1-10, for bcrypt
    minLength?: number;   // Default: 8
  };
};

type OAuthStrategyConfig = {
  type: "oauth";
  enabled?: boolean;
  config: {
    name: "google" | "github";
    client: {
      client_id: string;
      client_secret: string;
    };
  };
};

type CustomOAuthStrategyConfig = {
  type: "custom_oauth";
  enabled?: boolean;
  config: {
    name: string;
    type: "oauth2" | "oidc";
    client: { client_id: string; client_secret: string; token_endpoint_auth_method: string };
    as: AuthorizationServerConfig;
    profile: (info: any, config: any, tokens: any) => Promise<{ sub: string; email: string }>;
  };
};
```

### SDK Auth Methods

```typescript
interface AuthApi {
  login(strategy: string, input?: any): Promise<ResponseObject<AuthResponse>>;
  register(strategy: string, input?: any): Promise<ResponseObject<AuthResponse>>;
  me(): Promise<ResponseObject<{ user: SafeUser | null }>>;
  logout(): Promise<void>;
}

type AuthResponse = {
  user: SafeUser;
  token: string;
};

type SafeUser = {
  id: number | string;
  email: string;
  role?: string;
  [key: string]: any;  // Custom fields
};
```
