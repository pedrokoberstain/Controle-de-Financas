import { monthKey } from './period'
import type { Card, FixedExpense } from './types'

/** Uma conta a pagar unificada (fixa ou cartão) para exibição/ordenação. */
export interface Bill {
  id: string
  kind: 'fixed' | 'card'
  name: string
  amountCents: number
  dueDay: number | null
  paid: boolean
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

  const bills = [...fixedBills, ...cardBills].sort((a, b) => {
    // Não pagas primeiro, depois por dia de vencimento.
    if (a.paid !== b.paid) return a.paid ? 1 : -1
    return (a.dueDay ?? 99) - (b.dueDay ?? 99)
  })

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
  const nextMonthProjectionCents = salaryCents - fixedTotalCents

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
