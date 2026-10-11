import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    testTimeout: 35000,
    hookTimeout: 35000,
  },
});
