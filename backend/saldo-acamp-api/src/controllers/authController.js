import pool from '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
        const token = jwt.sign(
            { id: admin.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h', algorithm: 'HS256' }
        )

        // Não retorna o hash da senha
        return res.status(200).json({
            mensagem: 'Login realizado com sucesso',
            administrador: {
                id: admin.id,
                nome: admin.nome,
                email: admin.email
            },
            token
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
