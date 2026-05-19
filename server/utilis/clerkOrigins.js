/** Frontend origins allowed to send Clerk session tokens to this API */
export const getClerkAuthorizedParties = () => {
  const fromEnv = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.VITE_APP_URL,
    process.env.AUTHORIZED_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(',').map((s) => s.trim()))
    .filter(Boolean)

  const dev = ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000']

  const vercelDefaults = []
  if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
    if (process.env.CLIENT_URL?.trim()) {
      vercelDefaults.push(process.env.CLIENT_URL.trim())
    }
    vercelDefaults.push('https://job-go-client.vercel.app')
  }

  return [...new Set([...dev, ...fromEnv, ...vercelDefaults])]
}
