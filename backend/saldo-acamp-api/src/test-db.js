import pool from './config/database.js'

try {
    const result = await pool.query('SELECT NOW()')

    console.log('Conexão realizada com sucesso!')
    console.log('Horário do PostgreSQL:', result.rows[0].now)

} catch (error) {
    console.error('Erro na conexão:', error)

} finally {
    await pool.end()
}