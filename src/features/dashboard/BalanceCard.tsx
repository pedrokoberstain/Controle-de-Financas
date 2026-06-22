import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatBRL } from '../../domain/money'
import { PERIOD_LABELS } from '../../domain/period'
import type { PeriodSummary } from '../../domain/budget'

interface BalanceCardProps {
  summary: PeriodSummary
}

/**
 * Cartão principal do app: responde "quanto eu ainda posso gastar?".
 * A cor muda conforme a saúde do orçamento (verde → amarelo → vermelho).
 */
export function BalanceCard({ summary }: BalanceCardProps) {
  const { period, remainingCents, spentCents, limitCents, perDayCents, usedRatio } =
    summary

  const overBudget = remainingCents < 0
  const warning = !overBudget && usedRatio >= 0.8

  const accent = overBudget
    ? 'var(--color-danger)'
    : warning
      ? 'var(--color-warning)'
      : 'var(--color-brand)'

  return (
    <Card className="bg-gradient-to-br from-surface to-surface-2">
      <p className="text-sm text-muted">
        {PERIOD_LABELS[period]} · você ainda pode gastar
      </p>

      <p
        className="mt-1 text-4xl font-bold tracking-tight"
        style={{ color: accent }}
      >
        {formatBRL(Math.max(0, remainingCents))}
      </p>

      {overBudget ? (
        <p className="mt-1 text-sm font-medium text-danger">
          Você passou {formatBRL(-remainingCents)} do orçamento.
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">
          ≈ {formatBRL(perDayCents)} por dia até o fim do período
        </p>
      )}

      <div className="mt-4">
        <ProgressBar value={usedRatio} color={accent} />
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>Gasto: {formatBRL(spentCents)}</span>
          <span>Limite: {formatBRL(limitCents)}</span>
        </div>
      </div>
    </Card>
  )
}
