import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import manifest from './src/manifest'
import manifestFirefox from './src/manifest.firefox'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isFirefox = mode === 'firefox'

  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },

    plugins: [crx({ manifest: isFirefox ? manifestFirefox : manifest }), react(), nodePolyfills()],
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        port: 5173,
      },
    },
  }
})
