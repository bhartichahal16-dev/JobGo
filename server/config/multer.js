import multer from "multer"

// Memory storage works on localhost and Vercel (serverless has no persistent disk)
const upload = multer({ storage: multer.memoryStorage() })

export default upload
