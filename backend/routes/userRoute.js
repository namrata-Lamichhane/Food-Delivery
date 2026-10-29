import express from 'express'
import { adminMiddleware } from '../middleware/auth.js'
import { loginUser, registerUser, listUsers } from '../controllers/userController.js'

const userRouter = express.Router()

// POST /api/user/register  — create account (bcrypt + JWT)
userRouter.post('/register', registerUser)

// POST /api/user/login  — sign in (bcrypt compare + JWT)
userRouter.post('/login', loginUser)

// GET /api/user/list  — admin protected: list registered customer accounts
userRouter.get('/list', adminMiddleware, listUsers)

export default userRouter
