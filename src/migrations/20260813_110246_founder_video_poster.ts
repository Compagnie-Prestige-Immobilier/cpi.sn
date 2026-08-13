import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page" ADD COLUMN "founder_video_poster_id" integer;
  ALTER TABLE "home_page_locales" ADD COLUMN "founder_video_label" varchar;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_founder_video_poster_id_media_id_fk" FOREIGN KEY ("founder_video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_page_founder_founder_video_poster_idx" ON "home_page" USING btree ("founder_video_poster_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page" DROP CONSTRAINT "home_page_founder_video_poster_id_media_id_fk";
  
  DROP INDEX "home_page_founder_founder_video_poster_idx";
  ALTER TABLE "home_page" DROP COLUMN "founder_video_poster_id";
  ALTER TABLE "home_page_locales" DROP COLUMN "founder_video_label";`)
}
