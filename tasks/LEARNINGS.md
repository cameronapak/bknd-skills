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
