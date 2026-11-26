const base =
  'inline-flex items-center justify-center rounded-md px-4 py-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40'

export const btnPrimario = `${base} bg-pinho text-white hover:bg-pinho-escuro`
export const btnSecundario = `${base} border border-linha bg-papel text-tinta hover:bg-fundo`
export const campo =
  'w-full rounded-md border border-linha bg-papel px-3 py-2.5 text-tinta placeholder:text-tinta-suave'

export function Aviso({ tipo = 'erro', children }) {
  if (!children) return null
  const cor =
    tipo === 'ok'
      ? 'border-pinho bg-pinho/10 text-pinho-escuro'
      : 'border-brasa bg-brasa/10 text-brasa'
  return (
    <p role={tipo === 'erro' ? 'alert' : 'status'} className={`rounded-md border-l-4 px-3 py-2 ${cor}`}>
      {children}
    </p>
  )
}

export function Rotulo({ texto, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{texto}</span>
      {children}
    </label>
  )
}
