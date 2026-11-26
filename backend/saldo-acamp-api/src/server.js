import express from 'express'
import 'dotenv/config'

import acampantesRoutes from './routes/acampantes.js'
import adminsRoutes from './routes/admins.js'
import authRoutes from './routes/auth.js'
import itensRoutes from './routes/itens.js'
import transacoesRoutes from './routes/transacoes.js'
import pool from './config/database.js'

setInterval(() => {
    pool.query(
        `DELETE FROM RefreshTokens WHERE expira_em < NOW() - INTERVAL '1 day'`
    ).catch(err => console.error('Erro limpando refresh tokens:', err))
}, 60 * 60 * 1000)

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não definido no .env')
    process.exit(1)
}

const app = express()

app.use(express.json())


app.use('/auth', authRoutes)
app.use('/admins', adminsRoutes)
app.use('/acampantes', acampantesRoutes)
app.use('/itens', itensRoutes)
app.use('/transacoes', transacoesRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
