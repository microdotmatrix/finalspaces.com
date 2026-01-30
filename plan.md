# FinalSpace Beta Implementation Plan

This doc breaks `spec.md` into executable phases for a **beta** build using the stack in `tech.md` (Next.js App Router + Clerk + Drizzle/Neon + shadcn/Tailwind + Uploadthing + Resend).

Assumptions:
- Prefer **Server Components** by default; use **Client Components** only when needed.
- Use **server actions** for mutations.
- Use **Drizzle** for DB access and **zod/drizzle-zod** for validation.
- Run `pnpm fix` after meaningful changes.

## What “Beta” Means (Definition of Done)

Beta is ready when a real user can:
- Sign in, create a memorial (“FinalSpace”), and publish it to a public URL slug.
- Invite up to **3 collaborators** who can edit the memorial.
- Upload media (at least images; video/docs can follow) and organize into albums (including a header carousel).
- Add a timeline of events (at least the form-based flow; interview + map can follow).
- Accept guestbook entries / comments with basic moderation + IP rate limiting.
- See “In Memoriam” UI when `deathDate`/`inMemoriam` indicates it.

Non-goals for the first beta cut (can be Beta+):
- Drag-and-drop page layout editor, full timeline map view, Favorites API integrations, LibreTranslate, and “My People” claim flows.

## Milestones (Beta Iterations)

Use these as checkpoints; each milestone is composed of phases below.

- **Beta 0 (local/dev complete)**: core CRUD, auth wired, basic UI routes, DB writes working end-to-end.
- **Beta 1 (private invite)**: collaborators, media uploads, guestbook/comments, timeline (form mode), publish flow.
- **Beta 2 (expanded)**: moderation hardening, SEO/OG, performance/accessibility, email polish, admin basics.

## Workstreams (Cross-Phase)

These cut across multiple phases; keep them consistent throughout:
- **Auth & RBAC**: Clerk auth, “owner vs collaborator vs public”, admin gates.
- **Data contracts**: drizzle schema ↔ zod schemas ↔ server action inputs/outputs.
- **Media**: Uploadthing + `media_assets` and album organization.
- **Safety**: rate limiting, ownership validation, moderation statuses, safe redirects/URLs.
- **Quality**: error boundaries, logging, manual QA scripts, and (later) automated tests.

---

## Phase 0 — Project Baseline & Guardrails

Goal: make it hard to ship broken or insecure things.

Checklist:
- [ ] Add/verify env validation in `src/lib/env/server.ts` (only server-side secrets here).
- [ ] Ensure secrets are not committed (keep them in `.env.local`; rotate any leaked credentials).
- [ ] Create route groups: `src/app/(app)`, `src/app/(public)`, `src/app/(admin)`.
- [ ] Add an authenticated “app shell” layout for `(app)` routes (nav + page container).
- [ ] Confirm DB workflow: migrations (`pnpm db:generate` / `pnpm db:migrate`) + seeding approach.
- [ ] Decide beta deploy environments (preview/staging/prod) and Neon branch strategy.

Definition of done:
- `pnpm dev` works, env validation is accurate, DB connects, and repo structure is in place.

---

## Phase 1 — Auth (Clerk) + User Sync + RBAC

Goal: a signed-in identity exists and maps cleanly to your DB model.

Checklist:
- [ ] Wire Clerk provider in `src/app/layout.tsx` and add sign-in/sign-up routes.
- [ ] Add auth protection for `(app)` and `(admin)` routes; keep `(public)` readable without auth.
- [ ] Add `users.clerkUserId` (column + index) and decide how/when it is populated.
- [ ] Implement “upsert user” logic (on sign-in and/or Clerk webhook) so DB always has a matching user row.
- [ ] Define admin strategy (Clerk roles vs `users.role`/`users.isAdmin`) and enforce it in server actions.

Definition of done:
- You can sign in/out, and server actions can reliably identify: anonymous vs user vs admin.

---

## Phase 2 — FinalSpace Core (CRUD, Slugs, Publish States)

Goal: owners can create and manage memorials; public can view published ones.

Checklist:
- [ ] Confirm `final_spaces.status` flow for beta (recommended: default `draft`, explicit publish).
- [ ] Implement slug generation + uniqueness rules (collision handling).
- [ ] Add server actions: create draft, patch updates, publish/unpublish (with readiness checks), delete (owner/admin).
- [ ] Add public route `src/app/(public)/[slug]/page.tsx` that only reads `published`.
- [ ] Centralize access checks (owner/admin/collaborator) and reuse them everywhere.

Definition of done:
- Owner can create a draft, update fields, publish, and view it at a slug URL as an anonymous visitor.

---

## Phase 3 — 9-Step Creation Wizard (Auto-save + Drafting)

Goal: implement the end-to-end creation flow described in `spec.md`.

Suggested step breakdown (adjust to match your UX, but keep 9 steps):
1) Basic identity (name fields, nickname toggle, slug preview)
2) Dates & “In Memoriam” (birth/death, badge preview)
3) Locations (place of birth, hometown)
4) Bio + highlights + quotes
5) Photos (profile picture + header carousel)
6) Albums/media library
7) Timeline (seeded categories; add events)
8) Social + YouTube/Spotify links
9) Review & publish

Checklist:
- [ ] Define the 9 step routes (e.g. `src/app/(app)/finalspaces/new/(steps)/step-1/page.tsx`, etc.).
- [ ] Implement wizard state with Jotai and localStorage persistence.
- [ ] Implement debounced server-side autosave (patch server action) for drafts.
- [ ] Add step-level zod validation and a final publish-readiness validator.
- [ ] Build progress UI + save status indicators (“saved / saving / error / offline”).

Definition of done:
- You can complete all 9 steps, refresh at any time, and not lose work; publish only passes when required fields are present.

---

## Phase 4 — Media Uploads (Uploadthing) + Albums + Header Carousel

Goal: users can upload and organize memorial media safely and at scale.

Checklist:
- [ ] Create Uploadthing route handlers + typed client upload components.
- [ ] Persist uploads into `media_assets` (type/mime/size/storageKey) linked to `final_space_id`.
- [ ] Implement “Header Carousel” album behavior (exactly 1 per FinalSpace).
- [ ] Enforce “up to 5 custom albums” (server-side check; UI should communicate limits).
- [ ] Build album UI: create/edit, cover image, add/remove items, reorder items.
- [ ] Implement distinct profile picture selection (`final_spaces.profilePictureId` or equivalent).
- [ ] Enforce ownership checks and file validation; decide deletion/cleanup policy.

Definition of done:
- Owner/collaborators can upload images, set profile picture, manage a header carousel, and create a small number of albums.

---

## Phase 5 — Guestbook + Comments + Moderation + Rate Limiting

Goal: accept respectful public input without getting spammed.

Checklist:
- [ ] Implement public guestbook form backed by `guest_book_entries` (support anonymous).
- [ ] Decide beta scope: guestbook only vs guestbook + short comments (`comments`).
- [ ] Add owner moderation UI (approve/hide/flag) using `moderation_status` / booleans.
- [ ] Add a DB-backed rate limit mechanism (recommended: new table like `rate_limit_events` keyed by IP + action + window).
- [ ] Add safety limits: max lengths, basic spam heuristics, and a report/flag action.

Definition of done:
- Anonymous users can submit; spam is throttled; owners can hide/approve content.

---

## Phase 6 — Collaborators (Invite, Accept, Edit Access)

Goal: invite up to 3 collaborators with full edit permissions.

Checklist:
- [ ] Create invite server action: insert `final_space_collaborators` as `pending`.
- [ ] Send invite email via Resend with a secure, single-use tokenized link.
- [ ] Build accept flow: sign-in gate, then mark collaborator `active` and attach `collaboratorUserId`.
- [ ] Enforce rules: max 3 collaborators, no duplicates, don’t invite owner.
- [ ] Build owner UI: list collaborators, resend invite, remove collaborator.

Definition of done:
- A collaborator can accept an invite and then edit the memorial with the same capabilities as the owner.

---

## Phase 7 — Timeline (Events + Categories + Basic “Interview” Prep)

Goal: a meaningful life timeline exists and is editable.

Beta scope recommendation:
- Implement **Form mode** first with categories, event CRUD, and privacy controls.
- Add **Conversational Interview mode** later (Phase 10+) once the data model and prompts are stable.

Checklist:
- [ ] Seed `timeline_categories` (and optionally `timeline_questions` / `timeline_option_sets`) with sensible defaults.
- [ ] Implement event CRUD (create/update/reorder/delete) + privacy toggles.
- [ ] Support optional event thumbnails/media.
- [ ] Start with plain-text location input; design for later geocoding.
- [ ] Render timeline on the public page (respect privacy flags).

Definition of done:
- A FinalSpace shows an editable timeline; public view renders events correctly with basic filters/ordering.

---

## Phase 8 — Public Memorial Page V1 (SEO, OG, Sharing)

Goal: make the published memorial page feel “real” and shareable.

Checklist:
- [ ] Flesh out sections: hero, profile photo, in-memoriam ribbon, bio, albums, timeline, guestbook.
- [ ] Make sections resilient to partial drafts (no crashes on missing fields).
- [ ] Add metadata + OG strategy (static first; dynamic later).
- [ ] Accessibility pass: semantics, labels, focus management, keyboard support.
- [ ] Performance pass: `next/image`, pagination/virtualization where needed.

Definition of done:
- A published memorial looks good, loads fast, is accessible, and has sane metadata for sharing.

---

## Phase 9 — Beta Hardening (Reliability, Security, Observability)

Goal: reduce “beta pain”: bugs, broken drafts, accidental data leaks.

Checklist:
- [ ] Add consistent error boundaries + friendly empty/error states.
- [ ] Normalize server action error returns; don’t leak internals to users.
- [ ] Permissions audit on every mutation and every public read.
- [ ] Confirm Neon branch + backup expectations for beta.
- [ ] Write manual QA scripts: create/publish, invite/accept, upload/remove, guestbook spam, timeline privacy.
- [ ] Keep `pnpm check` clean; fix Ultracite/Biome issues as they appear.

Definition of done:
- You can confidently onboard beta users without daily “fix prod” cycles.

---

# Post-Beta Phases (Planned, Not Blocking Beta)

## Phase 10 — Spotify Playlist Player (30s Previews) + YouTube/Spotify Metadata

Goal: deliver the “signature” media experience described in `spec.md`.

Action items:
- Parse and validate Spotify links; store rich track metadata; cache results.
- Build a playlist player with 30-second previews and persistent playback state.
- Decide auth approach (Spotify API credentials) and rate-limit/caching strategy.

## Phase 10.5 — Media Commenting (Text + Audio) on Media Items

Goal: allow visitors to leave comments directly on photos/videos, including short audio messages.

Action items:
- Use `media_comments` for text and audio metadata; store audio blobs via Uploadthing (or a dedicated uploader).
- Add moderation + rate limiting similar to guestbook/comments.
- Build a lightweight recorder UI (client component) and playback UI.

## Phase 11 — Timeline Map View (Leaflet + OSM) + Clustering

Goal: visual map of life events with clustering and popups.

Action items:
- Store lat/lng reliably (server-side geocode + caching).
- Render a map view with marker clustering and category color coding.

## Phase 11.5 — Drag-and-Drop Page Layout Customization

Goal: allow owners/collaborators to rearrange and configure memorial sections.

Action items:
- Define a stable `layout_json` schema (sections, ordering, per-section settings).
- Implement safe defaults and migrations for layout versions.
- Start with a constrained editor (reorder + toggle sections), then expand.

## Phase 12 — Admin Dashboard (Categories, Option Sets, Favorite Types)

Goal: manage timeline taxonomy and “favorites” scaffolding without code changes.

Action items:
- Build `(admin)` routes gated by admin RBAC.
- CRUD for categories/questions/options; seed/export tooling.

## Phase 13 — Multilingual Translation (LibreTranslate) + Client Cache

Goal: on-demand translation with a language selector and cached results.

Action items:
- Decide where translations live (DB table vs client cache only).
- Rate limit and cache aggressively; keep original content authoritative.

## Phase 14 — Favorites + External APIs

Goal: “[Name]’s Favorites” with API-backed search and saved items.

Action items:
- Pick initial providers and normalize fields.
- Store `memorial_favorites` with stable external IDs + source metadata.

## Phase 15 — “My People” Connections + Claim Flow

Goal: connect people across memorials and allow placeholders to be claimed later.

Action items:
- UI to create categories (max 5 per profile) and connections.
- Claim flow: placeholder → verified FinalSpace link; handle redirects and privacy.

---

## Execution Notes (How to Work This Plan)

- Do phases in order. Each phase should produce a shippable slice (even if behind feature flags).
- Keep server actions small: one action per mutation, explicit input schema, explicit return type.
- Prefer additive migrations; avoid schema churn during beta unless required.
- After each phase:
  - Run: `pnpm check`
  - Run: `pnpm build`
  - Smoke test the “Definition of done” for that phase.

## Beta Launch Checklist (Before Inviting Users)

- [ ] Clerk: production keys + allowed redirect URLs + webhook endpoints configured (if used).
- [ ] Uploadthing: production config + file type/size limits set + deletion policy decided.
- [ ] Resend: verified sender domain + invite emails deliver correctly.
- [ ] DB: migrations applied; seed data present (timeline categories); backup/branch strategy confirmed.
- [ ] Security: ownership checks audited; drafts are never publicly readable; rate limiting enabled.
- [ ] Performance: image-heavy pages are acceptable on mobile; no obvious waterfall regressions.
- [ ] Accessibility: keyboard navigation works for critical flows; forms have labels and errors.
- [ ] Content policy: basic terms/privacy + reporting flow (even if simple) are in place.
