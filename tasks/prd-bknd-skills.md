# PRD: Bknd Skills for Claude Code

## Overview

Create a set of Claude Code skills that help AI agents understand and write code using Bknd, a Laravel-like TypeScript/JavaScript framework built on web standards. Since Bknd is newer, agents lack training data and struggle to use it correctly. These skills provide authoritative patterns and examples.

**Problem:** AI agents don't know Bknd's APIs, patterns, or best practices, leading to incorrect code suggestions.

**Solution:** 15 focused skills following Encore's proven structure, distributed via Anthropic's skills marketplace.

---

## Goals

1. Enable Claude Code to write correct Bknd code without hallucinating APIs
2. Cover core functionality: data modeling, queries, auth, permissions
3. Cover popular framework integrations: Next.js, Vite, Astro
4. Provide copy-paste ready, typed code examples
5. Match Encore's skill quality (~200-400 lines, focused)

---

## User Stories

1. **As a Claude Code user**, I want the agent to correctly set up a new Bknd project so I don't have to fix configuration errors.

2. **As a Claude Code user**, I want the agent to define Bknd entities with proper field types and relationships so my data schema is correct.

3. **As a Claude Code user**, I want the agent to write correct query syntax (filtering, sorting, joins) so I get the data I need.

4. **As a Claude Code user**, I want the agent to implement Bknd auth (password, OAuth, OTP) without guessing at APIs.

5. **As a Claude Code user**, I want the agent to configure permissions/RBAC correctly so my app is secure.

6. **As a Claude Code user**, I want the agent to integrate Bknd with Next.js/Vite/Astro using correct patterns.

---

## Functional Requirements

### Plugin Structure

1. Plugin must follow Anthropic marketplace format with `marketplace.json` at root
2. Plugin must include `plugin.json` with name, version, description
3. Each skill must be a single `SKILL.md` file in its own directory
4. Each skill must have YAML frontmatter with `name`, `description`, and keywords

### Skill Content Requirements

5. Each skill must be 200-400 lines (focused, not exhaustive)
6. Each skill must include working, typed TypeScript code examples
7. Each skill must show CORRECT vs WRONG patterns where applicable
8. Each skill must include a Guidelines/DOs and DON'Ts section
9. Code examples must be copy-paste ready (no pseudo-code)

### Skills to Implement (15 total)

**Priority 1 - Core (5 skills):**

10. `getting-started` - Project setup, CLI commands, config file, dev server
11. `data-schema` - Entity definition with `em()`, field types, relationships
12. `query` - WhereBuilder, operators, auto-join, pagination, sorting
13. `auth` - Password, OAuth, Email OTP, JWT strategies
14. `permissions` - Roles, policies, guards, guest access, RLS

**Priority 2 - Integrations (4 skills):**

15. `nextjs` - Server components, API routes, Admin UI mounting
16. `vite-react` - SPA setup, HMR, built-in dev server
17. `astro` - SSR integration, adapters, API routes
18. `database` - SQLite, PostgreSQL, Turso, Cloudflare D1 configuration

**Priority 3 - Advanced (6 skills):**

19. `media` - File uploads, storage backends, polymorphic relations
20. `config-modes` - UI mode, Code mode, Hybrid mode, production sync
21. `api-sdk` - TypeScript SDK usage, `api.data.*` methods, type generation
22. `plugins` - Custom plugin development, hooks, events
23. `deploy` - Vercel, Cloudflare, Docker deployment, env configuration
24. `code-review` - Common mistakes, anti-patterns, gotchas

### Keyword/Trigger Requirements

25. Each skill's description must include trigger phrases (e.g., "Use when setting up a new Bknd project")
26. Each skill must include relevant keywords for semantic matching

---

## Non-Goals (Out of Scope)

- Migration skills (Firebase, Supabase, PocketBase) - future consideration
- MCP integration skill - future consideration
- Testing patterns - Bknd testing not well documented yet
- SvelteKit, React Router integrations - future consideration
- Multi-language support (Go, Python) - Bknd is TS/JS only
- Version-specific documentation - address later

---

## Technical Considerations

- **Source content:** Adapt from existing `/archive` docs + official docs at https://docs.bknd.io
- **Bknd version:** Target v0.20.x (current stable)
- **Distribution:** Anthropic skills marketplace (`.claude-plugin/marketplace.json`)
- **File structure:**
  ```
  islamabad/
  ├── .claude-plugin/
  │   └── marketplace.json
  └── plugins/
      └── bknd-skills/
          ├── .claude-plugin/
          │   └── plugin.json
          └── skills/
              └── {skill-name}/SKILL.md
  ```

---

## Success Metrics

1. Claude Code correctly generates Bknd entity definitions without hallucinating field types
2. Claude Code uses correct query syntax (WhereBuilder, operators)
3. Claude Code sets up auth strategies without inventing non-existent methods
4. Skills trigger appropriately when user mentions Bknd-related tasks
5. Code examples from skills work when copy-pasted into a Bknd project

---

## Implementation Phases

### Phase 1: Setup
- Create plugin directory structure
- Create `marketplace.json` and `plugin.json`
- Create empty skill directories

### Phase 2: Core Skills
- Implement 5 core skills adapting from archive docs
- Test each skill triggers correctly

### Phase 3: Integration Skills
- Implement 4 framework integration skills
- Verify examples work with each framework

### Phase 4: Advanced Skills
- Implement 6 advanced skills
- Final testing and polish

---

## Open Questions

1. Should skills link to official Bknd docs or be fully self-contained?
2. How to handle Bknd breaking changes in future versions?
3. Should we include a "troubleshooting" or "common errors" skill?
