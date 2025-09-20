ALTER TABLE "children_group" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "children_group" CASCADE;--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_role_id_role_id_fk";
--> statement-breakpoint
ALTER TABLE "children" DROP CONSTRAINT "children_location_id_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "children" DROP CONSTRAINT "children_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "coach" DROP CONSTRAINT "coach_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "coach" DROP CONSTRAINT "coach_location_id_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "group" DROP CONSTRAINT "group_location_id_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "group" DROP CONSTRAINT "group_coach_id_coach_id_fk";
--> statement-breakpoint
ALTER TABLE "children_invoice" DROP CONSTRAINT "children_invoice_location_id_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "children_invoice" DROP CONSTRAINT "children_invoice_children_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "insurance" DROP CONSTRAINT "insurance_children_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "message" DROP CONSTRAINT "message_group_id_group_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_group_id_group_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_children_id_children_id_fk";
--> statement-breakpoint
ALTER TABLE "children_invoice" ALTER COLUMN "external_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "group_id" integer;--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "external_id" varchar(255);--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "external_id" varchar(255);--> statement-breakpoint
ALTER TABLE "group" ADD COLUMN "amount" integer;--> statement-breakpoint
ALTER TABLE "children_invoice" ADD COLUMN "group_id" integer;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach" ADD CONSTRAINT "coach_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach" ADD CONSTRAINT "coach_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children_invoice" ADD CONSTRAINT "children_invoice_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children_invoice" ADD CONSTRAINT "children_invoice_children_id_children_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance" ADD CONSTRAINT "insurance_children_id_children_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_children_id_children_id_fk" FOREIGN KEY ("children_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" DROP COLUMN "location_id";--> statement-breakpoint
ALTER TABLE "locations" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "locations" DROP COLUMN "external_id";--> statement-breakpoint
ALTER TABLE "children_invoice" DROP COLUMN "location_id";--> statement-breakpoint
ALTER TABLE "attendance" DROP COLUMN "group_id";