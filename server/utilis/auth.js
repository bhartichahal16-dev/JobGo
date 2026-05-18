import { getAuth } from '@clerk/express'
import { verifyToken } from '@clerk/backend'
import { getClerkAuthorizedParties } from './clerkOrigins.js'

export const getAuthUserId = async (req) => {
  const { userId } = getAuth(req)
  if (userId) return userId

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null

  try {
    const token = authHeader.slice(7).trim()
    const { data, errors } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: getClerkAuthorizedParties(),
    })

    if (errors?.length) {
      console.error('Clerk verifyToken:', errors[0]?.message || errors[0])
      return null
    }

    return data?.sub || null
  } catch (error) {
    console.error('Clerk verifyToken:', error.message)
    return null
  }
}
