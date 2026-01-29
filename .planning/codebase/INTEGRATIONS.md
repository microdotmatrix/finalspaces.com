# External Integrations

**Analysis Date:** 2026-01-28

## APIs & External Services

**Authentication:**
- Clerk - User authentication and identity management
  - SDK/Client: `@clerk/nextjs` 6.37.0, `@clerk/themes` 2.4.51
  - Auth: Not yet configured (no imports found in source)
  - Status: Dependency installed, awaiting integration

**File Uploads:**
- UploadThing - File upload service
  - SDK/Client: `uploadthing` 7.7.4, `@uploadthing/react` 7.3.3
  - Auth: Not yet configured
  - Status: Dependency installed, awaiting integration

**Email:**
- Resend - Transactional email delivery
  - SDK/Client: `resend` 6.9.1
  - Auth: Not yet configured
  - Status: Dependency installed, awaiting integration

**Media Embedding (Schema-defined):**
- YouTube - Video embedding
  - Integration: URLs stored in `youtubeLinks` JSONB field on `finalSpaces` table
  - Schema support: `youtubeUrl` field on `timelineEventMedia` table
  - No API integration, embed URLs only

- Spotify - Music embedding
  - Integration: Track data stored in `spotifyLinks` JSONB field on `finalSpaces` table
  - Schema fields: `trackId`, `artist`, `albumName`, `albumArtUrl`, `previewUrl`, `durationMs`
  - Schema support: `spotifyTrackId` on `timelineEventMedia` table
  - No Spotify API integration detected, likely manual/paste workflow

## Data Storage

**Databases:**
- Neon PostgreSQL (Serverless)
  - Connection: `DATABASE_URL` env var
  - Client: Drizzle ORM with `@neondatabase/serverless` driver
  - Configuration: `drizzle.config.ts`
  - Schema: `src/lib/db/schema/index.ts`
  - Migrations: `src/lib/db/migrations/`
  - Table prefix: `DATABASE_PREFIX` env var for filtering

**Database Schema Overview:**
- `users` - User accounts and authentication
- `finalSpaces` - Core memorial/legacy profiles
- `mediaAssets`, `mediaAlbums`, `albumMedia` - Photo/video storage
- `timelineEvents`, `timelineCategories`, `timelineQuestions` - Life milestones
- `guestBookEntries`, `comments`, `mediaComments` - Visitor messages
- `familyMembers` - Family tree data
- `petMemorials`, `petAlbums`, `petAlbumPhotos` - Pet tributes
- `memorialFavorites`, `favoriteTypes` - Curated favorites
- `profileConnections`, `connectionCategories` - Profile relationships
- `placeholderProfiles` - Unclaimed profile stubs
- `memorialTemplates` - Layout templates

**File Storage:**
- UploadThing (planned) - Images, videos, documents
  - Storage keys referenced in schema: `storageKey` fields on `mediaAssets`, `petAlbumPhotos`, `mediaComments`
  - Not yet integrated

**Caching:**
- None configured

## Authentication & Identity

**Auth Provider:**
- Clerk (planned)
  - Implementation: Not yet integrated
  - User sync: `users` table has `email`, `firstName`, `lastName`, `profileImageUrl` fields
  - Role system: `role` field with default "user", `isAdmin` boolean flag
  - Local auth fallback: `username` and `passwordHash` fields exist for potential local auth

## Monitoring & Observability

**Error Tracking:**
- None configured

**Logs:**
- Standard console logging (no structured logging service)

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred)
  - Detection: `VERCEL_PROJECT_PRODUCTION_URL` checks in `src/lib/utils.ts`
  - URL helpers: `getServerSideURL()`, `getClientSideURL()` functions

**CI Pipeline:**
- None detected (no `.github/workflows`, `vercel.json`, or CI config files)

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BASE_URL` - Application base URL
- `DATABASE_PREFIX` - Table prefix for Drizzle filtering

**Optional/Inferred env vars:**
- `NEXT_PUBLIC_SERVER_URL` - Public server URL
- `VERCEL_PROJECT_PRODUCTION_URL` - Auto-set by Vercel

**Secrets location:**
- `.env.local` (local development)
- Vercel environment variables (production)

**Env validation:**
- `src/lib/env/server.ts` - Server-side validation via `@t3-oss/env-nextjs`

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

## Future Integration Points

Based on installed dependencies and schema design:

1. **Clerk Authentication**
   - User registration/login
   - Profile sync to `users` table
   - Session management

2. **UploadThing File Uploads**
   - Media asset uploads for memorials
   - Profile pictures
   - Pet memorial photos
   - Audio comments on media

3. **Resend Email**
   - Collaborator invitation emails
   - Guest book notifications
   - Account notifications

4. **Potential API Integrations (schema supports):**
   - Spotify API for track metadata lookup (`favoriteTypes.apiProvider` field)
   - YouTube oEmbed for video previews
   - Geolocation services (lat/lng fields on multiple tables)

---

*Integration audit: 2026-01-28*
