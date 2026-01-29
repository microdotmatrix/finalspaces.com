# Codebase Structure

**Analysis Date:** 2026-01-28

## Directory Layout

```
finalspaces.com/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/
│   │   ├── ui/           # shadcn/ui primitives (45+ components)
│   │   └── theme/        # Theme provider and toggle
│   ├── hooks/            # Custom React hooks (18 hooks)
│   └── lib/
│       ├── db/
│       │   ├── schema/   # Drizzle schema definitions
│       │   └── index.ts  # Database client
│       ├── env/          # Environment validation
│       ├── config.ts     # App metadata configuration
│       ├── fonts.ts      # Google Font definitions
│       ├── utils.ts      # Shared utilities (cn, actions, formatting)
│       └── is-browser.ts # Browser detection constant
├── public/               # Static assets
├── drizzle.config.ts     # Drizzle Kit configuration
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── biome.json            # Biome linter/formatter config
├── components.json       # shadcn/ui configuration
└── package.json          # Dependencies and scripts
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router file-based routing
- Contains: Pages (`page.tsx`), layouts (`layout.tsx`), error boundaries, global CSS
- Key files: `layout.tsx` (root layout), `page.tsx` (home), `error.tsx`, `not-found.tsx`, `globals.css`

**`src/components/ui/`:**
- Purpose: Reusable UI primitives based on shadcn/ui (base-vega style)
- Contains: 45+ component files with Base UI primitives and CVA variants
- Key files: `button.tsx`, `dialog.tsx`, `card.tsx`, `sidebar.tsx`, `command.tsx`

**`src/components/theme/`:**
- Purpose: Dark/light/system theme management
- Contains: `provider.tsx` (next-themes wrapper), `toggle.tsx` (theme toggle button)

**`src/hooks/`:**
- Purpose: Reusable client-side hooks
- Contains: 18 hook files for DOM interactions, hydration, media queries
- Key files: `use-hydrated.ts`, `use-media-query.ts`, `use-mobile.ts`, `use-debounce.ts`

**`src/lib/db/`:**
- Purpose: Database layer with Drizzle ORM
- Contains: Schema definitions, migrations output directory, utilities
- Key files: `index.ts` (db client), `schema/index.ts` (main schema), `schema/content.ts` (CMS tables), `utils.ts` (table prefix creator)

**`src/lib/db/schema/`:**
- Purpose: Drizzle table definitions, relations, and Zod validation schemas
- Contains: Main schema file with 25+ tables and type exports
- Key files: `index.ts` (all memorial-related tables), `content.ts` (page/post tables)

**`src/lib/env/`:**
- Purpose: Runtime environment variable validation
- Contains: t3-env configuration
- Key files: `server.ts` (validates DATABASE_URL, BASE_URL)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with providers and HTML structure
- `src/app/page.tsx`: Home page component
- `src/lib/db/index.ts`: Database client singleton

**Configuration:**
- `next.config.ts`: Next.js config (React Compiler enabled)
- `drizzle.config.ts`: Drizzle Kit config for migrations
- `tsconfig.json`: TypeScript configuration with `@/*` path alias
- `biome.json`: Linting and formatting rules
- `components.json`: shadcn/ui CLI configuration

**Core Logic:**
- `src/lib/db/schema/index.ts`: All database schema (1600+ lines)
- `src/lib/utils.ts`: Utilities including `cn()`, `action()`, formatters
- `src/lib/config.ts`: App metadata (title, description, colors)

**Testing:**
- No test files detected; testing framework not yet configured

## Naming Conventions

**Files:**
- React components: `kebab-case.tsx` (e.g., `theme-switcher.tsx`, `alert-dialog.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-hydrated.ts`, `use-media-query.ts`)
- Utilities: `kebab-case.ts` (e.g., `is-browser.ts`)
- Config files: `kebab-case.config.ts` (e.g., `drizzle.config.ts`)

**Directories:**
- Lowercase with hyphens for multi-word: `db`, `env`, `ui`, `theme`
- Feature-organized within `src/`

**Exports:**
- Components: Named exports matching function name (`export { Button }`)
- Hooks: Named exports with `use` prefix (`export { useIsHydrated }`)
- Database tables: Named exports matching table name (`export const users = pgTable(...)`)

**Database:**
- Tables: `snake_case` with `DATABASE_PREFIX` prefix (e.g., `fs_final_spaces`)
- Columns: `snake_case` (e.g., `created_at`, `owner_user_id`)
- TypeScript types: `PascalCase` matching table (e.g., `User`, `FinalSpace`)

## Where to Add New Code

**New Page:**
- Create directory in `src/app/` matching route
- Add `page.tsx` for the route component
- Add `layout.tsx` if route needs shared layout
- Example: `src/app/memorial/[slug]/page.tsx`

**New Feature Component:**
- Create file in `src/components/` (outside `ui/`)
- Use `"use client"` only if component requires interactivity
- Example: `src/components/memorial-card.tsx`

**New UI Primitive:**
- Add to `src/components/ui/` following shadcn/ui patterns
- Use Base UI primitives (`@base-ui/react`)
- Apply CVA for variants
- Example: `src/components/ui/new-component.tsx`

**New Hook:**
- Create in `src/hooks/` with `use-` prefix
- Add SSR safety check if accessing browser APIs
- Example: `src/hooks/use-local-storage.ts`

**New Database Table:**
- Add table definition to `src/lib/db/schema/index.ts`
- Add relations if connected to existing tables
- Create insert schema with Zod validation
- Export type definitions
- Run `pnpm db:generate` then `pnpm db:push`

**New Server Action:**
- Create in same file as component or in dedicated `actions.ts`
- Wrap with `action()` helper from `src/lib/utils.ts` for validation
- Return `ActionState` type

**New Utility:**
- Add to `src/lib/utils.ts` if general purpose
- Create new file in `src/lib/` if domain-specific
- Example: `src/lib/memorial-utils.ts`

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (in .gitignore)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (via pnpm install)
- Committed: No (in .gitignore)

**`.planning/`:**
- Purpose: Project planning and codebase documentation
- Generated: No (manual/tool-generated)
- Committed: Yes

**`public/`:**
- Purpose: Static assets served at root URL
- Generated: No
- Committed: Yes
- Contains: SVG logos (next.svg, vercel.svg)

**`src/lib/db/migrations/`:**
- Purpose: Drizzle migration output
- Generated: Yes (via pnpm db:generate)
- Committed: Yes (recommended for version control)

---

*Structure analysis: 2026-01-28*
