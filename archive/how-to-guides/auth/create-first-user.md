---
title: "Create First User"
description: "Learn how to create users in Bknd via Admin UI, CLI, or programmatic methods."
---

Learn how to create users in Bknd using different methods. Users are stored in the entity configured for authentication (default: `users`).

## Prerequisites

Before creating users, ensure:
- [ ] Auth module is enabled in your `bknd.config.ts`
- [ ] A password strategy is configured
- [ ] Your database is initialized and schema is synced

## Method 1: Admin UI

**Status**: ⚠️ Unable to confirm exact workflow

The Admin UI provides a visual interface for managing users, but the exact steps are currently unclear. Based on available information:

**What we know:**
- Admin UI is accessible at `/admin` by default
- The Admin UI can manage data including users
- It provides a full graphical user interface for backend management

**What we don't know:**
- Exact location of user creation in the Admin UI (specific tab or menu)
- Required fields in the Admin UI form
- Whether users are created under a dedicated "Users" section or within the general Data module

**Next steps:**
- Visit `http://localhost:3000/admin` (or your configured admin path)
- Look for tabs or sections related to "Users", "Authentication", or "Data"
- Check if there's a "Create User" or similar button

**TODO**: This section needs to be updated after testing the Admin UI user creation flow. If you have experience using the Admin UI to create users, please contribute.

## Method 2: CLI (Recommended for First User)

Use the CLI to create users quickly, especially for your initial admin user.

### Step 1: Create User Command

Run the following command in your project directory:

```bash
npx bknd user create
```

### Step 2: Provide User Information

The CLI will prompt you for:

1. **Role** (optional): Select from configured roles or choose `<none>`
   ```
   Select role
   > admin
   > editor
   > viewer
   > <none>
   ```

2. **Email**: Enter the user's email address
   ```
   Enter email
   > admin@example.com
   ```

3. **Password**: Enter a password (minimum 3 characters)
   ```
   Enter password
   > ••••••
   ```

### Step 3: Confirmation

If successful, you'll see:

```
✓ Created user: admin@example.com
```

### Using CLI Options

You can also specify configuration file and database URL:

```bash
npx bknd user create --config ./bknd.config.ts --db-url file:./database.db
```

### Requirements

- **Auth module must be enabled**: The command will fail if `auth.enabled: false`
- **Password strategy must be configured**: The command requires a password strategy
- **Node runtime**: Some commands (like token generation) require Node.js runtime

### Additional CLI Commands

```bash
# Update a user's password
npx bknd user update

# Generate a JWT token for a user (Node.js only)
npx bknd user token
```

## Method 3: Programmatic (Custom Applications)

For creating users programmatically in your application code.

### Using App.createUser()

Bknd provides a helper method on the App instance:

```typescript
import { createApp } from "bknd";

const app = createApp(config);
await app.build();

// Create a user with email/password
const user = await app.createUser({
  email: "user@example.com",
  password: "hashed_password_here",
  role: "admin", // optional
});

console.log(user); // { id, email, role, ... }
```

### Using AppUserPool Directly

For more control, use the UserPool from the Auth module:

```typescript
const auth = app.module.auth;

// Create a user with password strategy
const user = await auth.userPool.create("password", {
  email: "user@example.com",
  strategy_value: "hashed_password_here", // Required: stores email/password hash
  role: "admin", // optional
  profile: { // optional additional fields
    name: "John Doe"
  }
});

console.log(user);
```

### Using EntityManager

For full control, use the EntityManager directly:

```typescript
const em = app.modules.ctx().em;
const usersRepo = em.repository("users");

// Note: You must hash passwords yourself when using EntityManager
const user = await usersRepo.insertOne({
  email: "user@example.com",
  strategy: "password",
  strategy_value: "hashed_password_here", // This field must be set
  role: "admin",
});

console.log(user);
```

**Important**: When using EntityManager directly, you must hash passwords using configured strategy:

```typescript
import { PasswordStrategy } from "bknd/auth";

const strategy = new PasswordStrategy({
  hashing: "sha256", // or "bcrypt"
});

const hashedPassword = await strategy.hash("plaintext_password");

// Then use hashedPassword in your user creation
```

## Method 4: OAuth Users (Automatic Creation)

OAuth users are created automatically when they first authenticate through an OAuth provider (Google, GitHub, etc.). This process is handled by the OAuth strategy's callback handler.

### How OAuth User Creation Works

**Flow:**
1. User initiates OAuth login → Redirects to provider
2. Provider redirects back with authorization code → Bknd exchanges code for access token
3. Bknd fetches user profile from provider → Extracts `email` and `sub` (unique identifier)
4. **Login flow**: Authenticator looks up user by `email` in UserPool
5. **Register flow**: Authenticator creates new user automatically via UserPool

### Automatic User Creation Details

**What happens during OAuth callback (from `OAuthStrategy.ts`):**

```typescript
// Lines 242-262 in app/src/auth/authenticate/strategies/oauth/OAuthStrategy.ts
hono.get("/callback", async (c) => {
  const profile = await this.callback(params, {
    redirect_uri,
    state: state.state,
  });

  const safeProfile = {
    email: profile.email,         // Extracted from provider profile
    strategy_value: profile.sub,  // Provider's unique user ID
  } as const;

  const verify = async (user) => {
    if (user.strategy_value !== profile.sub) {
      throw new Exception("Invalid credentials");
    }
  };

  switch (state.action) {
    case "login":
      return auth.resolveLogin(c, this, safeProfile, verify, opts);
    case "register":
      return auth.resolveRegister(c, this, safeProfile, verify, opts);
  }
});
```

**UserPool.create() process (from `AppUserPool.ts`):**

```typescript
// Lines 24-42 in app/src/auth/AppUserPool.ts
async create(strategy: string, payload: CreateUser & Partial<Omit<User, "id">>) {
  const fields = this.users.getSelect(undefined, "create");
  const safeProfile = pick(payload, fields) as any;
  const createPayload: Omit<User, "id"> = {
    ...safeProfile,
    strategy,
  };

  const mutator = this.em.mutator(this.users);
  mutator.__unstable_toggleSystemEntityCreation(false);
  this.toggleStrategyValueVisibility(true); // Temporarily expose hidden fields
  const createResult = await mutator.insertOne(createPayload);
  mutator.__unstable_toggleSystemEntityCreation(true);
  this.toggleStrategyValueVisibility(false);

  return createResult.data;
}
```

### What Gets Stored in Database

OAuth user records contain:
- `email`: User's email from OAuth provider
- `strategy`: OAuth strategy name (e.g., "google", "github")
- `strategy_value`: Provider's unique user ID (the `sub` claim from JWT/ID token)
- `role`: Default role assigned by your configuration

**Note**: Passwords are not stored for OAuth users (`strategy_value` holds the provider's user ID instead).

### Built-in OAuth Providers

Bknd provides pre-configured support for:
- **Google**: OIDC provider with standard scopes
- **GitHub**: OAuth2 provider

Configuration example:
```typescript
export default {
  config: {
    auth: {
      strategies: {
        google: {
          type: "oidc",
          enabled: true,
          config: {
            client: {
              client_id: process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
            },
          },
        },
        github: {
          type: "oauth2",
          enabled: true,
          config: {
            client: {
              client_id: process.env.GITHUB_CLIENT_ID,
              client_secret: process.env.GITHUB_CLIENT_SECRET,
            },
          },
        },
      },
    },
  },
} satisfies BkndConfig;
```

### Custom OAuth Providers

For providers not in the built-in list, create a custom OAuth strategy:

```typescript
import { CustomOAuthStrategy } from "bknd/auth";

const customStrategy = new CustomOAuthStrategy({
  name: "my-provider",
  type: "oauth2", // or "oidc"
  client: {
    client_id: process.env.PROVIDER_CLIENT_ID,
    client_secret: process.env.PROVIDER_CLIENT_SECRET,
    token_endpoint_auth_method: "client_secret_basic",
  },
  as: {
    issuer: "https://provider.com",
    authorization_endpoint: "https://provider.com/oauth/authorize",
    token_endpoint: "https://provider.com/oauth/token",
    userinfo_endpoint: "https://provider.com/oauth/userinfo",
    scopes_supported: ["openid", "profile", "email"],
  },
  profile: async (userInfo, config, tokenResponse) => {
    return {
      email: userInfo.email,
      sub: userInfo.id, // or userInfo.sub for OIDC
    };
  },
});
```

### User Creation vs Login Behavior

**Login action (`/api/auth/{strategy}/login`):**
- Looks for existing user with matching `email` and `strategy`
- If found: Authenticates and returns JWT
- If not found: Returns "User not found" error

**Register action (`/api/auth/{strategy}/register`):**
- Always creates a new user (if email doesn't exist)
- Requires user to be authenticated with the provider
- Automatically assigns default role

### Security Considerations

1. **Email verification**: OAuth providers typically verify email addresses, so you can trust the email
2. **Unique identifiers**: The `sub` (subject) claim uniquely identifies users across providers
3. **Strategy switching**: Users cannot authenticate with a different strategy once created (validation check in line 252 of `OAuthStrategy.ts`)
4. **Hidden fields**: `strategy` and `strategy_value` are hidden from normal API queries for security

### Troubleshooting OAuth User Creation

**"User not found" on login:**
- The user needs to register first (use `/register` endpoint instead of `/login`)
- Email might be different from what's stored in database

**"Invalid credentials":**
- User exists but `strategy_value` doesn't match the provider's user ID
- Possible cause: User was created with a different OAuth account

**"Callback URL mismatch":**
- Ensure `redirect_uri` matches your application's URL in OAuth provider settings

## Troubleshooting

### "Auth is not enabled"

```
✗ Auth is not enabled
```

**Solution**: Enable the auth module in your `bknd.config.ts`:

```typescript
export default {
  config: {
    auth: {
      enabled: true, // ← Set to true
      // ... other auth config
    }
  }
} satisfies BkndConfig;
```

### "Password strategy not configured"

```
✗ Password strategy not configured
```

**Solution**: Configure the password strategy in your auth config:

```typescript
export default {
  config: {
    auth: {
      enabled: true,
      strategies: {
        password: {
          type: "password",
          enabled: true,
          config: {
            hashing: "sha256", // or "bcrypt" (planned)
          },
        },
      },
    }
  }
} satisfies BkndConfig;
```

### "Invalid password" (CLI validation)

```
✗ Invalid password
```

**Solution**: The CLI requires passwords to be at least 3 characters. Use a stronger password in production.

### "User not found" (CLI update/token)

```
✗ User not found
```

**Solution**: Check that the user exists in your database:

```bash
# Verify database contains the user
sqlite3 database.db "SELECT email FROM users;"
```

## Next Steps

After creating your first user:

1. **Test authentication**: Use the CLI to generate a token:
   ```bash
   npx bknd user token
   ```

2. **Set up roles and permissions**: Configure roles in your `bknd.config.ts`:
   ```typescript
   export default {
     config: {
       auth: {
         roles: {
           admin: {
             permissions: ["*"], // Full access
           },
           user: {
             permissions: ["data.entity.read"],
           }
         }
       }
     }
   } satisfies BkndConfig;
   ```

3. **Protect your API**: Use the Guard to protect endpoints
4. **Create a signup form**: Use `bknd/elements` for pre-built auth components

## Related Documentation

- [Auth Module](/../reference/auth-module) - Complete auth module documentation
- [Add Authentication](/../getting-started/add-authentication) - Full authentication tutorial
- [Enable Public Access with Guard](/public-access-guard) - Configure permission-based access
- [Choose Your Mode](/setup/choose-your-mode) - Understanding configuration modes
