import { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { brl } from '../utils.js'
import { Aviso, btnPrimario, btnSecundario, campo } from '../ui.jsx'

export default function Venda() {
  const [acampantes, setAcampantes] = useState([])
  const [itens, setItens] = useState([])
  const [busca, setBusca] = useState('')
  const [acampante, setAcampante] = useState(null)
  const [item, setItem] = useState(null)
  const [qtd, setQtd] = useState(1)
  const [msg, setMsg] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    Promise.all([api('/acampantes'), api('/itens')])
      .then(([a, i]) => { setAcampantes(a); setItens(i) })
      .catch((e) => setMsg({ tipo: 'erro', texto: e.message }))
  }, [])

  const sugestoes = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return []
    const digitos = t.replace(/\D/g, '')
    return acampantes
      .filter((a) =>
        a.nome.toLowerCase().includes(t) ||
        (digitos && a.cpf.replace(/\D/g, '').includes(digitos)))
      .slice(0, 6)
  }, [busca, acampantes])

  const saldo = acampante ? Number(acampante.saldo) : 0
  const total = item ? Number(item.preco_centavos) * qtd : 0
  const semSaldo = !!acampante && !!item && total > saldo

  async function cobrar() {
    setEnviando(true)
    setMsg(null)
    try {
      // O Postgres devolve BIGINT como string, mas a API exige números inteiros
      const r = await api('/transacoes', {
        method: 'POST',
        body: { acampante_id: Number(acampante.id), item_id: Number(item.id), quantidade: qtd },
      })
      const novo = { ...acampante, saldo: r.saldo_atualizado }
      setAcampante(novo)
      setAcampantes((l) => l.map((a) => (a.id === novo.id ? novo : a)))
      setMsg({ tipo: 'ok', texto: `${qtd}× ${r.item} para ${r.acampante}: ${brl(r.total_centavos)}.` })
      setItem(null)
      setQtd(1)
    } catch (e) {
      setMsg({ tipo: 'erro', texto: e.message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Quem está comprando */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Quem está comprando</h2>

        {acampante ? (
          <div className="border-2 border-dashed border-pinho bg-papel p-5">
            <p className="text-lg font-semibold">{acampante.nome}</p>
            <p className="text-tinta-suave">{acampante.cpf}</p>
            <p className="mt-4 text-sm text-tinta-suave">Saldo disponível</p>
            <p className="text-5xl font-bold tabular-nums text-pinho">{brl(saldo)}</p>
            <button className="mt-4 text-sm font-semibold text-lago underline underline-offset-2"
              onClick={() => { setAcampante(null); setBusca(''); setMsg(null) }}>
              Trocar acampante
            </button>
          </div>
        ) : (
          <div>
            <input className={campo} placeholder="Nome ou CPF" value={busca}
              onChange={(e) => setBusca(e.target.value)} autoFocus />
            {busca.trim() && (
              <ul className="mt-1 divide-y divide-linha border border-linha bg-papel">
                {sugestoes.length === 0 && <li className="px-3 py-3 text-tinta-suave">Nenhum acampante encontrado.</li>}
                {sugestoes.map((a) => (
                  <li key={a.id}>
                    <button className="flex w-full items-center justify-between px-3 py-3 text-left hover:bg-fundo"
                      onClick={() => setAcampante(a)}>
                      <span className="font-medium">{a.nome}</span>
                      <span className="tabular-nums text-tinta-suave">{brl(a.saldo)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* O que está comprando */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">O que está comprando</h2>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {itens.map((i) => {
            const ativo = item?.id === i.id
            return (
              <button key={i.id} onClick={() => setItem(i)} aria-pressed={ativo}
                className={`min-h-20 border-2 p-3 text-left transition-colors ${
                  ativo ? 'border-pinho bg-pinho text-white' : 'border-linha bg-papel hover:border-pinho'}`}>
                <span className="block font-semibold">{i.nome}</span>
                <span className="tabular-nums">{brl(i.preco_centavos)}</span>
              </button>
            )
          })}
          {itens.length === 0 && <p className="col-span-full text-tinta-suave">Nenhum item disponível. Cadastre em Itens.</p>}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-medium">Quantidade</span>
          <button className={btnSecundario} onClick={() => setQtd((q) => Math.max(1, q - 1))} aria-label="Diminuir">−</button>
          <span className="w-8 text-center text-xl font-bold tabular-nums">{qtd}</span>
          <button className={btnSecundario} onClick={() => setQtd((q) => q + 1)} aria-label="Aumentar">+</button>
        </div>

        <Aviso tipo={msg?.tipo}>{msg?.texto}</Aviso>
        {semSaldo && <Aviso>Saldo insuficiente: faltam {brl(total - saldo)}.</Aviso>}

        <button className={`${btnPrimario} w-full py-4 text-lg`}
          disabled={!acampante || !item || semSaldo || enviando} onClick={cobrar}>
          {enviando ? 'Cobrando…' : item ? `Cobrar ${brl(total)}` : 'Escolha um item'}
        </button>
      </section>
    </div>
  )
}
