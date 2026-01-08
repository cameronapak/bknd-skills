## Bknd vs PocketBase Feature Comparison

![Bknd vs PocketBase](../assets/bknd-vs-pocketbase.png)

**Choosing a backend framework can feel overwhelming when you're just starting out.** You want something that won't lock you into complex decisions, but also scales as your skills grow. This comparison breaks down two popular options, Bknd and [PocketBase](https://pocketbase.io/), so you can see not just what they do, but how their different approaches might fit your learning journey and future projects. 

### Core Architecture & Tech Stack

| Dimension | Bknd | PocketBase |
|-----------|------|------------|
| **Programming Language** | TypeScript/JavaScript | Go |
| **Architecture Philosophy** | Modular, composable, embeddable | All-in-one, standalone service |
| **Deployment Approach** | Embeddable, standalone, serverless | Standalone service (single binary) |
| **Web Standards** | Based on WinterTC Minimum Common Web Platform API | Custom Go implementation |
| **Package Size** | ~300KB gzipped (minimal) | ~15MB (single executable) |

### Database Support

| Dimension | Bknd | PocketBase |
|-----------|------|------------|
| **SQLite Family** | ✅ LibSQL, Node SQLite, Bun SQLite, Cloudflare D1, SQLocal | ✅ SQLite 3 (built-in) |
| **PostgreSQL** | ✅ Vanilla Postgres, Supabase, Neon, Xata | ❌ Not supported |
| **Extensibility** | Extensible via adapter pattern | Limited to SQLite |

### Runtimes & Deployment Environments

| Dimension | Bknd | PocketBase |
|-----------|------|------------|
| **Node.js** | ✅ 22+ | ❌ Not supported |
| **Bun** | ✅ 1.0+ | ❌ Not supported |
| **Deno** | ✅ | ❌ Not supported |
| **Browser** | ✅ | ❌ Not supported |
| **Cloudflare Workers/Pages** | ✅ | ❌ Not supported |
| **Vercel/Netlify** | ✅ | ❌ Requires external container |
| **AWS Lambda** | ✅ | ❌ Requires external container |
| **Docker** | ✅ | ✅ |
| **Standalone** | ✅ CLI mode | ✅ Primary mode |

### Core Feature Modules

| Dimension | Bknd | PocketBase |
|-----------|------|------------|
| **Data Module** | ✅ Modular design, RLS support | ✅ Entity system, RLS |
| **Auth Module** | ✅ Email/Password (SHA-256), OAuth/OIDC, JWT, session management | ✅ Email/Password, OAuth2 (6+ providers), OTP via email, MFA (2 methods required), email verification, password reset, user impersonation |
| **Media Module** | ✅ Multiple storage backends (S3, R2, Cloudinary, local) | ✅ Local file storage |
| **Workflows** | ⚠️ Flows system (coming soon) | ❌ Not built-in |
| **MCP Integration** | ✅ Server, client, UI | ❌ Not supported |

### Admin & Management Features

| Dimension | Bknd | PocketBase |
|-----------|------|------------|
| **Admin Dashboard** | ✅ Embedded Admin UI (visual + code modes) | ✅ Built-in admin interface |
| **Cron Jobs** | ❌ Not available | ✅ Built-in cron service |
| **Backup/Restore** | ❌ Not available | ✅ Built-in backup service |
| **Log Management** | ❌ Not available | ✅ Built-in log service |

### Frontend Integration

| Dimension | Bknd | PocketBase |
|-----------|------|------------|
| **React Integration** | ✅ Embeddable Admin UI, React Elements | ❌ External admin interface |
| **Next.js** | ✅ Full integration | ❌ Requires separate deployment |
| **React Router** | ✅ Full integration | ❌ Requires separate deployment |
| **Astro** | ✅ Full integration | ❌ Requires separate deployment |
| **TypeScript SDK** | ✅ Auto-generated from schema with full type inference | ✅ TypeScript with manual generic type definitions |
| **Caching & State Management** | ✅ Built-in SWR with auto-invalidation | ❌ Manual cache management |
| **React Hooks** | ✅ useApi, useEntity, useApiQuery, useEntityQuery | ⚠️ Basic SDK |
| **Auto-config Components** | ✅ Media.Dropzone, login/register forms | ❌ Manual build required |

### API & Developer Experience

| Dimension | Bknd | PocketBase |
|-----------|------|------------|
| **REST API** | ✅ Complete OpenAPI spec | ✅ REST API |
| **Real-time Features** | ⚠️ Custom implementation (event-based) | ✅ Built-in Server-Sent Events (SSE), robust realtime subscriptions |
| **Type Safety** | ✅ Full TypeScript support | ✅ TypeScript with manual generic definitions |
| **Database Migrations** | ✅ Schema builder, version management | ✅ Built-in migrations |
| **Query Language** | ✅ SQL-based with chainable API (e.g., `.where({ views: { $gt: 100 } })`) | ✅ Custom query syntax (e.g., `title ~ 'text'`, `created > '2022-01-01'`) |
| **Permissions System** | ✅ RLS + RBAC + custom permissions | ✅ RLS |

### Extensibility & Flexibility

| Dimension | Bknd | PocketBase |
|-----------|------|------------|
| **Plugin System** | ✅ AppPlugin architecture | ⚠️ JavaScript hooks |
| **Event System** | ✅ Complete event architecture | ⚠️ Basic hooks |
| **Custom Adapters** | ✅ Database, storage, runtime adapters | ⚠️ Limited extension |
| **Middleware** | ✅ Hono-based | ⚠️ Basic support |
| **Custom Logic** | ✅ Add routes in same app | ⚠️ Requires external service |

### When to Choose Bknd

Here's the thing — both are great, but they solve different problems. Let me break it down honestly:

**Choose Bknd if you're:**
- Wanting **first-class TypeScript support** with auto-generated types from your schema
- Deploying to **multiple environments** — serverless (Vercel, Netlify, Cloudflare Workers), edge, or traditional hosting
- Working with **PostgreSQL or want database flexibility** (not locked into SQLite)
- Wanting **seamless React integration** with hooks like `useAuth`, `useEntity`, `useApiQuery` — and automatic cache management
- Preferring to **embed your backend** directly into your Next.js, Astro, React Router app, or other server-rendering environment
- Building for **edge** and need your backend to run everywhere JavaScript does

**Choose PocketBase if you're:**
- Looking for **built-in realtime** out of the box without custom implementation
- Need **admin tools** like cron jobs, backups, and log management included
- Happy with **SQLite-only** databases and don't need PostgreSQL support

Both are open source and community-driven, so you really can't go wrong. Bknd leans into modern web development (TypeScript, React, edge), while PocketBase offers a more traditional, feature-complete backend package.

Based on what you see in these tables, we'll let you decide what is best for your needs as you develop full-stack applications. Please consider Bknd. Bknd is 100% free to use and is open source.

Check out Bknd at https://bknd.io
