# Architecture

**Analysis Date:** 2026-01-28

## Pattern Overview

**Overall:** Next.js App Router with Server Components

**Key Characteristics:**
- Server Components by default with explicit `"use client"` for interactive components
- Drizzle ORM with Neon PostgreSQL serverless driver for data persistence
- Jotai for minimal client-side state management
- Centralized context providers for theme and toast notifications
- Zod schemas co-located with Drizzle table definitions for validation

## Layers

**Presentation Layer (UI):**
- Purpose: Render views and handle user interactions
- Location: `src/components/`, `src/app/`
- Contains: React components, pages, layouts
- Depends on: Hooks, utilities
- Used by: Next.js routing

**Data Layer (Database):**
- Purpose: Database schema, client connection, type definitions
- Location: `src/lib/db/`
- Contains: Drizzle schema definitions, database client, Zod validation schemas
- Depends on: Environment configuration
- Used by: Server Components, API routes, Server Actions

**Configuration Layer:**
- Purpose: Environment validation, app settings, fonts
- Location: `src/lib/env/`, `src/lib/config.ts`, `src/lib/fonts.ts`
- Contains: t3-env validation, meta configuration, font definitions
- Depends on: Nothing
- Used by: All layers

**Hooks Layer:**
- Purpose: Reusable client-side logic
- Location: `src/hooks/`
- Contains: Custom React hooks for DOM interactions, media queries, hydration
- Depends on: Browser APIs, utilities
- Used by: Client components

## Data Flow

**Page Render Flow:**

1. Request hits Next.js App Router (`src/app/`)
2. Layout renders with `AppContext` provider wrapping children
3. Server Component fetches data directly from database via Drizzle
4. React renders component tree, streaming to client
5. Client components hydrate with theme context

**Database Query Flow:**

1. Server Component or Server Action imports `db` from `@/lib/db`
2. Query uses Drizzle ORM with typed schema from `@/lib/db/schema`
3. Neon serverless driver executes query over HTTP
4. Results typed via Drizzle inference (`$inferSelect`, `$inferInsert`)

**Form Submission Flow:**

1. Form submits to Server Action
2. Action validates with Zod schema from `@/lib/db/schema`
3. On validation success, Drizzle mutation executes
4. Action returns `ActionState` with success/error
5. Client re-renders with returned state

**State Management:**
- Server state: Handled by Server Components with direct database access
- Client state: Jotai atoms (minimal usage currently)
- Theme state: `next-themes` via `ThemeProvider`
- Toast notifications: `sonner` via `Toaster`

## Key Abstractions

**Database Schema (`src/lib/db/schema/index.ts`):**
- Purpose: Single source of truth for all database tables, relations, and validation
- Contains: 25+ tables, full relation definitions, insert schemas, type exports
- Pattern: Drizzle pgTable with prefixed table names via `pgTableCreator`

**UI Components (`src/components/ui/`):**
- Purpose: Reusable UI primitives following shadcn/ui patterns
- Examples: `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`
- Pattern: Base UI primitives wrapped with CVA variants and Tailwind styling

**Custom Hooks (`src/hooks/`):**
- Purpose: Encapsulate client-side browser interactions
- Examples: `src/hooks/use-hydrated.ts`, `src/hooks/use-media-query.ts`
- Pattern: Prefixed with `use-`, SSR-safe with browser checks

**Utility Functions (`src/lib/utils.ts`):**
- Purpose: Shared helpers for class names, actions, formatting
- Pattern: Pure functions, SSR-safe where applicable

## Entry Points

**Root Layout (`src/app/layout.tsx`):**
- Location: `src/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: HTML structure, font variables, context providers, metadata

**Home Page (`src/app/page.tsx`):**
- Location: `src/app/page.tsx`
- Triggers: Request to `/`
- Responsibilities: Landing page render (currently starter template)

**Error Boundary (`src/app/error.tsx`):**
- Location: `src/app/error.tsx`
- Triggers: Unhandled errors in route segment
- Responsibilities: User-friendly error display with retry action

**Not Found (`src/app/not-found.tsx`):**
- Location: `src/app/not-found.tsx`
- Triggers: `notFound()` thrown or 404 response
- Responsibilities: User-friendly 404 page

**Database Client (`src/lib/db/index.ts`):**
- Location: `src/lib/db/index.ts`
- Triggers: Import from server code
- Responsibilities: Export configured Drizzle client with schema

## Error Handling

**Strategy:** Client-side error boundaries with user-friendly recovery

**Patterns:**
- `src/app/error.tsx` - Route-level error boundary with reset capability
- `src/app/global-error.tsx` - Root error boundary for critical failures
- Server Action errors returned via `ActionState` type with `error` property
- Validation errors from Zod returned with formatted message

**Error Response Shape:**
```typescript
type ActionState = {
  error?: string;
  success?: string;
  [key: string]: unknown;
};
```

## Cross-Cutting Concerns

**Logging:** Console logging in error boundaries; production logging not yet configured

**Validation:** Zod schemas co-located with Drizzle schema in `src/lib/db/schema/index.ts`; `action()` helper in `src/lib/utils.ts` wraps Server Actions with automatic validation

**Authentication:** Clerk SDK installed (`@clerk/nextjs`); not yet integrated into routes

**Theming:** `next-themes` with system preference detection; colors in `src/lib/config.ts`

**Environment:** t3-env validation in `src/lib/env/server.ts` for `DATABASE_URL` and `BASE_URL`

---

*Architecture analysis: 2026-01-28*
