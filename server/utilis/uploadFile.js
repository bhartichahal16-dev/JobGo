import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { v2 as cloudinary } from "cloudinary"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const uploadsDir = path.join(__dirname, "..", "uploads")

const getBaseUrl = () => {
    if (process.env.SERVER_URL?.trim()) {
        return process.env.SERVER_URL.trim().replace(/\/$/, "")
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }
    return `http://localhost:${process.env.PORT || 5000}`
}

const uploadBuffer = (buffer, resourceType, cloudinaryOptions = {}) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType, ...cloudinaryOptions },
            (error, result) => {
                if (error) reject(error)
                else resolve(result.secure_url)
            }
        )
        stream.end(buffer)
    })

export const uploadFile = async (file, resourceType = "auto", cloudinaryOptions = {}) => {
    if (!file) {
        throw new Error("No file provided")
    }

    try {
        if (file.buffer) {
            return await uploadBuffer(file.buffer, resourceType, cloudinaryOptions)
        }

        if (file.path) {
            const result = await cloudinary.uploader.upload(file.path, {
                resource_type: resourceType,
                ...cloudinaryOptions,
            })
            return result.secure_url
        }

        throw new Error("Invalid file upload")
    } catch (error) {
        // Local dev fallback. Vercel must use Cloudinary (no persistent disk).
        if (!process.env.VERCEL && file.buffer) {
            console.warn("Cloudinary upload failed, using local storage:", error.message)
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true })
            }
            const filename = `${Date.now()}-${file.originalname || "upload"}`
            const filePath = path.join(uploadsDir, filename)
            fs.writeFileSync(filePath, file.buffer)
            return `${getBaseUrl()}/uploads/${encodeURIComponent(filename)}`
        }

        throw new Error(
            error.message || "File upload failed. Check Cloudinary keys in server environment variables."
        )
    }
}
