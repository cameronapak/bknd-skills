# PRD: Bknd Claude Code Skills

## Introduction/Overview

Bknd is a new backend framework that allows developers to bring any web frontend. Due to its novelty, documentation gaps make it difficult for developers—and AI agents—to effectively build with Bknd.

This PRD defines a comprehensive set of Claude Code Skills that enable AI agents to guide developers through common Bknd tasks. Each skill is atomic (one action per skill), instruction-based, and covers both UI and code approaches.

## Goals

1. Enable AI agents to accurately guide developers through any common Bknd task
2. Reduce time-to-first-success for new Bknd users from hours to minutes
3. Cover all 8 core categories of backend framework tasks
4. Support diverse user types: new app builders, existing project integrators, and non-developers
5. Provide clear guidance on when to use UI vs code mode

## User Stories

- As a **new developer**, I want Claude to walk me through creating my first entity so I can understand Bknd's data modeling approach.
- As a **frontend developer** adding Bknd to an existing app, I want Claude to help me set up authentication that integrates with my current frontend.
- As a **non-developer**, I want Claude to help me create a working backend without needing to understand code deeply.
- As a **developer debugging**, I want Claude to know Bknd-specific patterns so it can help me troubleshoot issues.

## Functional Requirements

### Skill Structure

1. Each skill must follow the Agent Skills specification (SKILL.md with frontmatter)
2. Each skill must be atomic—one primary action per skill
3. Each skill must include:
   - When to use this skill (triggers)
   - Prerequisites
   - Step-by-step instructions for BOTH UI and code approaches
   - Guidance on which approach to use when
   - Common pitfalls/troubleshooting
   - Related skills (what to do next)

### Skill Categories & Actions

#### Category 1: Schema & Data Modeling
| Skill Name | Description |
|------------|-------------|
| `bknd-create-entity` | Create a new entity/table in Bknd |
| `bknd-add-field` | Add a field to an existing entity |
| `bknd-define-relationship` | Set up relationships between entities (1:1, 1:many, many:many) |
| `bknd-modify-schema` | Modify existing schema (rename, change types) |
| `bknd-delete-entity` | Safely remove an entity and handle dependencies |

#### Category 2: Data Operations
| Skill Name | Description |
|------------|-------------|
| `bknd-seed-data` | Populate database with initial/test data |
| `bknd-crud-create` | Insert new records into an entity |
| `bknd-crud-read` | Query and retrieve data with filtering |
| `bknd-crud-update` | Update existing records |
| `bknd-crud-delete` | Delete records safely |
| `bknd-query-filter` | Advanced filtering and querying |
| `bknd-pagination` | Implement paginated data retrieval |
| `bknd-bulk-operations` | Perform bulk insert/update/delete |

#### Category 3: Authentication
| Skill Name | Description |
|------------|-------------|
| `bknd-create-user` | Create a new user account |
| `bknd-setup-auth` | Initialize authentication system |
| `bknd-login-flow` | Implement login/logout functionality |
| `bknd-registration` | Set up user registration |
| `bknd-password-reset` | Implement password reset flow |
| `bknd-session-handling` | Manage user sessions |
| `bknd-oauth-setup` | Configure OAuth/social login providers |

#### Category 4: Authorization
| Skill Name | Description |
|------------|-------------|
| `bknd-create-role` | Define a new role |
| `bknd-assign-permissions` | Assign permissions to roles |
| `bknd-row-level-security` | Implement row-level access control |
| `bknd-protect-endpoint` | Secure specific endpoints |
| `bknd-public-vs-auth` | Configure public vs authenticated access |

#### Category 5: API Consumption
| Skill Name | Description |
|------------|-------------|
| `bknd-api-discovery` | Explore auto-generated API endpoints |
| `bknd-client-setup` | Set up SDK/client in frontend |
| `bknd-custom-endpoint` | Create custom API endpoints |
| `bknd-webhooks` | Configure webhook integrations |
| `bknd-realtime` | Set up real-time subscriptions (if supported) |

#### Category 6: Files & Media
| Skill Name | Description |
|------------|-------------|
| `bknd-file-upload` | Handle file uploads |
| `bknd-storage-config` | Configure storage backend |
| `bknd-serve-files` | Serve files and configure CDN |

#### Category 7: Development Workflow
| Skill Name | Description |
|------------|-------------|
| `bknd-local-setup` | Set up local development environment |
| `bknd-env-config` | Configure environment variables |
| `bknd-debugging` | Debug common issues |
| `bknd-testing` | Write and run tests |

#### Category 8: Deployment
| Skill Name | Description |
|------------|-------------|
| `bknd-deploy-hosting` | Deploy to various hosting options |
| `bknd-database-provision` | Set up production database |
| `bknd-production-config` | Configure for production |

### Reference Documents

Each category should have a reference document in `references/` containing:
- Bknd-specific terminology
- API reference snippets
- Code examples
- UI screenshots/descriptions (for UI mode guidance)

## Non-Goals (Out of Scope)

1. **Executable scripts**: Skills will be instruction-only (no `scripts/` directory)
2. **Bknd core development**: Not covering how to contribute to Bknd itself
3. **Framework comparisons**: Not documenting how Bknd differs from Supabase/Firebase/etc.
4. **Frontend-specific guidance**: Skills focus on Bknd backend; frontend integration is minimal
5. **Advanced optimization**: Performance tuning, caching strategies, etc.

## Design Considerations

### Skill Naming Convention
- All skills prefixed with `bknd-`
- Lowercase, hyphenated
- Action-oriented verbs (create, setup, configure, implement)

### UI vs Code Mode Guidance
Each skill should include a decision framework:
```
## When to use UI mode
- Exploring/prototyping
- Visual learners
- Quick one-off changes

## When to use code mode
- Version control needed
- Reproducible setups
- Team collaboration
- CI/CD pipelines
```

### Progressive Disclosure
- SKILL.md: Core instructions (<500 lines)
- references/: Detailed API docs, examples
- assets/: Code templates (if needed later)

## Technical Considerations

1. Skills must be validated against Agent Skills spec using `skills-ref validate`
2. Skills should reference official Bknd docs where they exist
3. Skills should note Bknd version compatibility where relevant
4. Skills should be testable—a developer should be able to follow instructions and verify success

# Bknd Claude Code Skills - Task List

## Relevant Files

- `plugins/bknd-skills/skills/bknd-*/SKILL.md` - Individual skill files (42 total)
- `plugins/bknd-skills/references/schema-modeling.md` - Schema & Data Modeling reference
- `plugins/bknd-skills/references/data-operations.md` - Data Operations reference
- `plugins/bknd-skills/references/authentication.md` - Authentication reference
- `plugins/bknd-skills/references/authorization.md` - Authorization reference
- `plugins/bknd-skills/references/api-consumption.md` - API Consumption reference
- `plugins/bknd-skills/references/files-media.md` - Files & Media reference
- `plugins/bknd-skills/references/dev-workflow.md` - Development Workflow reference
- `plugins/bknd-skills/references/deployment.md` - Deployment reference
- `plugins/bknd-skills/PLUGIN.md` - Plugin manifest
- `tasks/LEARNINGS.md` - API findings for reference

### Notes

- Each skill must follow Agent Skills spec (SKILL.md with frontmatter)
- Skills should be 200-400 lines, atomic (one action per skill)
- Validate skills with `skills-ref validate`
- Reference Bknd v0.20.0 API
- Skill naming: `bknd-<action>` (lowercase, hyphenated)

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, check it off by changing `- [ ]` to `- [x]`.

## How you will reference and learn

1. Talk to the Zread MCP server to ask questions and learn about bknd-io/bknd
2. Use Firecrawl to look at the pre-existing docs for said feature in Bknd https://docs.bknd.io
3. Pull in the repo locally with `btca` cli and ask questions about the repo

## Tasks

- [x] 1.0 Setup Project Structure & References
  - [x] 1.1 Create `references/` directory if not exists
  - [x] 1.2 Create `references/schema-modeling.md` - entity types, field types, relationship patterns
  - [x] 1.3 Create `references/data-operations.md` - CRUD API, filtering syntax, pagination patterns
  - [x] 1.4 Create `references/authentication.md` - auth strategies, session management, OAuth providers
  - [x] 1.5 Create `references/authorization.md` - roles, permissions, RLS patterns
  - [x] 1.6 Create `references/api-consumption.md` - SDK usage, endpoint patterns, webhooks
  - [x] 1.7 Create `references/files-media.md` - storage adapters, upload patterns
  - [x] 1.8 Create `references/dev-workflow.md` - local setup, env vars, debugging
  - [x] 1.9 Create `references/deployment.md` - hosting options, DB provisioning

- [x] 2.0 Create Schema & Data Modeling Skills (5 skills)
  - [x] 2.1 Create `bknd-create-entity/SKILL.md` - create new entity/table
  - [x] 2.2 Create `bknd-add-field/SKILL.md` - add field to existing entity
  - [x] 2.3 Create `bknd-define-relationship/SKILL.md` - 1:1, 1:many, many:many relationships
  - [x] 2.4 Create `bknd-modify-schema/SKILL.md` - rename, change types
  - [x] 2.5 Create `bknd-delete-entity/SKILL.md` - safely remove entity + dependencies

- [x] 3.0 Create Data Operations Skills (8 skills)
  - [x] 3.1 Create `bknd-seed-data/SKILL.md` - populate with initial/test data
  - [x] 3.2 Create `bknd-crud-create/SKILL.md` - insert new records
  - [x] 3.3 Create `bknd-crud-read/SKILL.md` - query and retrieve with filtering
  - [x] 3.4 Create `bknd-crud-update/SKILL.md` - update existing records
  - [x] 3.5 Create `bknd-crud-delete/SKILL.md` - delete records safely
  - [x] 3.6 Create `bknd-query-filter/SKILL.md` - advanced filtering and querying
  - [x] 3.7 Create `bknd-pagination/SKILL.md` - paginated data retrieval
  - [x] 3.8 Create `bknd-bulk-operations/SKILL.md` - bulk insert/update/delete

- [x] 4.0 Create Authentication Skills (7 skills)
  - [x] 4.1 Create `bknd-create-user/SKILL.md` - create new user account
  - [x] 4.2 Create `bknd-setup-auth/SKILL.md` - initialize authentication system
  - [x] 4.3 Create `bknd-login-flow/SKILL.md` - login/logout functionality
  - [x] 4.4 Create `bknd-registration/SKILL.md` - user registration setup
  - [x] 4.5 Create `bknd-password-reset/SKILL.md` - password reset flow
  - [x] 4.6 Create `bknd-session-handling/SKILL.md` - manage user sessions
  - [x] 4.7 Create `bknd-oauth-setup/SKILL.md` - OAuth/social login providers

- [x] 5.0 Create Authorization Skills (5 skills)
  - [x] 5.1 Create `bknd-create-role/SKILL.md` - define new role
  - [x] 5.2 Create `bknd-assign-permissions/SKILL.md` - assign permissions to roles
  - [x] 5.3 Create `bknd-row-level-security/SKILL.md` - row-level access control
  - [x] 5.4 Create `bknd-protect-endpoint/SKILL.md` - secure specific endpoints
  - [x] 5.5 Create `bknd-public-vs-auth/SKILL.md` - configure public vs authenticated access

- [x] 6.0 Create API Consumption Skills (5 skills)
  - [x] 6.1 Create `bknd-api-discovery/SKILL.md` - explore auto-generated endpoints
  - [x] 6.2 Create `bknd-client-setup/SKILL.md` - setup SDK/client in frontend
  - [x] 6.3 Create `bknd-custom-endpoint/SKILL.md` - create custom API endpoints
  - [x] 6.4 Create `bknd-webhooks/SKILL.md` - configure webhook integrations
  - [x] 6.5 Create `bknd-realtime/SKILL.md` - real-time subscriptions (if supported)

- [ ] 7.0 Create Files & Media Skills (3 skills)
  - [x] 7.1 Create `bknd-file-upload/SKILL.md` - handle file uploads
  - [ ] 7.2 Create `bknd-storage-config/SKILL.md` - configure storage backend
  - [ ] 7.3 Create `bknd-serve-files/SKILL.md` - serve files and CDN config

- [ ] 8.0 Create Development Workflow Skills (4 skills)
  - [ ] 8.1 Create `bknd-local-setup/SKILL.md` - local dev environment setup
  - [ ] 8.2 Create `bknd-env-config/SKILL.md` - environment variables config
  - [ ] 8.3 Create `bknd-debugging/SKILL.md` - debug common issues
  - [ ] 8.4 Create `bknd-testing/SKILL.md` - write and run tests

- [ ] 9.0 Create Deployment Skills (3 skills)
  - [ ] 9.1 Create `bknd-deploy-hosting/SKILL.md` - deploy to various hosts
  - [ ] 9.2 Create `bknd-database-provision/SKILL.md` - setup production database
  - [ ] 9.3 Create `bknd-production-config/SKILL.md` - configure for production

- [ ] 10.0 Validation & Cross-Linking
  - [ ] 10.1 Run `skills-ref validate` on all skills
  - [ ] 10.2 Verify all "Related Skills" sections link correctly
  - [ ] 10.3 Ensure each skill has UI + code approach sections
  - [ ] 10.4 Update PLUGIN.md to register all 42 skills
  - [ ] 10.5 Add `bknd-troubleshoot/SKILL.md` for common errors (per PRD Q&A)

---

## Skill Template Checklist

Each SKILL.md must include:
- [ ] Frontmatter with `name` and `description` (starts with "Use when...")
- [ ] Prerequisites section
- [ ] When to use UI mode vs code mode
- [ ] Step-by-step: UI approach
- [ ] Step-by-step: Code approach
- [ ] Common pitfalls / troubleshooting
- [ ] Related skills section
