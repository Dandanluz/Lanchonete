// O Postgres devolve BIGINT como string ("1500"), então sempre passe por Number().
export const brl = (centavos) =>
  (Number(centavos) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// "12,50" -> 1250 | "1.250,50" -> 125050 | "12.5" -> 1250 | inválido -> NaN
export function reaisParaCentavos(texto) {
  const t = String(texto).trim()
  const normal = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t
  const n = Number(normal)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN
}

export const fmtData = (d) =>
  new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function mascaraCpf(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
