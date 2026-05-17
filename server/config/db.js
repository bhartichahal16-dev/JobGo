import mongoose from "mongoose"

// Function to connect to the MongoDB database

const connectDB = async () => {

    mongoose.connection.on('connected',() => console.log('Database Connected'))


    let uri = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, '').replace(/\/$/, '')

    if (!uri.includes('/job-portal')) {
        uri = `${uri}/job-portal`
    }

    await mongoose.connect(uri)
}

export default connectDB