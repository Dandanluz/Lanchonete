import { Router } from 'express'

import {
    consultarSaldo,
    listAcampantes,
    consultarAcampante,
    cadastrarAcampante,
    deleteAcampante,
    adicionarSaldo
} from '../controllers/acampantesController.js'

import authMiddleware from '../middlewares/authMiddleware.js'


const routerAcampantes = Router()

routerAcampantes.use(authMiddleware)

routerAcampantes.post('/consultar', consultarSaldo)

routerAcampantes.get('/', listAcampantes)

routerAcampantes.get('/:id', consultarAcampante)

routerAcampantes.post('/', cadastrarAcampante)

routerAcampantes.delete('/:id', deleteAcampante)

routerAcampantes.patch('/:id/saldo', adicionarSaldo)

export default routerAcampantes
