# Testing Patterns

**Analysis Date:** 2026-01-28

## Test Framework

**Runner:**
- Not configured
- No test runner installed (Jest, Vitest, or similar)

**Assertion Library:**
- Not configured

**Run Commands:**
```bash
# No test commands defined in package.json
# Tests need to be set up
```

## Test File Organization

**Location:**
- No test files exist in `src/` directory
- No `__tests__` directories
- No `*.test.ts` or `*.spec.ts` files in source

**Recommended Pattern (not yet implemented):**
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx    # Co-located
├── lib/
│   ├── utils.ts
│   └── utils.test.ts          # Co-located
└── hooks/
    ├── use-debounce.ts
    └── use-debounce.test.ts   # Co-located
```

## Test Structure

**Suite Organization:**
- Not applicable - no tests exist

**Recommended Pattern:**
```typescript
import { describe, expect, it } from "vitest";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden")).toBe("base");
  });

  it("resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatDate", () => {
  it("formats date in US locale", () => {
    const date = new Date("2024-01-15T10:30:00");
    expect(formatDate(date)).toContain("Jan");
    expect(formatDate(date)).toContain("15");
  });
});
```

## Mocking

**Framework:** Not configured

**Recommended Approach:**
- Vitest native mocking or MSW for API mocking
- Mock external services (Clerk, Neon, UploadThing)

**Example Pattern for Database:**
```typescript
import { vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
```

**Example Pattern for Clerk Auth:**
```typescript
vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn(() => ({ userId: "test-user-id" })),
  currentUser: vi.fn(() => ({ id: "test-user-id", email: "test@example.com" })),
}));
```

**What to Mock:**
- Database connections (`@/lib/db`)
- Authentication (`@clerk/nextjs`)
- File uploads (`uploadthing`)
- External APIs

**What NOT to Mock:**
- Utility functions (`cn`, `formatDate`)
- React hooks (test with React Testing Library)
- Component rendering logic

## Fixtures and Factories

**Test Data:**
- Not implemented

**Recommended Pattern:**
```typescript
// src/test/fixtures/final-space.ts
import type { FinalSpace } from "@/lib/db/schema";

export const createFinalSpaceFixture = (
  overrides: Partial<FinalSpace> = {}
): FinalSpace => ({
  id: "test-uuid",
  slug: "test-memorial",
  name: "Test Memorial",
  firstName: "John",
  lastName: "Doe",
  ownerUserId: "owner-uuid",
  status: "published",
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

**Recommended Location:**
- `src/test/fixtures/` - Shared test data
- `src/test/utils/` - Test utilities
- `src/test/setup.ts` - Global test setup

## Coverage

**Requirements:** None enforced

**Recommended Setup:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules", ".next", "src/components/ui"],
    },
  },
});
```

**View Coverage:**
```bash
# After setup:
pnpm test:coverage
```

## Test Types

**Unit Tests:**
- Focus on utility functions in `src/lib/utils.ts`
- Test Zod schemas in `src/lib/db/schema/index.ts`
- Test hooks in isolation with `@testing-library/react-hooks`

**Integration Tests:**
- Database queries with test database
- API route handlers
- Server actions

**E2E Tests:**
- Framework: Not configured
- Recommended: Playwright for Next.js
- Key flows: Memorial creation, guest book, media upload

## Common Patterns

**Async Testing:**
```typescript
it("fetches data asynchronously", async () => {
  const result = await fetchMemorial("test-slug");
  expect(result).toBeDefined();
});
```

**Error Testing:**
```typescript
it("handles validation errors", () => {
  const result = insertFinalSpaceSchema.safeParse({ name: "" });
  expect(result.success).toBe(false);
});
```

**React Component Testing:**
```typescript
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with correct variant", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-destructive");
  });
});
```

## Recommended Setup Steps

1. **Install test dependencies:**
```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

2. **Create vitest.config.ts:**
```typescript
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

3. **Add test scripts to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

4. **Create setup file `src/test/setup.ts`:**
```typescript
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```

## Priority Testing Areas

**High Priority (core utilities):**
- `src/lib/utils.ts` - `cn()`, `formatDate()`, `formatRelativeTime()`
- `src/lib/db/schema/index.ts` - Zod validation schemas
- `src/lib/env/server.ts` - Environment validation

**Medium Priority (hooks):**
- `src/hooks/use-debounce.ts`
- `src/hooks/use-media-query.ts`
- `src/hooks/use-click-outside.ts`

**Lower Priority (UI components):**
- shadcn/ui components are well-tested upstream
- Focus on custom components and modifications

---

*Testing analysis: 2026-01-28*
