import mongoose from 'mongoose'

let connectionPromise = null

const connectDB = async () => {
    const uri = process.env.MONGODB_URI
    if (!uri) {
        throw new Error('MONGODB_URI is not configured.')
    }

    if (mongoose.connection.readyState === 1) {
        return
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(uri)
            .then(() => {
                console.log('MongoDB connected successfully')
            })
            .finally(() => {
                connectionPromise = null
            })
    }

    await connectionPromise
}

export default connectDB
