# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinalSpaces is a memorial/legacy platform built with Next.js 16, React 19, and TypeScript. Users create "Final Spaces" - digital memorials with timelines, media albums, guest books, family trees, and pet memorials.

## Commands

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm lint             # Check for linting issues (Biome)
pnpm format           # Format code (Biome)
pnpm check            # Run Ultracite checks
pnpm fix              # Auto-fix issues with Ultracite

# Database (Drizzle + Neon PostgreSQL)
pnpm db:generate      # Generate migrations from schema
pnpm db:push          # Push schema changes directly
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio

pnpm analyze          # Bundle analysis (ANALYZE=true)
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 App Router with React 19 and React Compiler
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Auth**: Clerk
- **Styling**: Tailwind CSS v4 with shadcn/ui (base-vega style, Phosphor icons)
- **State**: Jotai for client state
- **File Uploads**: UploadThing
- **Email**: Resend
- **Animations**: Motion (Framer Motion)
- **Validation**: Zod v4 with drizzle-zod

### Directory Structure
```
src/
├── app/           # Next.js App Router pages and layouts
├── components/
│   ├── ui/        # shadcn/ui components (Base UI primitives)
│   └── theme/     # Theme provider and toggle
├── hooks/         # Custom React hooks
└── lib/
    ├── db/
    │   ├── schema/   # Drizzle schema definitions
    │   └── index.ts  # Database client (Neon serverless)
    ├── env/          # Environment validation (t3-env)
    └── utils.ts      # cn() helper and utilities
```

### Database Schema
The main entity is `finalSpaces` which connects to:
- `users` - Authentication and ownership
- `mediaAssets` / `mediaAlbums` / `albumMedia` - Photo/video storage
- `timelineEvents` / `timelineCategories` - Life milestones
- `guestBookEntries` / `comments` - Visitor messages
- `familyMembers` - Family tree
- `petMemorials` / `petAlbums` - Pet tributes
- `memorialFavorites` / `favoriteTypes` - Curated favorites
- `profileConnections` / `connectionCategories` - Links between profiles

Schema location: `src/lib/db/schema/index.ts`

### Path Aliases
- `@/*` maps to `./src/*`

### Environment Variables
Required (validated via `@t3-oss/env-nextjs`):
- `DATABASE_URL` - Neon connection string
- `BASE_URL` - App base URL
- `DATABASE_PREFIX` - Table prefix for Drizzle filtering

## Code Style

This project uses **Ultracite** (Biome-based) for linting and formatting. Run `pnpm fix` before committing.

Key conventions:
- Server Components by default; use `"use client"` only when needed
- Prefer `for...of` over `.forEach()` and indexed loops
- Use `unknown` over `any`
- React 19: use `ref` as prop instead of `forwardRef`
- Use Next.js `<Image>` component for images
- Use semantic HTML with ARIA attributes for accessibility
