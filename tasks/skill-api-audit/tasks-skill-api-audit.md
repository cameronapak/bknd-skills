# Tasks: Bknd Skills API Audit & Fix

## Relevant Files

- `plugins/bknd-skills/skills/data-schema/SKILL.md` - Data schema skill (known critical issues with `primary()` import)
- `plugins/bknd-skills/skills/query/SKILL.md` - Query skill (known critical issues with `em.repo()`)
- `plugins/bknd-skills/skills/getting-started/SKILL.md` - Getting started skill
- `plugins/bknd-skills/skills/auth/SKILL.md` - Auth skill
- `plugins/bknd-skills/skills/permissions/SKILL.md` - Permissions skill
- `plugins/bknd-skills/skills/nextjs/SKILL.md` - Next.js integration skill
- `plugins/bknd-skills/skills/vite-react/SKILL.md` - Vite+React integration skill
- `plugins/bknd-skills/skills/astro/SKILL.md` - Astro integration skill
- `plugins/bknd-skills/skills/database/SKILL.md` - Database adapters skill
- `plugins/bknd-skills/skills/media/SKILL.md` - Media module skill
- `plugins/bknd-skills/skills/config-modes/SKILL.md` - Config modes skill
- `plugins/bknd-skills/skills/api-sdk/SKILL.md` - API SDK skill
- `plugins/bknd-skills/skills/plugins/SKILL.md` - Plugins skill
- `plugins/bknd-skills/skills/deploy/SKILL.md` - Deploy skill
- `plugins/bknd-skills/skills/code-review/SKILL.md` - Code review skill
- `tasks/LEARNINGS.md` - Document all API findings and gotchas

### Notes

- Use `npx opensrc bknd` to fetch/verify bknd source exports
- Use ZRead MCP (`mcp__zread__*`) to search bknd repo for usage patterns
- All code examples must compile against bknd v0.20.0 types

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, check it off by changing `- [ ]` to `- [x]`. Update after each sub-task, not just parent tasks.

## Tasks

- [ ] 1.0 Audit Critical Skills (data-schema, query)
  - [ ] 1.1 Read `data-schema/SKILL.md`, list all code examples
  - [ ] 1.2 Remove `import { primary } from "bknd"` - not exported
  - [ ] 1.3 Remove `id: primary({ format: "uuid" })` example
  - [ ] 1.4 Add `entity(..., { primary_format: "uuid" })` pattern
  - [ ] 1.5 Verify field types (`text`, `number`, `boolean`, `date`, `enumm`, `json`) against bknd source
  - [ ] 1.6 Read `query/SKILL.md`, list all code examples
  - [ ] 1.7 Remove `em.repo('Entity')` / `em.repository('Entity')` examples
  - [ ] 1.8 Clarify `em()` returns schema definition, not queryable EntityManager
  - [ ] 1.9 Add `app.em.repo()` pattern for Hybrid Mode (after `app.build()`)
  - [ ] 1.10 Add `api.data.readMany()` pattern for Code Mode queries
  - [ ] 1.11 Verify WhereBuilder operators against bknd source
  - [ ] 1.12 Verify RepoQuery options against bknd source

- [ ] 2.0 Audit Core Concept Skills (getting-started, auth, permissions)
  - [ ] 2.1 Read `getting-started/SKILL.md`, list all code examples
  - [ ] 2.2 Verify `em()`, `entity()` imports and usage
  - [ ] 2.3 Verify `schema.toJSON()` pattern
  - [ ] 2.4 Verify project setup commands (`bun create bknd`, etc.)
  - [ ] 2.5 Read `auth/SKILL.md`, list all code examples
  - [ ] 2.6 Verify auth strategies config structure
  - [ ] 2.7 Verify `api.auth.me()`, `api.auth.login()` signatures
  - [ ] 2.8 Verify session handling patterns
  - [ ] 2.9 Read `permissions/SKILL.md`, list all code examples
  - [ ] 2.10 Verify Guard system API
  - [ ] 2.11 Verify role definitions syntax
  - [ ] 2.12 Verify policy syntax and row-level security patterns

- [ ] 3.0 Audit Framework Integration Skills (nextjs, vite-react, astro)
  - [ ] 3.1 Read `nextjs/SKILL.md`, list all code examples
  - [ ] 3.2 Verify `getBkndApp()` import and usage
  - [ ] 3.3 Verify `app.getApi()` method
  - [ ] 3.4 Verify `api.verifyAuth()`, `api.getUser()` patterns
  - [ ] 3.5 Verify route handler patterns
  - [ ] 3.6 Read `vite-react/SKILL.md`, list all code examples
  - [ ] 3.7 Verify Vite plugin config
  - [ ] 3.8 Verify dev server setup
  - [ ] 3.9 Verify client SDK hooks (`useQuery`, etc.)
  - [ ] 3.10 Read `astro/SKILL.md`, list all code examples
  - [ ] 3.11 Verify Astro integration setup
  - [ ] 3.12 Verify SSR patterns
  - [ ] 3.13 Verify middleware setup

- [ ] 4.0 Audit Infrastructure Skills (database, media, config-modes)
  - [ ] 4.1 Read `database/SKILL.md`, list all code examples
  - [ ] 4.2 Verify `pg` adapter import and config
  - [ ] 4.3 Verify `postgresJs` adapter import and config
  - [ ] 4.4 Verify dialect setup for cloud providers (Neon, Turso, D1, etc.)
  - [ ] 4.5 Read `media/SKILL.md`, list all code examples
  - [ ] 4.6 Verify media module config structure
  - [ ] 4.7 Verify storage adapter patterns
  - [ ] 4.8 Verify upload API (`api.media.*`)
  - [ ] 4.9 Verify entity-media relation syntax
  - [ ] 4.10 Read `config-modes/SKILL.md`, list all code examples
  - [ ] 4.11 Verify UI-only mode description
  - [ ] 4.12 Verify Code-only mode description
  - [ ] 4.13 Verify Hybrid mode switching patterns

- [ ] 5.0 Audit Advanced Skills (api-sdk, plugins, deploy, code-review)
  - [ ] 5.1 Read `api-sdk/SKILL.md`, list all code examples
  - [ ] 5.2 Verify `Api` class constructor and initialization
  - [ ] 5.3 Verify `api.data.*` methods (readMany, readOne, createOne, etc.)
  - [ ] 5.4 Verify `api.auth.*` methods
  - [ ] 5.5 Read `plugins/SKILL.md`, list all code examples
  - [ ] 5.6 Verify plugin architecture patterns
  - [ ] 5.7 Verify lifecycle hooks API
  - [ ] 5.8 Verify event system integration
  - [ ] 5.9 Verify schema extension patterns
  - [ ] 5.10 Read `deploy/SKILL.md`, list all code examples
  - [ ] 5.11 Verify Vercel deployment pattern
  - [ ] 5.12 Verify AWS Lambda deployment pattern
  - [ ] 5.13 Verify Cloudflare Workers deployment pattern
  - [ ] 5.14 Verify Docker deployment pattern
  - [ ] 5.15 Read `code-review/SKILL.md`, list all anti-patterns
  - [ ] 5.16 Verify anti-patterns match actual v0.20.0 gotchas
  - [ ] 5.17 Cross-check with LEARNINGS.md for consistency

- [ ] 6.0 Final Review & LEARNINGS.md Consolidation
  - [ ] 6.1 Review all changes made across skills
  - [ ] 6.2 Ensure LEARNINGS.md has all new findings documented
  - [ ] 6.3 Verify no duplicate/conflicting info between skills
  - [ ] 6.4 Spot-check 3 random code examples against bknd source
  - [ ] 6.5 Update PRD success criteria checkboxes
