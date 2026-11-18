
import express from 'express'
import acampantesRoutes from './routes/acampantes.js'

const app = express()

app.use(express.json())

app.use('/acampantes', acampantesRoutes)

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})
