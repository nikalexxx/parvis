import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  esbuild: {
    charset: 'utf8',
  },
  server: {
    port: 3000,
  },
  build: {
    lib: {
      entry: ['src/index.ts'],
      fileName: (format, name) => `${name}${format === 'es' ? '' : '.cjs'}.js`,
      formats: ['es', 'cjs'],
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['html-tag-types', 'dot-tree-syntax'],
    },
    sourcemap: true,
  },
  plugins: [dts()],
});
