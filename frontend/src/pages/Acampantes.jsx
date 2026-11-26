import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { brl, mascaraCpf, reaisParaCentavos } from '../utils.js'
import { Aviso, Rotulo, btnPrimario, campo } from '../ui.jsx'

function Linha({ a, aoAtualizar, aoErro }) {
  const [valor, setValor] = useState('')

  async function recarregar(e) {
    e.preventDefault()
    const centavos = reaisParaCentavos(valor)
    if (!(centavos > 0)) return aoErro('Informe um valor maior que zero.')
    try {
      const r = await api(`/acampantes/${a.id}/saldo`, { method: 'PATCH', body: { valor: centavos } })
      aoAtualizar({ ...a, saldo: r.saldo })
      setValor('')
    } catch (err) {
      aoErro(err.message)
    }
  }

  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">{a.nome}</p>
        <p className="text-sm text-tinta-suave">{mascaraCpf(a.cpf)}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-right text-lg font-bold tabular-nums">{brl(a.saldo)}</span>
        <form onSubmit={recarregar} className="flex gap-2">
          <input className={`${campo} w-24`} inputMode="decimal" placeholder="R$ 0,00"
            aria-label={`Valor da recarga de ${a.nome}`} value={valor} onChange={(e) => setValor(e.target.value)} />
          <button className={btnPrimario}>Recarregar</button>
        </form>
      </div>
    </li>
  )
}

export default function Acampantes() {
  const [lista, setLista] = useState([])
  const [busca, setBusca] = useState('')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [saldoInicial, setSaldoInicial] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    api('/acampantes').then(setLista).catch((e) => setErro(e.message))
  }, [])

  async function cadastrar(e) {
    e.preventDefault()
    setErro('')
    const saldo = saldoInicial ? reaisParaCentavos(saldoInicial) : 0
    if (Number.isNaN(saldo)) return setErro('Saldo inicial inválido.')
    try {
      const novo = await api('/acampantes', { method: 'POST', body: { nome: nome.trim(), cpf, saldo } })
      setLista((l) => [...l, { ...novo, cpf }].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNome(''); setCpf(''); setSaldoInicial('')
    } catch (err) {
      setErro(err.message)
    }
  }

  const t = busca.trim().toLowerCase()
  const visiveis = lista.filter((a) => a.nome.toLowerCase().includes(t) || a.cpf.includes(t))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Acampantes</h1>

      <form onSubmit={cadastrar} className="grid gap-3 border-y border-linha py-4 sm:grid-cols-[2fr_1.5fr_1fr_auto] sm:items-end">
        <Rotulo texto="Nome"><input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} required /></Rotulo>
        <Rotulo texto="CPF">
          <input className={campo} inputMode="numeric" placeholder="000.000.000-00" value={cpf}
            onChange={(e) => setCpf(mascaraCpf(e.target.value))} required />
        </Rotulo>
        <Rotulo texto="Saldo inicial">
          <input className={campo} inputMode="decimal" placeholder="R$ 0,00" value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)} />
        </Rotulo>
        <button className={btnPrimario}>Cadastrar</button>
      </form>

      <Aviso>{erro}</Aviso>

      <input className={campo} placeholder="Buscar por nome ou CPF" value={busca} onChange={(e) => setBusca(e.target.value)} />

      <ul className="divide-y divide-linha">
        {visiveis.map((a) => (
          <Linha key={a.id} a={a} aoErro={setErro}
            aoAtualizar={(novo) => setLista((l) => l.map((x) => (x.id === novo.id ? novo : x)))} />
        ))}
        {visiveis.length === 0 && <li className="py-4 text-tinta-suave">Nenhum acampante encontrado.</li>}
      </ul>
    </div>
  )
}
