## Relevant Files

- `astro.config.mjs` - Main Astro configuration with Starlight integration setup
- `src/content/config.ts` - Content collections configuration (if needed for custom schemas)
- `src/content/docs/index.mdx` - Homepage/landing page documentation
- `src/content/docs/getting-started/*.mdx` - Getting Started section documentation files
- `src/content/docs/how-to/*.mdx` - How-to Guides section documentation files
- `src/content/docs/architecture/*.mdx` - Architecture & Concepts section documentation files
- `src/content/docs/reference/*.mdx` - Reference section documentation files
- `src/content/docs/troubleshooting/*.mdx` - Troubleshooting section documentation files
- `src/content/docs/comparisons/*.mdx` - Comparisons section documentation files
- `src/sidebar.ts` - Starlight navigation sidebar configuration converted from docs.json
- `src/custom.css` - Custom CSS for Bknd brand color overrides
- `src/assets/logo.svg` - Bknd logo asset for header
- `src/favicon.svg` - Site favicon
- `netlify.toml` - Netlify deployment configuration
- `README.md` - Project documentation with build/deploy instructions
- `docs.json` - Original Mintlify configuration (archive/backup)
- `docs/**/*.md` - Original markdown files (archive/backup)

### Notes

- **IMPORTANT:** YOU MUST READ tasks/docs-migration/STARLIGHT_CONVERSION_LEARNINGS.md to get caught up before doing any work.
- **IMPORTANT:** After completing a task, you must process something that you've learned that would be helpful for you to continue as you do more tasks like this. YOU MUST update tasks/docs-migration/STARLIGHT_CONVERSION_LEARNINGS.md with at least one learning.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 1.0 Starlight Project Setup & Configuration
  - [ ] 1.1 Create new Astro project using Starlight template (`npm create astro@latest -- --template starlight`)
  - [ ] 1.2 Verify project structure and test initial build (`npm run build`)
  - [ ] 1.3 Configure Starlight integration in `astro.config.mjs` with Bknd title and description
  - [ ] 1.4 Add Bknd logo asset to `src/assets/` directory (obtain from team)
  - [ ] 1.5 Configure logo in Starlight config with proper alt text
  - [ ] 1.6 Create or obtain favicon and add to project root
  - [ ] 1.7 Create `src/custom.css` with Bknd brand color overrides (#166E3F primary, #26BD6C secondary, #0D4A29 dark)
  - [ ] 1.8 Test brand colors appear correctly by running dev server and checking light/dark modes
  - [ ] 1.9 Set up Netlify account and connect to GitHub repository
  - [ ] 1.10 Configure Netlify build settings (build command: `npm run build`, publish directory: `dist`)
  - [ ] 1.11 Test initial Netlify deployment from main branch
  - [ ] 1.12 Verify production site builds and deploys successfully

- [ ] 2.0 Navigation Structure Conversion
  - [x] 2.1 Read and analyze existing `docs.json` Mintlify configuration
  - [x] 2.2 Create `src/content/docs/` directory structure matching Mintlify sections (getting-started, how-to, architecture, reference, troubleshooting, comparisons)
  - [x] 2.3 Create `src/sidebar.ts` file with base Starlight sidebar configuration
  - [ ] 2.4 Convert Mintlify "Getting Started" group to Starlight sidebar items with correct links
  - [ ] 2.5 Convert Mintlify "How-to Guides" group to Starlight sidebar items
  - [ ] 2.6 Convert Mintlify "Architecture & Concepts" group to Starlight sidebar items
  - [ ] 2.7 Convert Mintlify "Reference" group to Starlight sidebar items
  - [ ] 2.8 Convert Mintlify "Troubleshooting" group to Starlight sidebar items
  - [ ] 2.9 Convert Mintlify "Comparisons" group to Starlight sidebar items
  - [ ] 2.10 Add appropriate separators between major sidebar sections for readability
  - [ ] 2.11 Verify all sidebar links point to valid page paths (will exist after content migration)
  - [ ] 2.12 Test sidebar navigation appears correctly in dev server

- [ ] 3.0 Content Migration - Homepage & Getting Started
  - [ ] 3.1 Create backup of original markdown files in separate directory or branch
  - [ ] 3.2 Read existing homepage markdown file from `/docs/index.md`
  - [ ] 3.3 Create `src/content/docs/index.mdx` with migrated homepage content
  - [ ] 3.4 Preserve frontmatter (title, description) from original file
  - [ ] 3.5 Update homepage frontmatter for Starlight if needed (editUrl, tableOfContents)
  - [ ] 3.6 Test homepage renders correctly in dev server
  - [ ] 3.7 Migrate all Getting Started markdown files to `src/content/docs/getting-started/`
  - [ ] 3.8 Convert file extensions from `.md` to `.mdx` if JSX components present
  - [ ] 3.9 Preserve all frontmatter in each Getting Started file
  - [ ] 3.10 Validate internal links within Getting Started section work correctly
  - [ ] 3.11 Test navigation through Getting Started section via sidebar
  - [ ] 3.12 Verify all Getting Started pages are accessible and render properly

- [ ] 4.0 Content Migration - Core Sections
  - [ ] 4.1 Migrate all How-to Guides markdown files to `src/content/docs/how-to/`
  - [ ] 4.2 Preserve all frontmatter in each How-to Guides file
  - [ ] 4.3 Validate internal links within How-to Guides section
  - [ ] 4.4 Test navigation through How-to Guides section via sidebar
  - [ ] 4.5 Verify all How-to Guides pages render properly
  - [ ] 4.6 Migrate all Architecture & Concepts markdown files to `src/content/docs/architecture/`
  - [ ] 4.7 Preserve all frontmatter in each Architecture file
  - [ ] 4.8 Validate internal links within Architecture section
  - [ ] 4.9 Test navigation through Architecture section via sidebar
  - [ ] 4.10 Verify all Architecture pages render properly

- [ ] 5.0 Content Migration - Reference & Supporting Sections
  - [ ] 5.1 Migrate all Reference markdown files to `src/content/docs/reference/`
  - [ ] 5.2 Preserve all frontmatter in each Reference file
  - [ ] 5.3 Validate internal links within Reference section
  - [ ] 5.4 Test navigation through Reference section via sidebar
  - [ ] 5.5 Verify all Reference pages render properly
  - [ ] 5.6 Migrate all Troubleshooting markdown files to `src/content/docs/troubleshooting/`
  - [ ] 5.7 Preserve all frontmatter in each Troubleshooting file
  - [ ] 5.8 Validate internal links within Troubleshooting section
  - [ ] 5.9 Test navigation through Troubleshooting section via sidebar
  - [ ] 5.10 Migrate all Comparisons markdown files to `src/content/docs/comparisons/`
  - [ ] 5.11 Preserve all frontmatter in each Comparisons file
  - [ ] 5.12 Validate internal links within Comparisons section
  - [ ] 5.13 Test navigation through Comparisons section via sidebar
  - [ ] 5.14 Perform site-wide internal link validation across all migrated sections

- [ ] 6.0 JSX Component Conversion & Content Cleanup
  - [ ] 6.1 Audit all migrated markdown files for JSX-like syntax using grep/search
  - [ ] 6.2 Replace `<div className="grid...">` patterns with Markdown lists or Starlight Card components
  - [ ] 6.3 Replace `<div className="flex...">` patterns with simple Markdown formatting
  - [ ] 6.4 Convert custom alert/notice components to Starlight `:::note`, `:::tip`, `:::caution`, or `:::danger` callouts
  - [ ] 6.5 Convert any tab/accordion components to Starlight Tab component if needed
  - [ ] 6.6 Replace any custom card components with Starlight Card component syntax
  - [ ] 6.7 Validate code blocks are properly formatted for Starlight syntax highlighting
  - [ ] 6.8 Ensure all JSX has been converted to Markdown or Starlight components
  - [ ] 6.9 Document any complex JSX that couldn't be converted with HTML comments (`<!-- TODO: Convert to Starlight component -->`)
  - [ ] 6.10 Test all pages with converted components in dev server
  - [ ] 6.11 Verify no JSX syntax errors appear in build output

- [ ] 7.0 Quality Assurance & Testing
  - [ ] 7.1 Run full production build (`npm run build`) and verify no errors or warnings
  - [ ] 7.2 Test all sidebar navigation links work correctly
  - [ ] 7.3 Test search functionality with 10+ common queries (e.g., "authentication", "API", "deployment", "troubleshooting")
  - [ ] 7.4 Verify search returns relevant results for tested queries
  - [ ] 7.5 Test mobile responsiveness on common breakpoints (375px, 768px, 1024px)
  - [ ] 7.6 Verify sidebar navigation works on mobile devices
  - [ ] 7.7 Test dark mode toggle functionality
  - [ ] 7.8 Verify code syntax highlighting works for all code blocks (JavaScript/TypeScript, JSON, shell)
  - [ ] 7.9 Test copy-to-clipboard functionality on code blocks
  - [ ] 7.10 Validate all internal links work correctly site-wide
  - [ ] 7.11 Verify all images and assets load correctly
  - [ ] 7.12 Check for any broken external links
  - [ ] 7.13 Test page load times on 4G connection (should be < 2 seconds)
  - [ ] 7.14 Verify brand colors (#166E3F, #26BD6C, #0D4A29) display consistently
  - [ ] 7.15 Verify logo displays correctly in header and favicon appears in browser tab
  - [ ] 7.16 Review homepage for clarity and effective call-to-action
  - [ ] 7.17 Test "Quick Start" or "Get Started" link on homepage

- [ ] 8.0 Production Deployment & Handoff
  - [ ] 8.1 Update Netlify configuration if needed (netlify.toml)
  - [ ] 8.2 Configure GitHub repository URL for "Edit this page" links in Starlight config
  - [ ] 8.3 Perform final production deployment to Netlify
  - [ ] 8.4 Smoke test production site (verify all pages load, search works, navigation functions)
  - [ ] 8.5 Configure custom domain if applicable (otherwise use Netlify subdomain)
  - [ ] 8.6 Create comprehensive README.md with build and deployment instructions
  - [ ] 8.7 Document how to add new documentation pages (file structure, frontmatter, sidebar updates)
  - [ ] 8.8 Document Netlify deployment process and CI/CD workflow
  - [ ] 9.9 Document any content that couldn't be converted from JSX for future iteration
  - [ ] 8.10 Archive original Mintlify docs.json configuration file
  - [ ] 8.11 Archive original markdown files in separate directory or backup branch
  - [ ] 8.12 Conduct handoff meeting with Bknd team
  - [ ] 8.13 Provide overview of project structure and how to maintain documentation
  - [ ] 8.14 Walk through deployment process with Bknd team
  - [ ] 8.15 Answer any questions from Bknd team about maintenance and updates

## Dependencies

- Task 2.0 (Navigation Structure Conversion) depends on Task 1.0 completion
- Task 3.0, 4.0, 5.0 (Content Migration) can proceed in parallel after Task 2.0 completion
- Task 6.0 (JSX Conversion) depends on Tasks 3.0, 4.0, 5.0 completion
- Task 7.0 (QA & Testing) depends on Task 6.0 completion
- Task 8.0 (Deployment & Handoff) depends on Task 7.0 completion

## Priority Levels

**High Priority (Must Complete)**
- 1.1-1.4: Project initialization and branding setup
- 2.1-2.3: Navigation structure conversion
- 3.2-3.6: Homepage migration
- 6.1-6.8: JSX component conversion
- 7.1-7.3: Build test and search functionality
- 8.3-8.4: Production deployment

**Medium Priority (Should Complete)**
- 1.5-1.8: Logo and color refinement
- 3.7-3.12: Getting Started section migration
- 4.1-4.10: Core sections migration
- 5.1-5.14: Reference sections migration
- 7.4-7.14: Comprehensive testing
- 8.1-8.2, 8.6-8.9: Documentation and configuration

**Low Priority (Nice to Have)**
- 1.9-1.12: Early Netlify setup (can be deferred to Phase 4)
- 2.10: Sidebar separators
- 6.9: Documenting unconverted JSX
- 7.15-7.17: Visual polish and homepage review
- 8.5: Custom domain configuration
- 8.10-8.15: Archive and handoff activities

## Acceptance Criteria

### Critical Path Acceptance Criteria

**Project Setup (Task 1.0)**
- [ ] Starlight project builds successfully without errors
- [ ] Bknd brand colors (#166E3F, #26BD6C, #0D4A29) display in both light and dark modes
- [ ] Logo appears in header and favicon in browser tab

**Navigation (Task 2.0)**
- [ ] Sidebar contains all sections from Mintlify: Getting Started, How-to Guides, Architecture & Concepts, Reference, Troubleshooting, Comparisons
- [ ] All sidebar items link to valid page paths
- [ ] Navigation structure matches Mintlify docs.json structure

**Content Migration (Tasks 3.0-5.0)**
- [ ] All 25+ markdown files successfully migrated to Starlight structure
- [ ] All frontmatter preserved (title, description)
- [ ] No broken internal links across all sections
- [ ] All pages render without errors in dev server

**JSX Conversion (Task 6.0)**
- [ ] No JSX syntax errors in build output
- [ ] All grid/flex layouts converted to Markdown or Starlight components
- [ ] All custom alerts converted to Starlight callouts

**Quality Assurance (Task 7.0)**
- [ ] Production build succeeds with zero errors or warnings
- [ ] Search returns relevant results for at least 10 common queries
- [ ] Mobile responsive design works on 375px, 768px, 1024px breakpoints
- [ ] All navigation links functional
- [ ] Page load time < 2 seconds on 4G connection

**Deployment (Task 8.0)**
- [ ] Site successfully deployed to Netlify and accessible in production
- [ ] README.md with complete build/deploy instructions
- [ ] Handoff completed with Bknd team

## Timeline Estimate

**Phase 1: Setup & Configuration (Days 1-2)**
- Task 1.0: ~4-6 hours
- Task 2.0: ~2-3 hours

**Phase 2: Content Migration (Days 3-5)**
- Task 3.0: ~3-4 hours
- Task 4.0: ~4-5 hours
- Task 5.0: ~3-4 hours

**Phase 3: QA & Polish (Days 6-7)**
- Task 6.0: ~2-3 hours
- Task 7.0: ~4-6 hours

**Phase 4: Handoff (Day 8)**
- Task 8.0: ~2-3 hours

**Total Estimated Effort: ~24-34 hours (3-4 days)**

Note: PRD allocates 8 business days to account for coordination, feedback, and potential issues. Actual technical work should complete within 3-4 days.
