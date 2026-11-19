import { Router } from 'express'

import {
    login,
    getMe
} from '../controllers/authController.js'

import authMiddleware from '../middlewares/authMiddleware.js'

const router = Router()

// Login: não precisa estar autenticado
router.post('/login', login)

// Dados do administrador: precisa estar autenticado
router.get('/me', authMiddleware, getMe)

export default router
