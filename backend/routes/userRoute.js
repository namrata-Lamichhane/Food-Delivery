import express from 'express'
import { adminMiddleware } from '../middleware/auth.js'
import {
    loginUser,
    registerUser,
    getAdminSetupStatus,
    registerAdminAccount,
    registerFirstAdmin,
    getAdminAccounts,
    createAdminAccount,
    listUsers,
} from '../controllers/userController.js'

const userRouter = express.Router()

// POST /api/user/register  — create account (bcrypt + JWT)
userRouter.post('/register', registerUser)

// First-admin setup is public only while no administrator account exists.
userRouter.get('/admin-setup', getAdminSetupStatus)
userRouter.post('/admin-setup', registerFirstAdmin)
userRouter.post('/admin-signup', registerAdminAccount)

// Administrator account management is restricted to signed-in administrators.
userRouter.get('/admins', adminMiddleware, getAdminAccounts)
userRouter.post('/admins', adminMiddleware, createAdminAccount)

// POST /api/user/login  — sign in (bcrypt compare + JWT)
userRouter.post('/login', loginUser)

// GET /api/user/list  — admin protected: list registered customer accounts
userRouter.get('/list', adminMiddleware, listUsers)

export default userRouter
