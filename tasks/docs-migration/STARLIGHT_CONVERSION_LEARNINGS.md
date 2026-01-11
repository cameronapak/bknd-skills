# Starlight Conversion Learnings

## Task 2.1 Analysis - Mintlify docs.json Structure

**Learning: Mintlify Navigation Structure**
- Mintlify uses nested groups with `group` and `pages` arrays to create hierarchical navigation
- Pages can be strings (simple links) or objects (nested groups)
- Navigation structure: Top-level groups → Subgroups (optional) → Individual pages
- File paths are relative to `docs/` directory
- Color scheme defined with primary, light, dark, and background colors for light/dark modes
- Logo supports separate dark/light variants

## Task 2.3 - Creating src/sidebar.ts

**Learning: Starlight Sidebar Configuration**
- Sidebar can be separated into its own TypeScript file (`src/sidebar.ts`) and imported in `astro.config.mjs`
- Use `StarlightUserConfig['sidebar']` type for type safety
- Sidebar items use `slug` property to reference content files (not full paths)
- Build will fail if sidebar references non-existent content files - all slugs must map to actual files in `src/content/docs/`
- Sidebar structure supports nested groups with `label`, `items`, and `collapsed` properties
- Groups can contain both direct links and nested subgroups
- During migration, it's safer to start with a minimal sidebar that references only existing files, then expand as content is migrated
