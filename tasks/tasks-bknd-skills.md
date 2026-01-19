# Tasks: Bknd Skills for Claude Code

## Relevant Files

### Plugin Config
- `.claude-plugin/marketplace.json` - Root marketplace config for Anthropic
- `plugins/bknd-skills/.claude-plugin/plugin.json` - Plugin metadata

### Core Skills (Priority 1)
- `plugins/bknd-skills/skills/getting-started/SKILL.md` - Project setup skill
- `plugins/bknd-skills/skills/data-schema/SKILL.md` - Entity definition skill
- `plugins/bknd-skills/skills/query/SKILL.md` - Query system skill
- `plugins/bknd-skills/skills/auth/SKILL.md` - Authentication skill
- `plugins/bknd-skills/skills/permissions/SKILL.md` - Authorization skill

### Integration Skills (Priority 2)
- `plugins/bknd-skills/skills/nextjs/SKILL.md` - Next.js integration
- `plugins/bknd-skills/skills/vite-react/SKILL.md` - Vite + React integration
- `plugins/bknd-skills/skills/astro/SKILL.md` - Astro integration
- `plugins/bknd-skills/skills/database/SKILL.md` - Database configuration

### Advanced Skills (Priority 3)
- `plugins/bknd-skills/skills/media/SKILL.md` - Media handling
- `plugins/bknd-skills/skills/config-modes/SKILL.md` - Configuration modes
- `plugins/bknd-skills/skills/api-sdk/SKILL.md` - TypeScript SDK usage
- `plugins/bknd-skills/skills/plugins/SKILL.md` - Plugin development
- `plugins/bknd-skills/skills/deploy/SKILL.md` - Deployment patterns
- `plugins/bknd-skills/skills/code-review/SKILL.md` - Common mistakes

### Source Content (Archive)
- `archive/getting-started/` - First API, auth, deploy guides
- `archive/reference/` - Data module, query system, auth module, schema
- `archive/how-to-guides/` - Integrations, permissions, auth patterns
- `archive/troubleshooting/` - Common issues for code-review skill

### Notes

- Each skill: ~200-400 lines, YAML frontmatter + Instructions
- Repurpose archive docs, don't write from scratch
- Follow Encore's SKILL.md format exactly

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, check it off by changing `- [ ]` to `- [x]`.

## Tasks

- [x] 1.0 Setup Plugin Structure
  - [x] 1.1 Create `.claude-plugin/marketplace.json` at repo root
  - [x] 1.2 Create `plugins/bknd-skills/.claude-plugin/plugin.json`
  - [x] 1.3 Create all 15 skill directories under `plugins/bknd-skills/skills/`

- [ ] 2.0 Implement Core Skills (5 skills)
  - [ ] 2.1 `getting-started` - Adapt from `archive/getting-started/build-your-first-api.md` + `archive/architecture-and-concepts/`
  - [ ] 2.2 `data-schema` - Adapt from `archive/reference/data-module.md` + `archive/reference/schema.md` + `archive/reference/entity-manager-api.md`
  - [ ] 2.3 `query` - Adapt from `archive/reference/query-system.md`
  - [ ] 2.4 `auth` - Adapt from `archive/reference/auth-module.md` + `archive/how-to-guides/auth/`
  - [ ] 2.5 `permissions` - Adapt from `archive/how-to-guides/permissions/public-access-guard.md` + official docs

- [ ] 3.0 Implement Integration Skills (4 skills)
  - [ ] 3.1 `nextjs` - Adapt from `archive/how-to-guides/setup/integrations/nextjs.md`
  - [ ] 3.2 `vite-react` - Adapt from `archive/how-to-guides/setup/integrations/vite-react.md`
  - [ ] 3.3 `astro` - Adapt from `archive/how-to-guides/setup/integrations/astro.md`
  - [ ] 3.4 `database` - Adapt from `archive/reference/configuration.md` + official docs on SQLite/Postgres/Turso/D1

- [ ] 4.0 Implement Advanced Skills (6 skills)
  - [ ] 4.1 `media` - Adapt from `archive/how-to-guides/data/entity-media-relationships.md`
  - [ ] 4.2 `config-modes` - Adapt from `archive/how-to-guides/setup/choose-your-mode.md`
  - [ ] 4.3 `api-sdk` - Adapt from `archive/reference/react-sdk-reference.md`
  - [ ] 4.4 `plugins` - Research from official Bknd docs (less archive content)
  - [ ] 4.5 `deploy` - Adapt from `archive/getting-started/deploy-to-production.md` + `archive/how-to-guides/setup/integrations/docker.md` + cloudflare/aws-lambda guides
  - [ ] 4.6 `code-review` - Adapt from `archive/troubleshooting/common-issues.md` + `archive/troubleshooting/known-issues.md`

- [ ] 5.0 Testing and Verification
  - [ ] 5.1 Install plugin locally in Claude Code
  - [ ] 5.2 Test skill triggers with sample prompts (e.g., "set up a bknd project")
  - [ ] 5.3 Verify code examples compile/run against Bknd v0.20.x
  - [ ] 5.4 Review keyword coverage for semantic matching
