/**
 * API base URL. VITE_BACKEND_URL is baked in at build time on Vercel.
 * If missing, infer from hostname so production still calls your server API.
 */
export const getBackendUrl = () => {
  const fromEnv = import.meta.env.VITE_BACKEND_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location

    if (hostname === 'job-go-client.vercel.app') {
      return 'https://job-go-server.vercel.app'
    }

    if (hostname.endsWith('.vercel.app')) {
      const guessed = hostname.replace('-client', '-server')
      if (guessed !== hostname) {
        return `${protocol}//${guessed}`
      }
    }
  }

  return 'http://localhost:5000'
}
