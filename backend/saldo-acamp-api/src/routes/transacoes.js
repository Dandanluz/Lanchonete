
import { Router } from 'express'

import {
    realizarVenda,
    listTransacoes,
    historicoAcampante
} from '../controllers/transacoesController.js'

import authMiddleware from '../middlewares/authMiddleware.js'

const router = Router()

router.use(authMiddleware)

router.post('/', realizarVenda)

router.get('/', listTransacoes)

router.get('/acampante/:id', historicoAcampante)

export default router
