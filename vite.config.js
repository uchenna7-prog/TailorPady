import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

const PUBLIC_PATHS = new Set(['/', '/faq', '/contact', '/privacy', '/terms', '/refund', '/founder', '/delete-account'])

function isPublicPath(url) {
  const path = url.split('?')[0]
  return PUBLIC_PATHS.has(path) || path.startsWith('/portfolio/') || path.startsWith('/review/')
}

const publicPageRewrite = {
  name: 'public-page-rewrite',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.method !== 'GET' || !req.headers.accept?.includes('text/html')) {
        return next()
      }

      req.url = isPublicPath(req.url) ? '/index.html' : '/app.html'
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,jpg}'],
        maximumFileSizeToCacheInBytes: 3000000,
      },
    }),
  ],
})
