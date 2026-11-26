import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { brl, reaisParaCentavos } from '../utils.js'
import { Aviso, Rotulo, btnPrimario, btnSecundario, campo } from '../ui.jsx'

export default function Itens() {
  const [lista, setLista] = useState([])
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    api('/itens/admin').then(setLista).catch((e) => setErro(e.message))
  }, [])

  async function cadastrar(e) {
    e.preventDefault()
    setErro('')
    const centavos = reaisParaCentavos(preco)
    if (Number.isNaN(centavos)) return setErro('Preço inválido.')
    try {
      const novo = await api('/itens', { method: 'POST', body: { nome: nome.trim(), preco_centavos: centavos } })
      setLista((l) => [...l, novo].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNome(''); setPreco('')
    } catch (err) {
      setErro(err.message)
    }
  }

  async function alternar(i) {
    setErro('')
    try {
      const r = await api(`/itens/${i.id}/disponibilidade`, { method: 'PATCH', body: { disponivel: !i.disponivel } })
      setLista((l) => l.map((x) => (x.id === i.id ? { ...x, disponivel: r.disponivel } : x)))
    } catch (err) {
      setErro(err.message)
    }
  }

  async function excluir(i) {
    if (!confirm(`Excluir "${i.nome}"?`)) return
    setErro('')
    try {
      await api(`/itens/${i.id}`, { method: 'DELETE' })
      setLista((l) => l.filter((x) => x.id !== i.id))
    } catch (err) {
      setErro(err.message) // ex.: item com vendas não pode ser excluído; desative-o
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Itens</h1>

      <form onSubmit={cadastrar} className="grid gap-3 border-y border-linha py-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <Rotulo texto="Nome"><input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} required /></Rotulo>
        <Rotulo texto="Preço">
          <input className={campo} inputMode="decimal" placeholder="R$ 0,00" value={preco}
            onChange={(e) => setPreco(e.target.value)} required />
        </Rotulo>
        <button className={btnPrimario}>Cadastrar</button>
      </form>

      <Aviso>{erro}</Aviso>

      <ul className="divide-y divide-linha">
        {lista.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 py-3">
            <div className={i.disponivel ? '' : 'text-tinta-suave line-through'}>
              <p className="font-semibold">{i.nome}</p>
              <p className="tabular-nums">{brl(i.preco_centavos)}</p>
            </div>
            <div className="flex gap-2">
              <button className={btnSecundario} onClick={() => alternar(i)}>
                {i.disponivel ? 'Desativar' : 'Ativar'}
              </button>
              <button className={`${btnSecundario} text-brasa`} onClick={() => excluir(i)}>Excluir</button>
            </div>
          </li>
        ))}
        {lista.length === 0 && <li className="py-4 text-tinta-suave">Nenhum item cadastrado ainda.</li>}
      </ul>
    </div>
  )
}
