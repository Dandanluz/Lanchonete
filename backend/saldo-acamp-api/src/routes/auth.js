import { Router } from 'express'

import {
    login,
    getMe,
    refresh,
    logout
} from '../controllers/authController.js'

import authMiddleware from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', authMiddleware, getMe)

export default router
