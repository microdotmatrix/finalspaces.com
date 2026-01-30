import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const finalSpaceStatusEnum = pgEnum("final_space_status", [
  "draft",
  "published",
]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "doc"]);
export const mediaStatusEnum = pgEnum("media_status", [
  "ready",
  "processing",
  "failed",
]);
export const moderationStatusEnum = pgEnum("moderation_status", [
  "ok",
  "flagged",
  "hidden",
]);
export const templateCategoryEnum = pgEnum("template_category", [
  "elegant",
  "modern",
  "traditional",
  "nature",
  "minimalist",
]);
export const timelineEventTypeEnum = pgEnum("timeline_event_type", [
  "birth",
  "milestone",
  "achievement",
  "family",
  "career",
  "travel",
  "memory",
  "other",
]);
export const timelineCategoryKeyEnum = pgEnum("timeline_category_key", [
  "education",
  "work",
  "family",
  "accomplishments",
  "travel",
  "personal",
  "faith",
  "military",
  "pets",
]);
export const collaboratorStatusEnum = pgEnum("collaborator_status", [
  "pending",
  "active",
]);
export const questionTypeEnum = pgEnum("question_type", [
  "freeText",
  "dropdown",
  "date",
  "entityLink",
  "location",
  "multiSelect",
]);
export const cardSizeEnum = pgEnum("card_size", [
  "compact",
  "standard",
  "featured",
]);
export const cardMediaTypeEnum = pgEnum("card_media_type", [
  "photo",
  "audio",
  "song",
  "youtube",
]);
export const familyMemberCategoryEnum = pgEnum("family_member_category", [
  "ancestor",
  "lateral",
  "spouse",
  "descendant",
  "pet",
]);

// Users table for authentication
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").unique(),
    email: text("email"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    profileImageUrl: text("profile_image_url"),
    role: text("role").notNull().default("user"),
    isActive: boolean("is_active").notNull().default(true),
    username: text("username").unique(),
    passwordHash: text("password_hash"),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
    index("users_clerk_user_id_idx").on(table.clerkUserId),
  ]
);

// FinalSpaces table
export const finalSpaces = pgTable(
  "final_spaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    middleName: text("middle_name"),
    suffix: text("suffix"),
    nickname: text("nickname"),
    useNicknameOnly: boolean("use_nickname_only").notNull().default(false),
    birthDate: text("birth_date"),
    age: integer("age"),
    placeOfBirth: text("place_of_birth"),
    hometown: text("hometown"),
    bioText: text("bio_text"),
    educationEntries: jsonb("education_entries").default([]),
    lifeHighlights: text("life_highlights"),
    quotesJson: jsonb("quotes_json").default([]),
    youtubeLinks: jsonb("youtube_links").default([]),
    spotifyLinks: jsonb("spotify_links").default([]),
    socialLinks: jsonb("social_links").default({}),
    layoutJson: jsonb("layout_json").default({}),
    themeKey: text("theme_key").default("default"),
    templateId: uuid("template_id"),
    primaryMediaId: uuid("primary_media_id"),
    profilePictureId: uuid("profile_picture_id"),
    deathDate: text("death_date"),
    inMemoriam: boolean("in_memoriam").notNull().default(false),
    status: finalSpaceStatusEnum("status").notNull().default("published"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("final_spaces_owner_user_id_idx").on(table.ownerUserId),
    index("final_spaces_slug_idx").on(table.slug),
    index("final_spaces_status_idx").on(table.status),
  ]
);

// Media assets
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    type: mediaTypeEnum("type").notNull(),
    title: text("title"),
    originalName: text("original_name").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    storageKey: text("storage_key").notNull(),
    width: integer("width"),
    height: integer("height"),
    durationSec: integer("duration_sec"),
    extractedText: text("extracted_text"),
    status: mediaStatusEnum("status").notNull().default("ready"),
    addToMap: boolean("add_to_map").notNull().default(false),
    mapLocation: text("map_location"),
    mapLatitude: doublePrecision("map_latitude"),
    mapLongitude: doublePrecision("map_longitude"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("media_assets_final_space_id_idx").on(table.finalSpaceId),
    index("media_assets_type_idx").on(table.type),
  ]
);

// Comments
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    isHidden: boolean("is_hidden").notNull().default(false),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("ok"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("comments_final_space_id_idx").on(table.finalSpaceId)]
);

// Memorial Templates
export const memorialTemplates = pgTable(
  "memorial_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    category: templateCategoryEnum("category").notNull(),
    previewImageUrl: text("preview_image_url"),
    layoutJson: jsonb("layout_json").notNull().default({}),
    colorSchemeJson: jsonb("color_scheme_json").notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("memorial_templates_category_idx").on(table.category)]
);

// Media Albums for organizing photos and videos
export const mediaAlbums = pgTable(
  "media_albums",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    coverImageId: uuid("cover_image_id"),
    isHeaderCarousel: boolean("is_header_carousel").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("media_albums_final_space_id_idx").on(table.finalSpaceId)]
);

// Junction table for album media - using composite primary key
export const albumMedia = pgTable(
  "album_media",
  {
    albumId: uuid("album_id")
      .notNull()
      .references(() => mediaAlbums.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    caption: text("caption"),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.albumId, table.mediaId] })]
);

// Timeline Categories
export const timelineCategories = pgTable("timeline_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: timelineCategoryKeyEnum("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  promptIntro: text("prompt_intro"),
  promptQuestions: jsonb("prompt_questions").default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Timeline Questions
export const timelineQuestions = pgTable(
  "timeline_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => timelineCategories.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    helpText: text("help_text"),
    type: questionTypeEnum("type").notNull().default("freeText"),
    optionSetKey: text("option_set_key"),
    fieldMapping: text("field_mapping"),
    isRequired: boolean("is_required").notNull().default(false),
    followUpQuestionId: uuid("follow_up_question_id"),
    branchCondition: jsonb("branch_condition"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("timeline_questions_category_id_idx").on(table.categoryId)]
);

// Timeline Question Option Sets
export const timelineOptionSets = pgTable("timeline_option_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Timeline Question Options
export const timelineQuestionOptions = pgTable(
  "timeline_question_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    optionSetId: uuid("option_set_id")
      .notNull()
      .references(() => timelineOptionSets.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    icon: text("icon"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("timeline_question_options_option_set_id_idx").on(table.optionSetId),
  ]
);

// Timeline Events for life milestones
export const timelineEvents = pgTable(
  "timeline_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => timelineCategories.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    organization: text("organization"),
    eventType: timelineEventTypeEnum("event_type").notNull(),
    eventMonth: integer("event_month"),
    eventDay: integer("event_day"),
    eventYear: integer("event_year"),
    endMonth: integer("end_month"),
    endDay: integer("end_day"),
    endYear: integer("end_year"),
    location: text("location"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    addToMap: boolean("add_to_map").notNull().default(false),
    mediaId: uuid("media_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublic: boolean("is_public").notNull().default(true),
    cardSize: cardSizeEnum("card_size").notNull().default("standard"),
    accentGradient: jsonb("accent_gradient"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("timeline_events_final_space_id_idx").on(table.finalSpaceId),
    index("timeline_events_category_id_idx").on(table.categoryId),
    index("timeline_events_event_type_idx").on(table.eventType),
  ]
);

// Timeline Event Media
export const timelineEventMedia = pgTable(
  "timeline_event_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timelineEventId: uuid("timeline_event_id")
      .notNull()
      .references(() => timelineEvents.id, { onDelete: "cascade" }),
    mediaType: cardMediaTypeEnum("media_type").notNull(),
    mediaAssetId: uuid("media_asset_id").references(() => mediaAssets.id, {
      onDelete: "cascade",
    }),
    spotifyTrackId: text("spotify_track_id"),
    youtubeUrl: text("youtube_url"),
    youtubeTitle: text("youtube_title"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("timeline_event_media_event_id_idx").on(table.timelineEventId),
  ]
);

// Guest Book Entries
export const guestBookEntries = pgTable(
  "guest_book_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    authorEmail: text("author_email"),
    relationship: text("relationship"),
    tributeTitle: text("tribute_title"),
    message: text("message").notNull(),
    mediaId: uuid("media_id"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    isApproved: boolean("is_approved").notNull().default(true),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("ok"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("guest_book_entries_final_space_id_idx").on(table.finalSpaceId),
  ]
);

// Media Comments
export const mediaComments = pgTable(
  "media_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    commentText: text("comment_text"),
    audioStorageKey: text("audio_storage_key"),
    audioFileName: text("audio_file_name"),
    audioSize: integer("audio_size"),
    audioDurationSec: integer("audio_duration_sec"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("media_comments_media_id_idx").on(table.mediaId)]
);

// Final Space Collaborators
export const finalSpaceCollaborators = pgTable(
  "final_space_collaborators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    finalSpaceLink: text("final_space_link"),
    collaboratorUserId: uuid("collaborator_user_id").references(
      () => users.id,
      { onDelete: "set null" }
    ),
    inviteToken: text("invite_token"),
    status: collaboratorStatusEnum("status").notNull().default("pending"),
    invitedByUserId: uuid("invited_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    invitedAt: timestamp("invited_at", { withTimezone: true }).defaultNow(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  },
  (table) => [
    index("final_space_collaborators_final_space_id_idx").on(
      table.finalSpaceId
    ),
    index("final_space_collaborators_email_idx").on(table.email),
    index("final_space_collaborators_token_idx").on(table.inviteToken),
  ]
);

// Rate Limit Events for IP-based throttling
export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ipAddress: text("ip_address").notNull(),
    action: text("action").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("rate_limit_events_ip_action_idx").on(
      table.ipAddress,
      table.action,
      table.createdAt
    ),
  ]
);

// Family Members
export const familyMembers = pgTable(
  "family_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    category: familyMemberCategoryEnum("category").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    nickname: text("nickname"),
    relationship: text("relationship").notNull(),
    photoUrl: text("photo_url"),
    photoStorageKey: text("photo_storage_key"),
    linkedFinalSpaceId: uuid("linked_final_space_id").references(
      () => finalSpaces.id,
      { onDelete: "set null" }
    ),
    parentMemberId: uuid("parent_member_id"),
    generationLevel: integer("generation_level").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("family_members_final_space_id_idx").on(table.finalSpaceId),
    index("family_members_category_idx").on(table.category),
    index("family_members_linked_final_space_idx").on(table.linkedFinalSpaceId),
  ]
);

// Pet Memorials
export const petMemorials = pgTable(
  "pet_memorials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    species: text("species"),
    breed: text("breed"),
    birthDate: text("birth_date"),
    deathDate: text("death_date"),
    bio: text("bio"),
    profilePictureStorageKey: text("profile_picture_storage_key"),
    profilePictureUrl: text("profile_picture_url"),
    addToMap: boolean("add_to_map").notNull().default(false),
    mapLocation: text("map_location"),
    mapLatitude: doublePrecision("map_latitude"),
    mapLongitude: doublePrecision("map_longitude"),
    addGotPetToTimeline: boolean("add_got_pet_to_timeline")
      .notNull()
      .default(false),
    addPetPassedToTimeline: boolean("add_pet_passed_to_timeline")
      .notNull()
      .default(false),
    gotPetTimelineEventId: uuid("got_pet_timeline_event_id").references(
      () => timelineEvents.id,
      { onDelete: "set null" }
    ),
    petPassedTimelineEventId: uuid("pet_passed_timeline_event_id").references(
      () => timelineEvents.id,
      { onDelete: "set null" }
    ),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("pet_memorials_final_space_id_idx").on(table.finalSpaceId)]
);

// Pet Albums
export const petAlbums = pgTable(
  "pet_albums",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    petMemorialId: uuid("pet_memorial_id")
      .notNull()
      .references(() => petMemorials.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Photo Album"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("pet_albums_pet_memorial_id_idx").on(table.petMemorialId)]
);

// Pet Album Photos
export const petAlbumPhotos = pgTable(
  "pet_album_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    petAlbumId: uuid("pet_album_id")
      .notNull()
      .references(() => petAlbums.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    photoUrl: text("photo_url"),
    caption: text("caption"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("pet_album_photos_album_id_idx").on(table.petAlbumId)]
);

// Favorite Types
export const favoriteTypes = pgTable("favorite_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  namePlural: text("name_plural").notNull(),
  description: text("description"),
  icon: text("icon"),
  apiProvider: text("api_provider"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Memorial Favorites
export const memorialFavorites = pgTable(
  "memorial_favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    favoriteTypeId: uuid("favorite_type_id").references(
      () => favoriteTypes.id,
      { onDelete: "set null" }
    ),
    customTypeName: text("custom_type_name"),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    imageUrl: text("image_url"),
    externalUrl: text("external_url"),
    customLink: text("custom_link"),
    apiId: text("api_id"),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("memorial_favorites_final_space_id_idx").on(table.finalSpaceId),
    index("memorial_favorites_favorite_type_id_idx").on(table.favoriteTypeId),
  ]
);

// Connection Categories
export const connectionCategories = pgTable("connection_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  isSystemCategory: boolean("is_system_category").notNull().default(false),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// FinalSpace Category Selections
export const finalSpaceCategorySelections = pgTable(
  "final_space_category_selections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => connectionCategories.id, { onDelete: "cascade" }),
    customCategoryName: text("custom_category_name"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("final_space_category_selections_final_space_id_idx").on(
      table.finalSpaceId
    ),
  ]
);

// Placeholder Profiles
export const placeholderProfiles = pgTable(
  "placeholder_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    imageUrl: text("image_url"),
    birthDate: text("birth_date"),
    deathDate: text("death_date"),
    inMemoriam: boolean("in_memoriam").notNull().default(false),
    claimedByFinalSpaceId: uuid("claimed_by_final_space_id").references(
      () => finalSpaces.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("placeholder_profiles_created_by_user_id_idx").on(
      table.createdByUserId
    ),
  ]
);

// Profile Connections
export const profileConnections = pgTable(
  "profile_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    finalSpaceId: uuid("final_space_id")
      .notNull()
      .references(() => finalSpaces.id, { onDelete: "cascade" }),
    categorySelectionId: uuid("category_selection_id")
      .notNull()
      .references(() => finalSpaceCategorySelections.id, {
        onDelete: "cascade",
      }),
    linkedFinalSpaceId: uuid("linked_final_space_id").references(
      () => finalSpaces.id,
      { onDelete: "cascade" }
    ),
    placeholderProfileId: uuid("placeholder_profile_id").references(
      () => placeholderProfiles.id,
      { onDelete: "cascade" }
    ),
    displayOrder: integer("display_order").notNull().default(0),
    isTopDisplay: boolean("is_top_display").notNull().default(true),
    addToTimeline: boolean("add_to_timeline").notNull().default(false),
    timelineNote: text("timeline_note"),
    timelineDate: text("timeline_date"),
    linkedTimelineEventId: uuid("linked_timeline_event_id").references(
      () => timelineEvents.id,
      { onDelete: "set null" }
    ),
    addToMap: boolean("add_to_map").notNull().default(false),
    mapLocation: text("map_location"),
    mapLatitude: doublePrecision("map_latitude"),
    mapLongitude: doublePrecision("map_longitude"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("profile_connections_final_space_id_idx").on(table.finalSpaceId),
    index("profile_connections_category_selection_id_idx").on(
      table.categorySelectionId
    ),
  ]
);

export const schema = {
  users,
  finalSpaces,
  mediaAssets,
  comments,
  memorialTemplates,
  mediaAlbums,
  albumMedia,
  timelineCategories,
  timelineQuestions,
  timelineOptionSets,
  timelineQuestionOptions,
  timelineEvents,
  timelineEventMedia,
  guestBookEntries,
  mediaComments,
  finalSpaceCollaborators,
  rateLimitEvents,
  familyMembers,
  petMemorials,
  petAlbums,
  petAlbumPhotos,
  favoriteTypes,
  memorialFavorites,
  connectionCategories,
  finalSpaceCategorySelections,
  placeholderProfiles,
  profileConnections,
} as const;

// ==========================================
// RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  finalSpaces: many(finalSpaces),
  collaborations: many(finalSpaceCollaborators, {
    relationName: "collaboratorUser",
  }),
  invitedCollaborators: many(finalSpaceCollaborators, {
    relationName: "invitedBy",
  }),
}));

export const finalSpacesRelations = relations(finalSpaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [finalSpaces.ownerUserId],
    references: [users.id],
  }),
  template: one(memorialTemplates, {
    fields: [finalSpaces.templateId],
    references: [memorialTemplates.id],
  }),
  mediaAssets: many(mediaAssets),
  mediaAlbums: many(mediaAlbums),
  comments: many(comments),
  timelineEvents: many(timelineEvents),
  guestBookEntries: many(guestBookEntries),
  collaborators: many(finalSpaceCollaborators),
  familyMembers: many(familyMembers),
  petMemorials: many(petMemorials),
  memorialFavorites: many(memorialFavorites),
  categorySelections: many(finalSpaceCategorySelections),
  profileConnections: many(profileConnections),
}));

export const finalSpaceCollaboratorsRelations = relations(
  finalSpaceCollaborators,
  ({ one }) => ({
    finalSpace: one(finalSpaces, {
      fields: [finalSpaceCollaborators.finalSpaceId],
      references: [finalSpaces.id],
    }),
    collaboratorUser: one(users, {
      fields: [finalSpaceCollaborators.collaboratorUserId],
      references: [users.id],
      relationName: "collaboratorUser",
    }),
    invitedBy: one(users, {
      fields: [finalSpaceCollaborators.invitedByUserId],
      references: [users.id],
      relationName: "invitedBy",
    }),
  })
);

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  finalSpace: one(finalSpaces, {
    fields: [mediaAssets.finalSpaceId],
    references: [finalSpaces.id],
  }),
  mediaComments: many(mediaComments),
  albumMedia: many(albumMedia),
}));

export const mediaCommentsRelations = relations(mediaComments, ({ one }) => ({
  media: one(mediaAssets, {
    fields: [mediaComments.mediaId],
    references: [mediaAssets.id],
  }),
}));

export const memorialTemplatesRelations = relations(
  memorialTemplates,
  ({ many }) => ({
    finalSpaces: many(finalSpaces),
  })
);

export const mediaAlbumsRelations = relations(mediaAlbums, ({ one, many }) => ({
  finalSpace: one(finalSpaces, {
    fields: [mediaAlbums.finalSpaceId],
    references: [finalSpaces.id],
  }),
  coverImage: one(mediaAssets, {
    fields: [mediaAlbums.coverImageId],
    references: [mediaAssets.id],
  }),
  albumMedia: many(albumMedia),
}));

export const albumMediaRelations = relations(albumMedia, ({ one }) => ({
  album: one(mediaAlbums, {
    fields: [albumMedia.albumId],
    references: [mediaAlbums.id],
  }),
  media: one(mediaAssets, {
    fields: [albumMedia.mediaId],
    references: [mediaAssets.id],
  }),
}));

export const timelineCategoriesRelations = relations(
  timelineCategories,
  ({ many }) => ({
    events: many(timelineEvents),
    questions: many(timelineQuestions),
  })
);

export const timelineQuestionsRelations = relations(
  timelineQuestions,
  ({ one }) => ({
    category: one(timelineCategories, {
      fields: [timelineQuestions.categoryId],
      references: [timelineCategories.id],
    }),
  })
);

export const timelineOptionSetsRelations = relations(
  timelineOptionSets,
  ({ many }) => ({
    options: many(timelineQuestionOptions),
  })
);

export const timelineQuestionOptionsRelations = relations(
  timelineQuestionOptions,
  ({ one }) => ({
    optionSet: one(timelineOptionSets, {
      fields: [timelineQuestionOptions.optionSetId],
      references: [timelineOptionSets.id],
    }),
  })
);

export const timelineEventsRelations = relations(
  timelineEvents,
  ({ one, many }) => ({
    finalSpace: one(finalSpaces, {
      fields: [timelineEvents.finalSpaceId],
      references: [finalSpaces.id],
    }),
    category: one(timelineCategories, {
      fields: [timelineEvents.categoryId],
      references: [timelineCategories.id],
    }),
    media: one(mediaAssets, {
      fields: [timelineEvents.mediaId],
      references: [mediaAssets.id],
    }),
    eventMedia: many(timelineEventMedia),
  })
);

export const timelineEventMediaRelations = relations(
  timelineEventMedia,
  ({ one }) => ({
    timelineEvent: one(timelineEvents, {
      fields: [timelineEventMedia.timelineEventId],
      references: [timelineEvents.id],
    }),
    mediaAsset: one(mediaAssets, {
      fields: [timelineEventMedia.mediaAssetId],
      references: [mediaAssets.id],
    }),
  })
);

export const guestBookEntriesRelations = relations(
  guestBookEntries,
  ({ one }) => ({
    finalSpace: one(finalSpaces, {
      fields: [guestBookEntries.finalSpaceId],
      references: [finalSpaces.id],
    }),
    media: one(mediaAssets, {
      fields: [guestBookEntries.mediaId],
      references: [mediaAssets.id],
    }),
  })
);

export const commentsRelations = relations(comments, ({ one }) => ({
  finalSpace: one(finalSpaces, {
    fields: [comments.finalSpaceId],
    references: [finalSpaces.id],
  }),
}));

export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  finalSpace: one(finalSpaces, {
    fields: [familyMembers.finalSpaceId],
    references: [finalSpaces.id],
  }),
  linkedFinalSpace: one(finalSpaces, {
    fields: [familyMembers.linkedFinalSpaceId],
    references: [finalSpaces.id],
  }),
}));

export const petMemorialsRelations = relations(
  petMemorials,
  ({ one, many }) => ({
    finalSpace: one(finalSpaces, {
      fields: [petMemorials.finalSpaceId],
      references: [finalSpaces.id],
    }),
    gotPetTimelineEvent: one(timelineEvents, {
      fields: [petMemorials.gotPetTimelineEventId],
      references: [timelineEvents.id],
    }),
    petPassedTimelineEvent: one(timelineEvents, {
      fields: [petMemorials.petPassedTimelineEventId],
      references: [timelineEvents.id],
    }),
    album: many(petAlbums),
  })
);

export const petAlbumsRelations = relations(petAlbums, ({ one, many }) => ({
  petMemorial: one(petMemorials, {
    fields: [petAlbums.petMemorialId],
    references: [petMemorials.id],
  }),
  photos: many(petAlbumPhotos),
}));

export const petAlbumPhotosRelations = relations(petAlbumPhotos, ({ one }) => ({
  album: one(petAlbums, {
    fields: [petAlbumPhotos.petAlbumId],
    references: [petAlbums.id],
  }),
}));

export const favoriteTypesRelations = relations(favoriteTypes, ({ many }) => ({
  favorites: many(memorialFavorites),
}));

export const memorialFavoritesRelations = relations(
  memorialFavorites,
  ({ one }) => ({
    finalSpace: one(finalSpaces, {
      fields: [memorialFavorites.finalSpaceId],
      references: [finalSpaces.id],
    }),
    favoriteType: one(favoriteTypes, {
      fields: [memorialFavorites.favoriteTypeId],
      references: [favoriteTypes.id],
    }),
  })
);

export const connectionCategoriesRelations = relations(
  connectionCategories,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [connectionCategories.createdByUserId],
      references: [users.id],
    }),
    selections: many(finalSpaceCategorySelections),
  })
);

export const finalSpaceCategorySelectionsRelations = relations(
  finalSpaceCategorySelections,
  ({ one, many }) => ({
    finalSpace: one(finalSpaces, {
      fields: [finalSpaceCategorySelections.finalSpaceId],
      references: [finalSpaces.id],
    }),
    category: one(connectionCategories, {
      fields: [finalSpaceCategorySelections.categoryId],
      references: [connectionCategories.id],
    }),
    connections: many(profileConnections),
  })
);

export const placeholderProfilesRelations = relations(
  placeholderProfiles,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [placeholderProfiles.createdByUserId],
      references: [users.id],
    }),
    claimedBy: one(finalSpaces, {
      fields: [placeholderProfiles.claimedByFinalSpaceId],
      references: [finalSpaces.id],
    }),
    connections: many(profileConnections),
  })
);

export const profileConnectionsRelations = relations(
  profileConnections,
  ({ one }) => ({
    finalSpace: one(finalSpaces, {
      fields: [profileConnections.finalSpaceId],
      references: [finalSpaces.id],
    }),
    categorySelection: one(finalSpaceCategorySelections, {
      fields: [profileConnections.categorySelectionId],
      references: [finalSpaceCategorySelections.id],
    }),
    linkedFinalSpace: one(finalSpaces, {
      fields: [profileConnections.linkedFinalSpaceId],
      references: [finalSpaces.id],
    }),
    placeholderProfile: one(placeholderProfiles, {
      fields: [profileConnections.placeholderProfileId],
      references: [placeholderProfiles.id],
    }),
    linkedTimelineEvent: one(timelineEvents, {
      fields: [profileConnections.linkedTimelineEventId],
      references: [timelineEvents.id],
    }),
  })
);

// ==========================================
// INSERT SCHEMAS
// ==========================================

export const insertFinalSpaceSchema = createInsertSchema(finalSpaces)
  .pick({
    name: true,
    firstName: true,
    lastName: true,
    middleName: true,
    suffix: true,
    nickname: true,
    useNicknameOnly: true,
    birthDate: true,
    deathDate: true,
    inMemoriam: true,
    age: true,
    placeOfBirth: true,
    hometown: true,
    bioText: true,
    educationEntries: true,
    lifeHighlights: true,
    quotesJson: true,
    youtubeLinks: true,
    spotifyLinks: true,
    socialLinks: true,
    layoutJson: true,
    themeKey: true,
    primaryMediaId: true,
    profilePictureId: true,
    templateId: true,
  })
  .extend({
    name: z.string().min(1).max(100),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    middleName: z.string().max(50).optional(),
    suffix: z.string().max(10).optional(),
    nickname: z.string().max(50).optional(),
    useNicknameOnly: z.boolean().optional(),
    birthDate: z.string().optional(),
    deathDate: z.string().optional(),
    inMemoriam: z.boolean().optional(),
    age: z.number().int().min(0).max(150).optional(),
    placeOfBirth: z.string().max(200).optional(),
    hometown: z.string().max(200).optional(),
    bioText: z.string().max(20_000).optional(),
    educationEntries: z
      .array(
        z.object({
          institution: z.string().max(200),
          level: z.string(),
        })
      )
      .optional(),
    lifeHighlights: z.string().max(10_000).optional(),
    youtubeLinks: z
      .array(
        z.object({
          id: z.string().optional(),
          url: z.string().url(),
          title: z.string().optional(),
          thumbnailUrl: z.string().url().optional(),
          channelName: z.string().optional(),
          fetchedAt: z.string().optional(),
          staleAt: z.string().optional(),
        })
      )
      .max(10)
      .optional(),
    spotifyLinks: z
      .array(
        z.object({
          id: z.string().optional(),
          url: z.string().url(),
          title: z.string().optional(),
          type: z.enum(["track", "playlist", "album"]).optional(),
          spotifyId: z.string().optional(),
          trackId: z.string().optional(),
          artist: z.string().optional(),
          ownerName: z.string().optional(),
          albumName: z.string().optional(),
          albumArtUrl: z.string().optional(),
          previewUrl: z.string().nullable().optional(),
          durationMs: z.number().optional(),
          tracks: z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                artists: z.string(),
                albumName: z.string().optional(),
                albumArtUrl: z.string().optional(),
                previewUrl: z.string().nullable().optional(),
                durationMs: z.number().optional(),
              })
            )
            .optional(),
          sortOrder: z.number().optional(),
          fetchedAt: z.string().optional(),
          staleAt: z.string().optional(),
        })
      )
      .max(10)
      .optional(),
    socialLinks: z
      .object({
        pinterest: z.string().url().optional().or(z.literal("")),
        twitter: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
        facebook: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
      })
      .optional(),
    primaryMediaId: z.string().uuid().optional(),
  });

export const insertCommentSchema = createInsertSchema(comments)
  .pick({
    authorName: true,
    body: true,
  })
  .extend({
    authorName: z.string().min(1).max(100),
    body: z.string().min(2).max(2000),
  });

export const insertMemorialTemplateSchema = createInsertSchema(
  memorialTemplates
)
  .pick({
    name: true,
    description: true,
    category: true,
    layoutJson: true,
    colorSchemeJson: true,
  })
  .extend({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  });

export const insertMediaAlbumSchema = createInsertSchema(mediaAlbums)
  .pick({
    title: true,
    description: true,
    sortOrder: true,
  })
  .extend({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  });

export const insertTimelineCategorySchema = createInsertSchema(
  timelineCategories
)
  .pick({
    key: true,
    name: true,
    description: true,
    icon: true,
    color: true,
    promptIntro: true,
    promptQuestions: true,
    sortOrder: true,
    isActive: true,
  })
  .extend({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
    promptIntro: z.string().max(500).optional(),
    promptQuestions: z.array(z.string()).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  });

export const insertTimelineEventSchema = createInsertSchema(timelineEvents)
  .pick({
    categoryId: true,
    title: true,
    description: true,
    organization: true,
    eventType: true,
    eventMonth: true,
    eventDay: true,
    eventYear: true,
    endMonth: true,
    endDay: true,
    endYear: true,
    location: true,
    latitude: true,
    longitude: true,
    mediaId: true,
    sortOrder: true,
    isPublic: true,
    cardSize: true,
    accentGradient: true,
  })
  .extend({
    categoryId: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional().or(z.literal("")),
    organization: z.string().max(200).optional().or(z.literal("")),
    eventMonth: z.number().int().min(1).max(12).optional().nullable(),
    eventDay: z.number().int().min(1).max(31).optional().nullable(),
    eventYear: z.number().int().min(1900).max(2100).optional().nullable(),
    endMonth: z.number().int().min(1).max(12).optional().nullable(),
    endDay: z.number().int().min(1).max(31).optional().nullable(),
    endYear: z.number().int().min(1900).max(2100).optional().nullable(),
    location: z.string().max(200).optional().or(z.literal("")),
    mediaId: z.string().uuid().optional(),
    sortOrder: z.number().int().optional(),
    isPublic: z.boolean().optional(),
  });

export const insertTimelineQuestionSchema = createInsertSchema(
  timelineQuestions
)
  .pick({
    categoryId: true,
    prompt: true,
    helpText: true,
    type: true,
    optionSetKey: true,
    fieldMapping: true,
    isRequired: true,
    followUpQuestionId: true,
    branchCondition: true,
    sortOrder: true,
    isActive: true,
  })
  .extend({
    categoryId: z.string().uuid(),
    prompt: z.string().min(1).max(500),
    helpText: z.string().max(200).optional(),
    optionSetKey: z.string().max(100).optional(),
    fieldMapping: z.string().max(100).optional(),
    isRequired: z.boolean().optional(),
    followUpQuestionId: z.string().uuid().optional(),
    branchCondition: z.unknown().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  });

export const insertTimelineOptionSetSchema = createInsertSchema(
  timelineOptionSets
)
  .pick({
    key: true,
    name: true,
    description: true,
  })
  .extend({
    key: z.string().min(1).max(100),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  });

export const insertTimelineQuestionOptionSchema = createInsertSchema(
  timelineQuestionOptions
)
  .pick({
    optionSetId: true,
    label: true,
    value: true,
    icon: true,
    sortOrder: true,
    isActive: true,
  })
  .extend({
    optionSetId: z.string().uuid(),
    label: z.string().min(1).max(100),
    value: z.string().min(1).max(100),
    icon: z.string().max(50).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  });

export const insertTimelineEventMediaSchema = createInsertSchema(
  timelineEventMedia
)
  .pick({
    timelineEventId: true,
    mediaType: true,
    mediaAssetId: true,
    spotifyTrackId: true,
    youtubeUrl: true,
  })
  .extend({
    timelineEventId: z.string().uuid(),
    mediaType: z.enum(["photo", "audio", "song", "youtube"]),
    mediaAssetId: z.string().uuid().optional(),
    spotifyTrackId: z.string().optional(),
    youtubeUrl: z.string().url().optional(),
  });

export const insertGuestBookEntrySchema = createInsertSchema(guestBookEntries)
  .pick({
    authorName: true,
    authorEmail: true,
    relationship: true,
    tributeTitle: true,
    message: true,
    isAnonymous: true,
  })
  .extend({
    authorName: z.string().min(1).max(100),
    authorEmail: z.string().email().optional(),
    relationship: z.string().max(50).optional(),
    tributeTitle: z.string().max(100).optional(),
    message: z.string().min(2).max(5000),
  });

export const insertMediaCommentSchema = createInsertSchema(mediaComments)
  .pick({
    mediaId: true,
    authorName: true,
    commentText: true,
    audioStorageKey: true,
    audioFileName: true,
    audioSize: true,
    audioDurationSec: true,
  })
  .extend({
    mediaId: z.string().uuid(),
    authorName: z.string().min(1).max(100),
    commentText: z.string().max(2500).optional(),
    audioStorageKey: z.string().optional(),
    audioFileName: z.string().optional(),
    audioSize: z.number().int().max(5_000_000).optional(),
    audioDurationSec: z.number().int().max(120).optional(),
  });

export const insertCollaboratorSchema = createInsertSchema(
  finalSpaceCollaborators
)
  .pick({
    email: true,
    firstName: true,
    lastName: true,
    finalSpaceLink: true,
  })
  .extend({
    email: z.string().email().min(1),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    finalSpaceLink: z.string().url().optional().or(z.literal("")),
  });

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    passwordHash: true,
    firstName: true,
    lastName: true,
    isAdmin: true,
  })
  .extend({
    username: z.string().min(3).max(50),
    passwordHash: z.string().min(1),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    isAdmin: z.boolean().optional(),
  });

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  displayName: z.string().max(100).optional(),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers)
  .pick({
    category: true,
    firstName: true,
    lastName: true,
    nickname: true,
    relationship: true,
    photoUrl: true,
    photoStorageKey: true,
    linkedFinalSpaceId: true,
    parentMemberId: true,
    generationLevel: true,
    sortOrder: true,
  })
  .extend({
    category: z.enum(["ancestor", "lateral", "spouse", "descendant", "pet"]),
    firstName: z.string().min(1).max(100),
    lastName: z.string().max(100).optional(),
    nickname: z.string().max(100).optional(),
    relationship: z.string().min(1).max(100),
    photoUrl: z.string().url().optional().or(z.literal("")),
    photoStorageKey: z.string().optional(),
    linkedFinalSpaceId: z.string().uuid().optional(),
    parentMemberId: z.string().uuid().optional(),
    generationLevel: z.number().int().optional(),
    sortOrder: z.number().int().optional(),
  });

export const insertFavoriteTypeSchema = createInsertSchema(favoriteTypes).pick({
  key: true,
  name: true,
  namePlural: true,
  description: true,
  icon: true,
  apiProvider: true,
  sortOrder: true,
  isActive: true,
});

export const insertMemorialFavoriteSchema = createInsertSchema(
  memorialFavorites
).pick({
  finalSpaceId: true,
  favoriteTypeId: true,
  customTypeName: true,
  title: true,
  subtitle: true,
  imageUrl: true,
  externalUrl: true,
  customLink: true,
  apiId: true,
  notes: true,
  sortOrder: true,
});

export const insertConnectionCategorySchema = createInsertSchema(
  connectionCategories
).omit({ id: true, createdAt: true });
export const insertFinalSpaceCategorySelectionSchema = createInsertSchema(
  finalSpaceCategorySelections
).omit({ id: true, createdAt: true });
export const insertPlaceholderProfileSchema = createInsertSchema(
  placeholderProfiles
).omit({ id: true, createdAt: true });
export const insertProfileConnectionSchema = createInsertSchema(
  profileConnections
).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPetMemorialSchema = createInsertSchema(petMemorials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  gotPetTimelineEventId: true,
  petPassedTimelineEventId: true,
});

export const insertPetAlbumSchema = createInsertSchema(petAlbums).omit({
  id: true,
  createdAt: true,
});
export const insertPetAlbumPhotoSchema = createInsertSchema(
  petAlbumPhotos
).omit({ id: true, createdAt: true });

// ==========================================
// TYPE EXPORTS
// ==========================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertFinalSpace = z.infer<typeof insertFinalSpaceSchema>;
export type FinalSpace = typeof finalSpaces.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type MemorialTemplate = typeof memorialTemplates.$inferSelect;
export type InsertMemorialTemplate = z.infer<
  typeof insertMemorialTemplateSchema
>;
export type MediaAlbum = typeof mediaAlbums.$inferSelect;
export type InsertMediaAlbum = z.infer<typeof insertMediaAlbumSchema>;
export type AlbumMedia = typeof albumMedia.$inferSelect;
export type TimelineCategory = typeof timelineCategories.$inferSelect;
export type InsertTimelineCategory = z.infer<
  typeof insertTimelineCategorySchema
>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type GuestBookEntry = typeof guestBookEntries.$inferSelect;
export type InsertGuestBookEntry = z.infer<typeof insertGuestBookEntrySchema>;
export type MediaComment = typeof mediaComments.$inferSelect;
export type InsertMediaComment = z.infer<typeof insertMediaCommentSchema>;
export type FinalSpaceCollaborator =
  typeof finalSpaceCollaborators.$inferSelect;
export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;
export type TimelineQuestion = typeof timelineQuestions.$inferSelect;
export type InsertTimelineQuestion = z.infer<
  typeof insertTimelineQuestionSchema
>;
export type TimelineOptionSet = typeof timelineOptionSets.$inferSelect;
export type InsertTimelineOptionSet = z.infer<
  typeof insertTimelineOptionSetSchema
>;
export type TimelineQuestionOption =
  typeof timelineQuestionOptions.$inferSelect;
export type InsertTimelineQuestionOption = z.infer<
  typeof insertTimelineQuestionOptionSchema
>;
export type TimelineEventMedia = typeof timelineEventMedia.$inferSelect;
export type InsertTimelineEventMedia = z.infer<
  typeof insertTimelineEventMediaSchema
>;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type InsertPetMemorial = z.infer<typeof insertPetMemorialSchema>;
export type PetMemorial = typeof petMemorials.$inferSelect;
export type InsertPetAlbum = z.infer<typeof insertPetAlbumSchema>;
export type PetAlbum = typeof petAlbums.$inferSelect;
export type InsertPetAlbumPhoto = z.infer<typeof insertPetAlbumPhotoSchema>;
export type PetAlbumPhoto = typeof petAlbumPhotos.$inferSelect;
export type FavoriteType = typeof favoriteTypes.$inferSelect;
export type InsertFavoriteType = z.infer<typeof insertFavoriteTypeSchema>;
export type MemorialFavorite = typeof memorialFavorites.$inferSelect;
export type InsertMemorialFavorite = z.infer<
  typeof insertMemorialFavoriteSchema
>;
export type InsertConnectionCategory = z.infer<
  typeof insertConnectionCategorySchema
>;
export type ConnectionCategory = typeof connectionCategories.$inferSelect;
export type InsertFinalSpaceCategorySelection = z.infer<
  typeof insertFinalSpaceCategorySelectionSchema
>;
export type FinalSpaceCategorySelection =
  typeof finalSpaceCategorySelections.$inferSelect;
export type InsertPlaceholderProfile = z.infer<
  typeof insertPlaceholderProfileSchema
>;
export type PlaceholderProfile = typeof placeholderProfiles.$inferSelect;
export type InsertProfileConnection = z.infer<
  typeof insertProfileConnectionSchema
>;
export type ProfileConnection = typeof profileConnections.$inferSelect;

// View model for media items as exposed by API
export interface MediaItemDto {
  id: string;
  type: "image" | "video" | "document" | "audio";
  url: string;
  filename: string;
  title?: string | null;
  size: number;
  mime: string;
  isPrimary: boolean;
  isProfilePicture?: boolean;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function formatDisplayName(finalSpace: {
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  suffix?: string | null;
  nickname?: string | null;
  useNicknameOnly?: boolean | null;
  name?: string;
}): string {
  if (!(finalSpace.firstName || finalSpace.lastName)) {
    return finalSpace.name || "Unnamed";
  }

  const firstName = finalSpace.firstName || "";
  const lastName = finalSpace.lastName || "";
  const nickname = finalSpace.nickname;
  const suffix = finalSpace.suffix;

  let displayName: string;

  if (finalSpace.useNicknameOnly && nickname) {
    displayName = `${nickname} ${lastName}`.trim();
  } else if (nickname) {
    displayName = `${firstName} "${nickname}" ${lastName}`.trim();
  } else {
    displayName = `${firstName} ${lastName}`.trim();
  }

  if (suffix) {
    displayName = `${displayName}, ${suffix}`;
  }

  return displayName || finalSpace.name || "Unnamed";
}

export const suffixOptions = [
  { value: "Jr.", label: "Jr." },
  { value: "Sr.", label: "Sr." },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "V", label: "V" },
  { value: "Esq.", label: "Esq." },
  { value: "PhD", label: "PhD" },
  { value: "MD", label: "MD" },
  { value: "DDS", label: "DDS" },
];
