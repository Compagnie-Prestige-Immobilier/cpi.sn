import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials_locales" ALTER COLUMN "quote" DROP NOT NULL;
  ALTER TABLE "testimonials" ADD COLUMN "video_url" varchar;
  ALTER TABLE "testimonials_locales" ADD COLUMN "role" varchar;
  ALTER TABLE "home_page" ADD COLUMN "founder_video_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials_locales" ALTER COLUMN "quote" SET NOT NULL;
  ALTER TABLE "testimonials" DROP COLUMN "video_url";
  ALTER TABLE "testimonials_locales" DROP COLUMN "role";
  ALTER TABLE "home_page" DROP COLUMN "founder_video_url";`)
}
