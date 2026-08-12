import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "_properties_v_autosave_idx";
  DROP INDEX "_posts_v_autosave_idx";
  DROP INDEX "_pages_v_autosave_idx";
  ALTER TABLE "_properties_v" DROP COLUMN "autosave";
  ALTER TABLE "_posts_v" DROP COLUMN "autosave";
  ALTER TABLE "_pages_v" DROP COLUMN "autosave";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_properties_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "autosave" boolean;
  CREATE INDEX "_properties_v_autosave_idx" ON "_properties_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");`)
}
