import type { Budget, PeriodKey, Transaction } from './types'
import {
  daysInRange,
  daysRemaining,
  getCurrentRange,
  isWithinRange,
} from './period'

export interface PeriodSummary {
  period: PeriodKey
  /** Limite alocado para o período em centavos. */
  limitCents: number
  /** Total gasto no período em centavos. */
  spentCents: number
  /** Total recebido no período em centavos. */
  incomeCents: number
  /** Quanto ainda pode gastar (limite - gasto). Pode ser negativo. */
  remainingCents: number
  /** Sugestão de gasto por dia com o que resta, no período corrente. */
  perDayCents: number
  /** Fração gasta do limite (0..1+). */
  usedRatio: number
}

/**
 * Deriva o limite de um período a partir do orçamento mensal global.
 *
 * O mês usa o limite cheio. Dia e semana recebem uma fatia proporcional
 * ao número de dias do período dentro do mês corrente, dando uma meta
 * realista de "quanto dá pra gastar por dia/semana".
 */
function limitForPeriod(period: PeriodKey, monthlyLimitCents: number): number {
  if (period === 'month') return monthlyLimitCents

  const monthRange = getCurrentRange('month')
  const daysInMonth = daysInRange(monthRange)
  const dailyLimit = monthlyLimitCents / daysInMonth

  const days = period === 'day' ? 1 : daysInRange(getCurrentRange('week'))
  return Math.round(dailyLimit * days)
}

/** Soma transações de um tipo dentro do período corrente. */
function sumInPeriod(
  transactions: Transaction[],
  period: PeriodKey,
  type: Transaction['type'],
): number {
  const range = getCurrentRange(period)
  return transactions
    .filter((t) => t.type === type && isWithinRange(t.date, range))
    .reduce((acc, t) => acc + t.amountCents, 0)
}

export interface CategorySlice {
  categoryId: string | null
  spentCents: number
  /** Fração do total de gastos do período (0..1). */
  ratio: number
}

/**
 * Soma os gastos por categoria no período, ordenado do maior para o menor.
 * Útil para o gráfico "para onde vai o dinheiro".
 */
export function expensesByCategory(
  transactions: Transaction[],
  period: PeriodKey,
): CategorySlice[] {
  const range = getCurrentRange(period)
  const totals = new Map<string | null, number>()

  for (const t of transactions) {
    if (t.type !== 'expense' || !isWithinRange(t.date, range)) continue
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amountCents)
  }

  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0)
  if (grandTotal === 0) return []

  return [...totals.entries()]
    .map(([categoryId, spentCents]) => ({
      categoryId,
      spentCents,
      ratio: spentCents / grandTotal,
    }))
    .sort((a, b) => b.spentCents - a.spentCents)
}

/** Monta o resumo financeiro de um período. */
export function summarizePeriod(
  transactions: Transaction[],
  budget: Budget,
  period: PeriodKey,
): PeriodSummary {
  const limitCents = limitForPeriod(period, budget.monthlyLimitCents)
  const spentCents = sumInPeriod(transactions, period, 'expense')
  const incomeCents = sumInPeriod(transactions, period, 'income')
  const remainingCents = limitCents - spentCents

  const remainingDays = daysRemaining(getCurrentRange(period))
  const perDayCents =
    remainingCents > 0 ? Math.floor(remainingCents / remainingDays) : 0

  const usedRatio = limitCents > 0 ? spentCents / limitCents : 0

  return {
    period,
    limitCents,
    spentCents,
    incomeCents,
    remainingCents,
    perDayCents,
    usedRatio,
  }
}
