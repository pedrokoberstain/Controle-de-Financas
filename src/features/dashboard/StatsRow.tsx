import { Card } from '../../components/ui/Card'
import { formatBRL } from '../../domain/money'
import type { PeriodSummary } from '../../domain/budget'

interface StatsRowProps {
  summary: PeriodSummary
}

/** Dois indicadores rápidos: entradas e saídas do período. */
export function StatsRow({ summary }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-3">
        <p className="text-xs text-muted">Entradas</p>
        <p className="mt-1 text-lg font-semibold text-brand">
          {formatBRL(summary.incomeCents)}
        </p>
      </Card>
      <Card className="p-3">
        <p className="text-xs text-muted">Saídas</p>
        <p className="mt-1 text-lg font-semibold text-danger">
          {formatBRL(summary.spentCents)}
        </p>
      </Card>
    </div>
  )
}
