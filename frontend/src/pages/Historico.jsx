import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { brl, fmtData } from '../utils.js'
import { Aviso, campo } from '../ui.jsx'

export default function Historico() {
  const [lista, setLista] = useState([])
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    api('/transacoes').then(setLista).catch((e) => setErro(e.message))
  }, [])

  const t = busca.trim().toLowerCase()
  const visiveis = lista.filter((x) => x.acampante.toLowerCase().includes(t) || x.item.toLowerCase().includes(t))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Histórico de vendas</h1>
      <Aviso>{erro}</Aviso>
      <input className={campo} placeholder="Filtrar por acampante ou item" value={busca} onChange={(e) => setBusca(e.target.value)} />

      <div className="overflow-x-auto">
        <table className="w-full min-w-xl text-left">
          <thead className="border-b-2 border-pinho text-sm text-tinta-suave">
            <tr>
              <th className="py-2 pr-3 font-medium">Quando</th>
              <th className="py-2 pr-3 font-medium">Acampante</th>
              <th className="py-2 pr-3 font-medium">Item</th>
              <th className="py-2 pr-3 text-right font-medium">Qtd</th>
              <th className="py-2 pr-3 text-right font-medium">Total</th>
              <th className="py-2 font-medium">Atendente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linha">
            {visiveis.map((x) => (
              <tr key={x.id}>
                <td className="py-2 pr-3 tabular-nums text-tinta-suave">{fmtData(x.data_transacao)}</td>
                <td className="py-2 pr-3 font-medium">{x.acampante}</td>
                <td className="py-2 pr-3">{x.item}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{x.quantidade}</td>
                <td className="py-2 pr-3 text-right font-semibold tabular-nums">{brl(Number(x.preco_unitario_centavos) * x.quantidade)}</td>
                <td className="py-2 text-tinta-suave">{x.administrador}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visiveis.length === 0 && <p className="py-4 text-tinta-suave">Nenhuma venda encontrada.</p>}
      </div>
    </div>
  )
}
