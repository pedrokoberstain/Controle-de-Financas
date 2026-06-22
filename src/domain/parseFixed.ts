import { parseToCents } from './money'

export interface ParsedFixed {
  name: string
  amountCents: number
  dueDay: number | null
}

const MONEY_RE = /R\$\s*([\d.,]+)/
const BARE_MONEY_RE = /(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/
/** Captura "dia: 21", "dia 21", "venc 21", inclusive com asteriscos. */
const DAY_RE = /(?:dia|venc(?:imento)?)\s*:?\s*\*?\s*(\d{1,2})/i
/** Linhas a ignorar (totais, sobras, cabeçalhos). */
const IGNORE_RE = /(sobra|total|📊|💰|gastos?\s+fixos)/i

function cleanName(raw: string): string {
  return raw
    .replace(/^[\s\-*•·–—>]+/, '')
    .replace(/[​‎‏⁠*]/g, '')
    .replace(/[-–:\s]+$/, '')
    .trim()
}

/**
 * Faz o parse de uma lista de contas fixas colada em texto. Cada linha
 * vira uma conta com nome, valor e (opcional) dia de vencimento.
 *
 * Ex.: "Tiger 800 - R$ 1262,92 dia: *21*" →
 *      { name: "Tiger 800", amountCents: 126292, dueDay: 21 }
 */
export function parseFixedExpenses(text: string): ParsedFixed[] {
  const result: ParsedFixed[] = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || IGNORE_RE.test(line)) continue

    // Dia de vencimento.
    const dayMatch = line.match(DAY_RE)
    const dueDay = dayMatch ? clampDay(Number(dayMatch[1])) : null
    const withoutDay = line.replace(DAY_RE, '')

    // Valor (R$ ancorado; senão valor com centavos).
    let amountCents: number | null = null
    let valueToken: string | null = null
    const money = withoutDay.match(MONEY_RE)
    if (money) {
      amountCents = parseToCents(money[1])
      valueToken = money[0]
    } else {
      const bare = withoutDay.match(BARE_MONEY_RE)
      if (bare) {
        amountCents = parseToCents(bare[1])
        valueToken = bare[0]
      }
    }
    if (amountCents == null) continue

    const name = cleanName(
      (valueToken ? withoutDay.replace(valueToken, '') : withoutDay).replace(
        /R\$/g,
        '',
      ),
    )
    if (!/[a-zA-ZÀ-ÿ]{2,}/.test(name)) continue

    result.push({ name, amountCents, dueDay })
  }

  return result
}

function clampDay(day: number): number | null {
  if (!Number.isFinite(day) || day < 1 || day > 31) return null
  return day
}
