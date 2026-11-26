import pool from '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

const REFRESH_DIAS = Number(process.env.REFRESH_EXPIRES_DAYS) || 7

const hashToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex')

function gerarAccessToken(adminId) {
    return jwt.sign(
        { id: adminId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m', algorithm: 'HS256' }
    )
}

// "executor" pode ser o pool ou um client de transação
async function criarRefreshToken(executor, adminId, familia = crypto.randomUUID()) {
    const token = crypto.randomBytes(48).toString('base64url')

    await executor.query(
        `INSERT INTO RefreshTokens (admin_id, token_hash, familia, expira_em)
         VALUES ($1, $2, $3, NOW() + make_interval(days => $4::int))`,
        [adminId, hashToken(token), familia, REFRESH_DIAS]
    )

    return token
}

// Hash falso usado quando o email não existe, para que o tempo de resposta
// seja parecido com o de um email existente (evita descobrir emails cadastrados)
const HASH_FALSO = await bcrypt.hash('senha-falsa', 12)

// POST /auth/login
export async function login(req, res) {
    try {
        const { email, senha } = req.body

        // Verifica se os campos foram preenchidos
        if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
            return res.status(400).json({
                erro: 'Informe email e senha'
            })
        }

        // Busca o administrador pelo email
        const resultado = await pool.query(
            `SELECT id, nome, email, senha_hash
             FROM Admins
             WHERE email = $1`,
            [email.trim().toLowerCase()]
        )

        const admin = resultado.rows[0]

        // Compara a senha informada com o hash do banco
        // (se o admin não existir, compara com o hash falso)
        const senhaValida = await bcrypt.compare(
            senha,
            admin ? admin.senha_hash : HASH_FALSO
        )

        if (!admin || !senhaValida) {
            return res.status(401).json({
                erro: 'Email ou senha incorretos'
            })
        }

        // Gera o token JWT
        const token = gerarAccessToken(admin.id)
        const refreshToken = await criarRefreshToken(pool, admin.id)

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso',
            administrador: { id: admin.id, nome: admin.nome, email: admin.email },
            token,
            refreshToken
        })

    } catch (error) {
        console.error('Erro no login:', error)

        return res.status(500).json({
            erro: 'Erro interno ao realizar login'
        })
    }
}

// GET /auth/me
export function getMe(req, res) {
    return res.status(200).json({
        administrador: req.admin
    })
}

// POST /auth/refresh
export async function refresh(req, res) {
    const { refreshToken } = req.body

    if (typeof refreshToken !== 'string' || !refreshToken) {
        return res.status(400).json({ erro: 'Informe o refreshToken' })
    }

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        const resultado = await client.query(
            `SELECT id, admin_id, familia, expira_em, revogado_em
             FROM RefreshTokens
             WHERE token_hash = $1
             FOR UPDATE`,
            [hashToken(refreshToken)]
        )

        const atual = resultado.rows[0]

        if (!atual) {
            await client.query('ROLLBACK')
            return res.status(401).json({ erro: 'Refresh token inválido' })
        }

        // Token já usado/revogado sendo reapresentado: possível roubo.
        // Revoga toda a família e obriga novo login.
        if (atual.revogado_em) {
            await client.query(
                `UPDATE RefreshTokens
                 SET revogado_em = NOW()
                 WHERE familia = $1 AND revogado_em IS NULL`,
                [atual.familia]
            )
            await client.query('COMMIT')
            return res.status(401).json({ erro: 'Refresh token inválido' })
        }

        if (new Date(atual.expira_em) <= new Date()) {
            await client.query('ROLLBACK')
            return res.status(401).json({ erro: 'Refresh token expirado' })
        }

        // Rotação: revoga o atual e emite um novo na mesma família
        await client.query(
            'UPDATE RefreshTokens SET revogado_em = NOW() WHERE id = $1',
            [atual.id]
        )

        const novoRefresh = await criarRefreshToken(client, atual.admin_id, atual.familia)

        await client.query('COMMIT')

        return res.status(200).json({
            token: gerarAccessToken(atual.admin_id),
            refreshToken: novoRefresh
        })

    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Erro no refresh:', error)
        return res.status(500).json({ erro: 'Erro interno ao renovar token' })
    } finally {
        client.release()
    }
}

// POST /auth/logout
export async function logout(req, res) {
    const { refreshToken } = req.body

    if (typeof refreshToken === 'string' && refreshToken) {
        await pool.query(
            `UPDATE RefreshTokens
             SET revogado_em = NOW()
             WHERE token_hash = $1 AND revogado_em IS NULL`,
            [hashToken(refreshToken)]
        )
    }

    // Sempre 204, para não revelar se o token existia
    return res.status(204).send()
}