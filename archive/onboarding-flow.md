---
title: I'm New Here
description: First-time visitor guide for getting started with Bknd
---

Welcome to Bknd! This guide helps you get started quickly based on your goals and experience level.

## Choose Your Path

<Columns cols={3}>
  <Card title="I'm New to Backend Development" href="/getting-started/build-your-first-api" icon="book-open">
    **Time: 30 minutes**

    Start here if you're new to building backends. You'll learn:
    - What a backend framework is
    - How Bknd works (embeddable architecture)
    - Build your first API with React
  </Card>

  <Card title="I Know Backend, New to Bknd" href="/getting-started/build-your-first-api" icon="code">
    **Time: 15 minutes**

    Skip the basics and jump straight to implementation:
    - Set up Bknd with your preferred framework
    - Define entities and enable auth
    - Deploy to production
  </Card>

  <Card title="I'm Integrating Bknd into Existing App" href="/how-to-guides/setup/integrations/framework-comparison" icon="plug">
    **Time: 20 minutes**

    Choose your framework and integrate:
    - [Next.js](/how-to-guides/setup/integrations/nextjs)
    - [Vite + React](/how-to-guides/setup/integrations/vite-react)
    - [React Router](/how-to-guides/setup/integrations/react-router)
    - [Astro](/how-to-guides/setup/integrations/astro)
  </Card>
</Columns>

## Core Onboarding Checklist

Complete these steps to activate your Bknd application:

- [ ] **Step 1: Build Your First API** (15 min)
  - Set up a Vite + React project
  - Define your data model (entities)
  - Enable the Admin UI
  - Test your API
  [Go to Tutorial →](/getting-started/build-your-first-api)

- [ ] **Step 2: Add Authentication** (20 min)
  - Enable password-based auth
  - Create your first admin user
  - Set up role-based permissions
  - Protect endpoints
  [Go to Tutorial →](/getting-started/add-authentication)

- [ ] **Step 3: Deploy to Production** (15 min)
  - Choose a database (Turso, PostgreSQL, or SQLite)
  - Configure environment variables
  - Deploy to Vercel
  - Test production API
  [Go to Tutorial →](/getting-started/deploy-to-production)

**Total Time:** ~50 minutes to full deployment

## What Makes Bknd Different?

Before you start, understand what makes Bknd unique:

### Embeddable Architecture

Bknd runs **as part of your application**, not as a separate service. This means:
- No separate backend server to manage
- Single codebase for frontend + backend
- Type safety across your entire stack
- Easier deployment (just deploy your app)

### Full-Stack Type Safety

Auto-generated TypeScript types from your schema:
- Entity types generated automatically
- Query parameters type-checked
- Compile-time errors catch bugs early
- No more "any" types in your API code

### Choose Your Configuration Mode

Bknd supports three ways to define your backend:

| Mode | Best For | How It Works |
|-------|-----------|---------------|
| **Code Mode** | Developers who prefer code-first | Define entities in TypeScript files |
| **DB Mode** | Visual schema creation | Create entities in Admin UI |
| **UI Mode** | Quick prototyping | Mix code and visual tools |

[Learn more about modes →](/how-to-guides/setup/choose-your-mode)

## Common Use Cases

Pick the guide that matches what you're building:

### Building a SaaS Application
**Tutorial:** [Build Your First API](/getting-started/build-your-first-api) → [Add Authentication](/getting-started/add-authentication) → [Deploy to Production](/getting-started/deploy-to-production)

**You'll learn:**
- Multi-tenant data isolation
- User authentication with roles
- Protected API endpoints
- Production deployment

### Building a Content Website
**Guide:** [Choose Your Mode](/how-to-guides/setup/choose-your-mode) → [Entity-Media Relationships](/how-to-guides/data/entity-media-relationships) → [Next.js Integration](/how-to-guides/setup/integrations/nextjs)

**You'll learn:**
- Content management with entities
- Media file uploads
- SEO-friendly page routing
- Server-side rendering

### Building an API for Mobile App
**Guide:** [Choose Your Mode](/how-to-guides/setup/choose-your-mode) → [Create First User](/how-to-guides/auth/create-first-user) → [Public Access with Guard](/how-to-guides/permissions/public-access-guard)

**You'll learn:**
- REST API design
- JWT authentication
- Permission-based access control
- Guest/public endpoints

## Need Help?

### Quick Answers

**Q: Do I need a separate backend server?**
No! Bknd runs embedded in your application. No separate server needed.

**Q: What databases does Bknd support?**
SQLite (default), PostgreSQL, MySQL, and more. Upgrade when ready without code changes.

**Q: Can I use my existing frontend?**
Yes! Bknd works with React, Next.js, Vue, Svelte, Astro, and vanilla JavaScript.

**Q: Is Bknd production-ready?**
Yes. Used in production applications with JWT auth, RLS permissions, and enterprise-grade database support.

[Read Common Issues →](/troubleshooting/common-issues)

### Community & Support

- **GitHub Issues** - [Report bugs](https://github.com/bknd-io/bknd/issues)
- **Discussions** - [Ask questions](https://github.com/bknd-io/bknd/discussions)
- **Official Docs** - [docs.bknd.io](https://docs.bknd.io)
- **Examples** - [GitHub Repository](https://github.com/bknd-io/bknd)

## Progressive Learning Path

Once you complete the core checklist, continue learning:

### Level 1: Fundamentals ✅
- [x] Build Your First API
- [x] Add Authentication
- [x] Deploy to Production

### Level 2: Core Concepts
- [ ] [How Bknd Works](/architecture-and-concepts/how-bknd-works) - Request lifecycle
- [ ] [Choose Your Mode](/how-to-guides/setup/choose-your-mode) - Configuration modes
- [ ] [Schema IDs vs UUIDs](/how-to-guides/data/schema-ids-vs-uuids) - Primary key strategy

### Level 3: Advanced Features
- [ ] [Entity Relationships](/how-to-guides/data/entity-media-relationships) - One-to-many, many-to-many
- [ ] [Seed Database](/how-to-guides/data/seed-database) - Initial data patterns
- [ ] [Query System](/reference/query-system) - Advanced querying with filters and sorting

### Level 4: Production Best Practices
- [ ] [Troubleshooting](/troubleshooting/common-issues) - Debug common issues
- [ ] [Known Issues](/troubleshooting/known-issues) - Bugs and workarounds
- [ ] [Performance Optimization](/reference/entity-manager-api) - Advanced API patterns

## Next Steps

1. **Start building** → [Build Your First API](/getting-started/build-your-first-api)
2. **Read architecture** → [What is Bknd?](/architecture-and-concepts/what-is-bknd)
3. **Choose framework** → [Integration Guides](/how-to-guides/setup/integrations/framework-comparison)
4. **Get help** → [Troubleshooting FAQ](/troubleshooting/common-issues)

---

**Pro Tip:** Bookmark this page as your starting point. Use the checklist above to track your progress, and revisit the learning path as you advance.
