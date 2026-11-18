import { Router } from 'express'

import {
    listAdmins,
    getAdmin,
    createAdmin,
    updateAdmin,
    deleteAdmin
} from '../controllers/adminsController.js'

import authMiddleware from '../middlewares/authMiddleware.js'

const router = Router()

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware)

router.get('/', listAdmins)

router.get('/:id', getAdmin)

router.post('/', createAdmin)

router.put('/:id', updateAdmin)

router.delete('/:id', deleteAdmin)

export default router
