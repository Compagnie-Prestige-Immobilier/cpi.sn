import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_page_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_stats_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_founder_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar
  );
  
  CREATE TABLE "home_page_founder_highlights_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_value_props" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_page_value_props_locales" (
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "home_page" ADD COLUMN "founder_name" varchar;
  ALTER TABLE "home_page" ADD COLUMN "founder_portrait_id" integer;
  ALTER TABLE "home_page_locales" ADD COLUMN "founder_role" varchar;
  ALTER TABLE "home_page_locales" ADD COLUMN "founder_bio" jsonb;
  ALTER TABLE "home_page_stats" ADD CONSTRAINT "home_page_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_stats_locales" ADD CONSTRAINT "home_page_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_founder_highlights" ADD CONSTRAINT "home_page_founder_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_founder_highlights_locales" ADD CONSTRAINT "home_page_founder_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_founder_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_value_props" ADD CONSTRAINT "home_page_value_props_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_value_props_locales" ADD CONSTRAINT "home_page_value_props_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_value_props"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_stats_order_idx" ON "home_page_stats" USING btree ("_order");
  CREATE INDEX "home_page_stats_parent_id_idx" ON "home_page_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_page_stats_locales_locale_parent_id_unique" ON "home_page_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_founder_highlights_order_idx" ON "home_page_founder_highlights" USING btree ("_order");
  CREATE INDEX "home_page_founder_highlights_parent_id_idx" ON "home_page_founder_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_page_founder_highlights_locales_locale_parent_id_unique" ON "home_page_founder_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_value_props_order_idx" ON "home_page_value_props" USING btree ("_order");
  CREATE INDEX "home_page_value_props_parent_id_idx" ON "home_page_value_props" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_page_value_props_locales_locale_parent_id_unique" ON "home_page_value_props_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_founder_portrait_id_media_id_fk" FOREIGN KEY ("founder_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_page_founder_founder_portrait_idx" ON "home_page" USING btree ("founder_portrait_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_founder_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_founder_highlights_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_value_props" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_page_value_props_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_page_stats" CASCADE;
  DROP TABLE "home_page_stats_locales" CASCADE;
  DROP TABLE "home_page_founder_highlights" CASCADE;
  DROP TABLE "home_page_founder_highlights_locales" CASCADE;
  DROP TABLE "home_page_value_props" CASCADE;
  DROP TABLE "home_page_value_props_locales" CASCADE;
  ALTER TABLE "home_page" DROP CONSTRAINT "home_page_founder_portrait_id_media_id_fk";
  
  DROP INDEX "home_page_founder_founder_portrait_idx";
  ALTER TABLE "home_page" DROP COLUMN "founder_name";
  ALTER TABLE "home_page" DROP COLUMN "founder_portrait_id";
  ALTER TABLE "home_page_locales" DROP COLUMN "founder_role";
  ALTER TABLE "home_page_locales" DROP COLUMN "founder_bio";`)
}
