# Bknd Documentation Improvement - PRD Task List

We are improving the documentation for bknd-io/bknd: https://github.com/bknd-io/bknd

## Relevant Files

- `docs/getting-started/build-your-first-api.md` - Core tutorial for onboarding new developers
- `docs/getting-started/build-your-first-api.test.md` - Tutorial validation checklist
- `docs/architecture-and-concepts/what-is-bknd.md` - Grand unifying context page
- `docs/how-to-guides/setup/choose-your-mode.md` - Mode decision tree guide
- `docs/how-to-guides/data/seed-database.md` - Database seeding guide with workarounds
- `docs/how-to-guides/auth/create-first-user.md` - First user creation guide
- `docs/how-to-guides/permissions/public-access-guard.md` - Public access with guard guide
- `docs/how-to-guides/data/entity-media-relationships.md` - Entity relationships guide
- `docs/how-to-guides/data/schema-ids-vs-uuids.md` - ID configuration guide
- `docs/how-to-guides/setup/integrations/nextjs.md` - Next.js integration guide
- `docs/getting-started/add-authentication.md` - Auth tutorial with permissions
- `docs/getting-started/deploy-to-production.md` - Deployment tutorial
- `docs/troubleshooting/common-issues.md` - Troubleshooting FAQ
- `docs/troubleshooting/known-issues.md` - Known bugs and workarounds
- `docs/how-to-guides/setup/integrations/vite-react.md` - Vite + React integration guide
- `docs/how-to-guides/setup/integrations/react-router.md` - React Router integration guide
- `docs/how-to-guides/setup/integrations/astro.md` - Astro integration guide
- `docs/how-to-guides/setup/integrations/bun-node.md` - Bun/Node standalone guide
- `docs/how-to-guides/setup/integrations/cloudflare-workers.md` - Cloudflare Workers guide
- `docs/how-to-guides/setup/integrations/aws-lambda.md` - AWS Lambda guide
- `docs/how-to-guides/setup/integrations/docker.md` - Docker deployment guide
- `docs/reference/auth-module.md` - Complete Auth module documentation
- `docs/reference/data-module.md` - Complete Data module documentation
- `docs/architecture-and-concepts/how-bknd-works.md` - Request lifecycle and architecture

**IMPORTANT:** YOU MUST READ LEARNINGS.md to get caught up before doing any work.

### Notes

- Use Mintlify format for all documentation files
- Follow Divio's Four Documentation Types: Tutorials, How-to Guides, Explanation, Reference
- All tutorials must include working, tested code examples
- Each guide should have clear outcomes and prerequisites
- Use the testing checklist format (`.test.md`) for tutorials to validate each step
- Search https://docs.bknd.io and use Zread MCP server to research Bknd properly
- You can also use the `opensrc` tool available to search the bknd codebase! If you need to look at the codebase, this is the tool to use!

**IMPORTANT:** you must read https://www.mintlify.com/blog/how-to-write-documentation-that-developers-want-to-read and https://docs.divio.com/documentation-system/ before doing research.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

**IMPORTANT:** After completing a task, you must process something that you've learned that would be helpful for you to continue as you do more tasks like this. YOU MUST update LEARNINGS.md with at least one learning.

## Tasks

- [x] 1.0 Phase 1: Critical Foundation (Week 1-2)
  - [x] 1.1 Write "Build Your First API" tutorial (P0)
    - Create complete Vite + React tutorial from scratch (15 min)
    - Define entities in Admin UI
    - Enable Auth module and create admin user
    - Build React UI to consume API
    - Test complete application end-to-end
  - [x] 1.2 Write "Architecture & Concepts" page (P0)
    - Explain what Bknd IS conceptually (grand unifying context)
    - Clarify "embeddable" architecture (server-side, not client-side)
    - Create architecture diagram
    - Explain when to use Bknd vs alternatives
  - [x] 1.3 Write "Choose Your Mode" decision tree (P1)
    - Create decision tree for configuration modes (db mode vs code mode vs ui mode) https://docs.bknd.io/usage/introduction/#modes
    - Document deployment approaches (CLI standalone, Framework Embedded, Serverless/Edge)
    - Provide code examples for each approach
    - Explain mode switching workflow (development in db mode, production in code mode)
  - [x] 1.4 Write "Seed Database" guide (P1)
    - Document seeding process for each mode
    - Include workaround for CodeMode initial seed bug
    - Provide example seed scripts
  - [x] 1.5 Write "Create First User" guide (P1)
    - Document Admin UI method
    - Document CLI method
    - Document programmatic method
  - [x] 1.6 Set up documentation structure
    - Create directory structure for 5 main sections
    - Configure Mintlify navigation
    - Create stub pages for all planned content
  - [x] 1.7 Organize docs into correct folders
    - docs/bknd-comparison-pocketbase.md
    - docs/orm.md
    - docs/query-system.md
    - docs/schema.md
    - Then, update README that references those

- [x] 2.0 Phase 2: Core Task Guides (Week 3-4)
  - [x] 2.1 Write "Enable Public Access with Guard" guide (P1)
    - Step-by-step permission setup
    - Configure guest access
    - Test permission rules
    - Include Firebase comparison
  - [x] 2.2 Write "Entity-Media Relationships" guide (P1)
    - Document one-to-many relationships
    - Document many-to-many relationships
    - Provide complete code examples
  - [x] 2.3 Write "Schema IDs vs UUIDs" guide (P2)
    - Explain when to use each type
    - Provide configuration examples
    - Document trade-offs
   - [x] 2.4 Write "Add Auth with Permissions" tutorial (P2)
     - Set up email/password auth (20 min)
     - Create roles (admin, user, guest)
     - Assign permissions
     - Protect endpoints
  - [x] 2.5 Write "Request Lifecycle" explanation (P2)
    - Document how requests flow through Bknd
    - Explain database interaction
    - Explain auth flow (JWT, sessions)
    - Explain permission evaluation (RLS + RBAC)

  - [x] 3.0 Phase 3: Integration Guides (Week 5-6)
   - [x] 3.1 Write Next.js integration guide (P2)
     - Complete working example
     - Server component integration
     - App router configuration
     - Environment setup
   - [x] 3.2 Write Vite + React integration guide (P2)
     - Standalone SPA setup
     - API integration patterns
     - State management approach
   - [x] 3.3 Write React Router integration guide (P3)
      - Loader/Action pattern integration
      - Route-based authentication
   - [x] 3.4 Write Astro integration guide (P3)
     - SSR integration
     - Endpoint configuration
    - [x] 3.5 Write Bun/Node standalone guide (P3)
     - Server setup
     - Basic configuration
   - [x] 3.6 Create "Deploy to Production" tutorial (P2)
     - Deploy to Vercel (15 min)
     - Choose mode guidance
     - Set environment variables
     - Configure database connection
  - [x] 3.7 Create framework comparison matrix
    - Compare integration approaches across frameworks
    - Document framework-specific considerations
    - Provide recommendation guidance

- [x] 4.0 Phase 4: Troubleshooting & Advanced (Week 7-8)
   - [x] 4.1 Write Troubleshooting FAQ (P2)
     - Database connection errors
     - Type generation issues
     - Auth token expiration
     - CORS issues
     - Deployment problems
     - Mode switching issues
  - [x] 4.2 Document Known Issues & Workarounds (P2)
     - CodeMode prevents initial seed (with workaround)
     - Password length validation
     - Timestamp indexing limitations
     - Other discovered bugs
   - [x] 4.3 Write Cloudflare Workers guide (P3)
     - Edge deployment setup
     - D1 database configuration
   - [x] 4.4 Write AWS Lambda guide (P3)
     - Serverless deployment
     - Environment configuration
   - [x] 4.5 Write Docker guide (P3)
     - Container setup
     - Database configuration
     - Volume mounting

- [x] 5.0 Phase 5: Complete Reference Documentation
   - [x] 5.1 Complete Auth module documentation (P0)
      - Replace "work in progress" placeholder
      - Document all auth methods
      - Include practical examples
      - Document configuration options
   - [x] 5.2 Complete Data module documentation (P0)
     - Replace "work in progress" placeholder
     - Document CRUD operations
     - Include practical examples
     - Document query system
   - [x] 5.3 Expand SDK Reference (P1)
     - EntityManager API examples
     - Repository API examples
     - Mutator API examples
     - Query system examples (where, with, sort)
     - Event hooks documentation
   - [x] 5.4 Complete React SDK Reference (P1)
     - useAuth hook examples
     - useEntity hook examples
     - useApiQuery hook examples
     - Media.Dropzone documentation
     - Auto-config forms documentation

  - [x] 6.0 Testing & Validation
   - [x] 6.1 Test all tutorials end-to-end
    - Follow each tutorial step-by-step
    - Verify all code examples work
    - Create test checklist for each tutorial
   - [x] 6.2 Validate all guide examples
     - Run all code snippets
     - Verify copy-paste functionality
     - Test on fresh environments
  - [x] 6.3 Cross-link documentation
    - Link tutorials to relevant guides
    - Link guides to reference docs
    - Link explanations to tutorials
   - [x] 6.4 Review navigation structure
     - Test user journeys
     - Verify information hierarchy
     - Check for dead links

  - [x] 7.0 Launch Preparation
    - [x] 7.1 Create documentation index
      - Quick start links
      - Popular resources
      - Getting help section
   - [x] 7.2 Set up search optimization
      - Add meta descriptions
      - Configure search terms
      - Add keywords
    - [x] 7.3 Create onboarding flow
      - Define first-time visitor path
      - Highlight key resources
      - Create progressive disclosure
    - [x] 7.4 Prepare launch checklist
      - Technical validation complete
      - All P0 and P1 deliverables shipped
      - Navigation tested
      - Examples verified

  - [x] 8.0 Find answers to `LEARNINGS.md` and see if we can update any docs
        - [x] Research and document `useApiInfiniteQuery` (experimental infinite scroll hook)
        - [x] Research and document `mountOnce` middleware
        - [x] Research and document `mutateRaw` implementation
        - [x] Research and document end detection with API metadata (count/total)
        - [x] Research and document health check endpoint (`/api/system/ping`)
        - [x] Research and document transaction management (PostgreSQL auto-transactions, manual via Kysely)
        - [x] Research and document bulk operations performance (single SQL, 4-5x faster)
        - [x] Research and document relation mutation support (matrix by relation type)
        - [x] Research and document error recovery for infinite scroll (SWR retry, onErrorRetry, per-page error handling)
        - [x] Research and document prefetching limitations for infinite scroll (not supported)
