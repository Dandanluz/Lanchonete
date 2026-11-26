import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import acampantesRoutes from './routes/acampantes.js'
import adminsRoutes from './routes/admins.js'
import authRoutes from './routes/auth.js'
import itensRoutes from './routes/itens.js'
import transacoesRoutes from './routes/transacoes.js'
import pool from './config/database.js'

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não definido no .env')
    process.exit(1)
}

// Limpa refresh tokens expirados há mais de 1 dia
setInterval(() => {
    pool.query(
        `DELETE FROM RefreshTokens WHERE expira_em < NOW() - INTERVAL '1 day'`
    ).catch(err => console.error('Erro limpando refresh tokens:', err))
}, 60 * 60 * 1000)

const app = express()

app.use(helmet())
app.use(express.json({ limit: '100kb' }))

const api = express.Router()

api.use('/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }))
api.use('/auth', authRoutes)
api.use('/admins', adminsRoutes)
api.use('/acampantes', acampantesRoutes)
api.use('/itens', itensRoutes)
api.use('/transacoes', transacoesRoutes)
api.get('/health', (_req, res) => res.json({ ok: true }))
api.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }))

app.use('/api', api)

// Produção: serve o front compilado (frontend/dist)
if (process.env.NODE_ENV === 'production') {
    const dist = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../../frontend/dist'
    )
    app.use(express.static(dist))
    app.get('/{*splat}', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

// Handler global de erros
app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ erro: 'Erro interno' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})