import { createContext, useContext, useEffect, useState } from 'react'
import { api, aoExpirarSessao, limparTokens, salvarTokens, temSessao } from './api.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [carregando, setCarregando] = useState(temSessao())

  useEffect(() => {
    aoExpirarSessao(() => setAdmin(null))

    if (!temSessao()) return

    // Ao abrir o app com tokens salvos, confirma que a sessão ainda vale
    api('/auth/me')
      .then((d) => setAdmin(d.administrador))
      .catch(() => limparTokens())
      .finally(() => setCarregando(false))
  }, [])

  async function entrar(email, senha) {
    const d = await api('/auth/login', { method: 'POST', body: { email, senha }, auth: false })
    salvarTokens(d)
    setAdmin(d.administrador)
  }

  async function sair() {
    const refreshToken = localStorage.getItem('refreshToken')
    await api('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }).catch(() => {})
    limparTokens()
    setAdmin(null)
  }

  return <AuthCtx.Provider value={{ admin, carregando, entrar, sair }}>{children}</AuthCtx.Provider>
}
