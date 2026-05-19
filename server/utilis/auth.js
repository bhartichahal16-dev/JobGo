import { getAuth } from '@clerk/express'
import { verifyToken } from '@clerk/backend'
import { getClerkAuthorizedParties } from './clerkOrigins.js'

const verifyClerkBearer = async (token) => {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    console.error('CLERK_SECRET_KEY is not set')
    return null
  }

  const parties = getClerkAuthorizedParties()

  const withParties = await verifyToken(token, {
    secretKey,
    ...(parties.length > 0 ? { authorizedParties: parties } : {}),
  })

  if (withParties.data?.sub) {
    return withParties.data.sub
  }

  if (withParties.errors?.length) {
    console.warn('Clerk verifyToken (parties):', withParties.errors[0]?.message)
  }

  const relaxed = await verifyToken(token, { secretKey })

  if (relaxed.data?.sub) {
    return relaxed.data.sub
  }

  if (relaxed.errors?.length) {
    console.error('Clerk verifyToken:', relaxed.errors[0]?.message)
  }

  return null
}

export const getAuthUserId = async (req) => {
  const { userId } = getAuth(req)
  if (userId) return userId

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null

  try {
    const token = authHeader.slice(7).trim()
    return await verifyClerkBearer(token)
  } catch (error) {
    console.error('Clerk verifyToken:', error.message)
    return null
  }
}
