---
title: "What is Bknd?"
description: "Lightweight embeddable backend framework for JavaScript. Instant REST API, auth, and database management in any environment."
---

**Bknd** is a lightweight, infrastructure-agnostic backend system that runs in any JavaScript environment. It provides an instant backend with a full REST API, authentication, database management, media handling, and workflows.

## Core Philosophy

Bknd solves five key problems with traditional backend systems:

1. **Database lock-in** - Uses SQLite, LibSQL, or even Postgres as the base, treating it as a data store with schema enforcement at the application layer
2. **Environment and framework lock-in** - Works with any JavaScript framework by strictly using Web APIs
3. **Deviation from standards** - Adheres to web standards for authentication headers and query parameters
4. **Wrong-for-your-use-case implementations** - Uses an event system instead of hardcoding features like email verification
5. **Complex self-hosting** - Deploy wherever you deploy your frontend (Next.js, Remix, Astro, etc.)

## How Bknd Works

### Embeddable Architecture

Unlike traditional backend systems that run as separate services, Bknd integrates directly into your application:

- **Server-side integration**, not client-side
- Runs within your framework (Next.js, Astro, Remix, etc.)
- Enables single deployment for your entire application
- Or run standalone via CLI/Docker

### Mode Types

You can run Bknd in three modes:

1. **CodeMode** - Define entities programmatically in TypeScript
2. **HybridMode** - Use both programmatic and Admin UI configuration
3. **UIMode** - Configure everything through the Admin UI

### Database Strategy

Bknd focuses on SQLite as the "weakest" SQL database and:

- Treats it as a data store and query interface
- Moves schema details and enforcement to the application layer
- Makes it easy to adjust default values, property lengths, and validation
- Works without database-enforced referential integrity (integrity checks at application layer)
- Supports any SQL database (PostgreSQL, Turso/LibSQL, Cloudflare D1) theoretically

### Web Standards Compliance

Bknd follows web standards to ensure compatibility:

- Uses standard HTTP headers for authentication
- Implements standard query parameter formats
- Offers convenient alternatives where helpful

Example:
```
/api/data/todos?select=id&select=name  # Web standard
/api/data/todos?select=id,name          # Handy alternative
```

## Key Features

### Instant REST API

Get a complete REST API immediately:
- CRUD operations for all entities
- Automatic type generation
- Built-in query system (`where`, `with`, `sort`)
- Permission-based access control

### Authentication Module

- Multiple authentication strategies (email/password, OAuth 2.0, OpenID Connect)
- Built-in support for Google and GitHub OAuth providers
- Custom OAuth provider support for any OIDC/OAuth 2.0 compliant provider
- JWT-based session management
- Role-based access control (RBAC)
- Row-level security (RLS) support

### Data Module

- Entity management with relationships
- Type-safe schema definition
- Automatic migrations
- Query system with complex filtering
- Built-in validation at field level

### Media Module

- File upload and storage
- Automatic image transformations
- Entity-media relationships
- Cloud storage support

### Event System

Powerful event system for custom business logic:
- Asynchronous execution (webhooks)
- Synchronous execution with blocking
- React to system events (user creation, entity changes, etc.)
- JSON-serializable workflows

## When to Use Bknd

### Perfect For

- **Rapid prototyping** - Get a full backend in minutes, not hours
- **Small to medium applications** - Don't need a complex backend infrastructure
- **Multi-framework projects** - Want to switch between Next.js, Astro, Remix, etc.
- **Edge deployment** - Need to run on Cloudflare Workers, Vercel Edge, etc.
- **Type-safety** - Want TypeScript throughout the stack
- **Simple self-hosting** - Deploy alongside your frontend

### Consider Alternatives If

- You need **enterprise-scale** database features
- You require **complex microservices** architecture
- You need **advanced database features** specific to PostgreSQL/MySQL
- You're building a **large-scale SaaS** with complex multi-tenancy
- You need **real-time features** (WebSockets, GraphQL subscriptions)

## Comparison with Alternatives

### vs. Firebase

| Aspect | Firebase | Bknd |
|--------|----------|------|
| Database | NoSQL (Firestore) | SQL (SQLite, PostgreSQL, etc.) |
| Deployment | Cloud-only | Anywhere (including self-hosted) |
| Authentication | Built-in providers | Flexible strategies, custom business logic |
| Query Language | Custom SDK | REST API + Type-safe SDK |
| Offline Sync | Native | Not built-in (use your own) |
| Pricing | Usage-based | Free, self-hosted |

### vs. Supabase

| Aspect | Supabase | Bknd |
|--------|----------|------|
| Database | PostgreSQL | Any SQL (SQLite by default) |
| Deployment | Cloud or self-hosted | Anywhere (including embedded) |
| Architecture | Separate backend service | Embedded in your app |
| Real-time | Native | Not built-in |
| Auth | Built-in providers | Flexible strategies |

### vs. Prisma

| Aspect | Prisma | Bknd |
|--------|--------|------|
| Type | ORM | Full backend system |
| Schema | Prisma Schema | TypeScript entities |
| API | None | Complete REST API |
| Auth | None | Built-in authentication |
| Deployment | N/A | Single deployment with frontend |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
│                  (Next.js / Astro / Remix)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        Bknd                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   Data   │  │  Media   │  │  Flows   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              REST API (Hono)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Admin UI (React)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database                                │
│              (SQLite / PostgreSQL / D1 / Turso)              │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

The fastest way to start:

```bash
npx bknd run
```

This spins up a Bknd instance with:
- In-memory database
- Admin UI at `http://localhost:3000`
- REST API at `http://localhost:3000/api`

For framework-specific integration, see the [Integration Guides](/how-to-guides/setup/integrations/).

## Learn More

- [How Bknd Works](/how-bknd-works) - Deep dive into request lifecycle and architecture
- [Choose Your Mode](/how-to-guides/setup/choose-your-mode) - Decide which mode fits your needs
- [Build Your First API](/getting-started/build-your-first-api) - 15-minute tutorial

## Related Guides

- [Add Authentication with Permissions](/getting-started/add-authentication) - Complete auth setup
- [Deploy to Production](/getting-started/deploy-to-production) - Production deployment guide
- [Next.js Integration](/how-to-guides/setup/integrations/nextjs) - Framework integration example
- [Public Access with Guard](/how-to-guides/permissions/public-access-guard) - Permission setup
- [Framework Comparison](/how-to-guides/setup/integrations/framework-comparison) - Compare integration approaches
