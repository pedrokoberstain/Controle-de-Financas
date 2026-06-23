import { repository } from '../../data'
import { computeMonthSummary } from '../../domain/monthly'
import { formatBRL } from '../../domain/money'
import { todayISO } from '../../domain/period'

const FLAG = 'cf:notify'
const LAST_SHOWN = 'cf:notify:lastShown'
/** Antecedência (em dias) para avisar de um vencimento. */
const DAYS_AHEAD = 3

export function notificationsEnabled(): boolean {
  return (
    localStorage.getItem(FLAG) === '1' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  )
}

/** Pede permissão e liga os lembretes. Retorna true se ficou ativo. */
export async function enableNotifications(): Promise<boolean> {
  if (!('Notification' in window)) return false
  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission()
  if (permission !== 'granted') return false
  localStorage.setItem(FLAG, '1')
  return true
}

export function disableNotifications(): void {
  localStorage.removeItem(FLAG)
}

/**
 * Verifica contas a vencer (ou atrasadas) não pagas no mês corrente e
 * dispara UMA notificação por dia, para não encher o saco.
 */
export async function checkDueBills(): Promise<void> {
  if (!notificationsEnabled()) return

  // Já avisou hoje? Então não repete.
  const today = todayISO()
  if (localStorage.getItem(LAST_SHOWN) === today) return

  const [settings, fixedExpenses, cards, installments] = await Promise.all([
    repository.getMonthlySettings(),
    repository.listFixedExpenses(),
    repository.listCards(),
    repository.listInstallments(),
  ])

  const summary = computeMonthSummary(
    settings.salaryCents,
    fixedExpenses,
    cards,
    installments,
  )
  const day = new Date().getDate()

  const due = summary.bills.filter(
    (b) =>
      !b.paid &&
      b.amountCents > 0 &&
      b.dueDay != null &&
      b.dueDay <= day + DAYS_AHEAD,
  )
  if (due.length === 0) return

  const total = due.reduce((acc, b) => acc + b.amountCents, 0)
  const title =
    due.length === 1
      ? `${due[0].name} vence dia ${due[0].dueDay}`
      : `${due.length} contas a vencer`
  const body =
    due.length === 1
      ? `${formatBRL(due[0].amountCents)} pendente`
      : `${due.map((b) => b.name).join(', ')} — total ${formatBRL(total)}`

  try {
    new Notification(title, { body, icon: '/favicon.svg', tag: 'cf-due' })
    localStorage.setItem(LAST_SHOWN, today)
  } catch {
    // Silencioso: alguns navegadores exigem service worker para notificar.
  }
}
