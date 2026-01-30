CREATE TYPE "public"."card_media_type" AS ENUM('photo', 'audio', 'song', 'youtube');--> statement-breakpoint
CREATE TYPE "public"."card_size" AS ENUM('compact', 'standard', 'featured');--> statement-breakpoint
CREATE TYPE "public"."collaborator_status" AS ENUM('pending', 'active');--> statement-breakpoint
CREATE TYPE "public"."family_member_category" AS ENUM('ancestor', 'lateral', 'spouse', 'descendant', 'pet');--> statement-breakpoint
CREATE TYPE "public"."final_space_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."media_status" AS ENUM('ready', 'processing', 'failed');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'doc');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('ok', 'flagged', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('freeText', 'dropdown', 'date', 'entityLink', 'location', 'multiSelect');--> statement-breakpoint
CREATE TYPE "public"."template_category" AS ENUM('elegant', 'modern', 'traditional', 'nature', 'minimalist');--> statement-breakpoint
CREATE TYPE "public"."timeline_category_key" AS ENUM('education', 'work', 'family', 'accomplishments', 'travel', 'personal', 'faith', 'military', 'pets');--> statement-breakpoint
CREATE TYPE "public"."timeline_event_type" AS ENUM('birth', 'milestone', 'achievement', 'family', 'career', 'travel', 'memory', 'other');--> statement-breakpoint
CREATE TABLE "album_media" (
	"album_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"caption" text,
	"added_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "album_media_album_id_media_id_pk" PRIMARY KEY("album_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'ok' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "connection_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"is_system_category" boolean DEFAULT false NOT NULL,
	"created_by_user_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"category" "family_member_category" NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"nickname" text,
	"relationship" text NOT NULL,
	"photo_url" text,
	"photo_storage_key" text,
	"linked_final_space_id" uuid,
	"parent_member_id" uuid,
	"generation_level" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "favorite_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"name_plural" text NOT NULL,
	"description" text,
	"icon" text,
	"api_provider" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "favorite_types_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "final_space_category_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"custom_category_name" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "final_space_collaborators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"final_space_link" text,
	"collaborator_user_id" uuid,
	"status" "collaborator_status" DEFAULT 'pending' NOT NULL,
	"invited_by_user_id" uuid,
	"invited_at" timestamp with time zone DEFAULT now(),
	"accepted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "final_spaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"middle_name" text,
	"suffix" text,
	"nickname" text,
	"use_nickname_only" boolean DEFAULT false NOT NULL,
	"birth_date" text,
	"age" integer,
	"place_of_birth" text,
	"hometown" text,
	"bio_text" text,
	"education_entries" jsonb DEFAULT '[]'::jsonb,
	"life_highlights" text,
	"quotes_json" jsonb DEFAULT '[]'::jsonb,
	"youtube_links" jsonb DEFAULT '[]'::jsonb,
	"spotify_links" jsonb DEFAULT '[]'::jsonb,
	"social_links" jsonb DEFAULT '{}'::jsonb,
	"layout_json" jsonb DEFAULT '{}'::jsonb,
	"theme_key" text DEFAULT 'default',
	"template_id" uuid,
	"primary_media_id" uuid,
	"profile_picture_id" uuid,
	"death_date" text,
	"in_memoriam" boolean DEFAULT false NOT NULL,
	"status" "final_space_status" DEFAULT 'published' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "final_spaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "guest_book_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"author_email" text,
	"relationship" text,
	"tribute_title" text,
	"message" text NOT NULL,
	"media_id" uuid,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'ok' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cover_image_id" uuid,
	"is_header_carousel" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"title" text,
	"original_name" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"storage_key" text NOT NULL,
	"width" integer,
	"height" integer,
	"duration_sec" integer,
	"extracted_text" text,
	"status" "media_status" DEFAULT 'ready' NOT NULL,
	"add_to_map" boolean DEFAULT false NOT NULL,
	"map_location" text,
	"map_latitude" double precision,
	"map_longitude" double precision,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"comment_text" text,
	"audio_storage_key" text,
	"audio_file_name" text,
	"audio_size" integer,
	"audio_duration_sec" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "memorial_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"favorite_type_id" uuid,
	"custom_type_name" text,
	"title" text NOT NULL,
	"subtitle" text,
	"image_url" text,
	"external_url" text,
	"custom_link" text,
	"api_id" text,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "memorial_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "template_category" NOT NULL,
	"preview_image_url" text,
	"layout_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"color_scheme_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pet_album_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_album_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"photo_url" text,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pet_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_memorial_id" uuid NOT NULL,
	"title" text DEFAULT 'Photo Album' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pet_memorials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"name" text NOT NULL,
	"species" text,
	"breed" text,
	"birth_date" text,
	"death_date" text,
	"bio" text,
	"profile_picture_storage_key" text,
	"profile_picture_url" text,
	"add_to_map" boolean DEFAULT false NOT NULL,
	"map_location" text,
	"map_latitude" double precision,
	"map_longitude" double precision,
	"add_got_pet_to_timeline" boolean DEFAULT false NOT NULL,
	"add_pet_passed_to_timeline" boolean DEFAULT false NOT NULL,
	"got_pet_timeline_event_id" uuid,
	"pet_passed_timeline_event_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "placeholder_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"image_url" text,
	"birth_date" text,
	"death_date" text,
	"in_memoriam" boolean DEFAULT false NOT NULL,
	"claimed_by_final_space_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"category_selection_id" uuid NOT NULL,
	"linked_final_space_id" uuid,
	"placeholder_profile_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_top_display" boolean DEFAULT true NOT NULL,
	"add_to_timeline" boolean DEFAULT false NOT NULL,
	"timeline_note" text,
	"timeline_date" text,
	"linked_timeline_event_id" uuid,
	"add_to_map" boolean DEFAULT false NOT NULL,
	"map_location" text,
	"map_latitude" double precision,
	"map_longitude" double precision,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeline_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" timeline_category_key NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"prompt_intro" text,
	"prompt_questions" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "timeline_categories_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "timeline_event_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timeline_event_id" uuid NOT NULL,
	"media_type" "card_media_type" NOT NULL,
	"media_asset_id" uuid,
	"spotify_track_id" text,
	"youtube_url" text,
	"youtube_title" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_space_id" uuid NOT NULL,
	"category_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"organization" text,
	"event_type" timeline_event_type NOT NULL,
	"event_month" integer,
	"event_day" integer,
	"event_year" integer,
	"end_month" integer,
	"end_day" integer,
	"end_year" integer,
	"location" text,
	"latitude" double precision,
	"longitude" double precision,
	"add_to_map" boolean DEFAULT false NOT NULL,
	"media_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"card_size" "card_size" DEFAULT 'standard' NOT NULL,
	"accent_gradient" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeline_option_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "timeline_option_sets_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "timeline_question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"option_set_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeline_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"help_text" text,
	"type" "question_type" DEFAULT 'freeText' NOT NULL,
	"option_set_key" text,
	"field_mapping" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"follow_up_question_id" uuid,
	"branch_condition" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text,
	"email" text,
	"first_name" text,
	"last_name" text,
	"profile_image_url" text,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"username" text,
	"password_hash" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "album_media" ADD CONSTRAINT "album_media_album_id_media_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."media_albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_media" ADD CONSTRAINT "album_media_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_categories" ADD CONSTRAINT "connection_categories_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_linked_final_space_id_final_spaces_id_fk" FOREIGN KEY ("linked_final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_space_category_selections" ADD CONSTRAINT "final_space_category_selections_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_space_category_selections" ADD CONSTRAINT "final_space_category_selections_category_id_connection_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."connection_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_space_collaborators" ADD CONSTRAINT "final_space_collaborators_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_space_collaborators" ADD CONSTRAINT "final_space_collaborators_collaborator_user_id_users_id_fk" FOREIGN KEY ("collaborator_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_space_collaborators" ADD CONSTRAINT "final_space_collaborators_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_spaces" ADD CONSTRAINT "final_spaces_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_book_entries" ADD CONSTRAINT "guest_book_entries_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_albums" ADD CONSTRAINT "media_albums_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_comments" ADD CONSTRAINT "media_comments_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorial_favorites" ADD CONSTRAINT "memorial_favorites_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorial_favorites" ADD CONSTRAINT "memorial_favorites_favorite_type_id_favorite_types_id_fk" FOREIGN KEY ("favorite_type_id") REFERENCES "public"."favorite_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_album_photos" ADD CONSTRAINT "pet_album_photos_pet_album_id_pet_albums_id_fk" FOREIGN KEY ("pet_album_id") REFERENCES "public"."pet_albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_albums" ADD CONSTRAINT "pet_albums_pet_memorial_id_pet_memorials_id_fk" FOREIGN KEY ("pet_memorial_id") REFERENCES "public"."pet_memorials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_memorials" ADD CONSTRAINT "pet_memorials_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_memorials" ADD CONSTRAINT "pet_memorials_got_pet_timeline_event_id_timeline_events_id_fk" FOREIGN KEY ("got_pet_timeline_event_id") REFERENCES "public"."timeline_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_memorials" ADD CONSTRAINT "pet_memorials_pet_passed_timeline_event_id_timeline_events_id_fk" FOREIGN KEY ("pet_passed_timeline_event_id") REFERENCES "public"."timeline_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placeholder_profiles" ADD CONSTRAINT "placeholder_profiles_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placeholder_profiles" ADD CONSTRAINT "placeholder_profiles_claimed_by_final_space_id_final_spaces_id_fk" FOREIGN KEY ("claimed_by_final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_connections" ADD CONSTRAINT "profile_connections_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_connections" ADD CONSTRAINT "profile_connections_category_selection_id_final_space_category_selections_id_fk" FOREIGN KEY ("category_selection_id") REFERENCES "public"."final_space_category_selections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_connections" ADD CONSTRAINT "profile_connections_linked_final_space_id_final_spaces_id_fk" FOREIGN KEY ("linked_final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_connections" ADD CONSTRAINT "profile_connections_placeholder_profile_id_placeholder_profiles_id_fk" FOREIGN KEY ("placeholder_profile_id") REFERENCES "public"."placeholder_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_connections" ADD CONSTRAINT "profile_connections_linked_timeline_event_id_timeline_events_id_fk" FOREIGN KEY ("linked_timeline_event_id") REFERENCES "public"."timeline_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_event_media" ADD CONSTRAINT "timeline_event_media_timeline_event_id_timeline_events_id_fk" FOREIGN KEY ("timeline_event_id") REFERENCES "public"."timeline_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_event_media" ADD CONSTRAINT "timeline_event_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_final_space_id_final_spaces_id_fk" FOREIGN KEY ("final_space_id") REFERENCES "public"."final_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_category_id_timeline_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."timeline_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_question_options" ADD CONSTRAINT "timeline_question_options_option_set_id_timeline_option_sets_id_fk" FOREIGN KEY ("option_set_id") REFERENCES "public"."timeline_option_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_questions" ADD CONSTRAINT "timeline_questions_category_id_timeline_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."timeline_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_final_space_id_idx" ON "comments" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "family_members_final_space_id_idx" ON "family_members" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "family_members_category_idx" ON "family_members" USING btree ("category");--> statement-breakpoint
CREATE INDEX "family_members_linked_final_space_idx" ON "family_members" USING btree ("linked_final_space_id");--> statement-breakpoint
CREATE INDEX "final_space_category_selections_final_space_id_idx" ON "final_space_category_selections" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "final_space_collaborators_final_space_id_idx" ON "final_space_collaborators" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "final_space_collaborators_email_idx" ON "final_space_collaborators" USING btree ("email");--> statement-breakpoint
CREATE INDEX "final_spaces_owner_user_id_idx" ON "final_spaces" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "final_spaces_slug_idx" ON "final_spaces" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "final_spaces_status_idx" ON "final_spaces" USING btree ("status");--> statement-breakpoint
CREATE INDEX "guest_book_entries_final_space_id_idx" ON "guest_book_entries" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "media_albums_final_space_id_idx" ON "media_albums" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "media_assets_final_space_id_idx" ON "media_assets" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "media_assets_type_idx" ON "media_assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "media_comments_media_id_idx" ON "media_comments" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "memorial_favorites_final_space_id_idx" ON "memorial_favorites" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "memorial_favorites_favorite_type_id_idx" ON "memorial_favorites" USING btree ("favorite_type_id");--> statement-breakpoint
CREATE INDEX "memorial_templates_category_idx" ON "memorial_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "pet_album_photos_album_id_idx" ON "pet_album_photos" USING btree ("pet_album_id");--> statement-breakpoint
CREATE INDEX "pet_albums_pet_memorial_id_idx" ON "pet_albums" USING btree ("pet_memorial_id");--> statement-breakpoint
CREATE INDEX "pet_memorials_final_space_id_idx" ON "pet_memorials" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "placeholder_profiles_created_by_user_id_idx" ON "placeholder_profiles" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "profile_connections_final_space_id_idx" ON "profile_connections" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "profile_connections_category_selection_id_idx" ON "profile_connections" USING btree ("category_selection_id");--> statement-breakpoint
CREATE INDEX "timeline_event_media_event_id_idx" ON "timeline_event_media" USING btree ("timeline_event_id");--> statement-breakpoint
CREATE INDEX "timeline_events_final_space_id_idx" ON "timeline_events" USING btree ("final_space_id");--> statement-breakpoint
CREATE INDEX "timeline_events_category_id_idx" ON "timeline_events" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "timeline_events_event_type_idx" ON "timeline_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "timeline_question_options_option_set_id_idx" ON "timeline_question_options" USING btree ("option_set_id");--> statement-breakpoint
CREATE INDEX "timeline_questions_category_id_idx" ON "timeline_questions" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");