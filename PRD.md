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

## Questions

- What is the current state of Bknd documentation? (Need to audit to avoid duplication)
  - It's usable, but it's not structured well and easy to follow. And there are some missing pieces. 
- Should there be a bknd-troubleshoot skill for common errors?
  - Yes

---

## Appendix: Full Skill Inventory

Total skills: **42**

| Category | Count | Skills |
|----------|-------|--------|
| Schema & Data Modeling | 5 | create-entity, add-field, define-relationship, modify-schema, delete-entity |
| Data Operations | 8 | seed-data, crud-create, crud-read, crud-update, crud-delete, query-filter, pagination, bulk-operations |
| Authentication | 7 | create-user, setup-auth, login-flow, registration, password-reset, session-handling, oauth-setup |
| Authorization | 5 | create-role, assign-permissions, row-level-security, protect-endpoint, public-vs-auth |
| API Consumption | 5 | api-discovery, client-setup, custom-endpoint, webhooks, realtime |
| Files & Media | 3 | file-upload, storage-config, serve-files |
| Development Workflow | 4 | local-setup, env-config, debugging, testing |
| Deployment | 3 | deploy-hosting, database-provision, production-config |
