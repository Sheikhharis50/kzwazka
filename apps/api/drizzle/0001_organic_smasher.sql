-- 1. Drop FKs
ALTER TABLE "children" DROP CONSTRAINT "children_user_id_user_id_fk";
ALTER TABLE "children" DROP CONSTRAINT "children_location_id_locations_id_fk";

-- 2. Alter PKs and FKs
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE integer USING id::integer;
ALTER TABLE "user" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);

ALTER TABLE "children" ALTER COLUMN "id" SET DATA TYPE integer USING id::integer;
ALTER TABLE "children" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "children_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);

ALTER TABLE "children" ALTER COLUMN "user_id" SET DATA TYPE integer USING user_id::integer;
ALTER TABLE "children" ALTER COLUMN "location_id" SET DATA TYPE integer USING location_id::integer;

ALTER TABLE "locations" ALTER COLUMN "id" SET DATA TYPE integer USING id::integer;
ALTER TABLE "locations" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "locations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);

-- 3. Re-add FKs
ALTER TABLE "children" ADD CONSTRAINT "children_user_id_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;

ALTER TABLE "children" ADD CONSTRAINT "children_location_id_locations_id_fk"
  FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE;
