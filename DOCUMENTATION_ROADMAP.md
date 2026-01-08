# Bknd Documentation Improvement Roadmap

> [!WARNING]
> This came as a result of me riffing back and forth with AI, and there's no guarantee that this is actually helpful and accurate. The goal I had was to improve the documentation so that it's more approachable and that people can easily find the answers to the questions that they know that they have and the questions that they didn't know that they had. 
> — Cam

> **Status:** Planning Phase  
> **Last Updated:** January 8, 2026  
> **Target Audience:** Frontend developers who want a backend (primarily Next.js/React ecosystem)  
> **Documentation Sources:** Mintlify, Divio Documentation System

---

## Executive Summary

The current Bknd documentation is **technically accurate and comprehensive**, but it's organized around **what Bknd has** rather than **what developers need to accomplish**. This creates a significant onboarding barrier for newcomers who are overwhelmed by choices without clear guidance on what to choose first.

**Key Problems:**

1. **Missing "Grand Unifying Context"** - No clear explanation of WHAT Bknd IS conceptually
2. **Navigation Confusion** - Organized by features, not user goals
3. **Information Overload** - Too many choices presented immediately (modes, databases, frameworks)
4. **Incomplete Documentation** - API reference exists but Auth/Data modules are "work in progress"
5. **No Working Examples** - "Nobody has shipped" - no complete tutorial from scratch
6. **Missing Practical Guidance** - How to seed DB, create first user, set up permissions

**Solution Strategy:** Restructure documentation using [Divio's Four Documentation Types](https://docs.divio.com/documentation-system/) (Tutorials, How-to Guides, Reference, Explanation) and apply [Mintlify's documentation principles](https://www.mintlify.com/blog/how-to-write-documentation-that-developers-want-to-read) (user-centric navigation, clear outcomes, strategic organization).

---

## Target Audience Profile

- **Primary:** Frontend developers wanting a backend
- **Technical Level:** Mid-level developers familiar with React/TypeScript
- **Common Ecosystem:** Next.js, Vercel, TanStack
- **Experience Level:** Familiar with frontend concepts, new to backend systems
- **Learning Style:** Prefer hands-on tutorials over theory

---

## Identified Pain Points (User & Community Feedback)

### Concept Confusion

1. **"Embeddable" Misunderstanding**
   - **Source:** Hacker News feedback
   - **Issue:** Users think "embeddable" means client-side execution
   - **Reality:** Runs in server-side of full-stack apps (Next.js, Astro, React Router)
   - **Fix Needed:** Clear explanation of deployment architecture

2. **Mode Confusion**
   - **Issue:** CodeMode vs HybridMode vs UIMode - when to use which?
   - **User Quote:** "There's different modes of backend: CodeMode, HybridMode, UIMode. How do I approach it?"
   - **Fix Needed:** Decision tree and use case scenarios
   - **✅ STATUS: RESOLVED** - Verified with official docs at https://docs.bknd.io/usage/introduction/. Roadmap decision tree and guidance are accurate and comprehensive.

3. **Auth/Permissions Complexity**
   - **Issue:** How auth/permissions work compared to Firebase
   - **Specific Pain:** "How do you enable public frontend data access for guests while the guard is enabled?"
   - **Fix Needed:** Step-by-step permission setup guide

### Missing Practical Guidance

1. **Database Seeding**
   - **Issue:** How to seed database with initial data?
   - **User Quote:** "People want to learn how to seed the database"
   - **Known Bug:** "If you put Bknd in code mode then it prevents the initial seed from happening"
   - **Fix Needed:** Mode-specific seeding guides with bug workaround

2. **First User Creation**
   - **Issue:** How to create the first user/admin?
   - **User Quote:** "People were wondering how do I create the first user in Bknd"
   - **Fix Needed:** Multiple methods documented (Admin UI, CLI, programmatic)

3. **Entity Relationships**
   - **Issue:** How do relationships work between data, entity, and media?
   - **User Quote:** "People asking about how do I do relationships between data, entity, and media?"
   - **Fix Needed:** Complete relationship examples with code

4. **ID Configuration**
   - **Issue:** Schema IDs vs UUIDs for entity IDs
   - **User Quote:** "Someone trying to learn how to use schema IDs or to use UUIDs for IDs and the entities"
   - **Fix Needed:** Clear explanation of when to use each type

5. **Permission/Role Setup**
   - **Issue:** How to create roles, add permissions, assign users, enable guard
   - **User Quote:** "On that you can create roles, add permissions to it, assign users, and then you enable the guard"
   - **Fix Needed:** Complete permission/role workflow guide

### No Working Examples

1. **No Production Examples**
   - **Issue:** "I don't think anyone's actually shipped it. And that's a problem."
   - **Impact:** Users can't see real-world implementation patterns
   - **Fix Needed:** Complete "build from scratch" tutorials

2. **Incomplete Module Documentation**
   - **Auth Module:** "The documentation is currently a work in progress" (only high-level overview)
   - **Data Module:** "The documentation is currently a work in progress" (no practical examples)
   - **Impact:** Developers can't implement core features
   - **Fix Needed:** Complete implementation guides for core modules

---

## Proposed Documentation Structure

```md
docs.bknd.io
├── 1. Getting Started (Tutorials - learn by doing)
│   ├── Tutorial: Build Your First API (15 min)
│   │   ├── What you'll build (Todo API with Vite + React)
│   │   ├── What you'll learn (Core concepts in action)
│   │   ├── Step 1: Create Vite + React project
│   │   ├── Step 2: Install and configure Bknd
│   │   ├── Step 3: Define entities in Admin UI
│   │   ├── Step 4: Enable Auth module
│   │   ├── Step 5: Create first admin user
│   │   ├── Step 6: Build React UI to consume API
│   │   └── Step 7: Test complete application
│   │
│   ├── Tutorial: Add Authentication to Your App (20 min)
│   │   ├── Set up email/password auth
│   │   ├── Create roles (admin, user, guest)
│   │   ├── Assign permissions
│   │   ├── Protect endpoints
│   │   └── Enable public access for guests
│   │
│   └── Tutorial: Deploy to Production (15 min)
│       ├── Choose your mode
│       ├── Deploy to Vercel
│       ├── Set environment variables
│       └── Configure database connection
│
├── 2. How-to Guides (Task-based - solve specific problems)
│   ├── Set Up Bknd
│   │   ├── Choose right mode for your project
│   │   │   ├── Decision tree with scenarios
│   │   │   ├── UI-only: When you want quick prototyping
│   │   │   ├── Code-only: When you want type safety & Git
│   │   │   └── Hybrid: Best of both worlds
│   │   │
│   │   ├── Choose right database
│   │   │   ├── Local dev: SQLite
│   │   │   ├── Production low-cost: Turso/LibSQL
│   │   │   ├── Production high-perf: PostgreSQL
│   │   │   └── Serverless: Cloudflare D1
│   │   │
│   │   └── Integrate with your framework (prioritized by popularity)
│   │       ├── Next.js integration guide
│   │       ├── Vite + React integration guide
│   │       ├── React Router integration guide
│   │       ├── Astro integration guide
│   │       ├── Bun/Node standalone
│   │       ├── Cloudflare Workers
│   │       ├── AWS Lambda
│   │       └── Docker
│   │
│   ├── Work with Data
│   │   ├── Define your first entity
│   │   ├── Create relationships (one-to-many, many-to-many)
│   │   ├── Query data with filters
│   │   ├── Seed your database with initial data
│   │   ├── Handle file uploads with Media
│   │   ├── Use schema IDs vs UUIDs
│   │   └── Query related entities
│   │
│   ├── Add Authentication
│   │   ├── Set up email/password authentication
│   │   ├── Add Google OAuth
│   │   ├── Create your first admin user
│   │   ├── Manage user sessions
│   │   └── Configure JWT settings
│   │
│   ├── Permissions & Security
│   │   ├── Create roles (admin, user, guest)
│   │   ├── Assign permissions to roles
│   │   ├── Enable public access for guests
│   │   ├── Enable guard
│   │   └── Test permission rules
│   │
│   └── Advanced Topics
│       ├── Use events and workflows
│       ├── Write custom plugins
│       ├── Optimize database performance
│       └── Handle migrations
│
├── 3. Architecture & Concepts (Explanation - why & how)
│   ├── What is Bknd?
│   │   ├── Problem it solves (beyond "backend system")
│   │   ├── When to use vs Firebase/Supabase/custom
│   │   ├── How Admin UI works with code
│   │   ├── What "embeddable" really means
│   │   └── Architecture diagram
│   │
│   ├── How Bknd Works
│   │   ├── Request lifecycle
│   │   ├── Database interaction
│   │   ├── Auth flow (JWT, sessions)
│   │   ├── Permission evaluation (RLS + RBAC)
│   │   └── Media storage backends
│   │
│   ├── Design Decisions
│   │   ├── Why TypeScript-first
│   │   ├── Why Drizzle-like schema API
│   │   ├── Why REST API by default
│   │   └── Why multiple modes
│   │
│   └── Performance Considerations
│       ├── Mode performance comparison
│       ├── Database optimization
│       ├── Caching strategies
│       └── Edge vs traditional deployment
│
├── 4. Reference (Technical specs - already exists)
│   ├── API Reference (REST endpoints) ✅
│   │   ├── https://docs.bknd.io/api-reference/introduction/
│   │   ├── Authentication endpoints
│   │   ├── Data endpoints (CRUD)
│   │   ├── Media endpoints
│   │   ├── System endpoints
│   │   └── Error codes
│   │
│   ├── SDK Reference (TypeScript)
│   │   ├── EntityManager API
│   │   ├── Repository API
│   │   ├── Mutator API
│   │   ├── Query system (where, with, sort)
│   │   └── Event hooks
│   │
│   ├── React SDK Reference
│   │   ├── useAuth hook
│   │   ├── useEntity hook
│   │   ├── useApiQuery hook
│   │   ├── Media.Dropzone
│   │   └── Auto-config forms
│   │
│   ├── CLI Reference
│   │   ├── Commands (run, create, sync, config, types)
│   │   └── Flags and options
│   │
│   └── Configuration Reference
│       ├── BkndConfig schema
│       ├── Database options
│       ├── Auth configuration
│       └── Media storage config
│
└── 5. Troubleshooting (FAQ)
    ├── Common Issues
    │   ├── Database connection errors
    │   ├── Type generation not working
    │   ├── Auth tokens expiring
    │   ├── CORS issues
    │   ├── Deployment problems
    │   └── Mode switching issues
    │
    └── Known Issues & Workarounds
        ├── CodeMode prevents initial seed
        │   ├── ⚠️ Current Behavior
        │   └── 🔧 Workaround
        ├── Password length validation
        ├── Timestamp indexing limitations
        └── Other bugs as discovered
```

---

## Phase 1: Critical Foundation (Week 1-2)

### 1.1 Create "Build Your First API" Tutorial

**Goal:** Complete working Vite + React application from scratch in 15 minutes

**Decisions Made:**
- ✅ Use Vite + React (not CLI mode alone)
- ✅ Build complete app from scratch
- ✅ Include React UI consuming the API
- ✅ Show complete working example

**Structure:**

```markdown
# Tutorial: Build Your First API with Bknd

## What You'll Build
A complete Todo application with:
- REST API for managing todos
- Authentication (email/password)
- React frontend to consume the API
- Role-based permissions

## What You'll Learn
- How Bknd works with React applications
- How to define entities in Admin UI
- How to configure authentication
- How to protect endpoints with permissions
- How to consume the API from React

## Prerequisites
- Node.js 18+ installed
- Basic knowledge of React

## Step 1: Create Vite + React Project
[Command to scaffold project]

## Step 2: Install and Configure Bknd
[Installation commands, bknd.config.ts setup]

## Step 3: Define Todo Entity in Admin UI
[Screenshots of Admin UI, step-by-step entity creation]

## Step 4: Enable Authentication
[Auth configuration, role setup]

## Step 5: Create First Admin User
[Method 1: Admin UI, Method 2: CLI, Method 3: Programmatic]

## Step 6: Build React UI
[Complete React component code]
- Todo list component
- Add todo form
- Login form
- Protected routes

## Step 7: Test Complete Application
[What success looks like, curl commands to test API]

## Next Steps
- Link to: "How-to: Choose Your Mode"
- Link to: "How-to: Deploy to Production"
```

### 1.2 Create "Architecture & Concepts" Page

**Goal:** Provide missing mental model of Bknd

**Content Outline:**

```markdown
# What is Bknd?

## The Problem Bknd Solves
[Clear explanation, not feature list]

## When to Use Bknd
- You're a frontend dev who needs a backend
- You want auto-generated APIs from your schema
- You want auth without writing middleware
- You want an admin UI without building one

## When NOT to Use Bknd
- You need complex business logic backend
- You want maximum SQL control (use Drizzle)
- You need realtime out of box (use Firebase)

## What "Embeddable" Really Means
- NOT client-side execution (clarify HN confusion)
- Runs in server-side of full-stack apps
- Deployment architecture diagram:
  ```
  User → Browser
         ↓
  Next.js App (server-side)
         ↓
  Bknd (embedded)
         ↓
  Database (SQLite/Postgres/etc.)
         ↓
  Admin UI (optional)
  ```

## How the Three Modes Work
[Present all three equally with decision tree]
```

**Mode Decision Tree:**

```
Q: Do you want to make changes in production via UI?
  Yes → UI-only mode
       Pros: Fast prototyping, visual control
       Cons: No Git version control of schema, slower performance
       Best for: Prototyping, learning, simple projects

  No → Continue

Q: Do you want fast development iterations in production?
  No → Code-only mode
       Pros: Type safety, Git-managed schema, maximum performance
       Cons: Slower development (no visual tools)
       Best for: Production apps with stable schema, team collaboration

  Yes → Hybrid mode
       Pros: Visual in dev, type-safe in production
       Cons: More complex setup
       Best for: Projects needing both speed and safety

```

### 1.3 Complete "How-to: Seed Your Database" Guide

**Goal:** Address "How do I approach it? There's different modes"

**Content Structure:**

```markdown
# How to Seed Your Database

## Seeding Strategies by Mode

### UI-Only Mode
Use Admin UI to create initial data manually
- Open Admin UI
- Navigate to Entities
- Create records manually
- Best for: Simple initial data, prototyping

### Code-Only Mode
Use programmatic seed scripts
```typescript
// Example seed script
import { em } from 'bknd';
const mutator = em.mutator('todos');
await mutator.create({ title: 'First todo', done: false });
await mutator.create({ title: 'Second todo', done: true });
```
- Create `seed.ts` file
- Run with `bun run seed` or `node seed.js`
- Best for: Large datasets, reproducible seeds

### Hybrid Mode
Export data from UI, commit to repo
1. Develop with UI mode (create data visually)
2. Export configuration
3. Commit to Git (reproducible seeds)
4. Import in production
- Best for: Team collaboration, reproducible dev data

## Known Issue: CodeMode and Initial Seeds

⚠️ **Current Behavior:**
When Bknd is in CodeMode, initial database seeding may fail due to schema sync timing.

🔧 **Workaround:**
1. Start in UI-mode for initial seed
2. After seeding, switch to Code-mode
3. Or use migration scripts instead of initial seeds

## Best Practices
- Use environment-specific seeds (dev vs production)
- Version control your seed scripts
- Document seed data structure
- Test seed scripts in isolated environment
```

### 1.4 Complete "How-to: Create First User" Guide

**Goal:** Address "How do I create the first user?"

**Content Structure:**

```markdown
# How to Create Your First User

## Method 1: Admin UI (Easiest)
1. Enable Auth module in Admin UI
2. Navigate to "Users" entity
3. Click "Create User"
4. Fill in email, password, role
5. Check "admin" checkbox for admin privileges
6. Save

## Method 2: CLI Command
```bash
npx bknd user:create
# Follow prompts
```

## Method 3: Programmatic (Seed Script)
```typescript
import { em } from 'bknd';

const mutator = em.mutator('users');
await mutator.create({
  email: 'admin@example.com',
  password: 'secure-password',
  role: 'admin',
  name: 'Admin User'
});
```

## Making Users Admin
There are two approaches:

### 1. Checkbox in Admin UI
When creating/editing user, check "admin" role

### 2. Assign Role Programmatically
```typescript
await mutator.update(userId, {
  roles: ['admin']
});
```

## Default Role for New Users
Configure in `bknd.config.ts`:
```typescript
config: {
  auth: {
    defaultRole: 'user' // New users get this role automatically
  }
}
```

## Security Best Practices
- Change default admin password after first login
- Use strong passwords (min 8 characters)
- Limit admin accounts (principle of least privilege)
- Use 2FA when available
```

---

## Phase 2: Core Task Guides (Week 3-4)

### 2.1 "How-to: Choose Your Mode" Decision Tree

**Goal:** Address mode confusion with clear guidance

**Content Structure:**

```markdown
# How to Choose the Right Mode

## Mode Comparison Table

| Feature | UI-Only | Code-Only | Hybrid |
|----------|-----------|-----------|---------|
| Development Speed | ⚡⚡⚡ (Fastest) | ⚡ (Slower) | ⚡⚡⚡ (Fast in dev) |
| Type Safety | ❌ None | ✅ Full | ✅ Full |
| Git Version Control | ❌ No | ✅ Yes | ✅ Yes |
| Production Performance | ⚡ Good | ⚡⚡⚡ Best | ⚡⚡⚡ Best |
| Visual Tools | ✅ Yes | ❌ No | ✅ Yes (dev only) |
| Schema Changes | Visual (instant) | Code (requires sync) | Visual in dev, code in prod |
| Team Collaboration | ⚡ Challenging | ✅ Easy | ✅ Easy |
| Learning Curve | ⚡⚡⚡ Lowest | ⚡⚡ Higher | ⚡⚡ Moderate |

## Interactive Decision Tree

### Start Here:
```
Q1: Do you want to make changes to your backend in production via a visual interface?
   YES → UI-Only Mode
   - Visual configuration tools always available
   - No code changes required
   - Best for: Rapid prototyping, learning, simple projects

   NO → Continue to Q2

Q2: Do you want type safety and Git version control for your schema?
   NO → UI-Only Mode (already covered)
   YES → Continue to Q3

Q3: Do you want fast development iterations with visual tools in development?
   NO → Code-Only Mode
   - Programmatic schema definition only
   - No visual configuration tools
   - Best for: Production apps with stable schema, team collaboration

   YES → Hybrid Mode
   - Visual configuration in development
   - Type-safe code in production
   - Best for: Teams needing both speed and safety
```

## Mode Examples by Use Case

### E-commerce Platform
**Recommended:** Code-Only
- Why: Stable schema, team collaboration, need type safety
- Schema: Products, Orders, Users, Payments (complex relations)

### Internal Dashboard
**Recommended:** Hybrid
- Why: Fast iteration in dev, production stability
- Schema: Reports, Analytics, Settings (frequent changes)

### MVP / Prototype
**Recommended:** UI-Only
- Why: Fastest setup, visual exploration
- Schema: Simple CRUD entities, learning Bknd

### SaaS Application
**Recommended:** Hybrid or Code-Only
- Why: Multi-tenant, need production stability
- Schema: Organizations, Teams, Subscriptions (complex logic)

### Personal Blog
**Recommended:** UI-Only or Hybrid
- Why: Simple schema, occasional updates
- Schema: Posts, Comments, Categories (static)

## How to Switch Modes

### UI-Only → Code-Only
1. Export configuration from Admin UI
2. Create `bknd.config.ts` with exported config
3. Set `options.mode: "code"`
4. Delete database or run migration

### UI-Only → Hybrid
1. Develop in UI-only mode initially
2. Export configuration
3. Set `options.mode` based on environment:
   ```typescript
   mode: process.env.NODE_ENV === 'production' ? 'code' : 'db'
   ```
4. Deploy with production config

### Code-Only → Hybrid
1. Keep existing `bknd.config.ts`
2. Add conditional mode switching
3. Test in development with UI tools enabled
4. Deploy in code-only mode
```

### 2.2 "How-to: Enable Public Access with Guard"

**Goal:** Address "How do you enable public frontend data access for guests while the guard is enabled?"

**Content Structure:**

```markdown
# How to Enable Public Access with Guard

## The Problem
You want:
- Anonymous (guest) users to READ public data
- Authenticated users to READ/WRITE their data
- Admins to have full access

## The Solution
Create roles with granular permissions and set a default role for guests.

## Step-by-Step Setup

### Step 1: Create Guest Role (Default)
This role applies to unauthenticated users.

**Via Admin UI:**
1. Navigate to "Roles" in Auth section
2. Create new role: "guest"
3. Mark as default role
4. Add `read` permission for public entities

**Via Code:**
```typescript
config: {
  auth: {
    roles: {
      guest: {
        isDefault: true, // Unauthenticated users get this
        permissions: [
          'posts:read',      // Can read posts
          'categories:read'  // Can read categories
          // No write permissions
        ]
      },
      user: {
        isDefault: false, // Authenticated users get this
        permissions: [
          'posts:read', 'posts:write',
          'categories:read'
        ]
      },
      admin: {
        isDefault: false,
        permissions: ['*'] // Full access
      }
    }
  }
}
```

### Step 2: Enable Guard
```typescript
options: {
  guard: {
    enabled: true // Enforce permissions on all requests
  }
}
```

### Step 3: Configure Entity-Level Permissions
```typescript
config: {
  data: {
    posts: {
      permissions: {
        create: 'user',  // Must be user or higher
        read: 'guest',    // Anyone can read
        update: 'user',  // Owner or admin
        delete: 'admin'  // Only admins
      }
    }
  }
}
```

## Testing Your Setup

### Test 1: Guest Access (No Token)
```bash
curl http://localhost:8787/api/data/posts
# Should return posts (guest has read permission)
```

### Test 2: Guest Cannot Write
```bash
curl -X POST http://localhost:8787/api/data/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'
# Should return 403 Forbidden
```

### Test 3: Authenticated User Can Write
```bash
curl -X POST http://localhost:8787/api/data/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Test"}'
# Should succeed
```

## Common Patterns

### Public Blog
```
Roles:
- guest: read posts, comments
- user: read/write posts, read/write comments
- admin: full access

Permissions:
- Posts: guest read, user write, admin delete
- Comments: guest read, user write
```

### Private Dashboard
```
Roles:
- guest: no access (redirect to login)
- user: read own data
- admin: full access

Permissions:
- All entities: user read/write own, admin all
```

### Community Forum
```
Roles:
- guest: read posts, read categories
- member: read/write posts, read/write comments
- moderator: read/write/delete posts, read/write/delete comments
- admin: full access

Permissions:
- Posts: guest read, member write, moderator delete, admin all
- Comments: guest read, member write, moderator delete, admin all
```

## Troubleshooting

### Guests Can Access Everything
**Problem:** Guard enabled but guests have full access
**Fix:** Check that default role is set to "guest" not "admin"

### Authenticated Users Can't Access
**Problem:** Users get 403 after login
**Fix:** Check that role assignment is working correctly:
```typescript
// Verify user has role
const user = await em.repo('users').findOne({ email });
console.log(user.roles); // Should show role
```

### Guard Blocking All Requests
**Problem:** Everything returns 403
**Fix:** Check permissions are defined correctly:
```typescript
// Ensure permissions array exists and has required actions
permissions: ['read', 'write', 'delete'] // Not just '*'
```
```

### 2.3 "How-to: Entity-Media Relationships"

**Goal:** Address "How do you do relationships between data, entity, and media?"

**Content Structure:**

```markdown
# How to Handle Media in Entity Relationships

## Understanding Media Types

Bknd provides two media field types:
- `media()` - Multiple files (unlimited items)
- `medium()` - Single file (max 1 item)

## Schema Definition

### Single Media File
```typescript
const schema = em({
  posts: entity("posts", {
    title: text().required(),
    content: text(),
    thumbnail: medium(), // One featured image
  }),
});
```

### Multiple Media Files
```typescript
const schema = em({
  posts: entity("posts", {
    title: text().required(),
    content: text(),
    gallery: media(), // Multiple images
  }),
});
```

### Combined: Thumbnail + Gallery
```typescript
const schema = em({
  posts: entity("posts", {
    title: text().required(),
    thumbnail: medium(),  // Featured image
    gallery: media(),     // Additional images
  }),
});
```

## Uploading Media to Entities

### Method 1: Upload via Admin UI
1. Create/edit entity
2. Click "Upload" button on media field
3. Select files
4. Save entity

### Method 2: Upload Programmatically
```typescript
// Upload single file
await em.media().upload(file, {
  entity: 'posts',
  id: postId
});

// Upload multiple files
for (const file of files) {
  await em.media().upload(file, {
    entity: 'posts',
    id: postId
  });
}
```

### Method 3: Upload via REST API
```bash
# Upload file to entity
curl -X POST http://localhost:8787/api/media/upload \
  -F "file=@image.jpg" \
  -F "entity=posts" \
  -F "entity_id=123"
```

## Querying Entities with Media

### Include Media in Query
```typescript
const posts = await em.repo('posts').findMany({
  limit: 10,
  with: ['thumbnail', 'gallery'], // Include media
  where: { published: true }
});

// Result structure:
[
  {
    id: 1,
    title: "My Post",
    thumbnail: { id: 1, url: "..." }, // Single media
    gallery: [                          // Multiple media
      { id: 2, url: "..." },
      { id: 3, url: "..." }
    ]
  }
]
```

### Media Field Structure
```typescript
interface Media {
  id: number;
  filename: string;
  url: string;        // Public URL
  size: number;       // Bytes
  mimeType: string;   // e.g., "image/jpeg"
  createdAt: Date;
}
```

## Advanced Media Patterns

### Profile Pictures
```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),
    avatar: medium(), // Single profile picture
  }),
});
```

### Product Images
```typescript
const schema = em({
  products: entity("products", {
    name: text().required(),
    mainImage: medium(), // Featured product image
    images: media(),     // Additional product images
  }),
});
```

### Document Attachments
```typescript
const schema = em({
  documents: entity("documents", {
    title: text().required(),
    files: media(), // Multiple attached documents
  }),
});
```

## Media Storage Configuration

Bknd supports multiple storage backends in `bknd.config.ts`:

### Local Storage (Default)
```typescript
config: {
  media: {
    storage: 'local',
    local: {
      path: './uploads'
    }
  }
}
```

### S3 / R2 Storage
```typescript
config: {
  media: {
    storage: 's3',
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: 'us-east-1',
      bucket: 'my-bucket',
      endpoint: 'https://...'
    }
  }
}
```

### Cloudflare R2
```typescript
config: {
  media: {
    storage: 'r2',
    r2: {
      accountId: process.env.CF_ACCOUNT_ID,
      accessKey: process.env.CF_ACCESS_KEY,
      secretKey: process.env.CF_SECRET_KEY,
      bucket: 'my-bucket'
    }
  }
}
```

## Deleting Media

### Delete Entity (Cascades to Media)
```typescript
// Deleting entity removes associated media
await em.mutator('posts').delete(postId);
```

### Delete Specific Media
```typescript
await em.media().delete(mediaId);
```

## Best Practices

1. **Resize Images**
   - Upload optimized images for web
   - Use thumbnails for lists
   - Full resolution for detail views

2. **Organize by Entity**
   - Associate media with specific entities
   - Don't use generic media entities
   - Bknd handles relationships automatically

3. **Storage Strategy**
   - Use local for development
   - Use S3/R2 for production
   - Configure different buckets for dev/prod

4. **Validation**
   - Add file type validation in schema:
   ```typescript
   thumbnail: medium({
     allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
   })
   ```
```

### 2.4 "How-to: Schema IDs vs UUIDs"

**Goal:** Address "How to use schema IDs or to use UUIDs for IDs and the entities"

**Content Structure:**

```markdown
# Using Schema IDs vs UUIDs

## Default Behavior

By default, Bknd auto-generates integer primary keys:
```typescript
const schema = em({
  users: entity("users", {
    name: text().required(),
    // id field is auto-generated as number
  }),
});

// Result:
// users table: id (INTEGER PRIMARY KEY AUTOINCREMENT), name (TEXT)
```

## Using UUIDs

### Define Custom UUID Field
```typescript
const schema = em({
  users: entity("users", {
    id: uuid(), // Custom primary key
    name: text().required(),
  }),
});

// Result:
// users table: id (TEXT PRIMARY KEY), name (TEXT)
```

### UUID Configuration
```typescript
// UUID field with validation
const schema = em({
  users: entity("users", {
    id: uuid({
      version: 'v4', // v4 is standard
    }),
    name: text().required(),
  }),
});
```

## When to Use Each

### Integer IDs (Default)
✅ **Use when:**
- Building a simple application
- Performance is critical (integers are faster)
- Database size is a concern
- Readable IDs are acceptable
- Single-server deployment

❌ **Don't use when:**
- Need to merge data from multiple sources
- Exposing IDs publicly (security risk)
- Need distributed system support
- Need unguessable IDs

**Example Use Cases:**
- Blog posts (sequential, readable)
- Internal records (admin users, settings)
- Order numbers (sequential tracking)
- Simple CRUD apps

### UUIDs
✅ **Use when:**
- Building a distributed system
- Merging data from multiple databases
- IDs are exposed in URLs (security)
- Need unguessable IDs
- Multi-tenant application
- Edge deployment with data replication

❌ **Don't use when:**
- Maximum performance is required
- Database storage is limited
- Readable IDs are preferred

**Example Use Cases:**
- User accounts (prevent enumeration attacks)
- External references (API keys, tokens)
- Distributed entities (shared across services)
- Public resources (prevent ID guessing)
- Multi-tenant data isolation

## Performance Comparison

| Metric | Integer IDs | UUIDs |
|---------|--------------|---------|
| Storage Size | 4-8 bytes | 36 bytes |
| Index Speed | ⚡⚡⚡ Fastest | ⚡ Fast |
| Insert Speed | ⚡⚡⚡ Fastest | ⚡ Moderate |
| Comparison Speed | ⚡⚡⚡ Fastest | ⚡ Moderate |
| Cache Efficiency | ⚡⚡⚡ Best | ⚡ Good |
| Database Size | Smallest | ~9x larger |

## Security Considerations

### Integer ID Enumeration
**Risk:** Attackers can guess IDs and access data
```
GET /api/posts/1  ✅ Success
GET /api/posts/2  ✅ Success
GET /api/posts/3  ✅ Success
# Attacker knows how many posts exist
```

**Solution:** Use UUIDs or add permission checks
```typescript
// Check ownership before returning
const post = await em.repo('posts').findId(postId);
if (post.userId !== currentUser.id) {
  throw new Error('Not authorized');
}
```

### UUID Security
**Benefit:** Unguessable IDs prevent enumeration
```
GET /api/posts/550e8400-e29b-41d4-a716-4466554440000  ✅ Success
GET /api/posts/550e8400-e29b-41d4-a716-4466554440001  ❌ Not found
# Attacker cannot guess other IDs
```

## Migration Strategy

### Switch from Integer to UUID
⚠️ **Warning:** This requires data migration and downtime

```typescript
// Step 1: Add UUID column
const schema = em({
  users: entity("users", {
    id: number(), // Keep existing
    uuid: uuid(), // Add new column
  }),
});

// Step 2: Generate UUIDs for existing data
const users = await em.repo('users').findMany();
for (const user of users) {
  await em.mutator('users').update(user.id, {
    uuid: generateUUIDv4()
  });
}

// Step 3: Update foreign keys in related tables
// Manually update all references

// Step 4: Switch primary key
const schema = em({
  users: entity("users", {
    id: uuid(), // New primary key
    oldId: number(), // Keep old for reference
  }),
});
```

## Best Practices

1. **Consistency**
   - Choose one approach and stick with it
   - Don't mix integer and UUID IDs in same schema

2. **External References**
   - Use UUIDs for publicly exposed IDs
   - Use integers internally for performance

3. **Database-Specific Considerations**
   ```typescript
   // SQLite: TEXT for UUIDs
   uuid: text(),

   // PostgreSQL: UUID type (better performance)
   uuid: uuid(), // Uses native UUID type

   // MySQL: CHAR(36) or BINARY(16)
   uuid: text(), // Bknd uses TEXT for compatibility
   ```

4. **Indexing**
   ```typescript
   // Index UUIDs for performance
   const schema = em({
     users: entity("users", {
       id: uuid(),
     })
   },
   ({ index }, { users }) => {
     index(users).on(['id']); // Explicitly index UUID
   });
   ```

## Common Patterns

### Sequential IDs for Ordering
```typescript
const schema = em({
  orders: entity("orders", {
    id: number(), // Sequential order numbers
    userId: number(),
    total: number(),
  }),
});
// Orders: #1001, #1002, #1003...
```

### UUIDs for Public Resources
```typescript
const schema = em({
  documents: entity("documents", {
    id: uuid(), // Public document IDs
    title: text(),
    content: text(),
  }),
});
// URLs: /documents/550e8400-e29b-41d4-a716-4466554440000
```

### Hybrid Approach (Internal Integer, Public UUID)
```typescript
const schema = em({
  users: entity("users", {
    id: number(),      // Internal primary key
    publicId: uuid(), // Public identifier
    name: text(),
  }),
});
// API returns publicId, internal queries use id
```
```

### 2.5 "How-to: Add Auth with Permissions"

**Goal:** Address "Create roles, add permissions to it, assign users, enable guard"

**Content Structure:**

```markdown
# How to Add Authentication with Permissions

## Step 1: Enable Auth Module

### Via Admin UI
1. Navigate to "Modules" → "Auth"
2. Click "Enable Auth"
3. Configure basic settings

### Via Configuration
```typescript
// bknd.config.ts
import type { BkndConfig } from "bknd";

export default {
  config: {
    auth: {
      enabled: true,
      jwt: {
        secret: 'your-jwt-secret-here',
        expiresIn: '7d', // Token lifetime
        algorithm: 'HS256'
      },
      password: {
        minLength: 8,
        hashMethod: 'sha256' // bcrypt planned
      },
      providers: {
        emailPassword: {
          enabled: true
        },
        oauth: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          },
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
          }
        }
      }
    }
  }
} satisfies BkndConfig;
```

## Step 2: Create Roles

### Define Roles in Configuration
```typescript
config: {
  auth: {
    roles: {
      admin: {
        isDefault: false, // Not default for new users
        permissions: ['*'] // Full access
      },
      user: {
        isDefault: true, // Default for authenticated users
        permissions: [
          'posts:read',
          'posts:create',
          'posts:update:own', // Can update own posts
          'posts:delete:own'
        ]
      },
      guest: {
        isDefault: false, // Only for unauthenticated
        permissions: [
          'posts:read', // Public read access
          'categories:read'
        ]
      }
    }
  }
}
```

### Define Roles in Admin UI
1. Navigate to "Auth" → "Roles"
2. Click "Create Role"
3. Set role name (admin, user, guest)
4. Mark as default if needed
5. Add permissions (see Step 3)

## Step 3: Define Permissions

### Permission Syntax
Permissions use format: `resource:action:scope`

#### Examples:
- `posts:read` - Read any post
- `posts:read:own` - Read only own posts
- `posts:create` - Create new post
- `posts:update` - Update any post
- `posts:update:own` - Update only own posts
- `posts:delete` - Delete any post
- `*` - Full access (admin)

### Permission Levels

**Level 1: Public Access**
```typescript
guest: {
  permissions: ['posts:read', 'categories:read']
}
```

**Level 2: Authenticated User**
```typescript
user: {
  permissions: [
    'posts:read',
    'posts:create',
    'posts:update:own',
    'posts:delete:own',
    'comments:read',
    'comments:create'
  ]
}
```

**Level 3: Moderator**
```typescript
moderator: {
  permissions: [
    'posts:read',
    'posts:create',
    'posts:update', // Can update any post
    'comments:read',
    'comments:create',
    'comments:delete' // Can delete any comment
  ]
}
```

**Level 4: Admin**
```typescript
admin: {
  permissions: ['*'] // Full access to everything
}
```

## Step 4: Assign Permissions to Roles

### Assign in Configuration
```typescript
config: {
  auth: {
    roles: {
      user: {
        permissions: [
          'posts:read',
          'posts:create',
          'posts:update:own',
          'posts:delete:own'
        ]
      }
    }
  }
}
```

### Assign in Admin UI
1. Navigate to "Auth" → "Roles"
2. Edit role
3. Check permissions to grant
4. Save

## Step 5: Assign Roles to Users

### Create User with Role
```typescript
await em.mutator('users').create({
  email: 'user@example.com',
  password: 'password',
  roles: ['user'] // Assign roles
});
```

### Update User Roles
```typescript
await em.mutator('users').update(userId, {
  roles: ['admin', 'moderator'] // Assign multiple roles
});
```

### Via Admin UI
1. Navigate to "Users" entity
2. Create/edit user
3. Check roles to assign
4. Save

## Step 6: Enable Guard

```typescript
options: {
  guard: {
    enabled: true, // Enforce permission checks
    strict: false // If false, no permission = deny. If true, no permission = allow (unsafe)
  }
}
```

## Complete Example: Blog with Auth

```typescript
// bknd.config.ts
import type { BkndConfig } from "bknd";

export default {
  config: {
    auth: {
      enabled: true,
      jwt: {
        secret: 'your-secret-key',
        expiresIn: '7d'
      }
    },
    roles: {
      guest: {
        isDefault: true, // Unauthenticated users
        permissions: ['posts:read', 'comments:read']
      },
      author: {
        isDefault: false,
        permissions: [
          'posts:read', 'posts:create',
          'posts:update:own', 'posts:delete:own',
          'comments:read', 'comments:create'
        ]
      },
      editor: {
        isDefault: false,
        permissions: [
          'posts:read', 'posts:create',
          'posts:update', // Can update any post
          'comments:read', 'comments:create', 'comments:delete'
        ]
      },
      admin: {
        isDefault: false,
        permissions: ['*']
      }
    }
  }
} satisfies BkndConfig;
```

## Testing Permissions

### Test as Guest (No Token)
```bash
# Should succeed (guest has read permission)
curl http://localhost:8787/api/data/posts

# Should fail (guest doesn't have create permission)
curl -X POST http://localhost:8787/api/data/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'
# Response: 403 Forbidden
```

### Test as Authenticated User
```bash
# Login to get token
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
# Response: { "token": "..." }

# Use token to create post
curl -X POST http://localhost:8787/api/data/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "My Post"}'
# Should succeed

# Try to update someone else's post
curl -X PATCH http://localhost:8787/api/data/posts/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Changed"}'
# Should fail (can only update own posts)
```

### Test as Admin
```bash
# Use admin token
curl -X POST http://localhost:8787/api/data/posts \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"title": "Admin Post"}'
# Should succeed

# Update any post
curl -X PATCH http://localhost:8787/api/data/posts/123 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"title": "Changed by Admin"}'
# Should succeed (admin has * permission)
```

## Permission Scopes

### Own Scope
Only applies to resources owned by current user:
```typescript
'posts:update:own' // Can update only posts where userId = currentUserId
'posts:delete:own' // Can delete only posts where userId = currentUserId
```

### Any Scope
Applies to any resource (no scope modifier):
```typescript
'posts:update' // Can update any post
'posts:delete' // Can delete any post
```

## Best Practices

1. **Principle of Least Privilege**
   - Default to minimal permissions
   - Grant access only when needed
   - Review permissions regularly

2. **Role Hierarchy**
   - guest < user < moderator < admin
   - Inherit permissions where possible
   - Document role responsibilities

3. **Testing**
   - Test each role independently
   - Test permission escalation attempts
   - Verify guard enforcement

4. **Audit**
   - Log permission denials
   - Monitor suspicious activity
   - Review access patterns
```

---

## Phase 3: Integration Guides (Week 5-6)

**Status:** API Reference already exists at https://docs.bknd.io/api-reference/introduction/

**Focus:** Create complete, working integration examples prioritized by popularity.

### 3.1 Next.js Integration Guide (Highest Priority)

**Goal:** Most popular framework used by target audience

**Content Structure:**

```markdown
# Next.js Integration Guide

## Project Setup

### Create Next.js Project
```bash
npx create-next-app@latest my-bknd-app
cd my-bknd-app
```

### Install Bknd
```bash
npm install bknd
```

## Configuration

### Create bknd.config.ts
```typescript
// bknd.config.ts
import type { BkndConfig } from "bknd";
import { em, entity, text, boolean } from "bknd/data";

const schema = em({
  todos: entity("todos", {
    title: text().required(),
    done: boolean({ default_value: false }),
  }),
});

export default {
  config: {
    data: schema.toJSON(),
  },
  connection: {
    url: process.env.DATABASE_URL || 'file:./db.sqlite'
  }
} satisfies BkndConfig;
```

### Environment Variables
```bash
# .env.local
DATABASE_URL=file:./db.sqlite
```

## Integration Methods

### Method 1: Route Handlers (Recommended)

#### Create API Routes
```typescript
// app/api/bknd/[...path]/route.ts
import { createApp } from "bknd";
import config from "@/bknd.config";

const app = await createApp(config);

export const runtime = 'nodejs'; // or 'edge'
export { app as GET, app as POST, app as PUT, app as DELETE, app as PATCH };
```

#### Access in Frontend
```typescript
// app/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch('/api/bknd/data/todos')
      .then(res => res.json())
      .then(data => setTodos(data));
  }, []);

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### Method 2: Middleware Integration

#### Create Middleware
```typescript
// middleware.ts
import { createApp } from "bknd";
import config from "@/bknd.config";

const app = await createApp(config);

export async function middleware(request: Request) {
  return app.fetch(request);
}

export const config = {
  matcher: '/api/bknd/:path*',
};
```

## Deployment to Vercel

### Configure Environment Variables
```
DATABASE_URL=postgres://user:pass@host:port/db
BKND_MODE=code
```

### Deploy
```bash
git push origin main
vercel --prod
```

## Complete Example

See the full example repository:
https://github.com/bknd-io/examples/tree/main/nextjs-starter
```

### 3.2 Vite + React Integration Guide

**Goal:** Tutorial uses Vite + React from scratch

**Content Structure:**

```markdown
# Vite + React Integration Guide

## Project Setup

### Create Vite Project
```bash
npm create vite@latest my-bknd-app -- --template react-ts
cd my-bknd-app
npm install
```

### Install Bknd
```bash
npm install bknd
```

## Configuration

### Create bknd.config.ts
```typescript
// bknd.config.ts
import type { BkndConfig } from "bknd";
import { em, entity, text, boolean } from "bknd/data";

const schema = em({
  todos: entity("todos", {
    title: text().required(),
    done: boolean({ default_value: false }),
  }),
});

export default {
  config: {
    data: schema.toJSON(),
  },
  connection: {
    url: 'file:./db.sqlite'
  }
} satisfies BkndConfig;
```

## Backend Setup

### Create Backend Server
```typescript
// server.ts
import { createApp } from "bknd";
import config from "./bknd.config";

async function startServer() {
  const app = await createApp(config);
  const port = 3000;

  console.log(`Server running at http://localhost:${port}`);

  Bun.serve({
    port,
    fetch: app.fetch,
  });
}

startServer().catch(console.error);
```

### Add to package.json
```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"bun run server\"",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### Install Dependencies
```bash
npm install concurrently
```

## Frontend Integration

### Create API Client
```typescript
// src/api/client.ts
const API_BASE = 'http://localhost:3000/api';

export const api = {
  async getTodos() {
    const res = await fetch(`${API_BASE}/data/todos`);
    return res.json();
  },

  async createTodo(title: string) {
    const res = await fetch(`${API_BASE}/data/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return res.json();
  },

  async updateTodo(id: number, done: boolean) {
    const res = await fetch(`${API_BASE}/data/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    });
    return res.json();
  },

  async deleteTodo(id: number) {
    await fetch(`${API_BASE}/data/todos/${id}`, {
      method: 'DELETE',
    });
  }
};
```

### Create React Components
```typescript
// src/App.tsx
import { useState, useEffect } from 'react';
import { api } from './api/client';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    api.getTodos().then(setTodos);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const todo = await api.createTodo(newTitle);
    setTodos([...todos, todo]);
    setNewTitle('');
  };

  const handleToggle = async (id: number, done: boolean) => {
    const updated = await api.updateTodo(id, !done);
    setTodos(todos.map(t => t.id === id ? updated : t));
  };

  const handleDelete = async (id: number) => {
    await api.deleteTodo(id);
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="app">
      <h1>Todo App</h1>

      <form onSubmit={handleAdd}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New todo..."
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => handleToggle(todo.id, todo.done)}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
            <button onClick={() => handleDelete(todo.id)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Running the Application

### Development
```bash
npm run dev
```

This will:
1. Start Vite dev server (frontend) on http://localhost:5173
2. Start Bknd server (backend) on http://localhost:3000
3. Enable hot reload for both

### Production Build
```bash
npm run build
npm run preview
```

## Deployment

### Build for Production
```typescript
// Change DATABASE_URL for production
const config = {
  connection: {
    url: process.env.DATABASE_URL || 'file:./db.sqlite'
  }
};
```

### Deploy to Vercel/Netlify
1. Push to GitHub
2. Connect repository to Vercel/Netlify
3. Set `DATABASE_URL` environment variable
4. Deploy

## Complete Example

See the full example repository:
https://github.com/bknd-io/examples/tree/main/vite-react-starter
```

### 3.3 React Router Integration Guide

**Content Structure:**

```markdown
# React Router Integration Guide

## Project Setup

### Create React Router Project
```bash
npm create react-router@latest my-bknd-app
cd my-bknd-app
npm install
```

### Install Bknd
```bash
npm install bknd
```

## Configuration

### Create bknd.config.ts
```typescript
// bknd.config.ts
import type { BkndConfig } from "bknd";
import { em, entity, text } from "bknd/data";

const schema = em({
  posts: entity("posts", {
    title: text().required(),
    content: text(),
  }),
});

export default {
  config: {
    data: schema.toJSON(),
  },
  connection: {
    url: 'file:./db.sqlite'
  }
} satisfies BkndConfig;
```

## Integration via Loader

### Create API Routes
```typescript
// app/routes/api.bknd.tsx
import { createApp } from "bknd";
import config from "~/bknd.config";

const app = await createApp(config);

export async function loader({ request }: LoaderFunctionArgs) {
  return app.fetch(request);
}

export const action: ActionFunction = async ({ request }) => {
  return app.fetch(request);
};
```

### Access in Components
```typescript
// app/routes/posts.tsx
import { useLoaderData, Form } from "@react-router";

export async function loader() {
  const res = await fetch('http://localhost:3000/api/data/posts');
  const posts = await res.json();
  return { posts };
}

export default function Posts() {
  const { posts } = useLoaderData();

  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>

      <Form method="post" action="/api.bknd">
        <input type="text" name="title" placeholder="New post" />
        <button type="submit">Add</button>
      </Form>
    </div>
  );
}
```

## Integration via Client
```typescript
// app/root.tsx
import { createApp } from "bknd";
import config from "~/bknd.config";
import { useEffect } from "react";

const app = await createApp(config);

export default function Root() {
  useEffect(() => {
    // Make app available globally
    (window as any).bkndApp = app;
  }, []);

  return <Outlet />;
}
```

## Deployment

### Configure Environment
```bash
# .env
DATABASE_URL=file:./db.sqlite
```

### Build and Deploy
```bash
npm run build
# Deploy to preferred hosting
```

## Complete Example

See the full example repository:
https://github.com/bknd-io/examples/tree/main/react-router-starter
```

### 3.4 Additional Integration Guides (Lower Priority)

**Prioritized by usage/popularity:**

4. **Astro Integration**
   - Project setup
   - Astro adapter configuration
   - Server endpoints
   - Client components
   - Deployment

5. **Bun Standalone**
   - Create Bun server
   - Bknd configuration
   - REST API exposure
   - Static file serving

6. **Node.js Standalone**
   - Express.js integration
   - Bknd middleware
   - Route handling
   - Production setup

7. **Cloudflare Workers**
   - Worker integration
   - D1 database setup
   - R2 storage
   - Edge deployment

8. **AWS Lambda**
   - Lambda handler
   - RDS database
   - S3 storage
   - API Gateway

9. **Docker**
   - Dockerfile creation
   - Compose setup
   - Volume mounting
   - Container deployment

---

## Phase 4: Troubleshooting FAQ (Week 7)

### 4.1 Common Issues

**Goal:** Address most frequent user problems

#### Issue: Database Connection Errors

**Symptoms:**
```
Error: Unable to connect to database
Error: Database file not found
Error: Connection timeout
```

**Solutions:**

1. **Check Connection URL Format**
   ```typescript
   // ✅ Correct formats:
   url: 'file:./db.sqlite'           // SQLite
   url: 'postgres://user:pass@host:port/db' // PostgreSQL
   url: 'libsql://token@host.turso.io'     // Turso

   // ❌ Incorrect:
   url: './db.sqlite'              // Missing file: prefix
   url: 'postgres://user@host/db'  // Missing password
   ```

2. **Verify Database Exists**
   ```bash
   # Check if SQLite file exists
   ls -la db.sqlite

   # Test PostgreSQL connection
   psql postgres://user:pass@host:port/db

   # Check Turso database
   turso db list
   ```

3. **Check File Permissions**
   ```bash
   # Ensure Bknd can write to database
   chmod 666 db.sqlite
   ```

4. **Verify Environment Variables**
   ```typescript
   console.log(process.env.DATABASE_URL); // Debug: is it set?
   ```

#### Issue: Type Generation Not Working

**Symptoms:**
```
Type 'X' is not assignable to type 'Y'
Cannot find module 'bknd-types.d.ts'
Types are out of sync with schema
```

**Solutions:**

1. **Ensure typesFilePath is Set**
   ```typescript
   // bknd.config.ts
   export default {
     // ...
     typesFilePath: 'bknd-types.d.ts', // ← Must be set
   };
   ```

2. **Run Types Generation Manually**
   ```bash
   npx bknd types
   # or
   bunx bknd types
   ```

3. **Restart TypeScript Server**
   ```bash
   # VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
   # Terminal: Kill and restart dev server
   ```

4. **Check File Location**
   ```typescript
   // Ensure path is relative to project root
   typesFilePath: './bknd-types.d.ts', // ✅ Relative path
   typesFilePath: 'bknd-types.d.ts',     // ✅ Also works
   typesFilePath: '/absolute/path/...',     // ❌ Avoid absolute paths
   ```

5. **Verify tsconfig.json Includes**
   ```json
   {
     "include": [
       "bknd-types.d.ts", // ← Must be included
       "**/*.ts",
       "**/*.tsx"
     ]
   }
   ```

#### Issue: Auth Tokens Expiring

**Symptoms:**
```
Error: Invalid token
Error: Token expired
User logged out unexpectedly
```

**Solutions:**

1. **Increase JWT Lifetime**
   ```typescript
   // bknd.config.ts
   config: {
     auth: {
       jwt: {
         expiresIn: '30d', // Increase from default (7d)
         // Options: '1h', '1d', '7d', '30d', etc.
       }
     }
   }
   ```

2. **Implement Refresh Token Flow**
   ```typescript
   // On app initialization
   useEffect(() => {
     const checkToken = () => {
       const token = localStorage.getItem('token');
       if (token && isTokenExpiringSoon(token)) {
         refreshToken(); // Implement refresh logic
       }
     };

     checkToken();
     setInterval(checkToken, 60000); // Check every minute
   }, []);
   ```

3. **Handle Token Expiration Gracefully**
   ```typescript
   // In API client
   async function apiCall(url, options) {
     const res = await fetch(url, options);

     if (res.status === 401) {
       // Token expired
       localStorage.removeItem('token');
       window.location.href = '/login'; // Redirect to login
       return null;
     }

     return res.json();
   }
   ```

4. **Store Token Refresh Date**
   ```typescript
   // When storing token
   localStorage.setItem('token', token);
   localStorage.setItem('tokenExpires', Date.now() + (7 * 24 * 60 * 60 * 1000));

   // Check expiration
   const expires = localStorage.getItem('tokenExpires');
   if (Date.now() > parseInt(expires)) {
     // Token expired, refresh or logout
   }
   ```

#### Issue: CORS Errors

**Symptoms:**
```
Error: Access to fetch has been blocked by CORS policy
No 'Access-Control-Allow-Origin' header is present
Origin 'http://localhost:5173' is not allowed
```

**Solutions:**

1. **Configure CORS in bknd.config.ts**
   ```typescript
   // bknd.config.ts
   export default {
     options: {
       cors: {
         enabled: true,
         origin: [
           'http://localhost:5173', // Vite dev
           'http://localhost:3000',  // Next.js dev
           'https://yourdomain.com'   // Production
         ],
         methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
         credentials: true,
       }
     }
   } satisfies BkndConfig;
   ```

2. **Allow All Origins (Development Only)**
   ```typescript
   cors: {
     enabled: true,
     origin: '*', // ⚠️ Only for development!
   }
   ```

3. **Check Proxy Configuration**
   ```typescript
   // If using Vite proxy, ensure CORS is correct
   // vite.config.ts
   export default {
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:3000',
           changeOrigin: true,
         }
       }
     }
   }
   ```

4. **Debug CORS in Browser**
   ```bash
   # Check preflight request
   curl -X OPTIONS http://localhost:3000/api/data/posts \
     -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -v

   # Check response headers
   # Should see: Access-Control-Allow-Origin: http://localhost:5173
   ```

#### Issue: Deployment Problems

**Symptoms:**
```
Error: DATABASE_URL not set
Error: File not found in production
Server crashes on startup
```

**Solutions:**

1. **Set Environment Variables**
   ```bash
   # Vercel
   vercel env add DATABASE_URL

   # Netlify
   netlify env:set DATABASE_URL "your-url"

   # Docker
   docker run -e DATABASE_URL="file:./db.sqlite" bknd-app

   # Kubernetes
   kubectl create configmap bknd-config --from-literal=DATABASE_URL=...
   ```

2. **Verify Database Connection in Production**
   ```typescript
   // Add startup check
   import { createApp } from "bknd";

   try {
     const app = await createApp(config);
     console.log('✅ Database connected successfully');
     return app;
   } catch (error) {
     console.error('❌ Database connection failed:', error);
     process.exit(1); // Crash fast to show error in logs
   }
   ```

3. **Check Build Artifacts**
   ```bash
   # Ensure config file is included in build
   ls -la dist/bknd.config.ts

   # Ensure database path is correct
   # Use environment variables, not hardcoded paths
   url: process.env.DATABASE_URL
   ```

4. **Verify Mode Configuration**
   ```typescript
   // Ensure mode matches deployment
   mode: process.env.NODE_ENV === 'production' ? 'code' : 'db',
   ```

#### Issue: Mode Switching Issues

**Symptoms:**
```
Error: Configuration not found in database
Error: Schema out of sync
Changes in Admin UI not reflecting
```

**Solutions:**

1. **Understand Mode Behavior**
   ```
   UI-only mode:
   - Reads/writes config from database
   - config property is initial seed only
   - Changes made via Admin UI are live immediately

   Code-only mode:
   - Reads config from code (bknd.config.ts)
   - Admin UI is read-only
   - Changes require code + redeploy

   Hybrid mode:
   - Dev: Reads from database (UI-only)
   - Prod: Reads from code (Code-only)
   - Requires config export/import for switch
   ```

2. **Export Configuration (Hybrid Mode)**
   ```bash
   # Export from UI-mode to use in Code-mode
   npx bknd config:export

   # This creates:
   # - bknd-config.json (schema, roles, etc.)
   # - .env.local (secrets)
   # - bknd-types.d.ts (TypeScript types)
   ```

3. **Sync Database Schema**
   ```bash
   # When switching modes, sync schema to database
   npx bknd db:sync

   # Force sync (drops tables - use carefully!)
   npx bknd db:sync --force
   ```

4. **Handle Database Migrations**
   ```typescript
   // When schema changes, run migrations
   // CLI automatically detects changes and applies
   npx bknd db:migrate
   ```

### 4.2 Known Issues & Workarounds

#### Issue: CodeMode Prevents Initial Seed

⚠️ **Current Behavior:**
When Bknd is in CodeMode (`mode: "code"`), the initial database seeding may fail because the schema is applied immediately, but the seed data requires tables to exist first.

**Symptoms:**
```
Error: Table 'users' does not exist
Error: Foreign key constraint failed
Seed script runs but no data appears
```

**Root Cause:**
Schema migration and seed execution happen in the same startup sequence, creating a race condition where tables may not be fully created before seed scripts run.

**🔧 Workaround 1: Use Hybrid Mode Initially**
```typescript
// bknd.config.ts
export default {
  options: {
    // Start in UI-mode for initial seed
    mode: process.env.SEED ? 'db' : 'code',
  }
};

// Run seed
SEED=1 bun run seed

// After seed completes, switch to code-mode for production
```

**🔧 Workaround 2: Separate Migration and Seed**
```bash
# Step 1: Create schema only
npx bknd db:sync

# Step 2: Run seed script
bun run seed.ts
```

**🔧 Workaround 3: Use Database Initialization Script**
```typescript
// init-db.ts
import { createApp } from "bknd";
import config from "./bknd.config";

async function init() {
  // Create app and sync schema
  const app = await createApp(config);
  await app.db.sync();

  // Now safe to seed
  const mutator = app.em.mutator('users');
  await mutator.create({
    email: 'admin@example.com',
    password: 'password',
    roles: ['admin']
  });

  console.log('✅ Database initialized and seeded');
}

init().catch(console.error);
```

**🔧 Workaround 4: Use Admin UI for Initial Seed**
1. Start in UI-mode temporarily
2. Create initial data via Admin UI
3. Export configuration
4. Switch to Code-mode
5. Deploy with exported config

**⚠️ Note:** This is a known bug and will be fixed in a future release. Track at:
- GitHub Issue: [link to issue]
- Roadmap: CodeMode seed improvements

---

#### Issue: Password Length Validation

⚠️ **Current Behavior:**
Bknd enforces a minimum password length of 8 characters, but this requirement is not clearly communicated to users during setup.

**Symptoms:**
```
Error: Password too short
Error: Validation failed: password.minLength
User cannot create account with short password
```

**🔧 Workaround: Document Minimum Length**

**In Admin UI:**
1. Add validation message on password field
2. Show "Minimum 8 characters" placeholder
3. Display error: "Password must be at least 8 characters"

**In Custom Forms:**
```typescript
// Validate client-side before submission
function validatePassword(password: string) {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  return { valid: true };
}

// Usage
const validation = validatePassword(passwordInput.value);
if (!validation.valid) {
  showError(validation.error);
  return; // Don't submit
}
```

**In Configuration:**
```typescript
// bknd.config.ts
config: {
  auth: {
    password: {
      minLength: 8, // Explicitly document requirement
      // Future: add custom validation messages
    }
  }
}
```

**⚠️ Note:** Password validation improvements are planned for future releases. Request feature:
- GitHub Issue: [link to issue]
- Roadmap: Enhanced password validation

---

#### Issue: Timestamp Indexing Limitations

⚠️ **Current Behavior:**
When using the `timestamps` plugin to auto-generate `created_at` and `updated_at` fields, users cannot add custom indexes to these timestamp columns.

**Symptoms:**
```
Error: Cannot index 'created_at'
Error: Index definition failed
Performance issues on timestamp queries
```

**Root Cause:**
The `timestamps` plugin creates fields programmatically, and the index API may not recognize these auto-generated fields as valid targets for indexing.

**🔧 Workaround 1: Manually Add Timestamps**
```typescript
// Don't use timestamps plugin
import { em, entity, text, date } from "bknd/data";

const schema = em({
  posts: entity("posts", {
    title: text(),
    // Manually add timestamps
    created_at: date(),
    updated_at: date(),
  }),
},
// Now you can index them
({ index }, { posts }) => {
  index(posts).on(['created_at']); // ✅ Works
  index(posts).on(['updated_at']);
});
```

**🔧 Workaround 2: Use Database-Level Indexes**
```bash
# After Bknd creates tables, add indexes manually
sqlite3 db.sqlite "CREATE INDEX idx_posts_created_at ON posts(created_at);"

# PostgreSQL
psql -d database "CREATE INDEX idx_posts_created_at ON posts(created_at);"
```

**🔧 Workaround 3: Use Alternative Columns**
```typescript
// If indexing by timestamp is critical, use a separate indexed column
const schema = em({
  posts: entity("posts", {
    title: text(),
    created_at: date(),        // Auto-generated by plugin
    created_index: number(),    // Unix timestamp for indexing
    updated_at: date(),        // Auto-generated by plugin
    updated_index: number(),    // Unix timestamp for indexing
  }),
},
({ index }, { posts }) => {
  // Index the numeric columns instead
  index(posts).on(['created_index']); // ✅ Works
  index(posts).on(['updated_index']);
});
```

**🔧 Workaround 4: Accept Performance Impact**
If queries on timestamps are infrequent, the performance impact of missing indexes may be acceptable.

**⚠️ Note:** Timestamp indexing improvements are planned for future releases. Track at:
- GitHub Issue: #325 (Inability to index created_at or updated_at)
- Roadmap: Plugin field indexing

---

#### Issue: Other Known Bugs

**As discovered through community feedback, document additional bugs with workarounds here.**

Template for new bug entries:

```
#### Issue: [Bug Name]

⚠️ **Current Behavior:**
[Brief description of bug]

**Symptoms:**
- [Symptom 1]
- [Symptom 2]

**Root Cause:**
[Technical explanation if known]

**🔧 Workaround 1: [Solution name]
[Step-by-step workaround]

**🔧 Workaround 2: [Solution name]
[Alternative solution]

**⚠️ Note:** [Fix timeline or tracking info]
- GitHub Issue: #[number]
- Roadmap: [Feature/Bug]
```

---

## Implementation Timeline & Priorities

### Priority Matrix

| Priority | Deliverable | Impact | Effort | ROI | Target |
|----------|-------------|---------|------|--------|--------|
| **P0** | "Build Your First API" tutorial (Vite + React) | Very High | High | **Very High** | Week 1 |
| **P0** | "Architecture & Concepts" page | High | Medium | **High** | Week 1 |
| **P1** | "Choose Your Mode" decision tree | High | Low | **Very High** | Week 2 |
| **P1** | Seed database guide | High | Low | **High** | Week 2 |
| **P1** | Create first user guide | High | Low | **High** | Week 2 |
| **P1** | "Enable Public Access with Guard" guide | High | Medium | **High** | Week 3 |
| **P1** | Entity-Media relationships guide | High | Medium | **High** | Week 3 |
| **P2** | Schema IDs vs UUIDs guide | Medium | Low | **High** | Week 4 |
| **P2** | Next.js integration guide | High | High | **Medium** | Week 5 |
| **P2** | Vite + React integration guide | High | High | **Medium** | Week 5 |
| **P2** | "Add Auth with Permissions" guide | Medium | Medium | **Medium** | Week 4 |
| **P2** | Troubleshooting FAQ | Medium | Low | **High** | Week 7 |
| **P3** | React Router integration guide | Medium | High | **Low** | Week 6 |
| **P3** | Astro integration guide | Low | High | **Low** | Week 6 |
| **P3** | Bun/Node standalone guide | Low | Medium | **Low** | Week 6 |
| **P3** | Cloudflare Workers guide | Low | Medium | **Low** | Week 8 |
| **P3** | AWS Lambda guide | Low | Medium | **Low** | Week 8 |
| **P3** | Docker guide | Low | Medium | **Low** | Week 8 |

### Week-by-Week Breakdown

**Week 1-2: Critical Foundation**
- "Build Your First API" tutorial (Vite + React from scratch)
- "Architecture & Concepts" page
- "Choose Your Mode" decision tree
- Seed database guide
- Create first user guide

**Week 3-4: Core Task Guides**
- "Enable Public Access with Guard" guide
- Entity-Media relationships guide
- Schema IDs vs UUIDs guide
- "Add Auth with Permissions" guide

**Week 5-6: Integration Guides**
- Next.js integration guide (complete working example)
- Vite + React integration guide
- React Router integration guide
- Astro integration guide
- Bun/Node standalone guide

**Week 7-8: Troubleshooting & Advanced**
- Troubleshooting FAQ (common issues)
- Known issues & workarounds
- Cloudflare Workers guide
- AWS Lambda guide
- Docker guide

---

## Success Metrics

### Quantitative Metrics

- **Onboarding Success:** New users complete "Build Your First API" tutorial in < 20 minutes
- **Documentation Engagement:** Reduced bounce rate on start page (measure with analytics)
- **Time to First Success:** Users successfully run Bknd from documentation within 10 minutes
- **Support Ticket Reduction:** Decrease in "how do I..." questions in Discord/GitHub
- **Tutorial Completion:** Users report completion of at least one tutorial

### Qualitative Metrics

- **User Confidence:** Users report feeling confident choosing modes, databases, frameworks
- **Mental Model:** Users can explain what Bknd is conceptually
- **Self-Sufficiency:** Users can solve common problems without asking for help
- **Documentation Satisfaction:** Positive feedback on documentation clarity and completeness

---

## Ongoing Maintenance

### Review Schedule

- **Monthly:** Check community feedback (Discord, GitHub issues, Reddit)
- **Quarterly:** Review and update tutorials for latest Bknd features
- **Bi-annually:** Audit documentation for outdated information
- **As needed:** Update known issues section when bugs are fixed

### Content Updates

When Bknd releases new features:
1. Update "Architecture & Concepts" to explain new feature
2. Add feature to relevant how-to guides
3. Create tutorial if feature is significant
4. Update API reference documentation
5. Test existing guides against new version

When community reports new issues:
1. Add to "Known Issues" section with workaround
2. Link to GitHub issue for tracking
3. Note expected fix timeline
4. Update when bug is resolved

### Contribution Guidelines

Encourage community contributions:
- "Found a typo or unclear section? Edit this page"
- "Have a better example? Submit a PR"
- "Missing a guide? Request it in GitHub issues"

---

## Appendix: Reference Materials

### Documentation Sources

- [Mintlify: How to Write Documentation That Developers Want to Read](https://www.mintlify.com/blog/how-to-write-documentation-that-developers-want-to-read)
- [Divio: Documentation System](https://docs.divio.com/documentation-system/)
- [Bknd Documentation](https://docs.bknd.io/)
- [Bknd GitHub Repository](https://github.com/bknd-io/bknd)

### Community Feedback Sources

- Hacker News "Show HN: Bknd" (https://news.ycombinator.com/item?id=43471838)
- Reddit r/nextjs discussion
- GitHub issues (https://github.com/bknd-io/bknd/issues)
- Discord community

### Additional Documentation Files in This Repository

- `/docs/orm.md` - ORM and schema reference
- `/docs/schema.md` - Schema prototype API
- `/docs/bknd-comparison-pocketbase.md` - PocketBase comparison
- `/docs/query-system.md` - Query system documentation

---

## Next Steps

1. **Approve This Roadmap**
   - Review prioritization and timeline
   - Adjust based on resources and goals
   - Identify which P0/P1 items to start with

2. **Set Up Documentation Infrastructure**
   - Choose documentation platform (Mintlify? GitBook? Custom?)
   - Establish content creation workflow
   - Set up review process

3. **Begin Phase 1 Implementation**
   - Start with "Build Your First API" tutorial
   - Create "Architecture & Concepts" page
   - Build decision tree for modes

4. **Gather Feedback Early**
   - Share initial drafts with community
   - Test tutorials with new users
   - Iterate based on feedback

5. **Measure and Iterate**
   - Track success metrics
   - Adjust priorities based on data
   - Continuously improve content

---

**Document Status:** ✅ Complete (Planning Phase)

**Last Updated:** January 8, 2026

**Questions?** Contact [maintainer] or open an issue in [repository]
