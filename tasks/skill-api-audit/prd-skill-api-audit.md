# PRD: Bknd Skills API Audit & Fix

## Overview

Audit all 15 bknd-skills for API correctness against bknd v0.20.0. Fix incorrect code examples and document findings in LEARNINGS.md.

**Known critical issues:**
- `data-schema`: Shows non-existent `primary()` import
- `query`: Shows `em.repo()` which doesn't exist on schema return

## Goals

1. All code examples compile against bknd v0.20.0 types
2. Examples match patterns in official bknd repo
3. LEARNINGS.md updated with all findings
4. Skills remain focused and concise

## Verification Approach

Use three sources:
1. `npx opensrc bknd` - Check actual exports
2. ZRead MCP - Search bknd repo for usage
3. btca via bknd-repo-search skill - Query for patterns

## Non-Goals

- Adding DOs/DON'Ts sections (deferred)
- Adding Related Skills sections
- Trimming skills to arbitrary line count

## Success Criteria

- [x] All code examples compile against bknd v0.20.0 types
- [ ] Manual review of each skill against opensrc/bknd source
- [ ] Code examples match patterns in official bknd repo
- [ ] LEARNINGS.md updated with all new findings

---

## Tasks

### Task 1: data-schema
**File:** `plugins/bknd-skills/skills/data-schema/SKILL.md`
**Known issues:**
- Remove `import { primary } from "bknd"`
- Remove `id: primary({ format: "uuid" })` example
- Show `entity(..., { primary_format: "uuid" })` instead
**Audit:** Verify all field types (`text`, `number`, `boolean`, `date`, `enumm`, `json`) are correctly shown

### Task 2: query
**File:** `plugins/bknd-skills/skills/query/SKILL.md`
**Known issues:**
- Remove `em.repo('Entity')` / `em.repository('Entity')` examples
- Clarify `em()` returns schema definition, not queryable EntityManager
- Show `app.em.repo()` after `app.build()` for Hybrid Mode
- Show `api.data.readMany()` for Code Mode queries
**Audit:** Verify WhereBuilder operators, RepoQuery options

### Task 3: getting-started
**File:** `plugins/bknd-skills/skills/getting-started/SKILL.md`
**Audit:** Verify `em()`, `entity()`, `schema.toJSON()`, project setup commands

### Task 4: auth
**File:** `plugins/bknd-skills/skills/auth/SKILL.md`
**Audit:** Verify auth strategies config, `api.auth.me()`, `api.auth.login()`, session handling

### Task 5: permissions
**File:** `plugins/bknd-skills/skills/permissions/SKILL.md`
**Audit:** Verify Guard system, role definitions, policy syntax, row-level security

### Task 6: nextjs
**File:** `plugins/bknd-skills/skills/nextjs/SKILL.md`
**Audit:** Verify `getBkndApp()`, `app.getApi()`, `api.verifyAuth()`, `api.getUser()`, route handlers

### Task 7: vite-react
**File:** `plugins/bknd-skills/skills/vite-react/SKILL.md`
**Audit:** Verify Vite plugin config, dev server setup, client SDK hooks

### Task 8: astro
**File:** `plugins/bknd-skills/skills/astro/SKILL.md`
**Audit:** Verify Astro integration, SSR patterns, middleware setup

### Task 9: database
**File:** `plugins/bknd-skills/skills/database/SKILL.md`
**Audit:** Verify `pg` and `postgresJs` adapter imports, connection config, dialect setup

### Task 10: media
**File:** `plugins/bknd-skills/skills/media/SKILL.md`
**Audit:** Verify media module config, storage adapters, upload API, entity-media relations

### Task 11: config-modes
**File:** `plugins/bknd-skills/skills/config-modes/SKILL.md`
**Audit:** Verify UI-only, Code-only, Hybrid mode descriptions and switching patterns

### Task 12: api-sdk
**File:** `plugins/bknd-skills/skills/api-sdk/SKILL.md`
**Audit:** Verify `Api` class methods, `api.data.*` methods, `api.auth.*` methods

### Task 13: plugins
**File:** `plugins/bknd-skills/skills/plugins/SKILL.md`
**Audit:** Verify plugin architecture, lifecycle hooks, event system, schema extension

### Task 14: deploy
**File:** `plugins/bknd-skills/skills/deploy/SKILL.md`
**Audit:** Verify Vercel, AWS Lambda, Cloudflare Workers, Docker deployment patterns

### Task 15: code-review
**File:** `plugins/bknd-skills/skills/code-review/SKILL.md`
**Audit:** Verify anti-patterns listed match actual v0.20.0 gotchas

---

## Process Per Task

1. Read the skill file
2. Identify all code examples
3. For each example:
   - Check imports against `npx opensrc bknd` exports
   - Verify API usage with ZRead/btca
   - Fix incorrect code
4. Update LEARNINGS.md if new findings
5. Mark task complete

## Open Questions

None - all clarified.
