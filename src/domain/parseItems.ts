import { parseToCents } from './money'
import type { ProjectItemStatus } from './types'

export interface ParsedItem {
  name: string
  amountCents: number
  status: ProjectItemStatus
  url: string | null
  store: string | null
}

const URL_RE = /https?:\/\/\S+/i
/** Valor monetário ancorado em "R$" — evita capturar números do nome. */
const MONEY_RE = /R\$\s*([\d.,]+)/
/**
 * Valor "nu" (sem R$) no fim da linha, ex.: "Bolha (AliExpress): 438,00".
 * Exige centavos (",dd") para não confundir com números do nome (Titan 125)
 * nem com anos (2018).
 */
const BARE_MONEY_RE = /(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})\s*$/
/** Linha que começa com bullet ("-", "*", "•"...). */
const BULLET_RE = /^\s*[-*•·–—>]/

/** Marcadores que indicam mudança de seção para "comprado". */
const BOUGHT_RE = /(comprad|✅|j[áa]\s+gast|adquirid)/i
/** Marcadores que indicam mudança de seção para "pendente". */
const PENDING_RE = /(pendente|falta|a\s+comprar)/i
/** Linhas de total/resumo que devem ser ignoradas. */
const TOTAL_RE = /(total|📊|💰|subtotal|resumo)/i

function cleanName(raw: string): string {
  return raw
    // remove bullets, marcadores e espaços invisíveis no início
    .replace(/^[\s\-*•·–—>]+/, '')
    .replace(/[​‎‏⁠]/g, '')
    // remove ":" sobrando no fim
    .replace(/[:\s]+$/, '')
    .trim()
}

/** Tenta inferir a loja a partir do domínio de uma URL. */
function storeFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host.includes('mercadolivre') || host.includes('mercadolibre'))
      return 'Mercado Livre'
    if (host.includes('shp.ee') || host.includes('shopee')) return 'Shopee'
    if (host.includes('aliexpress')) return 'AliExpress'
    if (host.includes('amazon')) return 'Amazon'
    if (host.includes('magazine') || host.includes('magalu'))
      return 'Magalu'
    return host.split('.')[0] ?? null
  } catch {
    return null
  }
}

/**
 * Faz o parse de um texto livre (ex.: lista colada do WhatsApp) em itens
 * de projeto. Reconhece:
 * - bullets "-", "*", "•"
 * - valores "R$ 1.234,56"
 * - links http(s)
 * - cabeçalhos de seção ("Peças compradas", "Pendentes") que alternam o
 *   status dos itens seguintes
 * - linhas de total ("Total geral...") que são ignoradas
 *
 * Itens podem ter nome, valor e link em linhas separadas (são agrupados).
 */
export function parseProjectItems(
  text: string,
  defaultStatus: ProjectItemStatus = 'pending',
): ParsedItem[] {
  const items: ParsedItem[] = []
  let status: ProjectItemStatus = defaultStatus
  let current: ParsedItem | null = null

  const flush = () => {
    if (current && current.name) items.push(current)
    current = null
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const hadBullet = BULLET_RE.test(rawLine)
    const hasMoney = MONEY_RE.test(line)

    // Linhas de total/resumo são ignoradas (checadas antes dos cabeçalhos
    // para não confundir "Total já gasto" com a seção "comprado").
    if (TOTAL_RE.test(line)) {
      flush()
      continue
    }
    // Cabeçalhos de seção (sem valor de item junto) alteram o status.
    if (!hasMoney && BOUGHT_RE.test(line) && !URL_RE.test(line)) {
      flush()
      status = 'bought'
      continue
    }
    if (!hasMoney && PENDING_RE.test(line)) {
      flush()
      status = 'pending'
      continue
    }

    // Extrai URL e valor da linha (se houver).
    const urlMatch = line.match(URL_RE)
    const url = urlMatch?.[0] ?? null

    const withoutUrl = line.replace(URL_RE, '').trim()

    // Prefere o valor ancorado em "R$"; senão, tenta um valor "nu" no fim.
    let amountCents: number | null = null
    let valueToken: string | null = null
    const moneyMatch = withoutUrl.match(MONEY_RE)
    if (moneyMatch) {
      amountCents = parseToCents(moneyMatch[1])
      valueToken = moneyMatch[0]
    } else {
      const bare = withoutUrl.match(BARE_MONEY_RE)
      if (bare) {
        amountCents = parseToCents(bare[1])
        valueToken = bare[0]
      }
    }

    // Remove apenas o trecho do valor do nome, preservando números do item
    // (ex.: "Titan 125").
    const name = cleanName(
      valueToken ? withoutUrl.replace(valueToken, '') : withoutUrl,
    )
    const hasName = /[a-zA-ZÀ-ÿ]{2,}/.test(name)

    if (hasName) {
      // Linha sem bullet e sem valor é provavelmente um título/cabeçalho
      // solto (ex.: o nome da moto no topo) — ignora.
      if (!hadBullet && amountCents == null) continue

      // Início de um novo item.
      flush()
      current = {
        name,
        amountCents: amountCents ?? 0,
        status,
        url,
        store: url ? storeFromUrl(url) : null,
      }
    } else {
      // Linha só com valor e/ou link — complementa o item atual.
      if (!current) continue
      if (amountCents != null) current.amountCents = amountCents
      if (url) {
        current.url = url
        current.store = storeFromUrl(url)
      }
    }
  }

  flush()
  return items
}
