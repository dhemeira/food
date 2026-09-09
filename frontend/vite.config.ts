import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5050,
    allowedHosts: ['test.dhemeira.hu'],
  },
  resolve: {
    alias: {
      '~': import.meta.dirname + '/src',
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
});
