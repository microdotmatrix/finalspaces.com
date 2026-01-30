CREATE TABLE "rate_limit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "final_space_collaborators" ADD COLUMN "invite_token" text;--> statement-breakpoint
CREATE INDEX "rate_limit_events_ip_action_idx" ON "rate_limit_events" USING btree ("ip_address","action","created_at");--> statement-breakpoint
CREATE INDEX "final_space_collaborators_token_idx" ON "final_space_collaborators" USING btree ("invite_token");