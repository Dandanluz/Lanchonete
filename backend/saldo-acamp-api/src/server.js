import express from 'express'
import 'dotenv/config'

import acampantesRoutes from './routes/acampantes.js'
import adminsRoutes from './routes/admins.js'
import authRoutes from './routes/auth.js'
import itensRoutes from './routes/itens.js'
import transacoesRoutes from './routes/transacoes.js'

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send("helou")
})
app.use('/auth', authRoutes)
app.use('/admins', adminsRoutes)
app.use('/acampantes', acampantesRoutes)
app.use('/itens', itensRoutes)
app.use('/transacoes', transacoesRoutes)

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})
