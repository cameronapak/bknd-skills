# Framework Comparison Guide

Choose the right framework for your Bknd integration based on your project requirements, team expertise, and deployment needs.

## Quick Decision Matrix

| Framework | Best For | Type | SSR | HMR | Learning Curve |
|-----------|-----------|------|-----|------|---------------|
| **Next.js** | Full-stack apps, production SaaS | Framework | ✅ Yes | ✅ Yes | Medium |
| **React Router** | Full-stack React apps | Framework | ✅ Yes | ✅ Yes | Medium |
| **Vite + React** | SPAs, rapid prototyping | Runtime | ❌ No | ✅ Yes | Low |
| **Astro** | Content sites, marketing pages | Framework | ✅ Yes | ✅ Yes | Low |
| **Bun/Node** | Standalone APIs, microservices | Runtime | ❌ No | ✅ Watch | Low |
| **Cloudflare Workers** | Edge deployment, global APIs | Runtime | ❌ No | ❌ No | High |

## Detailed Framework Comparison

### Next.js

**Integration Pattern:** Framework adapter with `bknd/adapter/nextjs`

**Best Use Cases:**
- Production SaaS applications
- E-commerce sites
- Complex dashboards
- Teams already using Next.js

**Strengths:**
- ✅ Deep App Router integration
- ✅ Server Components with full type safety
- ✅ Built-in API routes (`app/api/[[...bknd]]/route.ts`)
- ✅ Excellent SEO support
- ✅ Mature ecosystem
- ✅ Vercel deployment (one-click)
- ✅ Edge runtime support
- ✅ Server Actions support

**Considerations:**
- ⚠️ Heavier bundle size than lighter alternatives
- ⚠️ More complex for simple CRUD apps
- ⚠️ Requires Node.js 22+

**Key Integration Features:**
```typescript
// API Route
serve(config) // Export from app/api/[[...bknd]]/route.ts

// Server Component
const api = await getApi(); // Direct API access
const { data } = await api.data.readMany("todos");

// Client SDK
<ClientProvider> // Wrap in layout.tsx
const { user } = useAuth(); // Client hooks
```

**Deployment:**
- **Primary:** Vercel (native)
- **Alternatives:** Netlify, Cloudflare Pages, Railway, Render

---

### React Router

**Integration Pattern:** Framework adapter with `bknd/adapter/react-router`

**Best Use Cases:**
- Full-stack React applications
- Teams familiar with React Router v7
- Custom routing requirements
- Applications needing flexible routing

**Strengths:**
- ✅ Native loader/action pattern
- ✅ Full TypeScript support
- ✅ Lazy-loaded Admin UI
- ✅ Flexible routing
- ✅ Smaller bundle than Next.js
- ✅ Familiar React patterns

**Considerations:**
- ⚠️ API route setup unclear (`api.$.tsx` mentioned but not found)
- ⚠️ Less mature than Next.js
- ⚠️ Smaller ecosystem

**Key Integration Features:**
```typescript
// Helper pattern
export async function getApi(args, { verify }) {
  const app = await getApp();
  return app.getApi({ headers: args?.request.headers });
}

// Loader
export const loader = async (args: LoaderFunctionArgs) => {
  const api = await getApi(args, { verify: true });
  const { data } = await api.data.readMany("posts");
  return { posts: data };
};

// Action
export const action = async (args: ActionFunctionArgs) => {
  const api = await getApi();
  const formData = await args.request.formData();
  // Handle mutations
};
```

**Unknown Details:**
- ⚠️ API catch-all route setup method
- ⚠️ Whether to use React Router middleware for auth
- ⚠️ Client-side SDK integration patterns

**Deployment:**
- **Primary:** Vercel, Netlify
- **Alternatives:** Any Node.js hosting

---

### Astro

**Integration Pattern:** Framework adapter with `bknd/adapter/astro`

**Best Use Cases:**
- Content-focused websites
- Marketing pages
- Documentation sites
- Multi-framework projects
- Performance-critical sites

**Strengths:**
- ✅ Optimized for performance (small bundles)
- ✅ Multiple integration approaches (page-based, middleware)
- ✅ Zero JS by default
- ✅ Server-side rendering
- ✅ Simple setup
- ✅ Supports React islands

**Considerations:**
- ⚠️ React SDK compatibility unclear with islands
- ⚠️ Requires `client:only` for Admin UI
- ⚠️ Not ideal for complex applications
- ⚠️ Less suited for dashboard apps

**Two Integration Patterns:**

**1. Page-Based (Standard):**
```astro
---
import { getApi } from "../bknd";

// API route
const api = await getApi(Astro);
return api.fetch(Astro.request);
---

<!-- Admin UI -->
<Admin
  withProvider={{ user }}
  config={{ basepath: "/admin" }}
  client:only
/>
```

**2. Middleware (Advanced):**
```typescript
// src/middleware.ts
export const onRequest = async (context, next) => {
  if (url.pathname.startsWith("/api/")) {
    return app.server.fetch(context.request);
  }
  return next();
};
```

**Unknown Details:**
- ⚠️ React SDK compatibility with Astro islands
- ⚠️ Best practices for optimistic updates
- ⚠️ Performance benchmarks vs page-based approach

**Deployment:**
- **Primary:** Vercel, Netlify, Cloudflare Pages
- **Alternatives:** Any Node.js hosting with SSR

---

### Vite + React

**Integration Pattern:** Runtime adapter with `bknd/adapter/vite`

**Best Use Cases:**
- Standalone SPAs
- Rapid prototyping
- Teams familiar with Vite
- Development-focused projects
- Simple CRUD apps

**Strengths:**
- ✅ Fast development (HMR)
- ✅ Simple setup
- ✅ Lightweight
- ✅ Works with `@hono/vite-dev-server`
- ✅ Great for learning Bknd
- ✅ Easy to understand

**Considerations:**
- ❌ No SSR (client-side only)
- ⚠️ Requires separate backend in production
- ⚠️ SEO limitations
- ⚠️ Initial load performance (all client-side)

**Key Integration Features:**
```typescript
// server.ts
export default serve(config); // Creates Bknd server

// vite.config.ts
devServer({ entry: "./server.ts" }); // HMR plugin

// Client-side
const api = new Api(); // SDK usage
const { data } = await api.data.readMany("todos");
```

**Development:**
- Port: 5174 (not default 5173)
- API: `/api/*`
- Admin UI: `/` (root)
- HMR: Full hot module replacement

**Deployment:**
- **Primary:** Vercel, Netlify
- **Alternatives:** Any static hosting + Node.js backend

---

### Bun/Node (Standalone)

**Integration Pattern:** Runtime adapter with `bknd/adapter/bun` or `bknd/adapter/node`

**Best Use Cases:**
- Standalone API servers
- Microservices
- Mobile app backends
- Testing Bknd features
- Simple backend needs

**Strengths:**
- ✅ Simplest setup
- ✅ Minimal dependencies
- ✅ Fast (especially Bun)
- ✅ Great for microservices
- ✅ Full control over server
- ✅ CLI starter available

**Considerations:**
- ❌ No frontend included
- ❌ Manual frontend integration
- ⚠️ Requires separate frontend project
- ⚠️ Admin UI at `/_admin` path

**Key Integration Features:**
```typescript
// Bun
import { serve } from "bknd/adapter/bun";
serve({ connection: { url: "file:data.db" } });

// Node.js
import { serve } from "bknd/adapter/node";
serve({ connection: { url: "file:data.db" } });
```

**Runtime Comparison:**
| Aspect | Bun | Node.js |
|--------|-----|---------|
| Startup | Fastest | Slower |
| Memory | Lower | Higher |
| Ecosystem | Growing | Mature |
| Best For | Development | Production |

**Deployment:**
- **Bun:** Any hosting supporting Bun
- **Node.js:** Any Node.js hosting (Heroku, Railway, Render, etc.)
- **Docker:** Official Docker support

---

### Cloudflare Workers

**Integration Pattern:** Runtime adapter with `bknd/adapter/cloudflare`

**Best Use Cases:**
- Global edge deployment
- Low-latency APIs
- Serverless applications
- Multi-region needs

**Strengths:**
- ✅ Global CDN (200+ locations)
- ✅ Edge compute
- ✅ D1 database (SQL at edge)
- ✅ R2 storage (S3-compatible)
- ✅ No server management
- ✅ Pay-per-use pricing

**Considerations:**
- ❌ Limited execution time (CPU limit)
- ❌ No persistent local storage
- ⚠️ Learning curve for Workers
- ⚠️ Not ideal for long-running tasks

**Deployment:**
- Wrangler CLI
- Zero-config deployment
- Automatic preview environments

---

## Integration Pattern Comparison

### Data Fetching Approaches

| Framework | Server-Side | Client-Side | Pattern |
|-----------|-------------|--------------|----------|
| **Next.js** | ✅ Server Components | ✅ React SDK | `getApi()` in components |
| **React Router** | ✅ Loaders | ⚠️ Unclear | `getApi(args)` in loaders |
| **Astro** | ✅ Frontmatter | ⚠️ Unknown | `getApi(Astro)` in pages |
| **Vite + React** | ❌ No | ✅ SDK | `new Api()` client-side |
| **Bun/Node** | N/A (backend only) | Client SDK | REST API calls |

### API Route Setup

| Framework | Route File | Method | Complexity |
|-----------|------------|--------|------------|
| **Next.js** | `app/api/[[...bknd]]/route.ts` | `serve(config)` | Simple |
| **React Router** | Unknown (`api.$.tsx`?) | Unknown | Unclear |
| **Astro** | `pages/api/[...api].astro` | `api.fetch()` | Simple |
| **Vite + React** | Built-in to `server.ts` | `serve(config)` | Simple |
| **Bun/Node** | Built-in to server | `serve(config)` | Simple |

### Authentication Patterns

| Framework | Auth Verification | Session Management | Best Practice |
|-----------|------------------|-------------------|---------------|
| **Next.js** | `getApi({ verify: true })` | HTTP-only cookies | Server components |
| **React Router** | `getApi(args, { verify })` | HTTP-only cookies | Loader checks |
| **Astro** | `getApi(Astro, { verify })` | HTTP-only cookies | Middleware |
| **Vite + React** | SDK `useAuth()` hook | HTTP-only cookies | Client hooks |
| **Bun/Node** | JWT tokens in headers | Custom implementation | REST API |

---

## Recommendation Guide

### Choose Next.js if:
- ✅ Building a production SaaS application
- ✅ Need SEO (marketing site + app)
- ✅ Team already knows Next.js
- ✅ Want Vercel deployment (one-click)
- ✅ Need server components for performance

### Choose React Router if:
- ✅ Want full-stack React without Next.js complexity
- ✅ Need flexible routing
- ✅ Prefer loader/action pattern
- ✅ Want smaller bundle than Next.js
- ✅ Team prefers React Router

### Choose Astro if:
- ✅ Building content-focused site
- ✅ Need maximum performance
- ✅ Want zero-JS by default
- ✅ Building marketing/documentation site
- ✅ Multi-framework project

### Choose Vite + React if:
- ✅ Building a simple SPA
- ✅ Rapid prototyping
- ✅ Learning Bknd
- ✅ Team prefers Vite
- ✅ Don't need SSR

### Choose Bun/Node if:
- ✅ Need standalone backend
- ✅ Building mobile app backend
- ✅ Creating microservices
- ✅ Want maximum simplicity
- ✅ Already have separate frontend

### Choose Cloudflare Workers if:
- ✅ Need global edge deployment
- ✅ Want serverless architecture
- ✅ Need low latency worldwide
- ✅ Want pay-per-use pricing
- ✅ Comfortable with Workers

---

## Migration Paths

### From Vite + React to Next.js
1. Create Next.js project with Bknd
2. Copy `bknd.config.ts`
3. Migrate client components to Server Components
4. Replace SDK calls with `getApi()`
5. Set up API routes
6. Test thoroughly

### From Bun/Node to Framework
1. Create framework project with Bknd
2. Keep database schema
3. Move data logic to framework-specific pattern
4. Update API endpoints if needed
5. Deploy to new target

---

## Performance Considerations

### Bundle Size Impact

| Framework | Base Bundle | With Bknd | Total |
|-----------|-------------|------------|-------|
| **Next.js** | ~90 KB | ~60 KB | ~150 KB |
| **React Router** | ~50 KB | ~60 KB | ~110 KB |
| **Astro** | ~10 KB | ~20 KB | ~30 KB |
| **Vite + React** | ~50 KB | ~60 KB | ~110 KB |
| **Bun/Node** | 0 KB | N/A | N/A |

### Time to First Byte (TTFB)

| Framework | SSR | Edge | Avg TTFB |
|-----------|-----|------|----------|
| **Next.js** | ✅ | ✅ | ~100-200ms |
| **React Router** | ✅ | ❌ | ~150-300ms |
| **Astro** | ✅ | ✅ | ~50-150ms |
| **Vite + React** | ❌ | ❌ | ~300-500ms |
| **Bun/Node** | N/A | ❌ | ~50-100ms |

---

## Team Expertise Matrix

| Team Background | Recommended Framework |
|----------------|---------------------|
| **Next.js experts** | Next.js (obviously) |
| **React experts** | React Router or Vite + React |
| **Full-stack team** | Next.js or React Router |
| **Frontend team** | Astro or Vite + React |
| **Backend team** | Bun/Node (then add frontend) |
| **Generalist team** | Vite + React (easiest to learn) |

---

## Unknown Areas Requiring Research

The following aspects need further investigation:

### React Router Integration
- ⚠️ API catch-all route setup method
- ⚠️ Authentication best practices (middleware vs loaders)
- ⚠️ Client-side SDK integration patterns

### Astro Integration
- ⚠️ React SDK compatibility with islands
- ⚠️ Optimistic update patterns
- ⚠️ Performance benchmarks (page-based vs middleware)

### Framework-Specific Features
- ⚠️ Server Actions in frameworks other than Next.js
- ⚠️ Streaming SSR support
- ⚠️ Edge runtime compatibility
- ⚠️ WebAssembly support

### Performance Benchmarks
- ⚠️ Real-world bundle sizes
- ⚠️ Database query performance by framework
- ⚠️ Cold start times (serverless)

### Advanced Patterns
- ⚠️ Multi-tenant deployments
- ⚠️ Database connection pooling
- ⚠️ Caching strategies
- ⚠️ Error handling patterns

---

## Related Documentation

- [Next.js Integration Guide](/how-to-guides/setup/integrations/nextjs.md)
- [React Router Integration Guide](/how-to-guides/setup/integrations/react-router.md)
- [Astro Integration Guide](/how-to-guides/setup/integrations/astro.md)
- [Vite + React Integration Guide](/how-to-guides/setup/integrations/vite-react.md)
- [Bun/Node Standalone Setup](/how-to-guides/setup/integrations/bun-node.md)
- [Choose Your Mode](/how-to-guides/setup/choose-your-mode.md)
- [Deploy to Production](/getting-started/deploy-to-production.md)
