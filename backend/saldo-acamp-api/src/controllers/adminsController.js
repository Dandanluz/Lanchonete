import pool from '../config/database.js'
import bcrypt from 'bcrypt'

// Listar administradores
export async function listAdmins(req, res) {
    try {
        const result = await pool.query(
            `SELECT id, nome, email, criado_em
             FROM Admins
             ORDER BY nome`
        )

        return res.json(result.rows)

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            erro: 'Erro ao listar administradores'
        })
    }
}

// Buscar administrador por ID
export async function getAdmin(req, res) {
    try {
        const { id } = req.params

        const result = await pool.query(
            `SELECT id, nome, email, criado_em
             FROM Admins
             WHERE id = $1`,
            [id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Administrador não encontrado'
            })
        }

        return res.json(result.rows[0])

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            erro: 'Erro ao buscar administrador'
        })
    }
}

// Cadastrar administrador
export async function createAdmin(req, res) {
    try {
        const { nome, email, senha } = req.body

        if (!nome || typeof email !== 'string' || !email.trim() || !senha) {
            return res.status(400).json({
                erro: 'Preencha todos os campos'
            })
        }

        const emailNormalizado = email.trim().toLowerCase()
        const senha_hash = await bcrypt.hash(senha, 12)

        const result = await pool.query(
            `INSERT INTO Admins (nome, email, senha_hash)
             VALUES ($1, $2, $3)
             RETURNING id, nome, email`,
            [nome, emailNormalizado, senha_hash]
        )

        return res.status(201).json(result.rows[0])

    } catch (error) {
        console.error(error)

        if (error.code === '23505') {
            return res.status(409).json({
                erro: 'Este email já está cadastrado'
            })
        }

        return res.status(500).json({
            erro: 'Erro ao cadastrar administrador'
        })
    }
}

// Atualizar administrador
export async function updateAdmin(req, res) {
    try {
        const { id } = req.params
        const { nome, email } = req.body
        const emailNormalizado =
            typeof email === 'string' ? email.trim().toLowerCase() : null

        const result = await pool.query(
            `UPDATE Admins
             SET nome = COALESCE($1, nome),
                 email = COALESCE($2, email)
             WHERE id = $3
             RETURNING id, nome, email`,
            [nome ?? null, emailNormalizado, id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Administrador não encontrado'
            })
        }

        return res.json(result.rows[0])

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            erro: 'Erro ao atualizar administrador'
        })
    }
}

// Excluir administrador
export async function deleteAdmin(req, res) {
    try {
        const { id } = req.params

        const result = await pool.query(
            `DELETE FROM Admins
             WHERE id = $1
             RETURNING id`,
            [id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Administrador não encontrado'
            })
        }

        return res.status(204).send()

    } catch (error) {
        console.error(error)

        if (error.code === '23503') {
            return res.status(409).json({
                erro: 'Administrador possui transações vinculadas'
            })
        }

        return res.status(500).json({
            erro: 'Erro ao excluir administrador'
        })
    }
}
