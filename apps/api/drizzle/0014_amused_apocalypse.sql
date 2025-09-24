ALTER TABLE "event" ALTER COLUMN "location_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "coach_id" integer;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "min_age";--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "max_age";