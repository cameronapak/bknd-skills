# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code plugin (`bknd-expert`) with many skills for the [Bknd](https://bknd.io/) backend framework (v0.20.0). No build/test commands - this is a documentation project.

## Structure

```
plugins/bknd-skills/skills/<skill-name>/SKILL.md
```

**Skills:** getting-started, data-schema, query, auth, permissions, nextjs, vite-react, astro, database, media, config-modes, api-sdk, plugins, deploy, code-review

## SKILL.md Format

```yaml
---
name: skill-name
description: Use when <trigger-phrases>. Covers <topics>.
---
```

- Description MUST start with "Use when..." for semantic matching
- Target 200-400 lines per skill
- Include DOs/DON'Ts section
- End with "Related Skills" section linking to other skills

## Critical Bknd v0.20.0 API Notes

**`em()` returns schema, not EntityManager:**
```typescript
// WRONG - em() is for schema definition only
const em = em({ ... });
em.repo("posts").find();  // ERROR

// CORRECT - use api.data for queries
const api = getApi(app);
api.data.readMany("posts", { ... });
```

**`primary()` not exported:**
```typescript
// WRONG
import { primary } from "bknd";

// CORRECT - use entity options
entity("posts", { title: text() }, { primary_format: "uuid" })
```

**API verification:** Use `npx opensrc bknd` to fetch source and verify exports.

## Reference Files

- `tasks/LEARNINGS.md` - API findings and gotchas
- `API-VERIFICATION.md` - v0.20.0 validation results
- `opensrc/` - Bknd source cache for offline reference
