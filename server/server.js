import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import "./config/instrument.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import {clerkWebhooks} from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from "./config/cloudinary.js";
import jobRoutes from './routes/jobRoutes.js'
import userRouter from './routes/userRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import { getClerkAuthorizedParties } from './utilis/clerkOrigins.js'

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let isReady = false

const initApp = async () => {
    if (isReady) return
    await connectDB()
    await connectCloudinary()
    isReady = true
}

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ['Content-Disposition', 'Content-Type'],
  })
)
app.use(async (req, res, next) => {
    try {
        await initApp()
        next()
    } catch (error) {
        console.error("Server init error:", error.message)
        res.status(500).json({ success: false, message: error.message })
    }
});
app.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks)
app.use(express.json());
if (process.env.VERCEL !== "1") {
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}
const clerkAuthorizedParties = getClerkAuthorizedParties()

app.use(
  clerkMiddleware({
    authorizedParties: clerkAuthorizedParties,
  })
)

// Routes
app.get("/", (req, res) => res.send("API Working"));
app.get("/debug-sentry", function mainHandler(req,res){
   throw new Error("My first Sentry error!");
});
app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users',userRouter)

Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500).json({ success: false, message: err.message || "Server error" })
})

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "1") {
    initApp().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
}

export default app
