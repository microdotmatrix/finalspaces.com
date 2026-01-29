# Coding Conventions

**Analysis Date:** 2026-01-28

## Naming Patterns

**Files:**
- Components: `kebab-case.tsx` (e.g., `theme-switcher.tsx`, `button-group.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-click-outside.ts`, `use-media-query.ts`)
- Utilities: `kebab-case.ts` (e.g., `utils.ts`, `is-browser.ts`)
- Schema/Config: `kebab-case.ts` (e.g., `drizzle.config.ts`)

**Functions:**
- React components: `PascalCase` (e.g., `Button`, `CardHeader`, `ThemeProvider`)
- Hooks: `useCamelCase` (e.g., `useClickOutside`, `useMediaQuery`, `useIsMobile`)
- Utilities: `camelCase` (e.g., `formatDate`, `generateUUID`, `getServerSideURL`)
- Arrow function style preferred for all functions

**Variables:**
- `camelCase` for local variables and state
- `SCREAMING_SNAKE_CASE` for constants (e.g., `MOBILE_BREAKPOINT`)
- Boolean variables use `is`, `has`, `should` prefixes

**Types:**
- `PascalCase` for types and interfaces
- Suffix with purpose: `Props`, `Options`, `State`, `Schema`
- Drizzle types: `Insert{Entity}Schema`, `{Entity}` for inferred types
- Use `type` keyword (not `interface`) for type definitions

## Code Style

**Formatting:**
- Tool: Biome (via Ultracite preset)
- Indent: 2 spaces
- Line width: Default (80-100 chars)
- Semicolons: Required
- Quotes: Double quotes for strings

**Linting:**
- Tool: Biome with Ultracite preset extensions
- Config: `biome.json` extends `ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/next`
- Key rules enforced:
  - No unknown CSS at-rules disabled (for Tailwind v4)
  - React recommended rules
  - Next.js recommended rules
  - Organize imports automatically

**Run Commands:**
```bash
pnpm lint          # Check for issues
pnpm format        # Format code
pnpm check         # Ultracite check
pnpm fix           # Auto-fix with Ultracite
```

## Import Organization

**Order:**
1. External packages (React, Next.js, third-party)
2. Internal absolute imports using `@/` alias
3. Relative imports (rare, prefer absolute)

**Examples from codebase:**
```typescript
// External first
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "@phosphor-icons/react";
import type * as React from "react";

// Internal imports with @/ alias
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

**Path Aliases:**
- `@/*` maps to `./src/*`
- Configured in `tsconfig.json` and `components.json`
- Use `@/components`, `@/lib`, `@/hooks` consistently

**Type Imports:**
- Use `import type` for type-only imports
- Example: `import type { Metadata, Viewport } from "next";`
- Example: `import type * as React from "react";`

## Error Handling

**Patterns:**
- Early return pattern for guard clauses
- Error boundary components for React errors (`src/app/error.tsx`, `src/app/global-error.tsx`)
- Zod for validation with `.safeParse()` returning error objects
- Server actions return `{ error: string }` on failure

**Example from `src/lib/utils.ts`:**
```typescript
export function action<S extends z.ZodType<unknown, unknown>, T>(
  schema: S,
  fn: ValidatedActionFunction<S, T>
) {
  return async (_prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.message } as T;
    }
    return await fn(result.data, formData);
  };
}
```

**ActionState Pattern:**
```typescript
export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: unknown;
};
```

## Logging

**Framework:** console (development only)

**Patterns:**
- Log errors in error boundary effects for debugging
- Remove console.log from production code (enforced by Ultracite)
- Example: `console.error(error)` in error page `useEffect`

## Comments

**When to Comment:**
- Complex algorithms or business logic
- Browser compatibility workarounds (e.g., Safari media query listeners)
- Intentional deviations from patterns

**JSDoc/TSDoc:**
- Not heavily used in current codebase
- Prefer self-documenting code with descriptive names

## Function Design

**Size:** Keep functions focused and single-purpose

**Parameters:**
- Destructure props in function signature
- Use `...props` spread for passthrough
- Default values in destructuring: `{ size = "default", ...props }`

**Return Values:**
- Components return JSX
- Hooks return values or objects with named properties
- Utilities return explicit types

**Component Pattern:**
```typescript
function ComponentName({
  className,
  variant = "default",
  size = "default",
  ...props
}: ComponentProps) {
  return (
    <Element
      className={cn(baseStyles, variants({ variant, size }), className)}
      data-slot="component-name"
      {...props}
    />
  );
}
```

## Module Design

**Exports:**
- Named exports preferred over default exports
- Components exported individually: `export { Button, buttonVariants }`
- Default exports for page components only (Next.js convention)

**Barrel Files:**
- Schema barrel file at `src/lib/db/schema/index.ts`
- UI components exported individually (no barrel file)

**UI Component Pattern:**
```typescript
// Export named function components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
```

## Component Conventions

**Server vs Client Components:**
- Default to Server Components
- Add `"use client"` directive only when needed (hooks, event handlers, browser APIs)
- Client components: `Button`, `Dialog`, `ThemeProvider`, error pages

**Data Attributes:**
- Use `data-slot="name"` for component identification
- Use `data-size`, `data-theme` for variant/state signaling
- Enables CSS targeting and debugging

**Styling Pattern:**
- Use `cn()` utility for class merging (clsx + tailwind-merge)
- CVA (class-variance-authority) for variant management
- Tailwind classes inline with logical grouping
- Semantic color tokens from CSS variables

**CVA Example from `src/components/ui/button.tsx`:**
```typescript
const buttonVariants = cva(
  "base-classes...",
  {
    variants: {
      variant: {
        default: "...",
        outline: "...",
      },
      size: {
        default: "...",
        sm: "...",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## React 19 Patterns

**Ref Handling:**
- Use `ref` as a prop directly (not `forwardRef`)
- React 19 native ref forwarding

**Type Patterns:**
- `React.ComponentProps<"element">` for HTML element props
- Intersection with variant props: `Props & VariantProps<typeof variants>`

## Database Conventions

**Schema Location:** `src/lib/db/schema/index.ts`

**Naming:**
- Tables: `snake_case` (e.g., `final_spaces`, `media_assets`)
- Columns: `snake_case` in database, `camelCase` in TypeScript
- Enums: `camelCase` with `Enum` suffix (e.g., `finalSpaceStatusEnum`)
- Relations: `camelCase` matching entity names

**Schema Pattern:**
```typescript
export const tableName = pgTable(
  "table_name",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // ... columns
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("table_name_column_idx").on(table.column),
  ]
);
```

**Zod Integration:**
- Use `createInsertSchema()` from `drizzle-zod`
- Extend with custom validations using `.extend()`
- Export both schema and inferred type

## Environment Variables

**Validation:** `@t3-oss/env-nextjs` in `src/lib/env/server.ts`

**Pattern:**
```typescript
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BASE_URL: z.string().min(1),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
});
```

**Access:** Import `env` object, never use `process.env` directly

---

*Convention analysis: 2026-01-28*
