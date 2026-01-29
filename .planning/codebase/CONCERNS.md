# Codebase Concerns

**Analysis Date:** 2026-01-28

## Tech Debt

**Monolithic Schema File:**
- Issue: Single 1628-line file contains all database schema definitions, relations, validation schemas, and type exports
- Files: `src/lib/db/schema/index.ts`
- Impact: Difficult to navigate, slow IDE performance, merge conflicts likely when multiple developers work on schema
- Fix approach: Split into domain-specific files (e.g., `users.ts`, `media.ts`, `timeline.ts`, `pets.ts`) with barrel export

**Orphaned Content Schema:**
- Issue: `content.ts` defines `PageContentTable` and `PostTable` using different table creator than main schema, creating inconsistency
- Files: `src/lib/db/schema/content.ts`, `src/lib/db/utils.ts`
- Impact: These tables use prefix via `pgTableCreator`, but main schema in `index.ts` does not - tables may not follow same naming convention
- Fix approach: Ensure all tables use the same `pgTable` creator from `utils.ts` or document intentional difference

**Placeholder Home Page:**
- Issue: Home page is still the default Next.js starter template with no actual application content
- Files: `src/app/page.tsx`
- Impact: No functional UI for the memorial platform; users cannot interact with core features
- Fix approach: Build landing page and navigation to memorial creation/viewing flows

**No API Routes:**
- Issue: No API routes exist despite comprehensive database schema defining complex CRUD operations
- Files: None in `src/app/api/`
- Impact: No backend functionality - cannot create, read, update, or delete memorials, media, or any entities
- Fix approach: Implement Server Actions or API routes for all major entities (finalSpaces, media, timeline, guestbook, etc.)

**No Server Actions:**
- Issue: No `"use server"` directives found in codebase - no server-side mutation logic implemented
- Files: None
- Impact: All the database schema and validation is unused; application cannot persist data
- Fix approach: Create server actions in `src/lib/actions/` for each entity type

**Exposed Database Credentials in .env.local:**
- Issue: `.env.local` is committed showing database connection strings with passwords (seen in git status as tracked file)
- Files: `.env.local` (should be gitignored but appears modified in git status)
- Impact: Database credentials visible in repository; security vulnerability
- Fix approach: Ensure `.env.local` is in `.gitignore` and rotate exposed credentials immediately

## Known Bugs

**None identified:**
- The codebase is early-stage with minimal implemented functionality
- No runtime bugs observable because core features are not built

## Security Considerations

**Database Credentials Exposure:**
- Risk: Production Neon database credentials visible in `.env.local`
- Files: `.env.local`
- Current mitigation: None - credentials are plaintext in file
- Recommendations: Add `.env.local` to `.gitignore`, rotate credentials, use secret management in production

**Password Hash Storage Without Auth Implementation:**
- Risk: Schema includes `passwordHash` field but no authentication logic exists
- Files: `src/lib/db/schema/index.ts` (line 105)
- Current mitigation: None - auth not implemented
- Recommendations: Use Clerk as planned (already in dependencies) instead of custom password auth, or implement bcrypt/argon2 if custom auth needed

**Missing CSRF Protection:**
- Risk: No server actions means no forms processing, but when added, CSRF protection needed
- Files: N/A - no forms yet
- Current mitigation: N/A
- Recommendations: Next.js Server Actions have built-in CSRF protection; ensure they are used instead of raw API routes for mutations

**dangerouslySetInnerHTML Usage:**
- Risk: Chart component uses dangerouslySetInnerHTML for dynamic styles
- Files: `src/components/ui/chart.tsx` (line 83)
- Current mitigation: Content appears to be internally generated color values, not user input
- Recommendations: Verify no user-controlled data flows into the style generation; consider using CSS-in-JS or CSS variables set via React instead

**External Links with target="_blank":**
- Risk: Links to external sites could enable reverse tabnapping
- Files: `src/app/page.tsx` (lines 42, 57)
- Current mitigation: `rel="noopener noreferrer"` is correctly applied
- Recommendations: No action needed - correctly implemented

## Performance Bottlenecks

**No Identified Bottlenecks:**
- Application has no functional features to benchmark
- Database queries not implemented

**Potential Future Concern - Large Media Queries:**
- Problem: Schema supports media assets, albums, and pets with photo galleries - unbounded queries likely
- Files: `src/lib/db/schema/index.ts`
- Cause: No pagination patterns established in codebase
- Improvement path: Implement cursor-based pagination for media queries when building API

## Fragile Areas

**Environment Variable Configuration:**
- Files: `src/lib/env/server.ts`, `drizzle.config.ts`
- Why fragile: Two different patterns for env access - t3-env for runtime, raw `process.env` for drizzle config
- Safe modification: Ensure all env vars are validated through t3-env before use
- Test coverage: None

**Database Table Prefix:**
- Files: `src/lib/db/utils.ts`, `drizzle.config.ts`
- Why fragile: Table prefix comes from `process.env.DATABASE_PREFIX` but this is not validated by t3-env
- Safe modification: Add `DATABASE_PREFIX` to server env schema in `src/lib/env/server.ts`
- Test coverage: None

## Scaling Limits

**No Identified Limits:**
- Application not functional enough to assess scaling
- Neon PostgreSQL serverless should scale well for initial traffic

**Potential Future Limit - Media Storage:**
- Current capacity: UploadThing configured but not implemented
- Limit: UploadThing free tier limits (check current tier limits)
- Scaling path: Upgrade UploadThing plan or switch to S3/R2 for media storage

## Dependencies at Risk

**None Critically at Risk:**

**Zod v4 (Beta/New Major Version):**
- Risk: Using Zod 4.3.6 which is a new major version; breaking changes from v3
- Impact: drizzle-zod compatibility should be verified
- Migration plan: Pin to stable version if issues arise

## Missing Critical Features

**User Authentication:**
- Problem: Clerk is in dependencies but not configured or integrated
- Blocks: User registration, login, memorial ownership, access control

**Memorial CRUD Operations:**
- Problem: No routes or actions to create/edit/delete Final Spaces
- Blocks: Core application functionality

**Media Upload:**
- Problem: UploadThing configured in package.json but no upload components or handlers
- Blocks: Photo albums, profile pictures, timeline media

**Email Functionality:**
- Problem: Resend is in dependencies but not configured
- Blocks: Collaborator invitations, notifications

## Test Coverage Gaps

**Complete Absence of Tests:**
- What's not tested: Everything - no test files exist in `src/`
- Files: All source files
- Risk: Any changes could break functionality unnoticed; no regression protection
- Priority: High - establish testing patterns before building features

**No Test Framework Configured:**
- What's missing: No jest.config or vitest.config in project root
- Files: `package.json` has no test script
- Risk: Developers may implement tests inconsistently
- Priority: High - add vitest with React Testing Library before feature development

---

*Concerns audit: 2026-01-28*
