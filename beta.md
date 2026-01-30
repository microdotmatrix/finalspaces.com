# Post-Beta PRD (Phases 10-15)

Owner: You  
Product: FinalSpace (finalspaces.com)  
Doc purpose: Detailed PRD for post-beta phases 10-15 from `plan.md` (Spotify/metadata, media commenting, timeline map, layout customization, admin taxonomy, translations, favorites APIs, "My People" + claim flow).  
Stack constraints: Next.js App Router (Server Components by default), Clerk, Drizzle + Neon Postgres, shadcn/ui + Tailwind v4, Uploadthing, Resend. Mutations via server actions.

---

## 1) Context & Goals

### 1.1 Why these phases exist
Beta proves the core memorial lifecycle (create - collaborate - publish - receive guest input). Post-beta phases deliver the "signature" experiences that differentiate FinalSpace:
- A media-rich memorial with Spotify + YouTube that feels alive (Phase 10)
- Deeper visitor participation directly on media (Phase 10.5)
- Spatial storytelling via timeline map (Phase 11)
- Personalization via layout customization (Phase 11.5)
- Rapid iteration without code deploys via admin taxonomy tools (Phase 12)
- Translation for accessibility and reach (Phase 13)
- "Favorites" as a humanizing section with API-backed discovery (Phase 14)
- Network effects via "My People" + claim flow (Phase 15)

### 1.2 Global product goals (post-beta)
- Increase memorial engagement (time on page, return visits, meaningful interactions).
- Preserve respectful UX and safety (spam/threat mitigation, moderation, privacy defaults).
- Keep performance acceptable on mobile even for media-heavy pages.
- Maintain strict access control (draft privacy, collaborator permissions, admin-only tools).
- Ship incrementally behind feature flags where appropriate.

### 1.3 Out of scope (for phases 10-15 unless explicitly noted)
- Full "conversational interview" timeline authoring (mentioned as later in `plan.md`; only prep/compatibility here).
- Complex WYSIWYG page builder beyond constrained section reorder/toggle (Phase 11.5 starts constrained).
- Automated content generation or AI rewriting of memorials.

---

## 2) Personas & Roles

### 2.1 Personas
- Memorial Owner: creates and publishes a FinalSpace; curates media, timeline, favorites, and people connections.
- Collaborator (max 3 per memorial): edits content with the same capabilities as owner (unless restricted later).
- Public Visitor (anonymous): views published memorial; interacts (guestbook, media comments), plays previews, uses translations.
- Admin: manages taxonomy and platform-level configuration; no special powers to read drafts unless explicitly granted.

### 2.2 Role & permission model (baseline)
- Public reads: published FinalSpaces only; respects per-item privacy flags.
- Edits: owner + active collaborators.
- Admin routes/actions: admin only.
- Moderation actions: owner/collaborator (and admin if desired).

---

## 3) Cross-Cutting Requirements (All Phases)

### 3.1 Safety, moderation, and rate limiting
- Any public submission (text or audio) must be:
  - Rate-limited by IP (and optionally by session/user when available).
  - Length-limited and validated server-side.
  - Stored with moderation status (at least: `pending`, `approved`, `hidden`, `flagged`).
- Admin/owner must be able to hide/remove public content quickly.
- Avoid leaking internal error details to public users; normalize server action error returns.

### 3.2 Privacy & compliance expectations
- Draft content is never public.
- "Private" timeline events or "private" people connections never render publicly.
- IP addresses: if stored for rate limiting or abuse prevention, define retention policy (e.g., store hashed IP + window bucketing; keep raw IP only if required).
- Respect third-party API terms (Spotify, YouTube, geocoding, provider APIs).
- Accessibility: keyboard operability, labeled controls, captions/alt where applicable, proper focus management.

### 3.3 Performance & caching
- Use server-side caching for third-party metadata with explicit TTLs and invalidation.
- Avoid client waterfalls on public pages; prefer server-fetched aggregates.
- Media-heavy UI should paginate/virtualize where needed and use `next/image`.
- Consider background refresh patterns for metadata to avoid blocking render.

### 3.4 Feature flags & rollout
- Add flags per phase (environment + per-memorial enablement optional):
  - `spotify_player_enabled`
  - `media_comments_enabled`
  - `timeline_map_enabled`
  - `layout_customization_enabled`
  - `admin_taxonomy_enabled`
  - `translation_enabled`
  - `favorites_enabled`
  - `my_people_enabled`
- Rollout order: internal dogfood - limited beta cohort - general enable.

### 3.5 Observability & analytics (minimum)
Track events (privacy-respecting, aggregated):
- Spotify: link parsed success/failure, metadata fetch success/failure, play/pause, track change, preview availability rate.
- Media comments: submit attempts, approvals/hides, spam throttles.
- Map: map open, marker interactions.
- Layout: reorder/toggle usage, publish impact.
- Translation: language chosen, cache hit ratio, translation request volume.
- Favorites: searches, saves, click-through to external providers.
- My People: connection created, placeholder created, claim initiated/completed.

---

## 4) Phase 10 - Spotify Playlist Player (30s Previews) + YouTube/Spotify Metadata

### 4.1 Objective
Deliver an embedded "signature" music experience: a playlist player with 30-second previews (where available), plus robust metadata extraction and caching for Spotify and YouTube links stored on a memorial.

### 4.2 Success metrics
- >= 90% of stored Spotify links parse successfully.
- Metadata fetch success rate >= 95% (excluding provider outages).
- Player loads and becomes interactive in < 2s on a typical mobile connection (assuming cached metadata).
- Meaningful engagement uplift (baseline-dependent): increased time on page, interactions with tracks.

### 4.3 User stories
- As a visitor, I can play 30-second previews for the memorial's playlist/tracks without logging in.
- As an owner, I can paste a Spotify playlist/track URL and see it validated with a friendly error if invalid.
- As an owner, I can add YouTube/Spotify links and see titles/thumbnails render reliably.
- As a collaborator, I can edit the same music/media links.
- As a visitor, if a track has no preview, I see a clear "Preview unavailable" state and optionally a "Open in Spotify" link.

### 4.4 Functional requirements

#### Spotify link support (minimum)
- Accept: track, playlist, album URLs (and optionally artist).
- Parse inputs:
  - `https://open.spotify.com/track/{id}`
  - `spotify:track:{id}` (optional)
  - variants with query params
- Validate server-side; normalize to canonical form.

#### Spotify metadata
- Store rich metadata for:
  - Track: name, artists, album, cover art, duration, preview_url, explicit flag, Spotify URL, external IDs.
  - Playlist: name, owner/display name (if available), cover, track listing (IDs), snapshot/version identifier if available.
- Caching strategy:
  - Persist metadata in DB with a TTL (e.g., 7 days for playlists, 30 days for track-level fields).
  - Background refresh on access if stale (non-blocking if possible).

#### Spotify API auth approach
- Use Spotify Web API via server:
  - Preferred: Client Credentials flow for public metadata and preview URLs (no user login).
  - Store credentials server-only (env validation).
- Rate limiting:
  - Enforce per-IP and global request caps to Spotify endpoints.
  - Cache aggressively to minimize API calls.

#### Playlist player behavior
- 30-second previews using `preview_url` (MP3) where present.
- Persistent playback state:
  - current track id, position, play/pause, volume
  - persist in memory and optionally localStorage per visitor
  - never persist sensitive data
- UI requirements:
  - Track list with title/artist, cover thumbnail, duration
  - Play/pause, next/prev, scrub for preview duration
  - "Preview unavailable" per track with graceful fallback
- Accessibility:
  - Keyboard controls for player buttons
  - ARIA labels and focus outlines
  - Avoid auto-play; only play after explicit user action

#### YouTube metadata
- Accept common YouTube URL formats:
  - `youtube.com/watch?v=...`
  - `youtu.be/...`
  - playlists optional (later)
- Fetch minimal metadata (title, thumbnail, channel name if available) via:
  - Preferred: oEmbed when sufficient (lower quota cost)
  - If richer metadata needed later: YouTube Data API (explicitly add keys/quotas)

#### Data model (proposed additions/adjustments)
(Exact naming should follow existing schema conventions; these are intent-level.)

- `external_links` (new) OR extend existing FinalSpace fields if they already exist:
  - `id`
  - `final_space_id`
  - `type` enum: `spotify_track`, `spotify_playlist`, `spotify_album`, `youtube_video`
  - `provider` enum: `spotify`, `youtube`
  - `canonical_url`
  - `external_id` (e.g., Spotify ID, YouTube video ID)
  - `title`, `subtitle`, `thumbnail_url`
  - `metadata_json` (jsonb; provider response subset)
  - `fetched_at`, `stale_at`
  - indexes: `(final_space_id, type)`, `(provider, external_id)`

- `spotify_tracks_cache` (optional separate cache table if you want dedupe across memorials):
  - keyed by `spotify_track_id`
  - stores preview_url, cover, artists, etc.

#### Server actions / routes (conceptual)
- `finalSpaceAddExternalLink(input)` - validate + persist + schedule metadata fetch
- `finalSpaceRemoveExternalLink(input)` - remove link
- `refreshExternalLinkMetadata(input)` - admin/owner-triggered manual refresh (rate-limited)
- All actions require owner/collaborator.

### 4.5 UX notes
- Editing UI: paste URL - instant client hint + server validation - render preview card.
- Public UI: Spotify section with player + optional "Open playlist in Spotify" link (`target="_blank" rel="noopener"`).
- Empty states:
  - No links: hide section or show tasteful empty state on draft editor only.
  - Fetch failed: show "Couldn't load details right now" and still show the raw link.

### 4.6 Risks & mitigations
- Many Spotify tracks have `preview_url = null`.
  - Mitigation: clear per-track unavailable state; consider fallback to Spotify embed (not a preview) as optional enhancement.
- Provider rate limits / outages.
  - Mitigation: DB cache, exponential backoff, stale-while-revalidate behavior.
- Terms compliance.
  - Mitigation: do not store full audio; only use preview_url; store minimal metadata necessary.

### 4.7 Acceptance criteria
- Owner can add a Spotify playlist URL; public page shows a track list with previews where available.
- Track play/pause/next/prev works; no auto-play; persistent state across navigation (within the memorial page).
- YouTube links render with correct title + thumbnail.
- Metadata fetches are cached; repeated page loads do not hammer providers.

---

## 5) Phase 10.5 - Media Commenting (Text + Audio) on Media Items

### 5.1 Objective
Allow visitors to comment directly on photos/videos (and later other media), including short audio messages, with moderation and rate limiting.

### 5.2 Success metrics
- Comment submission success rate >= 98% (excluding throttles).
- Spam rate manageable with throttles + moderation tooling (owner can keep gallery clean).
- Audio comment median upload time acceptable on mobile (target: < 10s for a short clip).

### 5.3 User stories
- As a visitor, I can leave a text comment on a photo.
- As a visitor, I can record a short audio message and attach it as a comment.
- As an owner/collaborator, I can approve/hide comments and remove abusive content.
- As a visitor, I can report a comment.

### 5.4 Functional requirements

#### Comment types
- Text comment:
  - Required: body
  - Optional: display name
- Audio comment:
  - Record via browser MediaRecorder
  - Constraints: max duration (e.g., 30-60s), max file size (e.g., 2-5MB), allowed mime types (webm/ogg/mp4 depending)
  - Optional: accompanying text

#### Moderation & lifecycle
- Default moderation status:
  - Option A: `approved` by default with fast hide controls (best UX, higher spam risk)
  - Option B (recommended): `pending` for anonymous, `approved` for signed-in (if you allow signed-in public users), plus owner override.

#### Rate limiting
- DB-backed rate limit events (reuse the guestbook mechanism).
- Separate buckets:
  - `media_comment_text_create`
  - `media_comment_audio_create`
  - `media_comment_report`
- Stronger limits for audio due to storage cost.

#### Storage
- Text stored in DB.
- Audio blob stored via Uploadthing; DB stores:
  - storage key, url, duration_ms, mime, size_bytes, waveform placeholder optional.

#### Data model (proposed)
- `media_comments`
  - `id`
  - `final_space_id`
  - `media_asset_id`
  - `type` enum: `text`, `audio`
  - `body` (nullable for audio-only)
  - `audio_asset_id` (nullable; references `media_assets` if you reuse it for audio)
  - `display_name` (nullable)
  - `created_at`
  - `ip_hash` / `ip` (per policy)
  - `moderation_status`
  - `reported_count` (optional)
  - indexes: `(media_asset_id, created_at)`, `(final_space_id, moderation_status)`

#### Public rendering rules
- Only render `approved` comments publicly.
- Owners/collaborators can see all statuses in edit mode.

#### Accessibility
- Recorder UI must be keyboard operable.
- Provide clear permission prompts and failure states if mic access denied.

### 5.5 UX notes
- Media modal/drawer:
  - Shows the media asset + comments thread
  - Tabs or inline composer: "Write" + "Record"
- Audio UI:
  - Show duration; playback controls; loading state during upload
  - Confirm-before-submit for audio (playback review)

### 5.6 Risks & mitigations
- Abuse/spam via audio.
  - Mitigation: strict limits + pending moderation for anonymous + report flow.
- Browser compatibility for MediaRecorder.
  - Mitigation: supported formats fallback; show "Audio comments not supported on this browser" gracefully.

### 5.7 Acceptance criteria
- Visitor can submit text comment; it appears according to moderation rules.
- Visitor can record and submit audio; owner can play it back; it appears according to moderation rules.
- Owner can moderate from the media view and from a queue.
- Rate limiting blocks repeated submissions with a user-friendly message.

---

## 6) Phase 11 - Timeline Map View (Leaflet + OSM) + Clustering

### 6.1 Objective
Add an interactive map view of timeline events with clustering, color-coded categories, and privacy-respecting rendering.

### 6.2 Success metrics
- Map view loads without blocking the main memorial content.
- Marker interactions are smooth on mobile.
- Geocoding does not violate provider rate limits; cache hit ratio improves over time.

### 6.3 User stories
- As a visitor, I can view a map of life events and tap markers to see details.
- As an owner, when I add an event location, it gets geocoded and shows on the map.
- As an owner, I can correct a location if the geocode is wrong.

### 6.4 Functional requirements

#### Data prerequisites
- Timeline events support:
  - `location_text` (user-entered)
  - `lat`, `lng` (nullable)
  - `geocode_source` + `geocoded_at` + `geocode_confidence` (optional)
- Public map respects:
  - event privacy flags (private events never appear)
  - draft vs published constraints

#### Geocoding
- Use OpenStreetMap Nominatim (as referenced in `spec.md`) with strict compliance:
  - Server-side geocode requests only
  - Cache results keyed by normalized query
  - Rate limit requests (global and per-IP/owner)
- Fallbacks:
  - If geocode fails, keep `lat/lng` null and omit from map (still show event in timeline list).
  - Owner can manually set approximate pin (later enhancement; can start with "retry geocode").

#### Map rendering
- Leaflet map in a Client Component; load it dynamically to reduce SSR cost.
- Marker clustering:
  - cluster at low zoom
  - show category color on marker dot or ring
- Popup content:
  - event title, date range, short description snippet, optional thumbnail
  - "View event" anchor scrolls to timeline entry (optional)

#### Filters
- Filter by category.
- Toggle "Show only pinned events" (optional).

### 6.5 UX notes
- Public memorial page:
  - Timeline section has tabs: "Timeline" | "Map"
  - Default stays on Timeline list; Map is opt-in to avoid heavy initial load
- Loading states:
  - Skeleton for map container; lazy load Leaflet assets

### 6.6 Risks & mitigations
- Nominatim usage restrictions.
  - Mitigation: aggressive caching + rate limiting + consider paid geocoding later if needed.
- Performance and bundle weight.
  - Mitigation: dynamic import + only load in map tab + keep marker icons simple.

### 6.7 Acceptance criteria
- For events with lat/lng, markers appear clustered and colored by category.
- Private events are not present in the public map.
- Map view does not significantly degrade initial page load.

---

## 7) Phase 11.5 - Drag-and-Drop Page Layout Customization (Constrained)

### 7.1 Objective
Allow owners/collaborators to rearrange and configure memorial sections safely with a versioned `layout_json` schema and strong defaults.

### 7.2 Success metrics
- Owners can personalize layout without breaking the public page.
- Layout changes are reversible (reset to default).
- No significant increase in rendering bugs across partial data states.

### 7.3 User stories
- As an owner, I can reorder sections (e.g., move Favorites above Timeline).
- As an owner, I can toggle sections on/off (e.g., hide Map).
- As a collaborator, I can do the same edits.

### 7.4 Functional requirements

#### Schema design (versioned)
- Store `layout_json` on `final_spaces` (or related table), including:
  - `version`
  - `sections`: ordered list of section IDs
  - per-section settings (e.g., show/hide, display variants)
- Stable section IDs (examples):
  - `hero`, `bio`, `albums`, `timeline`, `map`, `spotify`, `youtube`, `guestbook`, `favorites`, `my_people`

#### Editor scope (constrained first)
- Reorder list via drag-and-drop.
- Toggle visibility.
- Optional per-section settings:
  - "compact vs full"
  - "show heading" text override (later)

#### Safety
- Validate `layout_json` server-side against zod schema.
- If invalid/missing, fall back to default computed layout.
- Migrations:
  - If `version` is older, transform to latest on read or on next save.

#### Rendering
- Public page composes sections based on computed effective layout.
- Each section component must handle missing data gracefully.

### 7.5 UX notes
- "Customize layout" panel in editor mode:
  - List of sections with drag handles, eye toggle, short description
  - "Reset to default" button with confirmation
- Provide preview on the public page route in authenticated "preview" mode (optional).

### 7.6 Risks & mitigations
- Breaking changes when new sections introduced.
  - Mitigation: default insertion rules + version migrations + safe fallbacks.
- Over-complexity early.
  - Mitigation: keep editor constrained; no freeform grids yet.

### 7.7 Acceptance criteria
- Owner can reorder/toggle sections; public memorial reflects changes after publish (or immediately if published).
- Invalid layout never breaks rendering; default layout loads.

---

## 8) Phase 12 - Admin Dashboard (Categories, Option Sets, Favorite Types)

### 8.1 Objective
Build admin tooling to manage timeline taxonomy and favorites scaffolding without code deploys.

### 8.2 Success metrics
- Admin can create/update categories and option sets; changes reflect in editor UI.
- Auditability: clear tracking of what changed and by whom.
- No unauthorized access.

### 8.3 User stories
- As an admin, I can CRUD timeline categories and configure display properties.
- As an admin, I can manage option sets used by timeline questions (e.g., military branches).
- As an admin, I can define Favorite Types (e.g., Books, Movies) used in Phase 14.

### 8.4 Functional requirements

#### Admin access
- `(admin)` routes protected by Clerk role/flag.
- Server actions re-check admin status.

#### Entities
- Timeline categories:
  - name, slug/id, color, icon (optional), ordering, active flag
- Option sets:
  - set name, key, options list, ordering
- Favorite types:
  - type key, display name, provider mapping (which external providers are valid), icon, ordering

#### Safety & data integrity
- Prevent deleting categories in use (or soft-delete with `active=false`).
- Provide export/import (JSON) as an admin convenience (optional).
- Add an audit log table for admin actions (recommended).

### 8.5 UX notes
- Admin dashboard sections:
  - Categories
  - Option Sets
  - Favorite Types
- Provide search + reorder controls.
- Show "in use by N memorials/events" where helpful.

### 8.6 Risks & mitigations
- Taxonomy churn causing inconsistent data.
  - Mitigation: soft deletes; migrations; stable IDs.

### 8.7 Acceptance criteria
- Admin can create and reorder categories; editor UI reflects new ordering.
- Non-admin cannot access admin routes or actions.

---

## 9) Phase 13 - Multilingual Translation (LibreTranslate) + Client Cache

### 9.1 Objective
Enable visitors to translate memorial content on-demand with caching, while keeping original content authoritative.

### 9.2 Success metrics
- Translation requests are fast after caching (high cache hit rate).
- Cost and rate-limited requests are controlled.
- Translation never overwrites original content.

### 9.3 User stories
- As a visitor, I can select a language and see the memorial translated.
- As a visitor, I can switch back to original instantly.
- As an owner, I can choose whether translation is enabled on my memorial (optional toggle).

### 9.4 Functional requirements

#### Translation scope (v1)
Translate selected fields:
- bio/description blocks
- timeline event titles/descriptions (public events)
- section headings (optional; can keep headings in UI language only)
- guestbook entries/comments: optional (careful; translating user-generated content may be expensive)

#### LibreTranslate integration
- Server-side requests only.
- Configure endpoint + API key (if used) via env validation.
- Rate limiting per IP and per memorial.

#### Caching strategy (recommended hybrid)
- Server cache in DB:
  - Store translations keyed by:
    - `final_space_id` (or global by content hash)
    - `locale`
    - `source_hash` (hash of original text)
    - `translated_text`
  - Invalidate naturally when source changes (hash mismatch).
- Client cache:
  - localStorage keyed by memorial slug + locale + hash
  - Used to avoid repeat fetches during a session.

#### UI
- Language selector (top of memorial page or in settings menu).
- Show "Translated" indicator and allow "View original" toggle.
- If translation fails, show non-blocking toast and keep original content.

### 9.5 Data model (proposed)
- `translations`
  - `id`
  - `scope` enum: `final_space`, `timeline_event`, `guestbook_entry`, etc.
  - `entity_id`
  - `locale`
  - `source_hash`
  - `source_text` (optional; may omit to reduce storage)
  - `translated_text`
  - `provider` (`libretranslate`)
  - `created_at`
  - indexes: `(scope, entity_id, locale, source_hash)`

### 9.6 Risks & mitigations
- Translation quality and sensitive content.
  - Mitigation: clear "machine translated" label; easy revert.
- Abuse via repeated translation requests.
  - Mitigation: aggressive caching + rate limiting + max text length per request.

### 9.7 Acceptance criteria
- Visitor can translate a memorial; cached translations persist across refresh.
- No original content is altered.
- Translation failures degrade gracefully.

---

## 10) Phase 14 - Favorites + External APIs

### 10.1 Objective
Implement "[Name]'s Favorites" with API-backed search and saved items, normalized across providers.

### 10.2 Success metrics
- Owners can add favorites quickly (search - select - saved card).
- External API usage remains within quotas due to caching and debouncing.
- Favorites render reliably on the public page with minimal layout shift.

### 10.3 User stories
- As an owner, I can search for a book/movie/song and add it to Favorites.
- As a visitor, I can browse favorites and click through to more info externally.
- As an owner, I can reorder and remove favorites.

### 10.4 Functional requirements

#### Supported favorite types (initial recommendation)
Choose 2-3 to start to reduce complexity:
- Books (Open Library or Google Books)
- Movies/TV (TMDB)
- Music (Spotify search, but note auth/quota)
(Exact providers require keys; keep provider list configurable via Phase 12.)

#### Normalized favorite item model
Each saved favorite should store enough to render without live API calls:
- title, subtitle/creator, image, external URL, type, source provider, external id, and a `metadata_json` blob.

#### Search UX
- Type selector (Book/Movie/Music).
- Search box with debounced server action / route handler.
- Results show title + creator + thumbnail.
- On select: save normalized record.

#### Ordering
- Favorites are ordered per memorial; support drag-and-drop reorder (reuse layout DnD patterns).

#### Caching
- Cache provider search results server-side (short TTL, e.g., 10-60 minutes) keyed by `query + type + provider`.
- Save chosen item fully to DB so public page never depends on provider uptime.

#### Data model (proposed)
- `memorial_favorites`
  - `id`
  - `final_space_id`
  - `favorite_type` (matches admin-configured types)
  - `provider` (e.g., `openlibrary`, `google_books`, `tmdb`, `spotify`)
  - `external_id`
  - `title`
  - `subtitle`
  - `image_url`
  - `external_url`
  - `metadata_json` (jsonb)
  - `sort_order`
  - `created_at`
  - indexes: `(final_space_id, favorite_type, sort_order)`, `(provider, external_id)`

### 10.5 UX notes
- Public rendering:
  - Grid of cards grouped by type (or a single mixed feed; decide later)
  - Optional "See more" expands
- Editor:
  - "Add favorite" opens a dialog with search + results list.

### 10.6 Risks & mitigations
- API key management complexity.
  - Mitigation: start with one provider; add more iteratively; admin config in Phase 12.
- Quota issues.
  - Mitigation: caching + request throttling + only fetch details when saving.

### 10.7 Acceptance criteria
- Owner can add at least one favorite type via search and save.
- Public page renders favorites without calling third-party APIs at request time.
- Owner can reorder and remove favorites.

---

## 11) Phase 15 - "My People" Connections + Claim Flow

### 11.1 Objective
Let owners create "My People" categories (max 5) and add connections that link to existing FinalSpaces or placeholders that can later be claimed/linked.

### 11.2 Success metrics
- Owners can model real-life relationships without friction.
- Claim flow successfully converts placeholders into linked memorials.
- Privacy is respected (owners can keep people private).

### 11.3 User stories
- As an owner, I can create up to 5 categories (e.g., Family, Friends, Work).
- As an owner, I can add unlimited people connections within a category.
- As an owner, I can link a connection to an existing FinalSpace.
- As an owner, I can create a placeholder for someone who doesn't have a FinalSpace yet.
- As a future owner of that person's FinalSpace, I can claim the placeholder and link the memorial.
- As a visitor, I can browse "My People" if enabled and see linked profiles where public.

### 11.4 Functional requirements

#### Categories
- Up to 5 categories per memorial.
- Fields:
  - name, sort order, optional description
  - visibility flag (public/private)

#### Connections
- Unlimited per category.
- Connection can be:
  - Linked: references another `final_space_id`
  - Placeholder: stores display name + optional photo + optional notes
- Optional fields:
  - relationship label (e.g., "Brother", "Best friend")
  - date met / context (for future timeline integration)

#### Claim flow (recommended model)
Two main approaches; pick one as v1 and keep the other as future:

Option A (recommended, simplest): Owner-controlled linking
- Placeholder can be converted to a link only by the memorial owner/collaborator who created it.
- When a FinalSpace for that person exists, owner searches and links it.
- Pros: simplest, lowest abuse risk. Cons: not truly "claim by others".

Option B (true claim): Token-based claim with verification
- Placeholder has a claim token (single-use, rotateable).
- Flow:
  1) Owner creates placeholder - system generates `claim_token`.
  2) Owner shares "claim link" to the appropriate person/family.
  3) Claimant signs in, creates/chooses a FinalSpace, then submits token to link.
- Abuse controls:
  - token entropy + expiration (e.g., 30 days) + rate limit attempts
  - token can be revoked by original owner
- Permissions:
  - Claim requires claimant to be owner of the target FinalSpace (or admin if you allow).

This PRD assumes Option B for Phase 15, with Option A as fallback if complexity is too high.

#### Privacy & rendering
- Public memorial shows My People only if enabled and category/connection is public.
- For linked connections:
  - show avatar + name; click navigates to linked memorial slug (public only if published).
- For placeholders:
  - show name and optional image; no navigation unless claimed and linked.

#### Data model (proposed)
- `people_categories`
  - `id`
  - `final_space_id`
  - `name`
  - `sort_order`
  - `is_public`
  - `created_at`
  - unique: `(final_space_id, name)` (optional)

- `people_connections`
  - `id`
  - `final_space_id`
  - `category_id`
  - `type` enum: `linked`, `placeholder`
  - `linked_final_space_id` (nullable)
  - `display_name` (for placeholder; optionally also for linked override)
  - `relationship_label` (nullable)
  - `notes` (nullable, private by default)
  - `is_public`
  - `sort_order`
  - `claim_token_hash` (nullable)
  - `claim_token_expires_at` (nullable)
  - `claimed_at` (nullable)
  - `created_at`
  - indexes: `(final_space_id, category_id, sort_order)`, `(linked_final_space_id)`

Token handling:
- Store only a hash of the claim token; show the raw token once at creation.
- Validate token server-side with constant-time compare if feasible.

#### Server actions (conceptual)
- `createPeopleCategory(input)` / `updatePeopleCategory(input)` / `deletePeopleCategory(input)`
- `createPeopleConnection(input)` / `updatePeopleConnection(input)` / `deletePeopleConnection(input)`
- `generateClaimLink(connectionId)` - returns claim URL (only owner/collab)
- `claimPeopleConnection(input: { token, targetFinalSpaceId })` - links connection if token valid and claimant owns target

### 11.5 UX notes
- Editor:
  - "My People" section with category tabs and "Add person" button
  - For placeholders: "Generate claim link" action + "Revoke link"
- Public:
  - Cards grouped by category; consistent with memorial tone; keep respectful and uncluttered

### 11.6 Risks & mitigations
- Claim abuse / hijacking.
  - Mitigation: token-based, expiring, hashed, rate-limited, revocable; require claimant ownership of target memorial.
- Privacy issues with living persons.
  - Mitigation: default connections to private; explicit publish toggle per connection; avoid showing contact info.

### 11.7 Acceptance criteria
- Owner can create up to 5 categories and add connections.
- Placeholder claim link can be generated, claimed, and results in a linked connection (Option B).
- Public memorial renders only public categories/connections; linked items navigate only when the target is published.

---

## 12) Milestones & Delivery Plan (Suggested)

### Milestone A (Media & engagement)
- Phase 10: Spotify player + metadata (Spotify + YouTube)
- Phase 10.5: Media comments (text first, then audio)

### Milestone B (Storytelling)
- Phase 11: Timeline map view (geocode cache + clustering)
- Phase 11.5: Layout customization (constrained)

### Milestone C (Platform leverage)
- Phase 12: Admin taxonomy tools
- Phase 13: Translation with caching

### Milestone D (Expansion & network effects)
- Phase 14: Favorites with 1-2 providers
- Phase 15: My People + claim flow

---

## 13) QA Plan (Minimum per phase)

- Permissions:
  - owner vs collaborator vs public
  - draft is never readable publicly
- Abuse:
  - rate limiting and moderation paths
- Performance:
  - cold load vs warm cache
  - mobile interaction smoothness for player/map
- Accessibility:
  - keyboard navigation and labeled controls
- Data integrity:
  - schema migrations safe
  - fallback behavior when metadata missing or stale

---

## 14) Open Questions (Non-blocking, but should be decided early)

- Phase 10: Is Spotify Client Credentials acceptable long-term, or do you plan user-auth Spotify later?
- Phase 10: Should Spotify content be a single playlist, or multiple links (playlist + individual tracks)?
- Phase 10.5: Default moderation mode for anonymous media comments: `pending` (safer) vs `approved` (smoother)?
- Phase 11: Should owners be able to manually set pins in v1, or only geocoding?
- Phase 11.5: Which sections are allowed to be hidden (e.g., Guestbook maybe always visible if enabled)?
- Phase 13: Which fields are translated in v1 (exclude guestbook/comments to control cost)?
- Phase 14: Which provider(s) do you want first (Books vs Movies vs Music)?
- Phase 15: Do you want true token-based claim (Option B) in v1, or owner-controlled linking (Option A) first?
