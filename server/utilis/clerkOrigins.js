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

  return [...new Set([...dev, ...fromEnv])]
}
