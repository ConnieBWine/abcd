import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'os', 'events', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: 'util',
      'ethers': 'ethers/lib/index.js'
    }
  },
  build: {
    rollupOptions: {
      external: ['@ethersproject/providers'],
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'events',
      'stream',
      'util',
      'crypto',
      'ethers'
    ],
    esbuildOptions: {
      target: 'esnext',
      supported: { 
        bigint: true 
      },
    }
  }
});