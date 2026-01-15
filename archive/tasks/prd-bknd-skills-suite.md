# PRD: Bknd Skills Suite for AI Assistants

## Introduction/Overview

Bknd is a newer, less-documented backend-as-a-service platform that AI models lack training data on. This initiative creates a suite of 11 reusable **Amp skills** to enable AI assistants to effectively guide developers through common Bknd workflows and solve real-world problems.

Each skill acts as a specialized knowledge module that an AI can invoke to understand how to implement specific Bknd features—from authentication and media handling to deployment and optimization.

**Goal:** Dramatically improve the developer experience when building with Bknd by giving AI assistants the context needed to provide accurate, actionable guidance.

---

## Goals

1. **Enable AI-Assisted Development** - Let developers ask AI agents about Bknd tasks and receive expert guidance based on curated, up-to-date knowledge.
2. **Reduce Time-to-First-Success** - Developers can get from "what is Bknd?" to "I built a working feature" faster.
3. **Close Bknd Documentation Gaps** - Supplement official docs with practical how-to knowledge and common patterns.
4. **Support All Common Workflows** - Cover the 80/20 of tasks developers actually do with Bknd.
5. **Build on Existing Foundations** - Extend the 3 existing skills (querying, schemas, configuration) with complementary ones.

---

## User Stories

**As a** junior developer building my first Bknd app,  
**I want** an AI to guide me through setting up authentication,  
**So that** I don't have to read scattered docs and figure out JWT/roles myself.

**As an** experienced dev integrating Bknd into Next.js,  
**I want** an AI to show me server-side patterns and data-fetching best practices,  
**So that** my integration is idiomatic and performs well.

**As a** solo indie hacker,  
**I want** an AI to help me deploy to edge platforms without hiring DevOps,  
**So that** I can ship fast with zero infrastructure stress.

**As a** developer debugging a CORS error,  
**I want** an AI to help me understand the issue and walk through solutions,  
**So that** I get unblocked quickly instead of guessing.

---

## Functional Requirements

### High-Priority Skills (Tier 1) - Build First

**1. Authentication & Authorization (bknd-authentication-setup)**
- Skill must explain how to set up email/password authentication
- Skill must document how to configure JWT tokens (lifetime, secrets)
- Skill must explain role-based access control (RBAC) and how to attach roles to users
- Skill must cover OAuth/OIDC setup (Google, GitHub)
- Skill must show how to protect endpoints with authentication guards
- Skill must include code examples for common patterns (login, register, password reset)

**2. Media Handling (bknd-media-handling)**
- Skill must explain how to configure media storage (local, R2, S3)
- Skill must show how to handle file uploads from client code
- Skill must document media access patterns and permissions
- Skill must include examples for different storage backends
- Skill must explain trade-offs between storage options

**3. Permissions & Row-Level Security (bknd-permissions-and-rls)**
- Skill must explain Guard clauses and how to write them
- Skill must document RLS patterns and constraints
- Skill must show how to implement user-scoped data access
- Skill must include examples of public vs. private endpoints
- Skill must explain permission inheritance and role composition

### High-Priority Skills (Tier 2) - Build Second

**4. Next.js Integration (integrating-bknd-nextjs)**
- Skill must explain server vs. client-side Bknd usage
- Skill must show data fetching patterns for App Router
- Skill must document API routes integration points
- Skill must include Server Component examples
- Skill must show SSR/SSG considerations

**5. Deployment (bknd-deployment-guide)**
- Skill must cover Vercel deployment (most common)
- Skill must cover Cloudflare Workers deployment
- Skill must cover Docker deployment
- Skill must cover AWS Lambda and Bun as secondary options
- Skill must explain environment variables and secrets management for each platform
- Skill must include database connection setup per platform

**6. Email Integration (bknd-email-integration)**
- Skill must explain transactional email setup (Plunk, SendGrid, etc.)
- Skill must show OTP flow implementation
- Skill must include email template patterns
- Skill must document available email providers
- Skill must show how to test emails locally

### Medium-Priority Skills (Tier 3) - Build Third

**7. Event Hooks & Custom Logic (bknd-event-hooks)**
- Skill must explain available lifecycle hooks
- Skill must show how to write custom business logic in hooks
- Skill must include timing and order of hook execution
- Skill must document hook parameters and return values
- Skill must show practical examples (e.g., send email on user signup)

**8. React SDK & Real-Time (bknd-react-sdk)**
- Skill must explain the Bknd React SDK API
- Skill must show data fetching and mutation hooks
- Skill must document real-time sync patterns
- Skill must include loading/error state handling
- Skill must show optimistic updates patterns

**9. Debugging & Troubleshooting (debugging-bknd-issues)**
- Skill must list common errors and their root causes
- Skill must show CORS troubleshooting steps
- Skill must document migration and type-generation issues
- Skill must include DB connection debugging
- Skill must provide a decision tree for common problems

**10. Mode Selection (choosing-bknd-mode)**
- Skill must explain code mode vs. UI mode vs. DB mode
- Skill must show when to use each mode
- Skill must document trade-offs (flexibility vs. ease-of-use)
- Skill must include decision tree for developers
- Skill must show mode switching/migration patterns

### Lower-Priority Skills (Tier 4) - Build If Time Permits

**11. Performance & Optimization (bknd-performance-optimization)**
- Skill must explain indexing strategies
- Skill must document query optimization patterns
- Skill must show pagination best practices
- Skill must explain caching patterns
- Skill must include profiling/benchmarking guidance

---

## Non-Goals (Out of Scope)

- Skills will NOT include custom Bknd framework development or plugin creation
- Skills will NOT cover advanced use cases like multi-tenancy patterns (separate skill if demand exists)
- Skills will NOT be general AWS/Cloudflare/Docker tutorials—only Bknd-specific setup
- Skills will NOT replace official Bknd documentation; they supplement it
- Skills will NOT include offline-first/SQLocal patterns (lower demand, can be added later)
- Skills will NOT be exhaustive API reference—that's already in Bknd docs

---

## High-Level Structure (Each Skill Contains)

Each skill document (`SKILL.md`) will follow this structure:

1. **Metadata** (YAML frontmatter)
   - Name, description, use-case examples

2. **Quick Start** (2-3 min read)
   - Minimal working example
   - Copy-paste ready code

3. **Concepts** (5-10 min read)
   - Key terminology and patterns
   - Decision points ("when to use X vs Y")

4. **Common Patterns** (5-10 min read)
   - 3-5 realistic scenarios with code
   - What works, what doesn't

5. **API Reference** (as needed)
   - Configuration options
   - Method signatures
   - Parameters and return types

6. **Troubleshooting** (per skill)
   - Common issues specific to this skill
   - Solutions and workarounds

7. **Links to Related Skills**
   - Cross-references to complementary knowledge

---

## Success Metrics

1. **Adoption** - 80%+ of Bknd-related questions answered by AI using these skills within 3 months
2. **Completeness** - All Tier 1 & 2 skills published by end of Q2
3. **Developer Feedback** - Developers report "significantly faster" onboarding (survey or comments)
4. **Documentation Coverage** - Skills cover 80% of common "how do I...?" questions on Bknd Discord/GitHub
5. **Reusability** - Each skill is invoked in 10+ developer threads within first month of launch

---

## Open Questions

1. Should skills include video embeds or links, or text-only?
2. Do we need versioning if Bknd releases breaking changes?
3. Should Tier 4 (offline-first, multi-tenant) be pre-built in this initiative, or deferred?
4. How frequently should skills be updated as Bknd evolves?
5. Should we create a "cheat sheet" skill that ties all 11 together?

---

## Prioritization Summary

| Tier | Skills | When to Build | Why |
|------|--------|---------------|-----|
| **Tier 1** | Authentication, Media, Permissions | Weeks 1-2 | These are the first blockers most devs hit |
| **Tier 2** | Next.js, Deployment, Email | Weeks 3-4 | Enable real-world production workflows |
| **Tier 3** | Hooks, React SDK, Debugging, Mode Selection | Weeks 5-6 | Support advanced patterns and problem-solving |
| **Tier 4** | Performance & Optimization | Week 7+ | Nice-to-have; lower demand initially |

---

## Implementation Notes

- Build on top of existing Amp skill structure (see `building-skills` skill)
- Use the existing skills (querying, schemas, config) as reference for tone/depth
- Prioritize linking to official Bknd docs rather than duplicating
- Embed practical, testable code examples throughout
- Keep skills modular—each should stand alone but reference others

