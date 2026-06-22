/**
 * Utilitários de dinheiro. Trabalhamos em centavos (inteiros) internamente
 * e só convertemos para exibição/entrada nas bordas (UI).
 */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** Formata centavos como moeda brasileira, ex.: 123456 -> "R$ 1.234,56". */
export function formatBRL(cents: number): string {
  return BRL.format(cents / 100)
}

/** Formata centavos sem o símbolo, ex.: 123456 -> "1.234,56". */
export function formatAmount(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Converte um texto digitado pelo usuário (ex.: "1.234,56", "1234.56",
 * "1234,5", "12") em centavos inteiros. Retorna null se inválido.
 */
export function parseToCents(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Remove separador de milhar e normaliza vírgula decimal para ponto.
  let normalized = trimmed.replace(/\s/g, '')
  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  }

  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return null

  return Math.round(value * 100)
}
