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
        console.error('Server startup failed:', error.name)
        process.exitCode = 1
    }
}

startServer()
