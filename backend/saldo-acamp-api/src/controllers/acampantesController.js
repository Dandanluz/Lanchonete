import pool from '../config/database.js'

export async function consultarSaldo(req, res) {
    try {
        const { cpf } = req.body

        if (!cpf) {
            return res.status(400).json({
                erro: 'Informe o CPF'
            })
        }

        const resultado = await pool.query(
            `SELECT nome, saldo
             FROM Acampantes
             WHERE cpf = $1`,
            [cpf]
        )

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: 'Acampante não encontrado'
            })
        }

        return res.json(resultado.rows[0])

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: 'Erro ao consultar saldo'
        })
    }
}

export async function listAcampantes(req, res) {
    try {
        const result = await pool.query(
            `SELECT id, nome, cpf, saldo
            FROM Acampantes
            ORDER BY nome`
        )

        return res.json(result.rows)
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            erro: 'Erro ao listar acampantes'
        })
    }
}

export async function consultarAcampante(req, res) {
    try {
        const { id } = req.params

        const result = await pool.query(
            `SELECT id, nome, cpf, saldo
             FROM Acampantes
             WHERE id = $1`,
            [id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Acampante não encontrado'
            })
        }

        return res.json(result.rows[0])

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            erro: 'Erro ao buscar acampante'
        })
    }
}

export async function cadastrarAcampante(req, res) {
    try {
        const { nome, cpf, saldo } = req.body

        if (!nome || !cpf || !saldo) {
            return res.status(400).json({
                erro: 'Preencha todos os campos'
            })
        }

        const result = await pool.query(
            `INSERT INTO Acampantes (nome, cpf, saldo)
             VALUES ($1, $2, $3)
             RETURNING id, nome, saldo`,
            [nome, cpf, saldo]
        )

        return res.status(201).json(result.rows[0])

    } catch (error) {
        console.error(error)

        if (error.code === '23505') {
            return res.status(409).json({
                erro: 'Este cpf já está cadastrado'
            })
        }

        return res.status(500).json({
            erro: 'Erro ao cadastrar acampante'
        })
    }
}

export async function updateAcampante(req, res) {
    try {
        const { id } = req.params
        const { nome, saldo } = req.body

        const result = await pool.query(
            `UPDATE Acampantes
             SET nome = COALESCE($1, nome),
                 saldo = COALESCE($2, saldo)
             WHERE id = $3
             RETURNING id, nome, saldo`,
            [nome ?? null, saldo ?? null, id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Acampante não encontrado'
            })
        }

        return res.json(result.rows[0])

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            erro: 'Erro ao atualizar acampante'
        })
    }
}

export async function deleteAcampante(req, res) {
    try {
        const { id } = req.params

        const result = await pool.query(
            `DELETE FROM Acampantes
             WHERE id = $1
             RETURNING id`,
            [id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Acampante não encontrado'
            })
        }

        return res.status(204).send()

    } catch (error) {
        console.error(error)

        if (error.code === '23503') {
            return res.status(409).json({
                erro: 'Acampante possui transações vinculadas'
            })
        }

        return res.status(500).json({
            erro: 'Erro ao excluir acampante'
        })
    }
}

export async function adicionarSaldo(req, res) {
    try {
        const { id } = req.params
        const { valor } = req.body

        if (!Number.isInteger(valor) || valor <= 0) {
            return res.status(400).json({
                erro: 'Informe um valor válido em centavos'
            })
        }

        const result = await pool.query(
            `UPDATE Acampantes
             SET saldo = saldo + $1
             WHERE id = $2
             RETURNING id, nome, saldo`,
            [valor, id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Acampante não encontrado'
            })
        }

        return res.json(result.rows[0])

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: 'Erro ao adicionar saldo'
        })
    }
}