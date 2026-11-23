import pool from '../config/database.js'

// POST /transacoes
// Realizar uma venda
export async function realizarVenda(req, res) {
    const client = await pool.connect()

    try {
        const { acampante_id, item_id, quantidade } = req.body

        // Validar os dados recebidos
        if (
            !Number.isSafeInteger(acampante_id) ||
            !Number.isSafeInteger(item_id) ||
            !Number.isSafeInteger(quantidade) ||
            acampante_id <= 0 ||
            item_id <= 0 ||
            quantidade <= 0
        ) {
            return res.status(400).json({
                erro: 'Informe acampante, item e quantidade válidos'
            })
        }

        // Inicia a transação SQL
        await client.query('BEGIN')

        // 1. Buscar acampante e bloquear sua linha
        const acampante = await client.query(
            `SELECT id, nome, saldo
             FROM Acampantes
             WHERE id = $1
             FOR UPDATE`,
            [acampante_id]
        )

        if (acampante.rowCount === 0) {
            await client.query('ROLLBACK')

            return res.status(404).json({
                erro: 'Acampante não encontrado'
            })
        }

        // 2. Buscar item e bloquear sua linha
        const item = await client.query(
            `SELECT id, nome, preco_centavos, disponivel
             FROM Itens
             WHERE id = $1
             FOR UPDATE`,
            [item_id]
        )

        if (item.rowCount === 0) {
            await client.query('ROLLBACK')

            return res.status(404).json({
                erro: 'Item não encontrado'
            })
        }

        if (!item.rows[0].disponivel) {
            await client.query('ROLLBACK')

            return res.status(400).json({
                erro: 'Este item não está disponível'
            })
        }

        // 3. Calcular o valor da compra
        const saldoAtual = BigInt(acampante.rows[0].saldo)
        const precoUnitario = BigInt(item.rows[0].preco_centavos)

        const total = precoUnitario * BigInt(quantidade)

        // 4. Verificar se existe saldo suficiente
        if (saldoAtual < total) {
            await client.query('ROLLBACK')

            return res.status(400).json({
                erro: 'Saldo insuficiente'
            })
        }

        // 5. Descontar o saldo do acampante
        const novoSaldo = saldoAtual - total

        await client.query(
            `UPDATE Acampantes
             SET saldo = $1
             WHERE id = $2`,
            [novoSaldo.toString(), acampante_id]
        )

        // 6. Registrar a transação
        const transacao = await client.query(
            `INSERT INTO Transacoes (
                acampante_id,
                item_id,
                admin_id,
                quantidade,
                preco_unitario_centavos
             )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, acampante_id, item_id, admin_id,
                       quantidade, preco_unitario_centavos,
                       data_transacao`,
            [
                acampante_id,
                item_id,
                req.admin.id,
                quantidade,
                precoUnitario.toString()
            ]
        )

        // 7. Confirma as operações
        await client.query('COMMIT')

        return res.status(201).json({
            mensagem: 'Venda realizada com sucesso',
            transacao: transacao.rows[0],
            item: item.rows[0].nome,
            acampante: acampante.rows[0].nome,
            total_centavos: total.toString(),
            saldo_atualizado: novoSaldo.toString()
        })

    } catch (error) {
        await client.query('ROLLBACK')

        console.error('Erro ao realizar venda:', error)

        return res.status(500).json({
            erro: 'Erro ao realizar venda'
        })

    } finally {
        client.release()
    }
}


// GET /transacoes
// Listar todas as transações
export async function listTransacoes(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                t.id,
                a.nome AS acampante,
                i.nome AS item,
                ad.nome AS administrador,
                t.quantidade,
                t.preco_unitario_centavos,
                t.data_transacao
             FROM Transacoes t
             INNER JOIN Acampantes a ON a.id = t.acampante_id
             INNER JOIN Itens i ON i.id = t.item_id
             INNER JOIN Admins ad ON ad.id = t.admin_id
             ORDER BY t.data_transacao DESC`
        )

        return res.json(result.rows)

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: 'Erro ao listar transações'
        })
    }
}


// GET /transacoes/acampante/:id
// Consultar histórico de compras de um acampante
export async function historicoAcampante(req, res) {
    try {
        const { id } = req.params

        const result = await pool.query(
            `SELECT
                t.id,
                i.nome AS item,
                ad.nome AS administrador,
                t.quantidade,
                t.preco_unitario_centavos,
                t.quantidade * t.preco_unitario_centavos AS total_centavos,
                t.data_transacao
             FROM Transacoes t
             INNER JOIN Itens i ON i.id = t.item_id
             INNER JOIN Admins ad ON ad.id = t.admin_id
             WHERE t.acampante_id = $1
             ORDER BY t.data_transacao DESC`,
            [id]
        )

        return res.json(result.rows)

    } catch (error) {
        console.error(error)

        return res.status(500).json({
            erro: 'Erro ao consultar histórico do acampante'
        })
    }
}
