import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatBRL } from '../../domain/money'
import type { MonthSummary } from '../../domain/monthly'

interface MonthSummaryCardProps {
  summary: MonthSummary
  onEditSalary: () => void
}

/**
 * Cartão principal da aba Mês: mostra a SOBRA do mês (salário − contas)
 * e o detalhamento. Se não houver salário, convida a defini-lo.
 */
export function MonthSummaryCard({
  summary,
  onEditSalary,
}: MonthSummaryCardProps) {
  const {
    salaryCents,
    committedCents,
    leftoverCents,
    perDayCents,
    paidCents,
    remainingToPayCents,
  } = summary

  const negative = leftoverCents < 0
  const accent = negative ? 'var(--color-danger)' : 'var(--color-brand)'
  const payRatio = committedCents > 0 ? paidCents / committedCents : 0

  if (salaryCents === 0) {
    return (
      <Card className="bg-gradient-to-br from-surface to-surface-2 text-center">
        <p className="text-sm text-muted">Comece definindo sua renda</p>
        <button
          onClick={onEditSalary}
          className="mt-3 rounded-xl bg-brand px-5 py-3 font-semibold text-bg"
        >
          + Definir salário
        </button>
        <p className="mt-3 text-xs text-muted">
          Contas do mês: {formatBRL(committedCents)}
        </p>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-surface to-surface-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Sobra este mês</p>
        <button
          onClick={onEditSalary}
          className="text-xs text-muted underline-offset-2 hover:underline"
        >
          Renda: {formatBRL(salaryCents)} ✎
        </button>
      </div>

      <p
        className="mt-1 text-4xl font-bold tracking-tight"
        style={{ color: accent }}
      >
        {formatBRL(leftoverCents)}
      </p>

      {negative ? (
        <p className="mt-1 text-sm font-medium text-danger">
          As contas passam da renda em {formatBRL(-leftoverCents)}.
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">
          ≈ {formatBRL(perDayCents)} por dia até o fim do mês
        </p>
      )}

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>
            Pago {formatBRL(paidCents)} de {formatBRL(committedCents)}
          </span>
          <span className="text-warning">
            falta {formatBRL(remainingToPayCents)}
          </span>
        </div>
        <ProgressBar value={payRatio} />
      </div>
    </Card>
  )
}
