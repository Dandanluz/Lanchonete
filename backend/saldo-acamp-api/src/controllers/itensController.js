import pool from '../config/database.js'

// GET /itens
// Listar somente itens disponíveis
export async function listItens(req, res) {
    try {
        const result = await pool.query(
            `SELECT id, nome, preco_centavos
             FROM Itens
             WHERE disponivel = TRUE
             ORDER BY nome`
        )

        return res.json(result.rows)

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: 'Erro ao listar itens disponíveis'
        })
    }
}


// GET /itens/admin
// Listar todos os itens
export async function listTodosItens(req, res) {
    try {
        const result = await pool.query(
            `SELECT id, nome, preco_centavos, disponivel, criado_em
             FROM Itens
             ORDER BY nome`
        )

        return res.json(result.rows)

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: 'Erro ao listar itens'
        })
    }
}


// POST /itens
// Cadastrar item
export async function cadastrarItem(req, res) {
    try {
        const { nome, preco_centavos } = req.body

        if (!nome || typeof nome !== 'string' ||
            !Number.isSafeInteger(preco_centavos) ||
            preco_centavos < 0) {
            return res.status(400).json({
                erro: 'Informe um nome e um preço válido em centavos'
            })
        }

        const result = await pool.query(
            `INSERT INTO Itens (nome, preco_centavos)
             VALUES ($1, $2)
             RETURNING id, nome, preco_centavos, disponivel`,
            [nome.trim(), preco_centavos]
        )

        return res.status(201).json(result.rows[0])

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: 'Erro ao cadastrar item'
        })
    }
}


// PUT /itens/:id
// Atualizar nome e preço
export async function updateItem(req, res) {
    try {
        const { id } = req.params
        const { nome, preco_centavos } = req.body

        if (nome === undefined && preco_centavos === undefined) {
            return res.status(400).json({
                erro: 'Informe pelo menos um campo para atualizar'
            })
        }

        if (nome !== undefined &&
            (typeof nome !== 'string' || !nome.trim())) {
            return res.status(400).json({
                erro: 'Informe um nome válido'
            })
        }

        if (preco_centavos !== undefined &&
            (!Number.isSafeInteger(preco_centavos) || preco_centavos < 0)) {
            return res.status(400).json({
                erro: 'Informe um preço válido em centavos'
            })
        }

        const result = await pool.query(
            `UPDATE Itens
             SET nome = COALESCE($1, nome),
                 preco_centavos = COALESCE($2, preco_centavos)
             WHERE id = $3
             RETURNING id, nome, preco_centavos, disponivel`,
            [nome !== undefined ? nome.trim() : null,
             preco_centavos ?? null,
             id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Item não encontrado'
            })
        }

        return res.json(result.rows[0])

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: 'Erro ao atualizar item'
        })
    }
}


// PATCH /itens/:id/disponibilidade
// Ativar ou desativar item
export async function atualizarDisponibilidade(req, res) {
    try {
        const { id } = req.params
        const { disponivel } = req.body

        if (typeof disponivel !== 'boolean') {
            return res.status(400).json({
                erro: 'Informe uma disponibilidade válida (true ou false)'
            })
        }

        const result = await pool.query(
            `UPDATE Itens
             SET disponivel = $1
             WHERE id = $2
             RETURNING id, nome, disponivel`,
            [disponivel, id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Item não encontrado'
            })
        }

        return res.json(result.rows[0])

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: 'Erro ao atualizar disponibilidade'
        })
    }
}


// DELETE /itens/:id
// Excluir item sem histórico de transações
export async function deleteItem(req, res) {
    try {
        const { id } = req.params

        const result = await pool.query(
            `DELETE FROM Itens
             WHERE id = $1
             RETURNING id`,
            [id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
                erro: 'Item não encontrado'
            })
        }

        return res.status(204).send()

    } catch (error) {
        console.error(error)

        if (error.code === '23503') {
            return res.status(409).json({
                erro: 'Este item possui transações vinculadas e não pode ser excluído'
            })
        }

        return res.status(500).json({
            erro: 'Erro ao excluir item'
        })
    }
}
