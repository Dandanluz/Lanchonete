import { useState } from 'react'
import { useAuth } from '../auth.jsx'
import { Aviso, Rotulo, btnPrimario, campo } from '../ui.jsx'

export default function Login() {
  const { entrar } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar(email, senha)
    } catch (err) {
      setErro(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 border-2 border-dashed border-pinho bg-papel p-6">
        <div>
          <h1 className="text-2xl font-bold text-pinho">Cantina do acampamento</h1>
          <p className="text-tinta-suave">Entre para registrar vendas e recargas.</p>
        </div>
        <Rotulo texto="Email">
          <input className={campo} type="email" autoComplete="username" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
        </Rotulo>
        <Rotulo texto="Senha">
          <input className={campo} type="password" autoComplete="current-password" value={senha}
            onChange={(e) => setSenha(e.target.value)} required />
        </Rotulo>
        <Aviso>{erro}</Aviso>
        <button className={`${btnPrimario} w-full`} disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
