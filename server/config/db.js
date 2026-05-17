import mongoose from "mongoose"

let isConnected = false

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return
    }

    mongoose.connection.on("connected", () => console.log("Database Connected"))

    let uri = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, "").replace(/\/$/, "")

    if (!uri) {
        throw new Error("MONGODB_URI is not set in environment variables")
    }

    if (!uri.includes("/job-portal")) {
        uri = `${uri}/job-portal`
    }

    await mongoose.connect(uri)
    isConnected = true
}

export default connectDB
