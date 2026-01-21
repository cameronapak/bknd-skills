# Bknd Skills Plugin

Claude Code plugin with 57 skills for the [Bknd](https://bknd.io/) backend framework (v0.20.0).

## Installation

```bash
claude plugins add bknd-skills
```

## Skills Reference

### Schema & Data Modeling (5 skills)

| Skill | Description |
|-------|-------------|
| `bknd-create-entity` | Create a new entity/table in Bknd |
| `bknd-add-field` | Add a field to an existing entity |
| `bknd-define-relationship` | Set up relationships between entities (1:1, 1:many, many:many) |
| `bknd-modify-schema` | Modify existing schema (rename, change types) |
| `bknd-delete-entity` | Safely remove an entity and handle dependencies |

### Data Operations (8 skills)

| Skill | Description |
|-------|-------------|
| `bknd-seed-data` | Populate database with initial/test data |
| `bknd-crud-create` | Insert new records into an entity |
| `bknd-crud-read` | Query and retrieve data with filtering |
| `bknd-crud-update` | Update existing records |
| `bknd-crud-delete` | Delete records safely |
| `bknd-query-filter` | Advanced filtering and querying |
| `bknd-pagination` | Implement paginated data retrieval |
| `bknd-bulk-operations` | Perform bulk insert/update/delete |

### Authentication (7 skills)

| Skill | Description |
|-------|-------------|
| `bknd-create-user` | Create a new user account |
| `bknd-setup-auth` | Initialize authentication system |
| `bknd-login-flow` | Implement login/logout functionality |
| `bknd-registration` | Set up user registration |
| `bknd-password-reset` | Implement password reset flow |
| `bknd-session-handling` | Manage user sessions |
| `bknd-oauth-setup` | Configure OAuth/social login providers |

### Authorization (5 skills)

| Skill | Description |
|-------|-------------|
| `bknd-create-role` | Define a new role |
| `bknd-assign-permissions` | Assign permissions to roles |
| `bknd-row-level-security` | Implement row-level access control |
| `bknd-protect-endpoint` | Secure specific endpoints |
| `bknd-public-vs-auth` | Configure public vs authenticated access |

### API Consumption (5 skills)

| Skill | Description |
|-------|-------------|
| `bknd-api-discovery` | Explore auto-generated API endpoints |
| `bknd-client-setup` | Set up SDK/client in frontend |
| `bknd-custom-endpoint` | Create custom API endpoints |
| `bknd-webhooks` | Configure webhook integrations |
| `bknd-realtime` | Real-time patterns (polling, SSE workarounds) |

### Files & Media (3 skills)

| Skill | Description |
|-------|-------------|
| `bknd-file-upload` | Handle file uploads |
| `bknd-storage-config` | Configure storage backend |
| `bknd-serve-files` | Serve files and configure CDN |

### Development Workflow (5 skills)

| Skill | Description |
|-------|-------------|
| `bknd-local-setup` | Set up local development environment |
| `bknd-env-config` | Configure environment variables |
| `bknd-debugging` | Debug common issues |
| `bknd-testing` | Write and run tests |
| `bknd-troubleshoot` | Quick-reference error fixes and common mistakes |

### Deployment (3 skills)

| Skill | Description |
|-------|-------------|
| `bknd-deploy-hosting` | Deploy to various hosting options |
| `bknd-database-provision` | Set up production database |
| `bknd-production-config` | Configure for production |

### Legacy/General Skills (15 skills)

| Skill | Description |
|-------|-------------|
| `getting-started` | Getting started with Bknd |
| `data-schema` | Data schema overview |
| `query` | Query patterns |
| `auth` | Authentication overview |
| `permissions` | Permissions overview |
| `nextjs` | Next.js integration |
| `vite-react` | Vite + React integration |
| `astro` | Astro integration |
| `database` | Database configuration |
| `media` | Media handling overview |
| `config-modes` | Configuration modes |
| `api-sdk` | API/SDK usage |
| `plugins` | Bknd plugins |
| `deploy` | Deployment overview |
| `code-review` | Code review for Bknd projects |

### Utility Skills (1 skill)

| Skill | Description |
|-------|-------------|
| `bknd-repo-search-with-opencode` | Search Bknd repo with opencode |

## Reference Documents

- `references/schema-modeling.md` - Entity types, field types, relationships
- `references/data-operations.md` - CRUD API, filtering, pagination
- `references/authentication.md` - Auth strategies, sessions, OAuth
- `references/authorization.md` - Roles, permissions, RLS
- `references/api-consumption.md` - SDK, endpoints, webhooks
- `references/files-media.md` - Storage, uploads, CDN
- `references/dev-workflow.md` - Local setup, debugging
- `references/deployment.md` - Hosting, databases, production

## Skill Count Summary

| Category | Count |
|----------|-------|
| Schema & Data Modeling | 5 |
| Data Operations | 8 |
| Authentication | 7 |
| Authorization | 5 |
| API Consumption | 5 |
| Files & Media | 3 |
| Development Workflow | 5 |
| Deployment | 3 |
| Legacy/General | 15 |
| Utility | 1 |
| **Total** | **57** |

## Version

- Plugin version: 0.0.2
- Bknd version: 0.20.0
