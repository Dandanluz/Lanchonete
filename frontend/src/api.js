const BASE = '/api'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// ---- tokens ----------------------------------------------------------------
// Atenção: localStorage é simples, mas qualquer script da página consegue ler.
// Mantenha o frontend livre de bibliotecas duvidosas e nunca use dangerouslySetInnerHTML
// com dados vindos do banco.
export const temSessao = () => !!localStorage.getItem('refreshToken')

export function salvarTokens({ token, refreshToken }) {
  localStorage.setItem('token', token)
  localStorage.setItem('refreshToken', refreshToken)
}

export function limparTokens() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
}

let aoExpirar = () => {}
export const aoExpirarSessao = (fn) => { aoExpirar = fn }

// ---- refresh ---------------------------------------------------------------
// Uma única promessa compartilhada: se várias requisições recebem 401 ao mesmo
// tempo, só uma chama /auth/refresh. Isso é obrigatório com rotação de tokens,
// senão a segunda chamada reapresentaria um token já revogado e derrubaria a sessão.
let renovando = null

function renovar() {
  renovando ??= (async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('sem sessão')

    const r = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!r.ok) throw new Error('sessão expirada')

    salvarTokens(await r.json())
  })().finally(() => { renovando = null })

  return renovando
}

// ---- requisições -----------------------------------------------------------
export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const enviar = () =>
    fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(auth && localStorage.getItem('token') && {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

  let res = await enviar()

  // Access token expirou: renova uma vez e repete a requisição
  if (res.status === 401 && auth && temSessao()) {
    try {
      await renovar()
      res = await enviar()
    } catch {
      limparTokens()
      aoExpirar()
      throw new ApiError(401, 'Sessão expirada. Entre novamente.')
    }
  }

  if (res.status === 204) return null

  const dados = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, dados?.erro ?? 'Erro inesperado')
  return dados
}
