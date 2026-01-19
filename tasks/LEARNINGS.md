# Anthropic Plugin Marketplace Structure

## marketplace.json Format
- Must include `$schema` pointing to `https://anthropic.com/claude-code/marketplace.schema.json`
- Required fields: `name`, `owner`, `plugins` array
- Each plugin needs: `name`, `source`, optional `version`, `author`, `category`
- The `source` field is relative to the repo root (e.g., `"./plugins/bknd-skills"`)

## Plugin Directory Structure
```
.repo-root/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    └── plugin-name/
        ├── .claude-plugin/
        │   └── plugin.json
        └── skills/
            └── {skill-name}/SKILL.md
```

## Plugin.json Format
- Minimal required: `name`, `version`, `description`, `author`
- Author field needs `name` and `email` subfields

## Task 1.0 Completion
- Successfully created marketplace.json with proper schema
- Created plugin.json with author info
- Created 15 empty skill directories for future content

## Task 2.1 Completion (getting-started skill)
- Created first SKILL.md following Encore's format: YAML frontmatter + markdown content
- Skill should be 200-400 lines (getting-started is 407 lines - acceptable)
- Description in frontmatter includes trigger phrases for semantic matching (e.g., "Use when setting up a new Bknd project")
- Must include working, copy-paste ready TypeScript code examples (no pseudo-code)
- Include DOs and DON'Ts section at the end
- Structure: Quick Start → Project Setup → Configuration Modes → CLI Commands → Architecture → Next Steps
- Adapt content from archive docs but rewrite as focused guidance, not tutorial walkthrough

## Task 2.2 Completion (data-schema skill)
- Complex topics like data schema may exceed 200-400 line guideline (data-schema is 470 lines - acceptable)
- Bknd field types: primary, text, number, boolean, date, enum, json, jsonschema, media
- Relationship types: many-to-one, one-to-one, many-to-many, polymorphic
- Index creation supports chaining: `index(users).on(["email"], true).on(["username"], true)`
- Second parameter `true` in index creation creates unique index
- Self-referencing relations need `inversedBy` and `mappedBy` for parent/child relationships
- Many-to-many with custom fields requires third parameter to schema with additional fields
- Use plural snake_case for entity names (users, posts) not singular (user, post)
