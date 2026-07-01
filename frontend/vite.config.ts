import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react';
            }

            if (id.includes('@tanstack/react-query') || id.includes('axios')) {
              return 'query';
            }

            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'motion';
            }

            if (
              id.includes('react-hook-form') ||
              id.includes('@hookform/resolvers') ||
              id.includes('zod')
            ) {
              return 'forms';
            }

            if (id.includes('date-fns')) {
              return 'dates';
            }
          }
        },
      },
    },
  },
})
