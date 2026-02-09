CREATE TABLE "geocode_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_normalized" text NOT NULL,
	"display_name" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"provider" text DEFAULT 'nominatim' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "geocode_cache_query_normalized_unique" UNIQUE("query_normalized")
);
--> statement-breakpoint
CREATE TABLE "media_comment_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_comment_id" uuid NOT NULL,
	"reporter_user_id" uuid NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "media_comments" ADD COLUMN "author_user_id" uuid;--> statement-breakpoint
ALTER TABLE "media_comments" ADD COLUMN "moderation_status" "moderation_status" DEFAULT 'ok' NOT NULL;--> statement-breakpoint
ALTER TABLE "media_comments" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "media_comments" ADD COLUMN "report_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "media_comments" ADD COLUMN "flagged_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "media_comments" ADD COLUMN "flagged_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "media_comments" ADD COLUMN "edited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "media_comments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "media_comments" ADD COLUMN "deleted_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "media_comment_reports" ADD CONSTRAINT "media_comment_reports_media_comment_id_media_comments_id_fk" FOREIGN KEY ("media_comment_id") REFERENCES "public"."media_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_comment_reports" ADD CONSTRAINT "media_comment_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "geocode_cache_query_idx" ON "geocode_cache" USING btree ("query_normalized");--> statement-breakpoint
CREATE INDEX "media_comment_reports_comment_id_idx" ON "media_comment_reports" USING btree ("media_comment_id");--> statement-breakpoint
CREATE INDEX "media_comment_reports_reporter_user_id_idx" ON "media_comment_reports" USING btree ("reporter_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_comment_reports_unique_report_idx" ON "media_comment_reports" USING btree ("media_comment_id","reporter_user_id");--> statement-breakpoint
ALTER TABLE "media_comments" ADD CONSTRAINT "media_comments_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_comments" ADD CONSTRAINT "media_comments_flagged_by_user_id_users_id_fk" FOREIGN KEY ("flagged_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_comments" ADD CONSTRAINT "media_comments_deleted_by_user_id_users_id_fk" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_comments_author_user_id_idx" ON "media_comments" USING btree ("author_user_id");--> statement-breakpoint
CREATE INDEX "media_comments_moderation_status_idx" ON "media_comments" USING btree ("moderation_status");