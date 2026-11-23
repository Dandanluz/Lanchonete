import 'dotenv/config'
import bcrypt from 'bcrypt'
import pool from './config/database.js'

const [nome, email, senha] = process.argv.slice(2)

if (!nome || !email || !senha) {
  console.error('Uso: node src/criar-admin.js "Nome" "email" "senha"')
  process.exit(1)
}

try {
  const senhaHash = await bcrypt.hash(senha, 12)

  const result = await pool.query(
    `INSERT INTO Admins (nome, email, senha_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nome, email`,
    [nome, email.trim().toLowerCase(), senhaHash]
  )

  console.log(result.rows[0])
} finally {
  await pool.end()
}