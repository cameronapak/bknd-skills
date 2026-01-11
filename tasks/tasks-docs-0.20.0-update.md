## Relevant Files

### Source Code Verification
- `opensrc/sources.json` - Check if bknd-io/bknd is listed, may need to add entry
- `opensrc/repos/github.com/bknd-io/bknd/` - Will contain fetched source code

### Phase 2: Technical Verification Files
- `docs/releases/v0.20.0-release-notes.md` - Verify code examples and imports
- `docs/migration-guides/postgres-package-merge.md` - (409 lines) Verify PostgreSQL adapter changes
- `docs/how-to-guides/setup/integrations/sveltekit.md` - Verify SvelteKit adapter paths
- `docs/how-to-guides/setup/integrations/browser-sqlocal.md` - (923 lines) Verify browser mode implementation
- `docs/how-to-guides/auth/email-otp.md` - (810 lines) Verify Email OTP plugin code
- `docs/how-to-guides/integrations/plunk-email.md` - (691 lines) Verify Plunk email driver
- `docs/reference/configuration.md` - Verify configuration options
- `docs/getting-started/build-your-first-api.md` - Verify code examples and links
- `docs/getting-started/add-authentication.md` - Verify auth implementation examples
- `docs/getting-started/deploy-to-production.md` - Verify deployment examples

### Phase 3: Accuracy Corrections Files
- `docs/migration-guides/postgres-package-merge.md` - Fix 5 PostgreSQL adapter issues
- `docs/how-to-guides/auth/email-otp.md` - Fix 5 Email OTP plugin issues
- `docs/how-to-guides/integrations/plunk-email.md` - Fix 3 Plunk email driver issues
- `docs/how-to-guides/setup/integrations/sveltekit.md` - Fix 2 SvelteKit adapter issues
- `docs/how-to-guides/setup/integrations/browser-sqlocal.md` - Address high uncertainty in browser mode

### Phase 4: Navigation Files
- `docs/getting-started/build-your-first-api.md` - Fix broken link at line 202
- `docs.json` - Update navigation structure (Mintlify config)
- Multiple files - Fix references to non-existent `sdk.md`
- `docs/how-to-guides/setup/integrations/framework-comparison.md` - Verify comparison links

### Phase 5: Consistency Files
- All documentation files - Standardize `adminOptions` vs `adminOptions.adminBasepath` usage
- All code examples - Standardize import path patterns
- All API references - Standardize endpoint naming conventions
- `docs/reference/auth-module.md` - Consistent auth terminology
- `docs/reference/data-module.md` - Consistent data terminology
- `docs/reference/react-sdk-reference.md` - Consistent SDK terminology

### Phase 6: Simplification Files
- `docs/migration-guides/postgres-package-merge.md` - Reduce 30% (~120 lines from 409)
- `docs/how-to-guides/auth/email-otp.md` - Reduce 40% (~324 lines from 810)
- `docs/how-to-guides/integrations/plunk-email.md` - Reduce 35% (~242 lines from 691)
- `docs/how-to-guides/setup/integrations/browser-sqlocal.md` - Reduce 40% (~369 lines from 923)

### Notes
- The official bknd source code fetch is the critical blocker for all other tasks
- Each file has specific line counts and percentage reduction targets
- Use code verification by comparing import statements against source code
- Link verification can be done with `grep` for internal references and web tools for external links
- Consistency checks should use `grep` patterns to find all instances of terminology variations
- Simplification should focus on removing redundant explanations, verbose examples, and over-engineered scenarios
- After each phase, update the task list by checking off completed items

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
  - [ ] 2.2 Fix Email OTP plugin documentation (5 issues in email-otp.md)
  - [ ] 2.3 Fix Plunk email driver documentation (3 issues in plunk-email.md)
  - [ ] 2.4 Fix SvelteKit adapter documentation (2 issues in sveltekit.md)
  - [ ] 2.5 Verify and correct Browser/SQLocal mode documentation (browser-sqlocal.md)

- [ ] 3.0 Navigation & Consistency
  - [ ] 3.1 Fix broken internal link in build-your-first-api.md:202
  - [ ] 3.2 Find and fix all references to non-existent sdk.md file
  - [ ] 3.3 Verify all framework comparison links are correct
  - [ ] 3.4 Update docs.json navigation structure if needed
  - [ ] 3.5 Standardize terminology: adminOptions vs adminOptions.adminBasepath
  - [ ] 3.6 Standardize import path patterns across all documentation
  - [ ] 3.7 Standardize API endpoint naming conventions

- [ ] 4.0 Documentation Simplification
  - [ ] 4.1 Simplify migration guide (reduce 30%, ~120 lines from postgres-package-merge.md)
  - [ ] 4.2 Simplify email OTP guide (reduce 40%, ~324 lines from email-otp.md)
  - [ ] 4.3 Simplify Plunk guide (reduce 35%, ~242 lines from plunk-email.md)
  - [ ] 4.4 Simplify browser mode guide (reduce 40%, ~369 lines from browser-sqlocal.md)

- [ ] 5.0 Final Validation & Quality Assurance
  - [ ] 5.1 Perform comprehensive review of all corrected files
  - [ ] 5.2 Validate all internal links using link checker
  - [ ] 5.3 Verify all code examples against source code
  - [ ] 5.4 Reassess alignment score against original review
  - [ ] 5.5 Generate final report of improvements made
