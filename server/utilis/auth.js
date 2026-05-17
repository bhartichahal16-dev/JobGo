import { getAuth } from "@clerk/express"

export const getAuthUserId = (req) => {
    const { userId } = getAuth(req)
    return userId || null
}
