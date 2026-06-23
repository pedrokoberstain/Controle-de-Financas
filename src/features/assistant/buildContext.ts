import { repository } from '../../data'
import { summarizePeriod } from '../../domain/budget'
import { computeCardMargin, computeMonthSummary } from '../../domain/monthly'
import { formatBRL } from '../../domain/money'
import { monthKey, monthLabel } from '../../domain/period'

/**
 * Monta um resumo textual das finanças do usuário para enviar ao modelo.
 * Mantém compacto (limita transações) para controlar custo de tokens.
 */
export async function buildFinancialContext(): Promise<string> {
  const [
    transactions,
    categories,
    budget,
    settings,
    fixedExpenses,
    cards,
    installments,
    projects,
  ] = await Promise.all([
    repository.listTransactions(),
    repository.listCategories(),
    repository.getBudget(),
    repository.getMonthlySettings(),
    repository.listFixedExpenses(),
    repository.listCards(),
    repository.listInstallments(),
    repository.listProjects(),
  ])

  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  const month = computeMonthSummary(
    settings.salaryCents,
    fixedExpenses,
    cards,
    installments,
  )
  const monthBudget = summarizePeriod(transactions, budget, 'month')

  const lines: string[] = []
  lines.push(`# Finanças do usuário (mês de ${monthLabel()})`)

  lines.push('\n## Fluxo de caixa do mês')
  lines.push(`- Salário/renda: ${formatBRL(month.salaryCents)}`)
  lines.push(
    `- Contas comprometidas (fixas + faturas + parcelas): ${formatBRL(month.committedCents)}`,
  )
  lines.push(`- Já pago: ${formatBRL(month.paidCents)}`)
  lines.push(`- Falta pagar: ${formatBRL(month.remainingToPayCents)}`)
  lines.push(`- SOBRA do mês (renda − contas): ${formatBRL(month.leftoverCents)}`)
  lines.push(`- Sobra por dia até o fim do mês: ${formatBRL(month.perDayCents)}`)
  lines.push(
    `- Projeção do próximo mês (renda − contas fixas): ${formatBRL(month.nextMonthProjectionCents)}`,
  )

  if (month.bills.length > 0) {
    lines.push('\n## Contas a pagar do mês')
    for (const b of month.bills) {
      lines.push(
        `- ${b.name}: ${formatBRL(b.amountCents)}${b.dueDay ? ` (vence dia ${b.dueDay})` : ''} — ${b.paid ? 'pago' : 'pendente'}`,
      )
    }
  }

  const cardsWithLimit = cards.filter((c) => (c.limitCents ?? 0) > 0)
  if (cardsWithLimit.length > 0) {
    const currentMonth = monthKey()
    lines.push('\n## Margem de crédito (cartões)')
    for (const c of cardsWithLimit) {
      const m = computeCardMargin(c, currentMonth)
      lines.push(
        `- ${c.name}: limite ${formatBRL(m.limitCents)}, fatura ${formatBRL(m.billCents)}, disponível ${formatBRL(m.availableCents)}`,
      )
    }
  }

  lines.push('\n## Orçamento do dia a dia (mês)')
  lines.push(`- Limite mensal: ${formatBRL(monthBudget.limitCents)}`)
  lines.push(`- Gasto: ${formatBRL(monthBudget.spentCents)}`)
  lines.push(`- Entradas avulsas: ${formatBRL(monthBudget.incomeCents)}`)
  lines.push(`- Ainda pode gastar: ${formatBRL(monthBudget.remainingCents)}`)

  const recent = transactions.slice(0, 50)
  if (recent.length > 0) {
    lines.push('\n## Últimos lançamentos (até 50)')
    for (const t of recent) {
      const sign = t.type === 'expense' ? '-' : '+'
      const cat = t.categoryId ? (categoryName.get(t.categoryId) ?? '') : ''
      lines.push(
        `- ${t.date} ${sign}${formatBRL(t.amountCents)} ${t.description}${cat ? ` [${cat}]` : ''}`,
      )
    }
  }

  if (projects.length > 0) {
    lines.push('\n## Projetos')
    for (const p of projects) {
      const items = await repository.listProjectItems(p.id)
      const spent = items
        .filter((i) => i.status === 'bought')
        .reduce((a, i) => a + i.amountCents, 0)
      const pending = items
        .filter((i) => i.status === 'pending')
        .reduce((a, i) => a + i.amountCents, 0)
      lines.push(
        `- ${p.name}: gasto ${formatBRL(spent)}, pendente ${formatBRL(pending)}, total ${formatBRL(spent + pending)}`,
      )
    }
  }

  return lines.join('\n')
}
