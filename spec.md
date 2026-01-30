# Overview

FinalSpace is a B2C digital memorial platform designed for creating and managing personalized online memorial spaces. It supports user authentication, allows up to three collaborators per memorial, and features a 9-step creation flow. The platform enables extensive media uploads (images, documents, audio, video), embeds from YouTube and Spotify, social media links, drag-and-drop customization, auto-save functionality, quotes, anonymous commenting, and a comprehensive timeline of events. Unique features include a Spotify playlist player with 30-second track previews and an "In Memoriam" badge. The vision is to provide a respectful, customizable, and collaborative space for remembering loved ones.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

- **See tech.md file**

## Database Design
- **Core Entities**: Users, FinalSpaces (memorial pages), MediaAssets, TimelineEvents, MediaAlbums, GuestBookEntries, Comments, and Collaborators.
- **Media**: Structured storage for various media types, including rich Spotify track metadata.
- **Photo Albums**: MediaAlbums table, supporting a special Header Carousel and up to 5 custom albums per memorial.
- **Name Fields**: Granular structure for names (`firstName`, `lastName`, `middleName`, `suffix`, `nickname`) with a `useNicknameOnly` toggle.
- **URL Slugs**: Clean, unique URL slugs generated from names.
- **Location Fields**: Separate `placeOfBirth` and `hometown` fields with display logic.
- **Memorial Status**: `deathDate` and `inMemoriam` boolean for status.

## Access Control
- **Authentication**: Required for creating/editing.
- **Ownership**: Owner or admin can edit/delete.
- **Collaborators**: Full editing access for invited collaborators.
- **Public Viewing**: All published memorials are publicly viewable.
- **Security**: Session-based auth, scrypt hashing, IP-based rate limiting, ownership validation.

## Key Features
- **Memorial Creation/Editing**: Multi-step wizard with auto-drafting and localStorage persistence.
- **Life Timeline System**: Category-based events (Education, Career, Family, etc.) with Form and Conversational Interview modes. Events include title, description, organization, location (OpenStreetMap Nominatim autocomplete), dates, privacy controls, and optional thumbnails. Includes automatic server-side geocoding for location data.
- **Timeline Map View**: Interactive map using Leaflet + OpenStreetMap, displaying color-coded event markers with clustering and popups.
- **Admin Dashboard**: Manages timeline categories, option sets (e.g., Military Branches), and favorite types.
- **Media Commenting**: Text and audio comments on individual media items.
- **Spotify Integration**: Comprehensive playlist player with track metadata and persistent playback.
- **"In Memoriam" Feature**: Ribbon badge display based on death date.
- **Collaborator Management**: Invite up to 3 collaborators with full editing access.
- **Profile Picture**: Circular avatar distinct from header image.
- **Photo Albums**: Custom albums, including a "Header Carousel" for rotating slideshows.
- **Favorites Section**: Configurable "[Name's] Favorites" section with integrated APIs for books, movies, music, and more.
- **Multilingual Translation**: On-demand content translation using LibreTranslate, with a language selector and client-side caching.
- **"My People" Connections**: Organize important people by life categories (High School, College, Work, etc.). Up to 5 categories per profile, each with unlimited connections. Connections can link to existing FinalSpaces or placeholder entries with claim capability. Optional timeline integration for when connections were met.