import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

export default async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization

        // Verifica se o cabeçalho Authorization existe
        if (!authHeader) {
            return res.status(401).json({
                erro: 'Token não informado'
            })
        }

        // Espera o formato: Bearer token
        const [tipo, token] = authHeader.split(' ')

        if (tipo !== 'Bearer' || !token) {
            return res.status(401).json({
                erro: 'Formato de token inválido'
            })
        }

        // Verifica se o JWT é válido
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        // Busca o administrador atualizado no banco
        const resultado = await pool.query(
            `SELECT id, nome, email
             FROM Admins
             WHERE id = $1`,
            [decoded.id]
        )

        if (resultado.rowCount === 0) {
            return res.status(401).json({
                erro: 'Administrador não encontrado'
            })
        }

        // Disponibiliza os dados para a próxima etapa
        req.admin = resultado.rows[0]

        return next()

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                erro: 'Token expirado'
            })
            }

            if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                erro: 'Token inválido'
            })
            }

            if (error.name === 'NotBeforeError') {
            return res.status(401).json({
                erro: 'Token ainda não é válido'
            })
        }

        console.error('Erro na autenticação:', error)

        return res.status(500).json({
            erro: 'Erro interno na autenticação'
        })
    }
}
