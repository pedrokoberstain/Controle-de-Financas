import { parseToCents } from './money'

export interface ParsedInvoiceItem {
  description: string
  /** Valor em centavos. Negativo para créditos/estornos. */
  amountCents: number
  /** Data no formato YYYY-MM-DD, se encontrada. */
  date: string | null
}

export interface ParsedInvoice {
  items: ParsedInvoiceItem[]
  /** Soma dos itens (compras − créditos), em centavos. */
  totalCents: number
}

/** Token monetário com 2 casas decimais (vírgula ou ponto), opcional R$/sinal. */
const MONEY_TOKEN =
  /-?\s*R?\$?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2}(?!\d)|-?\s*R?\$?\s*\d+[.,]\d{2}(?!\d)/g
/** Data dd/mm, dd/mm/aaaa ou aaaa-mm-dd. */
const DATE_RE = /\b(\d{2})\/(\d{2})(?:\/(\d{2,4}))?\b|\b(\d{4})-(\d{2})-(\d{2})\b/
/** Linhas que não são compras (cabeçalhos, totais, encargos, pagamentos). */
const SKIP_RE =
  /(total|saldo|limite|fatura\s+anterior|encargos|juros|multa|anuidade|vencimento|melhor\s+dia|pagamento\s+receb)/i

function toIso(match: RegExpMatchArray): string | null {
  if (match[4]) {
    // aaaa-mm-dd
    return `${match[4]}-${match[5]}-${match[6]}`
  }
  const day = match[1]
  const month = match[2]
  let year = match[3]
  if (!year) {
    year = String(new Date().getFullYear())
  } else if (year.length === 2) {
    year = `20${year}`
  }
  return `${year}-${month}-${day}`
}

function cleanDescription(raw: string): string {
  return raw
    .replace(/[;,\t]+/g, ' ') // separadores de CSV viram espaço
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s\-*•·]+|[\s\-*•·]+$/g, '')
    .trim()
}

/**
 * Faz o parse de uma fatura de cartão colada como texto ou CSV. Cada linha
 * com um valor monetário vira um item; a descrição é o restante da linha
 * (sem data e sem valor). Valores negativos são tratados como créditos.
 */
export function parseInvoice(text: string): ParsedInvoice {
  const items: ParsedInvoiceItem[] = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || SKIP_RE.test(line)) continue

    // Último token monetário da linha = valor da compra.
    const moneyMatches = line.match(MONEY_TOKEN)
    if (!moneyMatches || moneyMatches.length === 0) continue
    const token = moneyMatches[moneyMatches.length - 1].trim()

    const negative = token.startsWith('-')
    const cents = parseToCents(token.replace(/[-R$\s]/g, ''))
    if (cents === null) continue
    const amountCents = negative ? -cents : cents

    // Data (se houver) e descrição (linha sem data e sem valor).
    const dateMatch = line.match(DATE_RE)
    const date = dateMatch ? toIso(dateMatch) : null

    // Remove todos os valores monetários e a data do nome (ex.: parcelas
    // "3x 33,33" somem, sobra só "AMAZON BR").
    let rest = line.replace(MONEY_TOKEN, '')
    if (dateMatch) rest = rest.replace(dateMatch[0], '')
    rest = rest.replace(/\b\d+x\b/gi, '') // remove "3x", "12x"
    const description = cleanDescription(rest) || 'Compra'

    items.push({ description, amountCents, date })
  }

  const totalCents = items.reduce((acc, i) => acc + i.amountCents, 0)
  return { items, totalCents }
}
