import app from './server.js'
import connectDB from './config/db.js'

const port = process.env.PORT || 4000

const startServer = async () => {
    try {
        await connectDB()
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
    } catch (error) {
        const errorName = error instanceof Error ? error.name : 'UnknownError'
        const errorMessage = error instanceof Error ? error.message : String(error)
        const uri = process.env.MONGODB_URI
        const safeMessage = uri
            ? errorMessage.split(uri).join('[redacted MongoDB URI]')
            : errorMessage
        console.error('Server startup failed:', errorName, safeMessage)
        process.exitCode = 1
    }
}

startServer()
