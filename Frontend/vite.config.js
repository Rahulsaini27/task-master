import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
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
        // Make sure to specify a destination for the sw.js
        swDest: 'dev-dist/sw.js', // Ensure this path is correct and matches your build folder
      },
    }),
  ],
  base: '/', 
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://task-manager-backend-ashen-nu.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    outDir: 'dev-dist', // Ensure the output directory is correct
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
