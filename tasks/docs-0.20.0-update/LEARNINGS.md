## Task 19.0: License Update - Apache 2.0

### What I learned:
- Bknd is licensed under Apache-2.0 license (verified from GitHub repo)
- Apache-2.0 is permissive license allowing commercial use, modification, and distribution
- When updating docs for license changes, update both README.md (description + dedicated section) and docs/index.md (Official Resources section)
- License information should be prominent in documentation repositories to set clear expectations for users
- Always verify license from official sources (GitHub LICENSE.md file, not just assumptions)

## Task 4.0: Auth Module Updates (v0.20.0)

### What I learned:
- **Source code verification is critical**: Use opensrc to fetch package source and verify actual implementation before updating docs
  - Task descriptions may contain outdated information (e.g., "password length is hardcoded" was incorrect for v0.20.0)
  - Search source for actual configuration options (e.g., `minLength` in PasswordStrategy.ts)
  - Verify permission names from SystemPermissions exports
- **New auth config options in v0.20.0**:
  - `default_role_register` - Set default role for newly registered users (must match configured role)
  - `minLength` in password config - Configurable password minimum length (default: 8, minimum: 1)
- **Schema permissions**: Schema operations protected by `system.schema.read` permission with optional module context filter
- **logout endpoint**: Supports `redirect` query parameter to override configured `pathLoggedOut`
- **Documentation update workflow**:
  1. Read existing file to understand structure
  2. Use opensrc to verify implementation details
  3. Update configuration tables with new options
  4. Remove outdated TODO notes
  5. Add examples for new features

## Task 6.0: React SDK Updates (v0.20.0)

### What I learned:
- **`useApi()` hook provides direct access to API modules**: The `api` object includes `data`, `auth`, `media`, and `system` modules
- **Direct API usage vs. hooks**: While `useAuth()` provides `logout()` method, you can also access `api.auth.logout()` directly through `useApi()`
- **Auth API logout behavior**: Calls `/api/auth/logout` endpoint with `Accept: application/json` header to prevent redirect, then triggers `onTokenUpdate` callback to clear token
- **Documentation organization**: When documenting SDK methods, show both hook-level convenience methods (like `useAuth().logout()`) and direct API access (like `api.auth.logout()`)
- **React SDK already had logout documented**: Task 6.0 items 6.2 and 6.3 were already complete - only needed to add direct API usage documentation in `useApi()` section

## Task 5.0: Data Module Updates (v0.20.0)

### What I learned:
- **readOneBy method**: Alternative to findOne that uses findMany with limit: 1 internally
  - Supports more query options (where, select, join, with) compared to findOne
  - Excludes limit, offset, and sort (automatically set to limit: 1, offset: 0)
  - Returns same result structure as findOne
  - Use case: When you need field selection or joins in single-record queries
- **Auto-join behavior**: Automatic joins triggered when filtering by related entity fields
  - Uses dot notation in where clause (e.g., `{"author.username": "john"}`)
  - Bknd automatically adds necessary joins behind the scenes
  - Checks if related field exists in relationship before adding join
  - Index warnings triggered for non-indexed related fields
  - Performance considerations: Auto-joins are convenient but may load unnecessary data; manual joins with explicit field selection can be more efficient
- **uploadToEntity overwrite parameter**: Media API method for uploading files to entity fields
  - `overwrite` parameter (boolean) controls behavior when file already exists
  - Default (overwrite not set): Error if file exists
  - `overwrite: true`: Replaces existing file with new one
  - Use case: Allow replacing profile pictures, cover images, etc. in update operations
- **Documentation structure**: When adding new methods, place them logically near related methods
  - readOneBy placed after findOne (both are single-record read methods)
  - Auto-join section added after Eager Loading Relations (both relate to joins)
  - Media Uploads added to Mutator API (Media API accessed through app.media)