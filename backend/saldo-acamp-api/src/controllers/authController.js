import pool from '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// POST /auth/login
export async function login(req, res) {
    try {
        const { email, senha } = req.body

        // Verifica se os campos foram preenchidos
        if (!email || !senha) {
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

        if (resultado.rowCount === 0) {
            return res.status(401).json({
                erro: 'Email ou senha incorretos'
            })
        }

        const admin = resultado.rows[0]

        // Compara a senha informada com o hash do banco
        const senhaValida = await bcrypt.compare(
            senha,
            admin.senha_hash
        )

        if (!senhaValida) {
            return res.status(401).json({
                erro: 'Email ou senha incorretos'
            })
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: admin.id },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
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
