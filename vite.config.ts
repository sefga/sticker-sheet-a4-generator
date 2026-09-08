/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  test: {
    globals: true,
    environment: 'node',
  },
  server: {
    port: 3000,
    open: false,
  },
});
