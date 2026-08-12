import * as migration_20260812_120926_initial from './20260812_120926_initial';

export const migrations = [
  {
    up: migration_20260812_120926_initial.up,
    down: migration_20260812_120926_initial.down,
    name: '20260812_120926_initial'
  },
];
