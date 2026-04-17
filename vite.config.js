import { defineConfig } from 'vite'

/** Mirror vercel.json rewrites so /features and /how work in local dev. */
export default defineConfig({
  plugins: [
    {
      name: 'landing-subroutes',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const pathOnly = (req.url || '').split('?')[0]
          if (
            pathOnly === '/features' ||
            pathOnly === '/features/' ||
            pathOnly === '/how' ||
            pathOnly === '/how/' ||
            pathOnly === '/signup' ||
            pathOnly === '/signup/' ||
            pathOnly === '/login' ||
            pathOnly === '/login/'
          ) {
            const q = (req.url || '').includes('?') ? '?' + req.url.split('?')[1] : ''
            let file = '/landing.html'
            if (pathOnly === '/signup' || pathOnly === '/signup/') file = '/signup.html'
            if (pathOnly === '/login' || pathOnly === '/login/') file = '/login.html'
            req.url = file + q
          }
          next()
        })
      }
    }
  ]
})
