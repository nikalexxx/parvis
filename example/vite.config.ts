import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    charset: 'utf8',
    jsxImportSource: 'parvis',
  },
  server: {
    port: 3000,
  },
});
