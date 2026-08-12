import * as migration_20260812_120926_initial from './20260812_120926_initial';
import * as migration_20260812_122813_schema from './20260812_122813_schema';
import * as migration_20260812_123554_disable_autosave from './20260812_123554_disable_autosave';
import * as migration_20260812_124532_media_source_url from './20260812_124532_media_source_url';
import * as migration_20260812_133338_home_page_global from './20260812_133338_home_page_global';

export const migrations = [
  {
    up: migration_20260812_120926_initial.up,
    down: migration_20260812_120926_initial.down,
    name: '20260812_120926_initial',
  },
  {
    up: migration_20260812_122813_schema.up,
    down: migration_20260812_122813_schema.down,
    name: '20260812_122813_schema',
  },
  {
    up: migration_20260812_123554_disable_autosave.up,
    down: migration_20260812_123554_disable_autosave.down,
    name: '20260812_123554_disable_autosave',
  },
  {
    up: migration_20260812_124532_media_source_url.up,
    down: migration_20260812_124532_media_source_url.down,
    name: '20260812_124532_media_source_url',
  },
  {
    up: migration_20260812_133338_home_page_global.up,
    down: migration_20260812_133338_home_page_global.down,
    name: '20260812_133338_home_page_global'
  },
];
