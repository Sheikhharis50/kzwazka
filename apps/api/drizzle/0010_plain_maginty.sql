ALTER TABLE "event" RENAME COLUMN "event_date" TO "start_date";--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT "event_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT "event_location_id_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "location_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "min_age" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "max_age" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "opening_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "closing_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "event_type" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "group_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "amount";