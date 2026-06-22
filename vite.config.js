import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

const publicPageRewrite = {
  name: 'public-page-rewrite',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url.startsWith('/portfolio/') || req.url.startsWith('/review/')) {
        req.url = '/public.html'
      }
      next()
    })
  },
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:   'index.html',
        public: 'public.html',
      },
    },
  },
  plugins: [
    publicPageRewrite,
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3000000,
      },
    }),
  ],
})