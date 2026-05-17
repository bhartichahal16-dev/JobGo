import path from "path"
import { fileURLToPath } from "url"
import { v2 as cloudinary } from "cloudinary"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const uploadsDir = path.join(__dirname, "..", "uploads")

const getBaseUrl = () =>
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`

export const uploadFile = async (filePath, resourceType = "auto") => {
    const filename = path.basename(filePath)
    const localUrl = `${getBaseUrl()}/uploads/${encodeURIComponent(filename)}`

    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: resourceType,
        })
        return result.secure_url
    } catch (error) {
        // Cloudinary upload blocked or misconfigured — use local file (dev-friendly)
        console.warn("Cloudinary upload failed, using local storage:", error.message)
        return localUrl
    }
}
