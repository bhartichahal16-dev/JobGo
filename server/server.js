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
import {clerkMiddleware} from '@clerk/express'


// Initialize Express
const app = express();

// Connect to database
await connectDB()
await connectCloudinary()

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middlewares
app.use(cors());
// Clerk webhook must receive raw body for signature verification
app.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks)
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(clerkMiddleware())

// Routes
app.get("/", (req, res) => res.send("API Working"));
app.get("/debug-sentry", function mainHandler(req,res){
   throw new Error("My first Sentry error!");
});
app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users',userRouter)

// Port
const PORT = process.env.PORT || 5000;

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});