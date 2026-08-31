import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: { target: 'es2020' },
  test: {
    exclude: ['tests/e2e/**', 'node_modules/**']
  }
});
