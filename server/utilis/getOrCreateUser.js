import { clerkClient } from "@clerk/express"
import User from "../models/User.js"

const getOrCreateUser = async (userId) => {
    if (!userId) {
        throw new Error("Unauthorized. Please login again.")
    }

    let user = await User.findById(userId)

    if (user) return user

    const clerkUser = await clerkClient.users.getUser(userId)

    const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        "User"

    const email = clerkUser.emailAddresses?.[0]?.emailAddress

    if (!email) {
        throw new Error("Unable to get user email from Clerk")
    }

    user = await User.create({
        _id: userId,
        name,
        email,
        image: clerkUser.imageUrl || "",
        resume: "",
    })

    return user
}

export default getOrCreateUser
