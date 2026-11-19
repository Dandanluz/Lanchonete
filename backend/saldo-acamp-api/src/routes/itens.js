
import { Router } from 'express'

import {
    listItens,
    listTodosItens,
    cadastrarItem,
    updateItem,
    atualizarDisponibilidade,
    deleteItem
} from '../controllers/itensController.js'

import authMiddleware from '../middlewares/authMiddleware.js'
import roleMiddleware from '../middlewares/roleMiddleware.js'

const router = Router()

// Rotas públicas
router.get('/', listItens)

// Rotas administrativas
router.get('/admin', authMiddleware, roleMiddleware('admin', 'superadmin'), listTodosItens)

router.post('/', authMiddleware, roleMiddleware('admin', 'superadmin'), cadastrarItem)

router.put('/:id', authMiddleware, roleMiddleware('admin', 'superadmin'), updateItem)

router.patch('/:id/disponibilidade', authMiddleware, roleMiddleware('admin', 'superadmin'), atualizarDisponibilidade)

router.delete('/:id', authMiddleware, roleMiddleware('admin', 'superadmin'), deleteItem)

export default router
