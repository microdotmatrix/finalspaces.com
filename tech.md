# tech.md

This file is the **single source of truth** for the project’s technical stack and tooling.

- If you are an AI assistant: use this to pick correct APIs, patterns, and commands.
- If you change core dependencies/versions: update this file in the same PR.

## Project

- **Name**: `finalspaces.com`
- **Version**: `0.1.0`
- **Type**: Next.js web app

## Runtime / Package Management

- **Package manager**: **pnpm**
- **Node.js**: not pinned in `package.json` (check for `.nvmrc`, `.node-version`, or `packageManager` field if added later)

## Web Framework

- **Next.js**: `16.1.6`
- **React**: `19.2.3`
- **React DOM**: `19.2.3`

## Database

- **Database**: PostgreSQL (Neon)
- **Driver**: `@neondatabase/serverless` `^1.0.2`
- **ORM**: Drizzle ORM `^0.45.1`
- **Schema validation**: `drizzle-zod` `^0.8.3` + `zod` `^4.3.6`
- **Migrations / CLI**: `drizzle-kit` `^0.31.8`

## Auth

- **Clerk**: `@clerk/nextjs` `^6.37.0`
- **Clerk themes**: `@clerk/themes` `^2.4.51`

## Styling / UI

- **Tailwind CSS**: `^4`
- **PostCSS plugin**: `@tailwindcss/postcss` `^4`
- **Shadcn CLI**: `shadcn` `^3.7.0`
- **Utility**:
  - `clsx` `^2.1.1`
  - `class-variance-authority` `^0.7.1`
  - `tailwind-merge` `^3.4.0`
  - `tw-animate-css` `^1.4.0`
- **Icons**:
  - `lucide-react` `^0.563.0`
  - `@phosphor-icons/react` `^2.1.10`
  - `@iconify/react` `^6.0.2` (dev)

## State / Data / Forms

- **State management**: `jotai` `^2.17.0`
- **Env validation**: `@t3-oss/env-nextjs` `^0.13.10`

## Media / Uploads

- **Uploadthing**: `uploadthing` `^7.7.4` and `@uploadthing/react` `^7.3.3`
- **Carousel**: `embla-carousel-react` `^8.6.0`

## Motion / Charts / Misc

- **Animation**: `motion` `^12.29.2`
- **Charts**: `recharts` `2.15.4`
- **Date utils**: `date-fns` `^4.1.0`
- **Command palette**: `cmdk` `^1.1.1`
- **Toasts**: `sonner` `^2.0.7`
- **Drawer**: `vaul` `^1.1.2`
- **Utilities**: `es-toolkit` `^1.44.0`

## Email

- **Resend**: `resend` `^6.9.1`

## Tooling (Lint / Format / Types)

- **TypeScript**: `^5`
- **Biome**: `@biomejs/biome` `2.3.12`
- **Ultracite**: `7.1.1`
- **Bundle analyzer**: `@next/bundle-analyzer` `^16.1.6`
- **React Compiler**: `babel-plugin-react-compiler` `1.0.0`

## Scripts

- **Dev**: `pnpm dev` → `next dev`
- **Build**: `pnpm build` → `next build`
- **Start**: `pnpm start` → `next start`
- **Lint**: `pnpm lint` → `biome check`
- **Format**: `pnpm format` → `biome format --write`
- **Quality**:
  - `pnpm check` → `ultracite check`
  - `pnpm fix` → `ultracite fix`
- **DB**:
  - `pnpm db:push` → `drizzle-kit push`
  - `pnpm db:generate` → `drizzle-kit generate`
  - `pnpm db:migrate` → `drizzle-kit migrate`
  - `pnpm db:studio` → `drizzle-kit studio`

## Conventions for AI-assisted changes

- Prefer **Server Components** by default. Use Client Components only when necessary.
- Prefer **server actions** for mutations.
- Prefer **Drizzle** for DB access. Keep queries typed and avoid `any`.
- Prefer **Tailwind v4** and **shadcn/ui** patterns for UI components.
- Run `pnpm fix` (Ultracite) after meaningful code changes.
