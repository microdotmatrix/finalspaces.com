CREATE TYPE "public"."relationship_type" AS ENUM('parent', 'grandparent', 'great_grandparent', 'child', 'grandchild', 'great_grandchild', 'sibling', 'half_sibling', 'step_sibling', 'cousin', 'aunt_uncle', 'niece_nephew', 'spouse', 'ex_spouse', 'partner', 'parent_in_law', 'sibling_in_law', 'child_in_law', 'step_parent', 'step_child', 'godparent', 'godchild', 'other');--> statement-breakpoint
ALTER TABLE "family_members" ADD COLUMN "relationship_type" "relationship_type";--> statement-breakpoint
ALTER TABLE "family_members" ADD COLUMN "birth_year" integer;--> statement-breakpoint
ALTER TABLE "family_members" ADD COLUMN "death_year" integer;--> statement-breakpoint
CREATE INDEX "family_members_relationship_type_idx" ON "family_members" USING btree ("relationship_type");