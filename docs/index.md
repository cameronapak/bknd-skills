---
title: "Welcome to Bknd"
description: "Embeddable backend for modern web applications. Build full-stack apps with your frontend framework of choice."
---

# Welcome to Bknd

Bknd is an embeddable backend framework that lets you build full-stack applications using your existing frontend setup. No separate backend server required—Bknd runs embedded in your application.

## Quick Start

<div className="grid gap-4 grid-cols-1 md:grid-cols-3">
  
  <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
    
### [Build Your First API](./getting-started/build-your-first-api.md)

Create a complete API in 15 minutes with Vite + React.

Learn the fundamentals of defining entities, enabling authentication, and building a React UI that consumes your API.

  </div>

  <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
    
### [Add Authentication](./getting-started/add-authentication.md)

Add email/password authentication with role-based permissions in 20 minutes.

Secure your API with user registration, login, roles, and protected endpoints.

  </div>

  <div className="flex flex-col gap-2 p-4 rounded-lg border border-border">
    
### [Deploy to Production](./getting-started/deploy-to-production.md)

Deploy your Bknd application to Vercel in 15 minutes.

Configure environment variables, choose the right mode, and go live.

  </div>

</div>

## What is Bknd?

[Read the full overview →](./architecture-and-concepts/what-is-bknd.md)

**Embeddable Architecture**

Bknd runs as part of your application, not as a separate service. Define your backend in code or visually with the Admin UI, and it's embedded directly into your app.

**Full-Stack Type Safety**

Auto-generated TypeScript types from your schema. Use types in your frontend code for compile-time safety.

**Zero Configuration**

Start with SQLite, upgrade to PostgreSQL when ready. Bknd handles database migrations, connections, and queries automatically.

**Built-in Auth & Permissions**

Authentication module with JWT tokens, roles, and row-level security (RLS). Protect endpoints with minimal code.

**Framework Agnostic**

Works with any frontend framework: React, Next.js, Vue, Svelte, Astro, and vanilla JavaScript.

## Popular Resources

### Core Concepts
- [Choose Your Mode](./how-to-guides/setup/choose-your-mode.md) - DB mode, code mode, or UI mode
- [How Bknd Works](./architecture-and-concepts/how-bknd-works.md) - Request lifecycle and architecture
- [Entity Relationships](./how-to-guides/data/entity-media-relationships.md) - One-to-many, many-to-many, polymorphic

### Integration Guides
- [Next.js Integration](./how-to-guides/setup/integrations/nextjs.md) - Server components and App Router
- [Vite + React Integration](./how-to-guides/setup/integrations/vite-react.md) - Standalone SPA setup
- [React Router Integration](./how-to-guides/setup/integrations/react-router.md) - Loader/Action pattern
- [Cloudflare Workers](./how-to-guides/setup/integrations/cloudflare-workers.md) - Edge deployment

### Authentication & Permissions
- [Create First User](./how-to-guides/auth/create-first-user.md) - Admin, CLI, or programmatic methods
- [Public Access with Guard](./how-to-guides/permissions/public-access-guard.md) - Guest access configuration
- [Auth Module Reference](./reference/auth-module.md) - Complete authentication API

### Data Management
- [Seed Database](./how-to-guides/data/seed-database.md) - Initial data for any mode
- [Schema IDs vs UUIDs](./how-to-guides/data/schema-ids-vs-uuids.md) - Configuration and trade-offs
- [Data Module Reference](./reference/data-module.md) - CRUD operations and query system

## Framework Comparison

**Not sure which framework to use?**

[Compare integration approaches across React, Next.js, Vue, and more →](./how-to-guides/setup/integrations/framework-comparison.md)

## Troubleshooting

Running into issues? Check our troubleshooting resources:

- [Common Issues](./troubleshooting/common-issues.md) - Database connections, type generation, CORS
- [Known Issues](./troubleshooting/known-issues.md) - Bugs and workarounds

## Getting Help

**Documentation**

- Browse the [full documentation index](#)
- Search using **Ctrl/Cmd + K**
- Explore [how-to guides](./how-to-guides/setup/choose-your-mode.md) and [reference docs](./reference/auth-module.md)

**Community**

- [GitHub Issues](https://github.com/bknd-io/bknd/issues) - Report bugs and request features
- [Discussions](https://github.com/bknd-io/bknd/discussions) - Ask questions and share ideas

**Official Resources**

- [Bknd GitHub Repository](https://github.com/bknd-io/bknd) - Source code and releases
- [Official Documentation](https://docs.bknd.io) - Latest docs and updates

## Next Steps

1. **New to Bknd?** Follow the [Onboarding Flow](./onboarding-flow.md) for a guided experience
2. **Start building?** [Build Your First API](./getting-started/build-your-first-api.md)
3. **Exploring Bknd?** Read [What is Bknd?](./architecture-and-concepts/what-is-bknd.md)
4. **Integrating Bknd?** Choose your integration: [Next.js](./how-to-guides/setup/integrations/nextjs.md), [Vite + React](./how-to-guides/setup/integrations/vite-react.md), [React Router](./how-to-guides/setup/integrations/react-router.md), or [Astro](./how-to-guides/setup/integrations/astro.md)
5. **Need authentication?** Follow [Add Authentication](./getting-started/add-authentication.md)
6. **Ready to deploy?** Read [Deploy to Production](./getting-started/deploy-to-production.md)
