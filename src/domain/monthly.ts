import { monthKey } from './period'
import type { Card, FixedExpense, InstallmentPurchase } from './types'

/** Uma conta a pagar unificada (fixa, cartão ou parcela) para a lista do mês. */
export interface Bill {
  id: string
  kind: 'fixed' | 'card' | 'installment'
  name: string
  amountCents: number
  dueDay: number | null
  paid: boolean
}

/** Índice (0-based) da parcela que cai no mês informado; -1 se fora do intervalo. */
export function installmentIndexForMonth(
  purchase: InstallmentPurchase,
  month: string,
): number {
  const [sy, sm] = purchase.startMonth.split('-').map(Number)
  const [my, mm] = month.split('-').map(Number)
  const index = (my - sy) * 12 + (mm - sm)
  return index >= 0 && index < purchase.installments ? index : -1
}

export interface MonthSummary {
  /** Renda do mês (salário) em centavos. */
  salaryCents: number
  /** Soma de todas as contas do mês (fixas + faturas), em centavos. */
  committedCents: number
  /** Quanto já foi pago das contas, em centavos. */
  paidCents: number
  /** Quanto falta pagar, em centavos. */
  remainingToPayCents: number
  /** Sobra do mês: salário − contas (pago ou não). */
  leftoverCents: number
  /** Sobra dividida pelos dias restantes do mês. */
  perDayCents: number
  /** Projeção do próximo mês: salário − contas fixas (faturas ainda não conhecidas). */
  nextMonthProjectionCents: number
  /** Contas do mês, já unificadas e ordenadas por vencimento. */
  bills: Bill[]
}

/** Valor da fatura de um cartão que conta para o mês informado. */
function cardBillForMonth(card: Card, month: string): number {
  return card.billMonth === month ? card.billCents : 0
}

export interface CardMargin {
  card: Card
  /** Limite do cartão (centavos). */
  limitCents: number
  /** Fatura aberta considerada (centavos). */
  billCents: number
  /** Quanto ainda dá pra passar: limite − fatura (centavos). */
  availableCents: number
  /** Fração do limite já usada (0..1+). */
  usedRatio: number
}

/**
 * Margem de crédito de um cartão: quanto ainda dá pra gastar (limite menos
 * a fatura aberta). Usa a fatura do mês informado.
 */
export function computeCardMargin(card: Card, month: string): CardMargin {
  const limitCents = card.limitCents ?? 0
  const billCents = cardBillForMonth(card, month)
  return {
    card,
    limitCents,
    billCents,
    availableCents: limitCents - billCents,
    usedRatio: limitCents > 0 ? billCents / limitCents : 0,
  }
}

/** Quantos dias faltam até o fim do mês (mínimo 1). */
function daysLeftInMonth(reference: Date): number {
  const lastDay = new Date(
    reference.getFullYear(),
    reference.getMonth() + 1,
    0,
  ).getDate()
  return Math.max(1, lastDay - reference.getDate() + 1)
}

/**
 * Calcula o panorama do mês a partir do salário, contas fixas e cartões.
 * As faturas só entram no mês a que se referem (`billMonth`).
 */
export function computeMonthSummary(
  salaryCents: number,
  fixedExpenses: FixedExpense[],
  cards: Card[],
  installments: InstallmentPurchase[] = [],
  reference: Date = new Date(),
): MonthSummary {
  const month = monthKey(reference)

  const fixedBills: Bill[] = fixedExpenses.map((f) => ({
    id: f.id,
    kind: 'fixed',
    name: f.name,
    amountCents: f.amountCents,
    dueDay: f.dueDay,
    paid: f.paidMonth === month,
  }))

  const cardBills: Bill[] = cards.map((c) => ({
    id: c.id,
    kind: 'card',
    name: c.name,
    amountCents: cardBillForMonth(c, month),
    dueDay: c.dueDay,
    paid: c.paidMonth === month && c.billMonth === month,
  }))

  const installmentBills: Bill[] = installments
    .map((p): Bill | null => {
      const index = installmentIndexForMonth(p, month)
      if (index === -1) return null
      return {
        id: p.id,
        kind: 'installment',
        name: `${p.name} (${index + 1}/${p.installments})`,
        amountCents: p.installmentCents,
        dueDay: p.dueDay,
        paid: p.paidMonths.includes(month),
      }
    })
    .filter((b): b is Bill => b !== null)

  const bills = [...fixedBills, ...cardBills, ...installmentBills].sort(
    (a, b) => {
      // Não pagas primeiro, depois por dia de vencimento.
      if (a.paid !== b.paid) return a.paid ? 1 : -1
      return (a.dueDay ?? 99) - (b.dueDay ?? 99)
    },
  )

  const committedCents = bills.reduce((acc, b) => acc + b.amountCents, 0)
  const paidCents = bills
    .filter((b) => b.paid)
    .reduce((acc, b) => acc + b.amountCents, 0)
  const remainingToPayCents = committedCents - paidCents
  const leftoverCents = salaryCents - committedCents
  const perDayCents =
    leftoverCents > 0
      ? Math.floor(leftoverCents / daysLeftInMonth(reference))
      : 0

  const fixedTotalCents = fixedExpenses.reduce(
    (acc, f) => acc + f.amountCents,
    0,
  )
  // Parcelas que ainda caem no próximo mês também comprometem a renda.
  const nextMonth = monthKey(
    new Date(reference.getFullYear(), reference.getMonth() + 1, 1),
  )
  const nextInstallmentsCents = installments.reduce(
    (acc, p) =>
      installmentIndexForMonth(p, nextMonth) >= 0
        ? acc + p.installmentCents
        : acc,
    0,
  )
  const nextMonthProjectionCents =
    salaryCents - fixedTotalCents - nextInstallmentsCents

  return {
    salaryCents,
    committedCents,
    paidCents,
    remainingToPayCents,
    leftoverCents,
    perDayCents,
    nextMonthProjectionCents,
    bills,
  }
}
