import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

const PUBLIC_PATHS = ['/', '/faq', '/contact', '/privacy', '/terms', '/refund', '/founder']

const publicPageRewrite = {
  name: 'public-page-rewrite',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (
        PUBLIC_PATHS.includes(req.url) ||
        req.url.startsWith('/portfolio/') ||
        req.url.startsWith('/review/')
      ) {
        req.url = '/index.html'
      } else {
        req.url = '/app.html'
      }
      next()
    })
  },
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'app.html',
        public: 'index.html',
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
