import type { PeriodKey } from './types'

/** Intervalo de datas [start, end) — start inclusivo, end exclusivo. */
export interface DateRange {
  start: Date
  end: Date
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

/**
 * Calcula o intervalo do período corrente que contém `reference`.
 * - day: o dia de hoje.
 * - week: semana de segunda a domingo (padrão brasileiro/ISO).
 * - month: do dia 1 ao fim do mês.
 */
export function getCurrentRange(
  period: PeriodKey,
  reference: Date = new Date(),
): DateRange {
  const today = startOfDay(reference)

  switch (period) {
    case 'day':
      return { start: today, end: addDays(today, 1) }

    case 'week': {
      // getDay(): 0=domingo ... 6=sábado. Queremos segunda como início.
      const weekday = today.getDay()
      const daysSinceMonday = (weekday + 6) % 7
      const start = addDays(today, -daysSinceMonday)
      return { start, end: addDays(start, 7) }
    }

    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      return { start, end }
    }
  }
}

/** Número de dias inteiros no intervalo. */
export function daysInRange(range: DateRange): number {
  const ms = range.end.getTime() - range.start.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

/** Quantos dias restam no período corrente, contando o dia de hoje. */
export function daysRemaining(
  range: DateRange,
  reference: Date = new Date(),
): number {
  const today = startOfDay(reference)
  const ms = range.end.getTime() - today.getTime()
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

/** Testa se uma data ISO (YYYY-MM-DD) cai dentro do intervalo. */
export function isWithinRange(isoDate: string, range: DateRange): boolean {
  const [year, month, day] = isoDate.split('-').map(Number)
  const d = new Date(year, (month ?? 1) - 1, day ?? 1).getTime()
  return d >= range.start.getTime() && d < range.end.getTime()
}

/** Data de hoje no formato YYYY-MM-DD (horário local). */
export function todayISO(reference: Date = new Date()): string {
  const y = reference.getFullYear()
  const m = String(reference.getMonth() + 1).padStart(2, '0')
  const d = String(reference.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Chave do mês corrente no formato YYYY-MM (ex.: "2026-06"). */
export function monthKey(reference: Date = new Date()): string {
  return todayISO(reference).slice(0, 7)
}

/** Primeiro dia do mês de `reference` (00:00 local). */
export function startOfMonth(reference: Date = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 1)
}

/** Retorna uma nova data deslocada em `n` meses (n pode ser negativo). */
export function addMonths(reference: Date, n: number): Date {
  return new Date(reference.getFullYear(), reference.getMonth() + n, 1)
}

/** True se as duas datas caem no mesmo mês/ano. */
export function isSameMonth(a: Date, b: Date): boolean {
  return monthKey(a) === monthKey(b)
}

/** Nome do mês por extenso, ex.: "junho de 2026". */
export function monthLabel(reference: Date = new Date()): string {
  return reference.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  day: 'Hoje',
  week: 'Esta semana',
  month: 'Este mês',
}
