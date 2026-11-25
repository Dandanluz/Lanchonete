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

const itensRoutes = Router()


itensRoutes.get('/', listItens)

itensRoutes.use(authMiddleware)

itensRoutes.get('/admin', listTodosItens)

itensRoutes.post('/', cadastrarItem)

itensRoutes.put('/:id', updateItem)

itensRoutes.patch('/:id/disponibilidade', atualizarDisponibilidade)

itensRoutes.delete('/:id', deleteItem)

export default itensRoutes
