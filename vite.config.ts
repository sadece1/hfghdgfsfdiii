import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic'
    })
  ],
  base: '/',
  server: {
    port: 3000,
    open: true,
    https: process.env.NODE_ENV === 'production',
    // Optimize for faster development
    hmr: {
      overlay: false // Disable error overlay for faster HMR
    },
    headers: {
      // Security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': process.env.REACT_APP_CSP_POLICY || "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data: blob:; img-src 'self' data: https: blob:; connect-src 'self' https:;"
    }
  },
  build: {
    // Performance optimizations
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-icons', 'swiper'],
          utils: ['zustand', 'crypto-js', 'bcryptjs'],
          helmet: ['react-helmet-async']
        },
        // Optimize chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // External dependencies that shouldn't be bundled
      external: []
    },
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    // Enable compression
    reportCompressedSize: true,
    // Optimize CSS
    cssCodeSplit: true
  },
  define: {
    // Remove console logs in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // Optimize React
    __DEV__: process.env.NODE_ENV === 'development'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async',
      'zustand'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // CSS optimization
  css: {
    devSourcemap: false
  }
})