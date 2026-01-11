---
title: "Auth Module"
description: "Complete reference for the Bknd Authentication module, including configuration, strategies, session management, and API endpoints."
---

The Auth module provides comprehensive user authentication and session management for your Bknd application. It supports multiple authentication strategies (password, OAuth 2.0, custom OAuth), role-based access control, and secure session management.

## Enabling Auth

To enable the Auth module in your application, configure it in your `bknd.config.ts`:

```typescript
export default {
  config: {
    auth: {
      enabled: true,
      // ... other options
    },
  },
};
```

**Minimum required configuration:**

```typescript
{
  auth: {
    enabled: true,
    jwt: {
      issuer: "your-app-name",
    },
  },
}
```

**Additional configuration options:**

```typescript
{
  auth: {
    enabled: true,
    entity_name: "users",           // Custom entity name (default: "users")
    basepath: "/api/auth",         // Custom API base path (default: "/api/auth")
    allow_register: true,           // Allow user registration (default: true)
    default_role_register: "user",   // Default role for new users (optional)
    jwt: {
      issuer: "your-app-name",
    },
  },
}
```

When you enable auth without providing a JWT secret, Bknd automatically generates a secure random secret for you.

## Configuration

The auth module provides extensive configuration options for JWT tokens, cookies, strategies, roles, and permissions.

### JWT Configuration

| Property | Type | Default | Description |
|-----------|------|----------|-------------|
| `secret` | string | `""` | Secret key for signing JWT tokens. Auto-generated if empty. |
| `alg` | `"HS256" \| "HS384" \| "HS512"` | `"HS256"` | HMAC algorithm for signing tokens. |
| `expires` | number | `undefined` | Token expiration time in seconds. If not set, cookie expiration is used. |
| `issuer` | string | `undefined` | Issuer claim in JWT payload. |
| `fields` | string[] | `["id", "email", "role"]` | User fields included in JWT payload. |

### Auth Module Configuration

| Property | Type | Default | Description |
|-----------|------|----------|-------------|
| `entity_name` | string | `"users"` | Name of the entity used for user storage. |
| `basepath` | string | `"/api/auth"` | Base path for authentication endpoints. |
| `allow_register` | boolean | `true` | Allow user registration via password strategy. |
| `default_role_register` | string | `undefined` | Default role assigned to newly registered users. Must match a configured role. |

**Example:**

```typescript
{
  auth: {
    enabled: true,
    jwt: {
      secret: "your-secret-key",
      alg: "HS256",
      expires: 3600, // 1 hour
      issuer: "my-app",
      fields: ["id", "email", "role", "name"],
    },
  },
}
```

### Cookie Configuration

| Property | Type | Default | Description |
|-----------|------|----------|-------------|
| `domain` | string | `undefined` | Domain for the cookie. Uses current domain if not set. |
| `path` | string | `"/"` | Path where the cookie is valid. |
| `sameSite` | `"strict" \| "lax" \| "none"` | `"lax"` | SameSite cookie attribute. |
| `secure` | boolean | `true` | Secure cookie attribute (HTTPS only). |
| `httpOnly` | boolean | `true` | HttpOnly cookie attribute (not accessible via JavaScript). |
| `expires` | number | `604800` (1 week) | Cookie expiration in seconds. |
| `partitioned` | boolean | `false` | Partitioned cookie attribute. |
| `renew` | boolean | `true` | Auto-refresh cookie on authenticated requests (sliding session). |
| `pathSuccess` | string | `"/"` | Redirect destination after successful login/register. |
| `pathLoggedOut` | string | `"/"` | Redirect destination after logout. |

**Example:**

```typescript
{
  auth: {
    enabled: true,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: 604800, // 1 week
      renew: true, // Enable sliding session
      pathSuccess: "/dashboard",
      pathLoggedOut: "/login",
    },
  },
}
```

### Strategies Configuration

The auth module supports three built-in strategy types:

1. **Password Strategy** - Email/password authentication
2. **OAuth Strategy** - OAuth 2.0/OpenID Connect providers
3. **Custom OAuth Strategy** - Custom OAuth 2.0 providers

#### Password Strategy

Email/password authentication with configurable hashing algorithms.

```typescript
{
  auth: {
    enabled: true,
    strategies: {
      password: {
        type: "password",
        enabled: true,
        config: {
          hashing: "sha256", // "plain", "sha256", or "bcrypt"
          rounds: 4, // Only for bcrypt (1-10)
          minLength: 8, // Minimum password length (default: 8, minimum: 1)
        },
      },
    },
  },
}
```

**Hashing Options:**

- `plain` - Plain text (not recommended for production)
- `sha256` - SHA-256 hashing (default)
- `bcrypt` - Bcrypt hashing with configurable rounds (1-10, default 4)

**Password Configuration:**

| Property | Type | Default | Description |
|-----------|------|----------|-------------|
| `minLength` | number | `8` | Minimum password length (minimum: 1) |

**Password Requirements:**

- Password must meet configured minimum length (default: 8 characters)
- Password length validation is configurable via `minLength` option

#### OAuth Strategy

Built-in OAuth 2.0 and OpenID Connect providers.

```typescript
{
  auth: {
    enabled: true,
    strategies: {
      google: {
        type: "oauth",
        enabled: true,
        config: {
          name: "google", // or "github", "discord", etc.
          type: "oidc", // "oidc" or "oauth2"
          client: {
            client_id: "your-client-id",
            client_secret: "your-client-secret",
          },
        },
      },
    },
  },
}
```

**Built-in Providers:**

- Google (`google`)
- GitHub (`github`)
- Discord (`discord`)
- Facebook (`facebook`)

**OAuth Strategy Properties:**

| Property | Type | Required | Description |
|-----------|------|-----------|-------------|
| `name` | string | Yes | Provider name (must match built-in or custom provider). |
| `type` | `"oidc" \| "oauth2"` | No | Protocol type. Default `"oauth2"`. |
| `client.client_id` | string | Yes | OAuth client ID from provider. |
| `client.client_secret` | string | Yes | OAuth client secret from provider. |

#### Custom OAuth Strategy

Define custom OAuth 2.0 providers with full control over authorization server and profile mapping.

```typescript
{
  auth: {
    enabled: true,
    strategies: {
      custom_provider: {
        type: "custom_oauth",
        enabled: true,
        config: {
          name: "custom_provider",
          type: "oauth2", // or "oidc"
          as: {
            issuer: "https://auth.example.com",
            authorization_endpoint: "https://auth.example.com/authorize",
            token_endpoint: "https://auth.example.com/token",
            userinfo_endpoint: "https://auth.example.com/userinfo",
            scopes_supported: ["openid", "email", "profile"],
          },
          client: {
            client_id: "your-client-id",
            client_secret: "your-client-secret",
            token_endpoint_auth_method: "client_secret_post",
          },
          profile: (userInfo, config, tokenResponse) => {
            return {
              sub: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
            };
          },
        },
      },
    },
  },
}
```

**Custom OAuth Configuration:**

| Property | Type | Required | Description |
|-----------|------|-----------|-------------|
| `name` | string | Yes | Unique identifier for this strategy. |
| `type` | `"oidc" \| "oauth2"` | Yes | Protocol type. |
| `as.issuer` | string | Yes | OAuth server issuer URL. |
| `as.authorization_endpoint` | string | Yes | Authorization URL for initiating OAuth flow. |
| `as.token_endpoint` | string | Yes | Token exchange endpoint. |
| `as.userinfo_endpoint` | string | No | User profile endpoint. |
| `as.scopes_supported` | string[] | Yes | Supported scopes. |
| `client.client_id` | string | Yes | OAuth client ID. |
| `client.client_secret` | string | Yes | OAuth client secret. |
| `client.token_endpoint_auth_method` | string | Yes | Authentication method for token endpoint. |
| `profile` | function | Yes | Map OAuth user info to Bknd user profile. |

**Profile Function:**

```typescript
(profile: any, config: CustomOAuthConfig, tokenResponse: any) => Promise<{
  sub: string;  // Subject (unique identifier)
  email: string;
  [key: string]: any;
}>
```

### Roles and Permissions

Configure roles and their permissions for authorization.

```typescript
{
  auth: {
    enabled: true,
    guard: {
      enabled: true,
    },
    roles: {
      admin: {
        is_default: false,
        implicit_allow: true, // ⚠️ Allows all permissions (use with caution)
        permissions: [],
      },
      user: {
        is_default: true,
        implicit_allow: false,
        permissions: [
          {
            permission: "entityRead",
            effect: "allow",
            policies: [],
          },
        ],
      },
      guest: {
        is_default: false,
        implicit_allow: false,
        permissions: [
          {
            permission: "entityRead",
            effect: "filter",
            policies: [
              {
                condition: { entity: "posts" },
                filter: { published: true },
              },
            ],
          },
        ],
      },
    },
  },
}
```

**Role Properties:**

| Property | Type | Default | Description |
|-----------|------|----------|-------------|
| `is_default` | boolean | `false` | Default role assigned to users without an explicit role. |
| `implicit_allow` | boolean | `false` | Allow all permissions for this role (security risk). |
| `permissions` | array | `[]` | List of permissions and policies for this role. |

**Permission Effects:**

- `allow` - Explicitly grants access when condition is met.
- `deny` - Revokes access (takes precedence over allow).
- `filter` - Filters data based on query criteria (row-level security).

### Schema Permissions

Schema operations (reading and modifying application schema) are protected by system-level permissions.

**Schema Permissions:**

| Permission | Description | Context |
|------------|-------------|---------|
| `system.schema.read` | Read application schema and configuration | `{ module?: string }` - Optional module filter |

**Protected Endpoints:**

Schema operations are protected by the `system.schema.read` permission:

- `GET /api/system/schema` - Get current schema
- `GET /api/system/config` - Get configuration (module-specific)
- `GET /api/data/schema` - Get data schema
- `GET /api/data/config` - Get data configuration

**Schema Permission Examples:**

```typescript
// Role with full schema access
{
  roles: {
    admin: {
      is_default: false,
      permissions: [
        {
          permission: "system.schema.read",
          effect: "allow",
        },
      ],
    },
  },
}
```

```typescript
// Role with limited schema access (only data module)
{
  roles: {
    data_admin: {
      is_default: false,
      permissions: [
        {
          permission: "system.schema.read",
          effect: "allow",
          policies: [
            {
              condition: { module: "data" },
            },
          ],
        },
      ],
    },
  },
}
```

**Note:** Default user roles typically do not have schema permissions. Schema operations are restricted to admin roles.

## Session Management

Bknd provides secure session management with JWT tokens and HTTP-only cookies.

### Sliding Session Expiration

When `cookie.renew` is enabled (default), sessions automatically extend as the user remains active. On every authenticated request, the cookie expiration is reset to the configured duration.

**How it works:**

1. User authenticates, receives cookie with expiration time
2. User makes authenticated request
3. Bknd detects valid session and resets cookie expiration
4. Session continues indefinitely as long as user remains active

**Configuration example:**

```typescript
{
  auth: {
    cookie: {
      expires: 3600, // 1 hour
      renew: true, // Enable sliding session
    },
  },
}
```

With this configuration, the session expires after 1 hour of **inactivity**, not 1 hour from login.

### JWT vs Cookie Expiration

Bknd supports two-layer expiration for defense-in-depth:

```typescript
{
  auth: {
    jwt: {
      expires: 1800, // 30 minutes
    },
    cookie: {
      expires: 604800, // 1 week
    },
  },
}
```

**Behavior:**

- JWT token expires after 30 minutes
- Cookie expires after 1 week
- With `renew: true`, cookie refreshes every authenticated request
- Session remains active until cookie expires (1 week of inactivity)

**Recommendation:** Configure JWT expiration for security, cookie expiration for session duration.

## API Endpoints

The Auth module automatically registers the following endpoints at the configured base path (default `/api/auth`).

### Authentication Endpoints

#### `GET /api/auth/strategies`

Get available authentication strategies.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|-----------|-------------|
| `include_disabled` | boolean | No | Include disabled strategies in response. |

**Response:**

```json
{
  "strategies": {
    "password": {
      "type": "password",
      "enabled": true,
      "config": {}
    }
  },
  "basepath": "/api/auth"
}
```

#### `GET /api/auth/me`

Get the current authenticated user.

**Response:**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

Returns `403` if not authenticated.

#### `GET /api/auth/logout`

Logout the current user and clear auth cookie.

**Behavior:**

- Deletes auth cookie
- Clears session
- Invalidates JWT token
- Redirects to referer or configured `pathLoggedOut`
- Returns JSON `{ ok: true }` for JSON requests

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|-----------|-------------|
| `redirect` | string | No | Redirect URL after logout (overrides `pathLoggedOut`). |

**Response Types:**

- **Redirect:** Redirects to `redirect` query param, referer, or `pathLoggedOut` (default for browser requests)
- **JSON:** Returns `{ ok: true }` for API requests with `Accept: application/json` header

**Example:**

```bash
# Browser redirect (default)
GET /api/auth/logout
# Response: 302 redirect to configured pathLoggedOut

# API logout with JSON response
GET /api/auth/logout
Headers: Accept: application/json
# Response: 200 { "ok": true }

# Custom redirect
GET /api/auth/logout?redirect=/custom/logout/page
# Response: 302 redirect to /custom/logout/page
```

### Password Strategy Endpoints

#### `POST /api/auth/password/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|-----------|-------------|
| `redirect` | string | No | Redirect URL after successful login. |

**Response Types:**

- **Redirect:** Redirects to configured `pathSuccess` or provided `redirect`
- **JSON:** Returns `{ user: {...}, token: "..." }`

**Errors:**

- `400` - Invalid email or password
- `401` - Credentials not found

#### `POST /api/auth/password/register`

Register a new user with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|-----------|-------------|
| `redirect` | string | No | Redirect URL after successful registration. |

**Response Types:**

- **Redirect:** Redirects to configured `pathSuccess` or provided `redirect`
- **JSON:** Returns `{ user: {...}, token: "..." }`

**Validation:**

- Email must be valid format
- Password must be at least 8 characters
- User email must be unique

**Errors:**

- `400` - Invalid email format or password too short
- `409` - Email already registered

### OAuth Strategy Endpoints

OAuth strategies register the following endpoints for each provider (e.g., `/api/auth/google/*`):

#### `GET /api/auth/{strategy}/login`

Initiate OAuth authorization flow.

**Query Parameters:**

None required. Parameters are set via signed cookie.

**Response Types:**

- **Redirect:** Redirects to OAuth provider authorization URL
- **JSON:** Returns `{ url: "...", challenge: "...", action: "login" }` (debug mode)

#### `POST /api/auth/{strategy}/login`

Initiate OAuth authorization flow (for programmatic access).

**Request Body:**

None required.

**Response:**

```json
{
  "url": "https://provider.com/authorize?...",
  "challenge": "random-state",
  "action": "login"
}
```

Use the returned `url` to redirect user to OAuth provider, and store `challenge` for callback validation.

#### `GET /api/auth/{strategy}/register`

Initiate OAuth registration flow.

**Response Types:**

- **Redirect:** Redirects to OAuth provider authorization URL
- **JSON:** Returns `{ url: "...", challenge: "...", action: "register" }` (debug mode)

#### `GET /api/auth/{strategy}/callback`

Handle OAuth provider callback.

**Query Parameters:**

Provided by OAuth provider (e.g., `code`, `state`).

**Behavior:**

1. Validates callback parameters
2. Exchanges authorization code for access token
3. Fetches user profile from provider
4. Creates or logs in user
5. Sets auth cookie
6. Redirects to configured `pathSuccess` or referer

**Response Types:**

- **Redirect:** Redirects after successful OAuth flow
- **JSON:** Returns `{ user: {...}, token: "..." }` for programmatic access

#### `GET /api/auth/{strategy}/token`

Exchange OAuth authorization code for token (for programmatic OAuth flow).

**Response:**

```json
{
  "code": "authorization-code-from-callback"
}
```

Use this code to complete the OAuth flow programmatically.

### User Management Endpoints (Protected)

#### `POST /api/auth/{strategy}/create`

Create a new user (protected by `auth.user.create` permission).

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**

```json
{
  "success": true,
  "action": "create",
  "strategy": "password",
  "data": {
    "id": 2,
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Permissions Required:**

- `auth.user.create`
- `entityCreate` (for users entity)

#### `GET /api/auth/{strategy}/create/schema.json`

Get the schema for creating users.

**Response:**

```json
{
  "type": "object",
  "properties": {
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 },
    "role": { "type": "string" }
  }
}
```

## Programmatic User Creation

Bknd provides programmatic methods for creating users in your application code.

### Using App.createUser

Simple method for creating users with password hashing handled automatically.

```typescript
const app = createApp({ /* config */ });
await app.build();

const user = await app.auth.createUser({
  email: "admin@example.com",
  password: "securepassword",
  role: "admin",
});

console.log(user.id, user.email);
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|-----------|-------------|
| `email` | string | Yes | User email address. |
| `password` | string | Yes | User password (hashed automatically). |
| `role` | string | No | User role (must be configured in auth.roles). |

**Requires:** Auth module enabled, password strategy configured.

### Using UserPool

For more control over user creation and lookup.

```typescript
import type { CreateUser, User } from "bknd";

const userPool = app.auth.authenticator.userPool;

// Create user
const profile: CreateUser = {
  email: "user@example.com",
  strategy_value: await hash("password"), // Must hash password yourself
  role: "user",
};

const user = await userPool.create("password", profile);

// Find user
const found = await userPool.findBy("password", "email", "user@example.com");
```

**UserPool Methods:**

- `findBy(strategy, prop, value)` - Find user by strategy and property
- `create(strategy, user)` - Create new user with hashed password

**Note:** When using UserPool directly, you must hash passwords using the configured PasswordStrategy.

### Using EntityManager

Full control over user entity (not recommended for production).

```typescript
import { em, entity } from "bknd/data";

const usersEntity = entity("users", {
  email: text().required(),
  password: text(), // Don't use this field directly
});

// Insert user
const mutator = em.mutator("users");
const { data: user } = await mutator.insertOne({
  email: "user@example.com",
  strategy: "password",
  strategy_value: await hashPassword("password"), // Must hash yourself
});
```

**Warning:** Requires manual password hashing and handling of hidden fields. Use `App.createUser` instead.

## Password Management

### Change User Password

Change a user's password programmatically.

```typescript
const userId = 1;
const newPassword = "new-secure-password";

const success = await app.auth.changePassword(userId, newPassword);

console.log(success); // true
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|-----------|-------------|
| `userId` | number \| string | Yes | User ID (integer or UUID). |
| `newPassword` | string | Yes | New password (hashed automatically). |

**Errors:**

- `Error: User not found` - User ID does not exist
- `Error: User is not using password strategy` - User registered with OAuth or other strategy

**Requires:** Auth module enabled, password strategy configured.

## Authentication Strategies

### Strategy Comparison

| Aspect | Password | OAuth | Custom OAuth |
|---------|-----------|---------|--------------|
| **Credential Type** | Email/password | External provider | External provider |
| **User Storage** | Password hash | OAuth token | OAuth token |
| **Registration** | Via API | Via OAuth flow | Via OAuth flow |
| **Token Management** | None | Provider handles | Provider handles |
| **Use Case** | Traditional auth | Social login | Enterprise SSO |

### Strategy Type

Each strategy has a `type` property:

- `form` - Credentials submitted via POST form (password strategy)
- `external` - Credentials obtained via external provider (OAuth strategies)

This affects how endpoints are registered and how flows work.

## Security Best Practices

### JWT Configuration

1. **Set a strong secret:** Auto-generate or use a cryptographically secure secret.
2. **Configure expiration:** Set `jwt.expires` for security defense-in-depth.
3. **Use HTTPS:** Always use `secure: true` for production.
4. **Limit fields:** Only include necessary fields in JWT payload.

### Cookie Configuration

1. **Enable `httpOnly`:** Prevent XSS attacks from stealing tokens.
2. **Use `sameSite: "strict"` or `"lax":` Prevent CSRF attacks.
3. **Set `secure: true`:** Only transmit cookies over HTTPS.
4. **Configure `renew: true`:** Enable sliding sessions for better UX.
5. **Set reasonable expiration:** Balance security and UX (1-7 days typical).

### Password Strategy

1. **Use bcrypt hashing:** More secure than SHA-256.
2. **Set rounds appropriately:** 4 rounds = default, 10 rounds = maximum security.
3. **Enforce strong passwords:** Implement client-side validation (minimum 8 chars).
4. **Never log passwords:** Bknd hides `strategy_value` field from logs.

### OAuth Strategy

1. **Use `type: "oidc"` for OpenID Connect:** More secure than OAuth 2.0.
2. **Validate `redirect_uri`:** Only allow your domain in OAuth redirect.
3. **Store secrets securely:** Use environment variables for `client_secret`.
4. **Implement PKCE:** Bknd automatically enables PKCE for supported providers.

## Troubleshooting

### Common Issues

#### "Cannot sign JWT without a secret"

**Cause:** JWT secret is empty.

**Solution:**
- Let Bknd auto-generate a secret (recommended for development)
- Set a secure secret in production via environment variable

#### "Password strategy cannot be disabled"

**Cause:** Attempting to disable password strategy.

**Solution:** Password strategy is always enabled. You can configure it, but cannot disable it.

#### "User signed up with a different strategy"

**Cause:** Attempting to login with different strategy than registration used.

**Solution:** Users must login using the same strategy they registered with.

#### Cookie not setting

**Cause:** Cookie configuration incorrect for environment.

**Solution:**
- Check `domain` is correct for your environment
- Ensure `secure: true` if using HTTPS
- Check `path` includes your application routes

#### Session expiring too quickly

**Cause:** JWT expiration is shorter than expected.

**Solution:**
- Increase `jwt.expires` value
- Ensure `cookie.renew` is `true` for sliding session
- Check that authenticated requests are being made regularly

### Debug Mode

Enable debug logging to troubleshoot authentication issues:

```typescript
// In development
process.env.DEBUG = "bknd:*";

// Or set environment variable
// DEBUG=bknd:* npm run dev
```

## Limitations and TODOs

Based on source code analysis, following limitations are known:

1. **Password strategy cannot be disabled:** Always required, even if not used.
2. **No refresh token rotation:** Only sliding session expiration is supported.
3. **Password change via API:** Requires programmatic method, no HTTP endpoint.
4. **User field configuration:** Limited to email, role, and strategy fields by default.

## Related Documentation

- [Add Authentication with Permissions Tutorial](../getting-started/add-authentication.md)
- [Email OTP Authentication Guide](../how-to-guides/auth/email-otp.md)
- [Enable Public Access with Guard Guide](../how-to-guides/auth/public-access-guard.md)
- [Create First User Guide](../how-to-guides/auth/create-first-user.md)
- [Guard and RBAC](../architecture-and-concepts/guard-rbac.md)
- [SDK Reference](./sdk-reference.md)
