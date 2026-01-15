---
title: "Welcome to Bknd"
description: "Embeddable backend for modern web applications. Build full-stack apps with your frontend framework of choice."
---

Bknd is an embeddable backend framework that lets you build full-stack applications using your existing frontend setup. No separate backend server required—Bknd runs embedded in your application.

## Quick Start

<Columns cols={3}>
  <Card title="Build Your First API" href="/getting-started/build-your-first-api" icon="zap">
    Create a complete API in 15 minutes with Vite + React. Learn fundamentals of defining entities, enabling authentication, and building a React UI that consumes your API.
  </Card>

  <Card title="Add Authentication" href="/getting-started/add-authentication" icon="shield">
    Add email/password authentication with role-based permissions in 20 minutes. Secure your API with user registration, login, roles, and protected endpoints.
  </Card>

  <Card title="Deploy to Production" href="/getting-started/deploy-to-production" icon="rocket">
    Deploy your Bknd application to Vercel in 15 minutes. Configure environment variables, choose the right mode, and go live.
  </Card>
</Columns>

<Info title="PostgreSQL Migration Guide (v0.20.0)">
  If you're upgrading from a previous version, read the [migration guide](/migration-guides/postgres-package-merge) for the PostgreSQL package merge.
</Info>

<Info title="v0.20.0 Release Notes">
  Read about new features, improvements, and breaking changes in latest release.
</Info>

## What is Bknd?

[Read the full overview →](/architecture-and-concepts/what-is-bknd)

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
- [Choose Your Mode](/how-to-guides/setup/choose-your-mode) - DB mode, code mode, or UI mode
- [How Bknd Works](/architecture-and-concepts/how-bknd-works) - Request lifecycle and architecture
- [Entity Relationships](/how-to-guides/data/entity-media-relationships) - One-to-many, many-to-many, polymorphic

### Integration Guides
- [Next.js Integration](/how-to-guides/setup/integrations/nextjs) - Server components and App Router
- [Vite + React Integration](/how-to-guides/setup/integrations/vite-react) - Standalone SPA setup
- [React Router Integration](/how-to-guides/setup/integrations/react-router) - Loader/Action pattern
- [SvelteKit Integration](/how-to-guides/setup/integrations/sveltekit) - SSR and load functions
- [Browser + SQLocal](/how-to-guides/setup/integrations/browser-sqlocal) - Local-first offline apps
- [Cloudflare Workers](/how-to-guides/setup/integrations/cloudflare-workers) - Edge deployment

### Authentication & Permissions
- [Create First User](/how-to-guides/auth/create-first-user) - Admin, CLI, or programmatic methods
- [Email OTP Authentication](/how-to-guides/auth/email-otp) - Passwordless login via one-time codes
- [Public Access with Guard](/how-to-guides/permissions/public-access-guard) - Guest access configuration
- [Plunk Email Provider](/how-to-guides/integrations/plunk-email) - Open-source email platform for transactional emails
- [Auth Module Reference](/reference/auth-module) - Complete authentication API

### Data Management
- [Seed Database](/how-to-guides/data/seed-database) - Initial data for any mode
- [Schema IDs vs UUIDs](/how-to-guides/data/schema-ids-vs-uuids) - Configuration and trade-offs
- [Data Module Reference](/reference/data-module) - CRUD operations and query system

## Framework Comparison

**Not sure which framework to use?**

[Compare integration approaches across React, Next.js, Vue, and more →](/how-to-guides/setup/integrations/framework-comparison)

## Troubleshooting

Running into issues? Check our troubleshooting resources:

- [Common Issues](/troubleshooting/common-issues) - Database connections, type generation, CORS
- [Known Issues](/troubleshooting/known-issues) - Bugs and workarounds

## Getting Help

**Documentation**

- Browse the [full documentation index](#)
- Search using **Ctrl/Cmd + K**
- Explore [how-to guides](/how-to-guides/setup/choose-your-mode) and [reference docs](/reference/auth-module)

**Community**

- [GitHub Issues](https://github.com/bknd-io/bknd/issues) - Report bugs and request features
- [Discussions](https://github.com/bknd-io/bknd/discussions) - Ask questions and share ideas

**Official Resources**

- [Bknd GitHub Repository](https://github.com/bknd-io/bknd) - Source code and releases
- [Official Documentation](https://docs.bknd.io) - Latest docs and updates
- [Apache-2.0 License](https://www.apache.org/licenses/LICENSE-2.0) - Bknd is licensed under Apache 2.0

## Next Steps

1. **New to Bknd?** Follow the [Onboarding Flow](/onboarding-flow) for a guided experience
2. **Start building?** [Build Your First API](/getting-started/build-your-first-api)
3. **Exploring Bknd?** Read [What is Bknd?](/architecture-and-concepts/what-is-bknd)
4. **Integrating Bknd?** Choose your integration: [Next.js](/how-to-guides/setup/integrations/nextjs), [Vite + React](/how-to-guides/setup/integrations/vite-react), [React Router](/how-to-guides/setup/integrations/react-router), or [Astro](/how-to-guides/setup/integrations/astro)
5. **Need authentication?** Follow [Add Authentication](/getting-started/add-authentication)
6. **Ready to deploy?** Read [Deploy to Production](/getting-started/deploy-to-production)
