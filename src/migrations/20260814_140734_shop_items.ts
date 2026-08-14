import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_shop_items_kind" AS ENUM('terrain', 'service');
  CREATE TYPE "public"."enum_shop_items_action" AS ENUM('basket', 'portal');
  CREATE TABLE "shop_items_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "shop_items_tags_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "shop_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_shop_items_kind" DEFAULT 'terrain' NOT NULL,
  	"order" numeric DEFAULT 0,
  	"featured" boolean,
  	"image_id" integer,
  	"region" varchar,
  	"price" numeric,
  	"action" "enum_shop_items_action" DEFAULT 'basket' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "shop_items_locales" (
  	"title" varchar NOT NULL,
  	"place" varchar,
  	"surface" varchar,
  	"description" varchar,
  	"price_caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "shop_items_id" integer;
  ALTER TABLE "shop_items_tags" ADD CONSTRAINT "shop_items_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_items_tags_locales" ADD CONSTRAINT "shop_items_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_items_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_items" ADD CONSTRAINT "shop_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shop_items_locales" ADD CONSTRAINT "shop_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "shop_items_tags_order_idx" ON "shop_items_tags" USING btree ("_order");
  CREATE INDEX "shop_items_tags_parent_id_idx" ON "shop_items_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "shop_items_tags_locales_locale_parent_id_unique" ON "shop_items_tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "shop_items_image_idx" ON "shop_items" USING btree ("image_id");
  CREATE INDEX "shop_items_updated_at_idx" ON "shop_items" USING btree ("updated_at");
  CREATE INDEX "shop_items_created_at_idx" ON "shop_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "shop_items_locales_locale_parent_id_unique" ON "shop_items_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shop_items_fk" FOREIGN KEY ("shop_items_id") REFERENCES "public"."shop_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_shop_items_id_idx" ON "payload_locked_documents_rels" USING btree ("shop_items_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_items_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shop_items_tags_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shop_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shop_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shop_items_tags" CASCADE;
  DROP TABLE "shop_items_tags_locales" CASCADE;
  DROP TABLE "shop_items" CASCADE;
  DROP TABLE "shop_items_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_shop_items_fk";
  
  DROP INDEX "payload_locked_documents_rels_shop_items_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "shop_items_id";
  DROP TYPE "public"."enum_shop_items_kind";
  DROP TYPE "public"."enum_shop_items_action";`)
}
