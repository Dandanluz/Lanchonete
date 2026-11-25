import 'dotenv/config'
import fs from 'node:fs'
import pool from './config/database.js'

const sql = fs.readFileSync(
    new URL('../database/schema.sql', import.meta.url),
    'utf8'
)

try {
    await pool.query(sql)
    console.log('Tabelas criadas com sucesso')
} finally {
    await pool.end()
}
