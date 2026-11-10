import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5050,
    strictPort: true,
    allowedHosts: ['test.dhemeira.hu'],
    fs: {
      allow: [resolve(import.meta.dirname, '..')],
    },
  },
  resolve: {
    alias: {
      '~': import.meta.dirname + '/src',
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', '@heroicons/react'],
  },
});
