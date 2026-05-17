import { v2 as cloudinary} from 'cloudinary'

const connectCloudinary = async () => {

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME?.trim(),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_SECRET_KEY?.trim(),
        secure: true,
    })

    try {
        await cloudinary.api.ping()
        console.log('Cloudinary connected')
    } catch (error) {
        console.warn(
            'Cloudinary not configured for uploads — check CLOUDINARY_* in server/.env.',
            'Files will save to server/uploads/ until fixed.',
            error.message
        )
    }
}

export default connectCloudinary