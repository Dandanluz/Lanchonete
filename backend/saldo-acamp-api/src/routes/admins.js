import { Router } from 'express'

import {
    listAdmins,
    getAdmin,
    createAdmin,
    updateAdmin,
    deleteAdmin
} from '../controllers/adminsController.js'

import authMiddleware from '../middlewares/authMiddleware.js'

const routerAdmins = Router()

routerAdmins.use(authMiddleware)

routerAdmins.get('/', listAdmins)

routerAdmins.get('/:id', getAdmin)

routerAdmins.post('/', createAdmin)

routerAdmins.put('/:id', updateAdmin)

routerAdmins.delete('/:id', deleteAdmin)

export default routerAdmins
