import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Task Manager',
        short_name: 'TaskMgr',
        description: 'Manage your tasks efficiently, even offline!',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        swDest: 'dist/sw.js', // Must match build output folder
      },
    }),
  ],
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://task-master-backend-sand.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    outDir: 'dist', // Changed from 'dev-dist' to 'dist' for Vercel
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
