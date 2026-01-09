# Product Requirements Document: Bknd Documentation Migration to Starlight

## Executive Summary

Migrate Bknd's documentation from a planned Mintlify implementation to Astro's Starlight documentation framework. This is a greenfield project where the Mintlify configuration (`docs.json`) exists but the site was never deployed. The migration will enable a functional documentation site for external developers with minimal customization (logo, colors, search) and deploy to Netlify within 1-2 weeks.

**Primary Goal**: Launch a production-ready documentation site that serves external developers with clear navigation, effective search, and brand-appropriate styling.

## Goals

1. Create a functional Starlight documentation site from existing 25+ markdown files
2. Implement minimal brand customization (logo, green colors, typography)
3. Enable full-text search using Starlight's built-in Pagefind integration
4. Convert Mintlify navigation structure to Starlight's sidebar configuration
5. Replace JSX-like syntax with Starlight components where possible
6. Deploy to Netlify with CI/CD automation
7. Complete migration within 10 business days

## User Stories

- As an external developer, I want to quickly find documentation through search so I can implement Bknd features efficiently
- As an external developer, I want a clear navigation structure so I can discover relevant topics without confusion
- As the Bknd team, I want minimal customization effort so we can launch quickly without extensive design work
- As the Bknd team, I want Netlify deployment so we can easily update and maintain the site

## Functional Requirements

### Core Requirements

1. **Starlight Setup**
   - Initialize new Astro project with Starlight integration
   - Configure Starlight with Bknd brand colors (#166E3F primary, #26BD6C secondary, #0D4A29 dark)
   - Add Bknd logo to header and favicon
   - Enable Starlight's default Pagefind search functionality

2. **Content Migration**
   - Migrate all 25+ markdown files from `/docs/` to Starlight's content structure
   - Preserve all frontmatter (title, description)
   - Maintain content structure and formatting
   - Validate internal links work correctly in new structure

3. **Navigation Conversion**
   - Convert Mintlify `docs.json` navigation to Starlight's `sidebar` configuration
   - Maintain section structure: Getting Started, How-to Guides, Architecture & Concepts, Reference, Troubleshooting, Comparisons
   - Ensure all pages are discoverable through sidebar navigation
   - Implement grouping and separators where appropriate

4. **JSX to Starlight Components**
   - Audit all markdown files for JSX-like syntax
   - Replace `<div className="grid...">` with Starlight's built-in layout components or Markdown alternatives
   - Replace custom JSX components with Starlight equivalents (cards, tabs, callouts)
   - Document any complex JSX that cannot be easily converted (mark for future iteration)

5. **Homepage Configuration**
   - Set up landing page from `index.md` with clear call-to-action
   - Display core sections with links to key documentation
   - Include "Quick Start" or "Get Started" prominent link

6. **Deployment**
   - Configure Netlify deployment with build commands
   - Set up automatic deployments on push to main branch
   - Configure domain settings (if applicable)
   - Test production build succeeds

### Search Requirements

7. **Search Functionality**
   - Enable Starlight's default Pagefind search
   - Configure search indexing for all documentation pages
   - Test search returns relevant results for key terms
   - Ensure search UI appears in header (Starlight default)

### Code Examples

8. **Code Syntax Highlighting**
   - Configure Starlight's syntax highlighting for all code examples
   - Support JavaScript/TypeScript, JSON, shell commands
   - Ensure copy-to-clipboard functionality works

## Non-Goals (Out of Scope)

- Advanced custom branding (custom fonts, elaborate styling)
- Internationalization (i18n) - single language (English) only
- Custom search beyond Starlight's default Pagefind
- API documentation generation from code comments
- Interactive code playgrounds
- Versioned documentation (e.g., v1, v2 side-by-side)
- User authentication or gated content
- Blog posts or changelog integration
- Custom routing beyond Starlight's file-based routing
- Redirects from Mintlify URLs (site was never live)

## Technical Approach

### Starlight Configuration Strategy

**Framework Setup**
```bash
npm create astro@latest -- --template starlight
```

**Key Configuration Files**
- `astro.config.mjs`: Configure Starlight integration
- `src/content/config.ts`: Define content collections (if needed)
- `src/content/docs/`: Migrate all markdown files here
- `sidebar.ts`: Convert navigation from docs.json

**Theme Customization**
```typescript
// Minimal customization in astro.config.mjs
starlight({
  title: 'Bknd Documentation',
  favicon: '/src/favicon.svg',
  logo: {
    src: './src/assets/logo.svg',
    alt: 'Bknd Logo'
  },
  customCss: ['./src/custom.css'], // For brand colors only
})
```

**Color Override (custom.css)**
```css
:root {
  --sl-color-brand: #166E3F;
  --sl-color-brand-dark: #0D4A29;
  --sl-color-brand-light: #26BD6C;
}
```

### Content Migration Strategy

1. **File Structure**
   ```
   src/content/docs/
   ├── index.mdx
   ├── getting-started/
   │   ├── onboarding-flow.mdx
   │   ├── build-your-first-api.mdx
   │   └── ...
   ├── how-to/
   ├── architecture/
   ├── reference/
   ├── troubleshooting/
   └── comparisons/
   ```

2. **Frontmatter Preservation**
   - Keep existing `title` and `description` fields
   - Add Starlight-specific frontmatter if needed (e.g., `editUrl`, `tableOfContents`)

3. **JSX to Starlight Component Mapping**
   - `<div className="grid">` → Markdown lists or Starlight Cards (if applicable)
   - `<div className="flex">` → Simple Markdown formatting
   - Custom alert components → Starlight's `:::note`, `:::tip`, `:::caution`, `:::danger`
   - Tabs/accordions → Starlight's Tab component (if complex content organization)

### Navigation Conversion (docs.json → sidebar.ts)

**Mintlify Structure (docs.json)**
```json
{
  "logo": {
    "light": "/logo/light.svg",
    "dark": "/logo/dark.svg"
  },
  "name": "Bknd",
  "colors": {
    "primary": "#166E3F",
    "dark": "#0D4A29",
    "light": "#26BD6C"
  },
  "navigation": [
    {
      "group": "Getting Started",
      "pages": [
        "getting-started/index",
        "getting-started/onboarding-flow"
      ]
    }
  ]
}
```

**Starlight Equivalent (sidebar.ts)**
```typescript
export default [
  {
    label: 'Getting Started',
    items: [
      { label: 'Overview', link: '/getting-started/' },
      { label: 'Onboarding Flow', link: '/getting-started/onboarding-flow/' }
    ]
  },
  // ... other sections
]
```

### Hosting Strategy (Netlify)

**Netlify Configuration**
- Build command: `npm run build` (Astro default)
- Publish directory: `dist` (Astro default)
- Node version: 18+ (match Astro requirements)

**CI/CD Setup**
- Connect GitHub repository to Netlify
- Deploy on push to main branch
- Enable deploy previews for pull requests
- Configure environment variables if needed

**Domain**
- Use Netlify subdomain (e.g., bknd-docs.netlify.app) initially
- Configure custom domain via DNS when ready

## Implementation Phases

### Phase 1: Setup & Configuration (Days 1-2)

**Day 1: Project Initialization**
- [ ] Create new Astro + Starlight project
- [ ] Install dependencies
- [ ] Configure brand colors and logo
- [ ] Set up Netlify deployment pipeline
- [ ] Verify initial build and deployment

**Day 2: Base Configuration**
- [ ] Configure sidebar structure from docs.json
- [ ] Set up content directory structure
- [ ] Create custom.css for brand colors
- [ ] Test Starlight search functionality

### Phase 2: Content Migration (Days 3-5)

**Day 3: Getting Started Section**
- [ ] Migrate index.mdx (homepage)
- [ ] Migrate all Getting Started markdown files
- [ ] Convert JSX syntax to Starlight components
- [ ] Validate internal links
- [ ] Test navigation for this section

**Day 4: Core Sections (How-to, Architecture)**
- [ ] Migrate How-to Guides markdown files
- [ ] Migrate Architecture & Concepts markdown files
- [ ] Convert JSX syntax
- [ ] Validate internal links
- [ ] Test navigation

**Day 5: Reference & Other Sections**
- [ ] Migrate Reference markdown files
- [ ] Migrate Troubleshooting markdown files
- [ ] Migrate Comparisons markdown files
- [ ] Convert JSX syntax
- [ ] Validate all internal links site-wide

### Phase 3: QA & Polish (Days 6-7)

**Day 6: Testing**
- [ ] Full site build test
- [ ] Test all navigation links
- [ ] Test search functionality for common queries
- [ ] Test mobile responsiveness
- [ ] Test code block syntax highlighting
- [ ] Verify all images and assets load correctly

**Day 7: Final Polish**
- [ ] Review homepage for clarity
- [ ] Check for broken links
- [ ] Optimize page load times
- [ ] Final deployment to Netlify
- [ ] Smoke test in production environment

### Phase 4: Handoff (Day 8)

**Day 8: Documentation & Handoff**
- [ ] Document deployment process
- [ ] Document how to add new documentation pages
- [ ] Create Netlify deployment documentation
- [ ] Handoff to Bknd team
- [ ] Archive Mintlify configuration files

## Deliverables

1. **Production Starlight Documentation Site**
   - Fully functional on Netlify
   - All 25+ pages migrated
   - Working search functionality
   - Brand-apropriate styling

2. **Configuration Files**
   - `astro.config.mjs` with Starlight setup
   - `sidebar.ts` with complete navigation structure
   - `src/custom.css` with brand color overrides
   - `netlify.toml` (if custom configuration needed)

3. **Migration Documentation**
   - README with build/deploy instructions
   - Guide for adding new documentation pages
   - Notes on any content that couldn't be automatically converted

4. **Archived Mintlify Files**
   - Backup of original `docs.json`
   - Backup of original markdown files (in separate branch or folder)

## Success Criteria

### Functional Success
- [x] All 25+ documentation pages successfully migrated and accessible
- [x] Sidebar navigation matches original Mintlify structure
- [x] Search returns relevant results for at least 10 common queries
- [x] No broken internal links
- [x] Site builds successfully without errors or warnings
- [x] Deployed to Netlify and accessible in production

### Quality Success
- [x] Brand colors applied consistently throughout site
- [x] Logo displays correctly in header and favicon
- [x] Mobile-responsive design works on common breakpoints
- [x] Code syntax highlighting works for all code blocks
- [x] Page load time < 2 seconds on 4G connection

### Timeline Success
- [x] Completed within 10 business days (2 weeks)
- [x] Minimal ad-hoc changes during implementation
- [x] Clear handoff with documentation

## Technical Decisions

### Starlight Features to Use

**✅ Will Use**
- Default Pagefind search (no custom search)
- Default sidebar navigation configuration
- Built-in components: Cards, Tabs, Callouts
- Dark mode (Starlight default)
- Code syntax highlighting (Shiki)
- Table of contents (auto-generated)
- Edit URL link (to GitHub repository)

**❌ Won't Use**
- Internationalization (i18n)
- Versioned documentation
- Custom social image generator
- Custom search overrides
- Advanced theme customization

### JSX Syntax Handling Strategy

**Decision**: Replace JSX with Starlight components or Markdown equivalents

**Mapping Strategy**:
- Grid layouts → Use Markdown lists or Starlight Card components
- Flexbox layouts → Simplify to standard Markdown formatting
- Custom alerts → Use Starlight's `:::note`, `:::tip`, `:::caution`, `:::danger`
- Interactive elements → Evaluate if necessary, otherwise simplify to static content

**Fallback**: If JSX cannot be easily converted, wrap in HTML comments with a note: `<!-- TODO: Convert to Starlight component -->`

### Navigation Structure Preservation

**Decision**: Maintain exact structure from Mintlify docs.json

**Approach**:
1. Read docs.json groups and page titles
2. Create matching groups in sidebar.ts
3. Preserve order and hierarchy
4. Ensure all pages are linked
5. Use Starlight's auto-generated labels from frontmatter when available

**Edge Cases**:
- If a page doesn't have a clear title, use filename
- If a group has too many items, consider subgroups
- Add separators between major sections for readability

### Hosting Options: Netlify Recommendation

**Why Netlify?**
- Native support for Astro (excellent performance)
- Automatic HTTPS and global CDN
- Built-in preview deployments
- Easy domain management
- Free tier for small documentation sites
- Simple GitHub integration

**Alternative Considered (Not Chosen)**:
- Vercel: Also excellent for Astro, but Netlify has simpler configuration for static sites
- Cloudflare Pages: Good performance, but Netlify has better DX for documentation projects

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Complex JSX syntax difficult to convert | Medium | Medium | Audit all files early; document unconvertible content for future iteration |
| Broken internal links after migration | Low | High | Automated link checking; manual validation of each section |
| Netlify build errors due to configuration | Low | Medium | Test build early (Phase 1); use Astro's default config initially |
| Search returns poor results | Low | Medium | Test with common queries; adjust Pagefind config if needed |
| Brand colors don't match exactly | Low | Low | Use exact hex codes; test on both light and dark modes |
| Missing images or assets after migration | Medium | Medium | Audit all markdown files for images; ensure assets copied correctly |
| Navigation structure too deep/hard to navigate | Low | Medium | Review UX during QA; consider flattening or adding subgroups if needed |
| Timeline overrun due to unexpected issues | Low | High | Buffer day in schedule; prioritize core functionality over nice-to-haves |

## Open Questions

1. **GitHub Repository**: What is the GitHub repository URL for the documentation? (needed for "Edit this page" links)
2. **Custom Domain**: Is there a specific domain to configure (e.g., docs.bknd.io), or should we start with Netlify subdomain?
3. **Logo Assets**: Do you have the logo in SVG format with proper dimensions for both light and dark modes?
4. **Additional Pages**: Are there any new documentation pages needed that don't exist in the current Mintlify plan?
5. **Maintenance Owner**: Who will be responsible for updating the documentation after launch?

## Appendix: Migration Checklist

### Pre-Migration
- [ ] Review all markdown files for JSX syntax
- [ ] Inventory all images and assets
- [ ] Verify brand color hex codes
- [ ] Prepare logo assets (SVG format preferred)

### During Migration
- [ ] Set up Starlight project
- [ ] Convert navigation structure
- [ ] Migrate content section by section
- [ ] Test each section before moving to next

### Post-Migration
- [ ] Full link check
- [ ] Search functionality test
- [ ] Mobile responsiveness test
- [ ] Production deployment verification
- [ ] Document maintenance procedures

---

**Document Version**: 1.0
**Created**: January 9, 2026
**Last Updated**: January 9, 2026
**Owner**: Bknd Team
