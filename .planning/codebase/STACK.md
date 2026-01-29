# Technology Stack

**Analysis Date:** 2026-01-28

## Languages

**Primary:**
- TypeScript 5.x - All application code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- CSS - Styling via Tailwind CSS v4 (`src/app/globals.css`)

## Runtime

**Environment:**
- Node.js 24.11.1

**Package Manager:**
- pnpm 10.28.2
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router
- React 19.2.3 - UI library with React Compiler enabled
- React DOM 19.2.3 - DOM rendering

**Testing:**
- Not configured (no test runner detected)

**Build/Dev:**
- TypeScript 5.x - Type checking
- Biome 2.3.12 - Linting and formatting
- Ultracite 7.1.1 - Zero-config Biome preset
- PostCSS with `@tailwindcss/postcss` plugin
- `@next/bundle-analyzer` 16.1.6 - Bundle analysis (`pnpm analyze`)

## Key Dependencies

**Critical:**
- `drizzle-orm` 0.45.1 - Type-safe ORM for PostgreSQL
- `@neondatabase/serverless` 1.0.2 - Serverless PostgreSQL driver for Neon
- `@clerk/nextjs` 6.37.0 - Authentication (installed but not yet integrated)
- `uploadthing` 7.7.4 + `@uploadthing/react` 7.3.3 - File uploads (installed but not yet integrated)
- `resend` 6.9.1 - Email delivery (installed but not yet integrated)

**UI/Styling:**
- `tailwindcss` 4.x - Utility-first CSS framework
- `@base-ui/react` 1.1.0 - Unstyled primitives for shadcn/ui base-vega style
- `@phosphor-icons/react` 2.1.10 - Icon library (configured in shadcn)
- `lucide-react` 0.563.0 - Additional icon library
- `class-variance-authority` 0.7.1 - Variant styling
- `clsx` 2.1.1 + `tailwind-merge` 3.4.0 - Class name utilities

**State & Data:**
- `jotai` 2.17.0 - Atomic state management
- `zod` 4.3.6 - Schema validation
- `drizzle-zod` 0.8.3 - Drizzle-to-Zod schema generation

**Animation:**
- `motion` 12.29.2 - Animation library (Framer Motion)

**UI Components:**
- `cmdk` 1.1.1 - Command palette
- `vaul` 1.1.2 - Drawer component
- `sonner` 2.0.7 - Toast notifications
- `embla-carousel-react` 8.6.0 - Carousel
- `react-day-picker` 9.13.0 - Date picker
- `recharts` 2.15.4 - Charting library

**Utilities:**
- `date-fns` 4.1.0 - Date manipulation
- `es-toolkit` 1.44.0 - Modern utility functions
- `react-use-measure` 2.1.7 - DOM measurement
- `next-themes` 0.4.6 - Theme switching
- `server-only` 0.0.1 - Server component enforcement

**Database Tooling:**
- `drizzle-kit` 0.31.8 - Migrations and studio

**Code Quality:**
- `shadcn` 3.7.0 - Component CLI
- `tw-animate-css` 1.4.0 - Tailwind animation utilities
- `babel-plugin-react-compiler` 1.0.0 - React Compiler babel plugin

## Configuration

**Environment:**
- Environment validation via `@t3-oss/env-nextjs` in `src/lib/env/server.ts`
- Required server vars: `DATABASE_URL`, `BASE_URL`
- Database prefix via `DATABASE_PREFIX` env var (for table filtering in Drizzle)
- Local env file: `.env.local`

**Build:**
- `next.config.ts` - Next.js config with React Compiler enabled
- `tsconfig.json` - TypeScript config (ES2017 target, bundler resolution)
- `drizzle.config.ts` - Drizzle ORM config (PostgreSQL dialect, schema at `src/lib/db/schema/index.ts`)
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `biome.json` - Biome config extending Ultracite presets
- `components.json` - shadcn/ui config (base-vega style, phosphor icons)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)

## Platform Requirements

**Development:**
- Node.js 24.x (detected)
- pnpm 10.x (detected)
- PostgreSQL database (Neon serverless)

**Production:**
- Vercel (inferred from `VERCEL_PROJECT_PRODUCTION_URL` checks in `src/lib/utils.ts`)
- Neon PostgreSQL (serverless)

## Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Biome check
pnpm format           # Biome format
pnpm check            # Ultracite check
pnpm fix              # Ultracite auto-fix
pnpm db:push          # Push schema to database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm analyze          # Bundle analysis (ANALYZE=true)
```

## Font Configuration

Custom fonts loaded via `next/font/google` in `src/lib/fonts.ts`:
- Display: Oswald (`--display-family`)
- Sans: Saira (`--sans-family`)
- Serif: Cinzel (`--serif-family`)
- Code: Space Mono (`--code-family`)

---

*Stack analysis: 2026-01-28*
