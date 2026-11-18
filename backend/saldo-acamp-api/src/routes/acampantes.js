import { Router } from 'express'
import pool from '../config/database.js'

const router = Router()

router.post('/consultar', async (req, res) => {
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
})

export default router
