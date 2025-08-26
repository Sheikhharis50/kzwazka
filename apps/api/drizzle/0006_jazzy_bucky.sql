ALTER TABLE "user" ALTER COLUMN "last_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "children" DROP COLUMN "photo_url";