import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const uiRoot = resolve(import.meta.dirname, '../packages/ui');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5050,
    allowedHosts: ['test.dhemeira.hu'],
    fs: {
      allow: [resolve(import.meta.dirname, '..')],
    },
  },
  resolve: {
    alias: {
      '~': import.meta.dirname + '/src',
      '@dhemeira/ui': resolve(uiRoot, 'src/source.ts'),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
});
