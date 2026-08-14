import * as migration_20260812_120926_initial from './20260812_120926_initial';
import * as migration_20260812_122813_schema from './20260812_122813_schema';
import * as migration_20260812_123554_disable_autosave from './20260812_123554_disable_autosave';
import * as migration_20260812_124532_media_source_url from './20260812_124532_media_source_url';
import * as migration_20260812_133338_home_page_global from './20260812_133338_home_page_global';
import * as migration_20260813_103323_homepage_sections from './20260813_103323_homepage_sections';
import * as migration_20260813_105800_testimonial_video from './20260813_105800_testimonial_video';
import * as migration_20260813_110246_founder_video_poster from './20260813_110246_founder_video_poster';
import * as migration_20260813_195642_home_hero_slides from './20260813_195642_home_hero_slides';
import * as migration_20260814_133006_add_spanish_locale from './20260814_133006_add_spanish_locale';

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
    name: '20260812_133338_home_page_global',
  },
  {
    up: migration_20260813_103323_homepage_sections.up,
    down: migration_20260813_103323_homepage_sections.down,
    name: '20260813_103323_homepage_sections',
  },
  {
    up: migration_20260813_105800_testimonial_video.up,
    down: migration_20260813_105800_testimonial_video.down,
    name: '20260813_105800_testimonial_video',
  },
  {
    up: migration_20260813_110246_founder_video_poster.up,
    down: migration_20260813_110246_founder_video_poster.down,
    name: '20260813_110246_founder_video_poster',
  },
  {
    up: migration_20260813_195642_home_hero_slides.up,
    down: migration_20260813_195642_home_hero_slides.down,
    name: '20260813_195642_home_hero_slides',
  },
  {
    up: migration_20260814_133006_add_spanish_locale.up,
    down: migration_20260814_133006_add_spanish_locale.down,
    name: '20260814_133006_add_spanish_locale'
  },
];
