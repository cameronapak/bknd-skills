## Relevant Files

### Phase 1: Critical Foundation
- `opensrc/sources.json` - Check if bknd-io/bknd is listed, add entry if needed
- `opensrc/repos/github.com/bknd-io/bknd/` - Contains fetched source code for verification
- `opensrc/repos/github.com/bknd-io/bknd/package.json` - Main package entry points and exports
- `opensrc/repos/github.com/bknd-io/bknd/packages/` - All package directories (adapters, plugins, SDKs)

### Phase 2: Technical Verification Files
- `docs/releases/v0.20.0-release-notes.md` (273 lines) - Verify all import paths and code examples
- `docs/reference/configuration.md` - Verify all API signatures and configuration options
- `docs/getting-started/build-your-first-api.md` - Verify code examples are syntactically correct
- `docs/getting-started/add-authentication.md` - Verify auth implementation code examples
- `docs/getting-started/deploy-to-production.md` - Verify deployment code examples

### Phase 3: Accuracy Corrections Files
- `docs/migration-guides/postgres-package-merge.md` (409 lines) - Fix 5 PostgreSQL adapter issues
- `docs/how-to-guides/auth/email-otp.md` (810 lines) - Fix 5 Email OTP plugin issues
- `docs/how-to-guides/integrations/plunk-email.md` (691 lines) - Fix 3 Plunk email driver issues
- `docs/how-to-guides/setup/integrations/sveltekit.md` - Fix 2 SvelteKit adapter issues
- `docs/how-to-guides/setup/integrations/browser-sqlocal.md` (923 lines) - Address high uncertainty in browser mode

### Phase 4: Navigation Files
- `docs/getting-started/build-your-first-api.md` - Fix broken internal link at line 202
- `docs.json` - Update Mintlify navigation structure
- `docs/how-to-guides/setup/integrations/framework-comparison.md` - Verify all comparison links
- All `.md` files - Fix references to non-existent `sdk.md`

### Phase 5: Consistency Files
- All documentation files - Standardize `adminOptions` vs `adminOptions.adminBasepath` usage
- All code examples - Standardize import path patterns (e.g., @bknd/core)
- All API references - Standardize endpoint naming conventions
- `docs/reference/auth-module.md` - Consistent auth terminology throughout
- `docs/reference/data-module.md` - Consistent data terminology throughout
- `docs/reference/react-sdk-reference.md` - Consistent SDK terminology throughout

### Phase 6: Simplification Files
- `docs/migration-guides/postgres-package-merge.md` - Reduce 30% (~120 lines from 409, target ~280)
- `docs/how-to-guides/auth/email-otp.md` - Reduce 40% (~324 lines from 810, target ~480)
- `docs/how-to-guides/integrations/plunk-email.md` - Reduce 35% (~242 lines from 691, target ~450)
- `docs/how-to-guides/setup/integrations/browser-sqlocal.md` - Reduce 40% (~369 lines from 923, target ~550)

### Reference Files for Updates
- `docs/architecture-and-concepts/how-bknd-works.md` - Updated during v0.20.0 release
- `docs/index.md` - Main index, updated during v0.20.0 release
- `docs/how-to-guides/setup/choose-your-mode.md` - Mode selection guide, updated
- `docs/how-to-guides/data/entity-media-relationships.md` - Data relationships guide, updated
- `docs/reference/auth-module.md` - Auth module reference, updated
- `docs/reference/data-module.md` - Data module reference, updated
- `docs/reference/query-system.md` - Query system reference, updated
- `docs/reference/schema.md` - Schema reference, updated
- `docs/reference/react-sdk-reference.md` - React SDK reference, updated

### Notes
- **Critical Blocker:** Must fetch bknd source code before any verification tasks can begin
- Use `npx opensrc bknd-io/bknd` to fetch the official source code
- Import verification requires checking actual file structure in `opensrc/repos/github.com/bknd-io/bknd/`
- Link verification: Use `grep -r "\[.*\](.*\.md)" docs/` for internal links and web tools for external
- Code verification: Compare import statements with actual exports in package.json and source files
- Consistency checks: Use `grep -r "adminOptions\|adminBasepath" docs/` to find all instances
- Terminology: Check source code for correct API naming before making changes
- Simplification principles: Remove redundancy, eliminate edge cases, consolidate duplicate content, use concise examples
- After each task is completed, update the task list by checking off `- [ ]` → `- [x]`
- Track progress after each phase, not just after parent tasks
- Original alignment score was 37.25% (MEDIUM), target >80% after all fixes

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 1.0 Critical Foundation & Technical Verification
  - [ ] 1.1 Fetch official bknd source code using `npx opensrc bknd-io/bknd`
  - [ ] 1.2 Verify source code was fetched to `opensrc/repos/github.com/bknd-io/bknd/`
  - [ ] 1.3 Review directory structure to understand package organization
    - [ ] 1.3.1 List directories in `opensrc/repos/github.com/bknd-io/bknd/`
    - [ ] 1.3.2 Identify main package entry points (package.json exports)
    - [ ] 1.3.3 Locate adapter directories (postgres, sveltekit, etc.)
    - [ ] 1.3.4 Locate plugin directories (email, auth, etc.)
    - [ ] 1.3.5 Document the package structure for reference
  - [ ] 1.4 Verify all import paths in v0.20.0-release-notes.md against source
    - [ ] 1.4.1 Read `docs/releases/v0.20.0-release-notes.md`
    - [ ] 1.4.2 Extract all import statements using grep pattern `^import|^from`
    - [ ] 1.4.3 For each import, check if the path exists in source code
    - [ ] 1.4.4 Document any import paths that don't match source
    - [ ] 1.4.5 Correct any mismatched import paths
  - [ ] 1.5 Verify all API signatures in configuration.md against source
    - [ ] 1.5.1 Read `docs/reference/configuration.md`
    - [ ] 1.5.2 Extract all configuration option definitions
    - [ ] 1.5.3 Search source for type definitions of each config option
    - [ ] 1.5.4 Compare documented signatures with source type definitions
    - [ ] 1.5.5 Document any discrepancies found
    - [ ] 1.5.6 Update configuration.md to match source signatures
  - [ ] 1.6 Verify code examples in build-your-first-api.md are syntactically correct
    - [ ] 1.6.1 Read `docs/getting-started/build-your-first-api.md`
    - [ ] 1.6.2 Extract all code blocks in markdown code fences
    - [ ] 1.6.3 For TypeScript/JavaScript blocks, verify syntax
    - [ ] 1.6.4 Check that all imports in examples are valid paths
    - [ ] 1.6.5 Document any syntax errors or invalid code
    - [ ] 1.6.6 Fix any identified code issues
  - [ ] 1.7 Verify code examples in add-authentication.md are syntactically correct
    - [ ] 1.7.1 Read `docs/getting-started/add-authentication.md`
    - [ ] 1.7.2 Extract all code blocks in markdown code fences
    - [ ] 1.7.3 For TypeScript/JavaScript blocks, verify syntax
    - [ ] 1.7.4 Check that all imports in examples are valid paths
    - [ ] 1.7.5 Document any syntax errors or invalid code
    - [ ] 1.7.6 Fix any identified code issues
  - [ ] 1.8 Verify code examples in deploy-to-production.md are syntactically correct
    - [ ] 1.8.1 Read `docs/getting-started/deploy-to-production.md`
    - [ ] 1.8.2 Extract all code blocks in markdown code fences
    - [ ] 1.8.3 For TypeScript/JavaScript blocks, verify syntax
    - [ ] 1.8.4 Check that all imports in examples are valid paths
    - [ ] 1.8.5 Document any syntax errors or invalid code
    - [ ] 1.8.6 Fix any identified code issues
  - [ ] 1.9 Cross-reference all code examples with actual source implementation
    - [ ] 1.9.1 Create list of all files modified in tasks 1.4-1.8
    - [ ] 1.9.2 For each code example, find the corresponding source file
    - [ ] 1.9.3 Verify API usage matches source implementation
    - [ ] 1.9.4 Document examples that don't match source
    - [ ] 1.9.5 Update examples to match source implementation

- [ ] 2.0 Accuracy Corrections
  - [ ] 2.1 Fix PostgreSQL adapter documentation (5 issues in postgres-package-merge.md)
    - [ ] 2.1.1 Read `docs/migration-guides/postgres-package-merge.md`
    - [ ] 2.1.2 Locate PostgreSQL adapter source code in opensrc directory
    - [ ] 2.1.3 Identify and document all 5 PostgreSQL adapter issues
    - [ ] 2.1.4 For each issue, compare documentation against source implementation
    - [ ] 2.1.5 Correct import paths for PostgreSQL adapter
    - [ ] 2.1.6 Correct API signatures for PostgreSQL adapter
    - [ ] 2.1.7 Update code examples to match current implementation
    - [ ] 2.1.8 Remove deprecated adapter usage patterns
    - [ ] 2.1.9 Verify all corrections align with source code
  - [ ] 2.2 Fix Email OTP plugin documentation (5 issues in email-otp.md)
    - [ ] 2.2.1 Read `docs/how-to-guides/auth/email-otp.md`
    - [ ] 2.2.2 Locate Email OTP plugin source code in opensrc directory
    - [ ] 2.2.3 Identify and document all 5 Email OTP plugin issues
    - [ ] 2.2.4 For each issue, compare documentation against source implementation
    - [ ] 2.2.5 Correct import paths for Email OTP plugin
    - [ ] 2.2.6 Correct API signatures for Email OTP plugin
    - [ ] 2.2.7 Update code examples to match current implementation
    - [ ] 2.2.8 Fix configuration options for Email OTP
    - [ ] 2.2.9 Verify all corrections align with source code
  - [ ] 2.3 Fix Plunk email driver documentation (3 issues in plunk-email.md)
    - [ ] 2.3.1 Read `docs/how-to-guides/integrations/plunk-email.md`
    - [ ] 2.3.2 Locate Plunk email driver source code in opensrc directory
    - [ ] 2.3.3 Identify and document all 3 Plunk email driver issues
    - [ ] 2.3.4 For each issue, compare documentation against source implementation
    - [ ] 2.3.5 Correct import paths for Plunk email driver
    - [ ] 2.3.6 Correct API signatures for Plunk email driver
    - [ ] 2.3.7 Update code examples to match current implementation
    - [ ] 2.3.8 Verify all corrections align with source code
  - [ ] 2.4 Fix SvelteKit adapter documentation (2 issues in sveltekit.md)
    - [ ] 2.4.1 Read `docs/how-to-guides/setup/integrations/sveltekit.md`
    - [ ] 2.4.2 Locate SvelteKit adapter source code in opensrc directory
    - [ ] 2.4.3 Identify and document all 2 SvelteKit adapter issues
    - [ ] 2.4.4 For each issue, compare documentation against source implementation
    - [ ] 2.4.5 Correct import paths for SvelteKit adapter
    - [ ] 2.4.6 Correct API signatures for SvelteKit adapter
    - [ ] 2.4.7 Update code examples to match current implementation
    - [ ] 2.4.8 Verify all corrections align with source code
  - [ ] 2.5 Verify and correct Browser/SQLocal mode documentation (browser-sqlocal.md)
    - [ ] 2.5.1 Read `docs/how-to-guides/setup/integrations/browser-sqlocal.md`
    - [ ] 2.5.2 Locate browser mode and SQLocal source code in opensrc directory
    - [ ] 2.5.3 Identify all uncertain areas in browser mode documentation
    - [ ] 2.5.4 For each uncertain area, research source implementation
    - [ ] 2.5.5 Correct import paths for browser mode integration
    - [ ] 2.5.6 Correct API signatures for browser mode
    - [ ] 2.5.7 Update code examples to match current implementation
    - [ ] 2.5.8 Verify SQLocal integration details match source
    - [ ] 2.5.9 Remove any speculative or uncertain content
    - [ ] 2.5.10 Verify all corrections align with source code

- [ ] 3.0 Navigation & Consistency
  - [ ] 3.1 Fix broken internal link in build-your-first-api.md:202
    - [ ] 3.1.1 Read `docs/getting-started/build-your-first-api.md`
    - [ ] 3.1.2 Locate line 202 and examine the broken link
    - [ ] 3.1.3 Determine the correct target path (should point to create-first-user)
    - [ ] 3.1.4 Search for the actual create-first-user file location
    - [ ] 3.1.5 Update the link with the correct path
    - [ ] 3.1.6 Verify the link now resolves correctly
  - [ ] 3.2 Find and fix all references to non-existent sdk.md file
    - [ ] 3.2.1 Search all .md files for references to sdk.md using grep
    - [ ] 3.2.2 Document all files containing sdk.md references
    - [ ] 3.2.3 Determine the correct replacement for each reference (likely react-sdk-reference.md or specific SDK file)
    - [ ] 3.2.4 Update each reference to point to the correct file
    - [ ] 3.2.5 Verify all updated links resolve correctly
  - [ ] 3.3 Verify all framework comparison links are correct
    - [ ] 3.3.1 Read `docs/how-to-guides/setup/integrations/framework-comparison.md`
    - [ ] 3.3.2 Extract all internal and external links
    - [ ] 3.3.3 For internal links, verify target files exist
    - [ ] 3.3.4 For external links, verify URLs are valid using web fetch
    - [ ] 3.3.5 Fix any broken or incorrect links found
    - [ ] 3.3.6 Update docs.json if navigation structure needs changes
  - [ ] 3.4 Update docs.json navigation structure if needed
    - [ ] 3.4.1 Read `docs.json` file
    - [ ] 3.4.2 Verify all navigation entries have corresponding files
    - [ ] 3.4.3 Check for orphaned files not in navigation
    - [ ] 3.4.4 Add any missing files to navigation
    - [ ] 3.4.5 Remove any navigation entries for deleted files
    - [ ] 3.4.6 Ensure navigation structure is logical and organized
  - [ ] 3.5 Standardize terminology: adminOptions vs adminOptions.adminBasepath
    - [ ] 3.5.1 Search all .md files for `adminOptions` using grep
    - [ ] 3.5.2 Search all .md files for `adminBasepath` using grep
    - [ ] 3.5.3 Determine the correct terminology from source code
    - [ ] 3.5.4 Document all instances of incorrect terminology
    - [ ] 3.5.5 Replace all instances with correct terminology
    - [ ] 3.5.6 Verify consistency across all updated files
  - [ ] 3.6 Standardize import path patterns across all documentation
    - [ ] 3.6.1 Extract all import statements from all .md files using grep
    - [ ] 3.6.2 Analyze patterns and identify inconsistencies (e.g., @bknd/core vs bknd/core)
    - [ ] 3.6.3 Determine the correct import pattern from package.json exports
    - [ ] 3.6.4 Document all files with non-standard import patterns
    - [ ] 3.6.5 Update all imports to use the correct pattern
    - [ ] 3.6.6 Verify all imports are now consistent
  - [ ] 3.7 Standardize API endpoint naming conventions
    - [ ] 3.7.1 Search for API endpoint references in all .md files
    - [ ] 3.7.2 Identify naming patterns (e.g., /api/auth vs /auth/api)
    - [ ] 3.7.3 Determine the correct endpoint naming from source code
    - [ ] 3.7.4 Document all instances of non-standard endpoint names
    - [ ] 3.7.5 Update all endpoint references to use correct naming
    - [ ] 3.7.6 Verify all endpoints are now consistent

- [ ] 4.0 Documentation Simplification
  - [ ] 4.1 Simplify migration guide (reduce 30%, ~120 lines from postgres-package-merge.md)
    - [ ] 4.1.1 Read `docs/migration-guides/postgres-package-merge.md` (409 lines)
    - [ ] 4.1.2 Identify redundant explanations and verbose sections
    - [ ] 4.1.3 Identify over-engineered scenarios that can be simplified
    - [ ] 4.1.4 Identify duplicate content that can be consolidated
    - [ ] 4.1.5 Simplify code examples (remove verbose, add concise alternatives)
    - [ ] 4.1.6 Remove edge case scenarios that aren't commonly needed
    - [ ] 4.1.7 Consolidate repeated warnings or notes
    - [ ] 4.1.8 Rewrite sections to be more direct and concise
    - [ ] 4.1.9 Target reduction to ~280 lines (30% reduction from 409)
    - [ ] 4.1.10 Verify content is still clear and actionable after simplification
  - [ ] 4.2 Simplify email OTP guide (reduce 40%, ~324 lines from email-otp.md)
    - [ ] 4.2.1 Read `docs/how-to-guides/auth/email-otp.md` (810 lines)
    - [ ] 4.2.2 Identify redundant explanations and verbose sections
    - [ ] 4.2.3 Identify over-engineered scenarios that can be simplified
    - [ ] 4.2.4 Identify duplicate content that can be consolidated
    - [ ] 4.2.5 Simplify code examples (remove verbose, add concise alternatives)
    - [ ] 4.2.6 Remove unnecessary troubleshooting scenarios
    - [ ] 4.2.7 Consolidate repeated configuration explanations
    - [ ] 4.2.8 Rewrite sections to be more direct and concise
    - [ ] 4.2.9 Target reduction to ~480 lines (40% reduction from 810)
    - [ ] 4.2.10 Verify content is still clear and actionable after simplification
  - [ ] 4.3 Simplify Plunk guide (reduce 35%, ~242 lines from plunk-email.md)
    - [ ] 4.3.1 Read `docs/how-to-guides/integrations/plunk-email.md` (691 lines)
    - [ ] 4.3.2 Identify redundant explanations and verbose sections
    - [ ] 4.3.3 Identify over-engineered scenarios that can be simplified
    - [ ] 4.3.4 Identify duplicate content that can be consolidated
    - [ ] 4.3.5 Simplify code examples (remove verbose, add concise alternatives)
    - [ ] 4.3.6 Remove edge case scenarios that aren't commonly needed
    - [ ] 4.3.7 Consolidate repeated configuration explanations
    - [ ] 4.3.8 Rewrite sections to be more direct and concise
    - [ ] 4.3.9 Target reduction to ~450 lines (35% reduction from 691)
    - [ ] 4.3.10 Verify content is still clear and actionable after simplification
  - [ ] 4.4 Simplify browser mode guide (reduce 40%, ~369 lines from browser-sqlocal.md)
    - [ ] 4.4.1 Read `docs/how-to-guides/setup/integrations/browser-sqlocal.md` (923 lines)
    - [ ] 4.4.2 Identify redundant explanations and verbose sections
    - [ ] 4.4.3 Identify over-engineered scenarios that can be simplified
    - [ ] 4.4.4 Identify duplicate content that can be consolidated
    - [ ] 4.4.5 Simplify code examples (remove verbose, add concise alternatives)
    - [ ] 4.4.6 Remove edge case scenarios that aren't commonly needed
    - [ ] 4.4.7 Consolidate repeated configuration explanations
    - [ ] 4.4.8 Rewrite sections to be more direct and concise
    - [ ] 4.4.9 Target reduction to ~550 lines (40% reduction from 923)
    - [ ] 4.4.10 Verify content is still clear and actionable after simplification

- [ ] 5.0 Final Validation & Quality Assurance
  - [ ] 5.1 Perform comprehensive review of all corrected files
    - [ ] 5.1.1 Create list of all files modified in phases 1-4
    - [ ] 5.1.2 Read each modified file to review changes
    - [ ] 5.1.3 Check for any introduced inconsistencies
    - [ ] 5.1.4 Verify all code examples are still complete
    - [ ] 5.1.5 Verify all links are properly formatted
    - [ ] 5.1.6 Check for any remaining placeholder or TODO content
    - [ ] 5.1.7 Document any issues that need addressing
  - [ ] 5.2 Validate all internal links using link checker
    - [ ] 5.2.1 Extract all internal links from all .md files
    - [ ] 5.2.2 Verify each link target file exists
    - [ ] 5.2.3 Verify anchor links point to valid sections
    - [ ] 5.2.4 Document any broken links found
    - [ ] 5.2.5 Fix all broken internal links
    - [ ] 5.2.6 Verify docs.json navigation entries match file structure
  - [ ] 5.3 Verify all code examples against source code
    - [ ] 5.3.1 Extract all code blocks from all .md files
    - [ ] 5.3.2 For TypeScript/JavaScript code, verify syntax
    - [ ] 5.3.3 For code with imports, verify import paths exist
    - [ ] 5.3.4 For API usage, verify signatures match source
    - [ ] 5.3.5 Document any remaining code issues
    - [ ] 5.3.6 Fix any remaining code issues
  - [ ] 5.4 Reassess alignment score against original review
    - [ ] 5.4.1 Review original review findings
    - [ ] 5.4.2 Count remaining issues from original review
    - [ ] 5.4.3 Calculate new alignment score (aim for >80%)
    - [ ] 5.4.4 Document improvements made vs original state
    - [ ] 5.4.5 Identify any remaining issues that couldn't be resolved
  - [ ] 5.5 Generate final report of improvements made
    - [ ] 5.5.1 Count total lines reduced across all simplified files
    - [ ] 5.5.2 Count total technical issues fixed
    - [ ] 5.5.3 Count total broken links fixed
    - [ ] 5.5.4 Count total terminology inconsistencies resolved
    - [ ] 5.5.5 Create summary report with before/after metrics
    - [ ] 5.5.6 Save report to `tasks/docs-0.20.0-update/report.md`
