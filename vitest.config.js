import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Only run tests inside the alakeifak __tests__ directory
    include: ['src/app/services/alakeifak/__tests__/**/*.test.{js,jsx}'],
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
