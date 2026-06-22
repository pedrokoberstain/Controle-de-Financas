import { Card } from '../../components/ui/Card'
import { formatBRL } from '../../domain/money'

interface ProjectionCardProps {
  /** Projeção do próximo mês (salário − contas fixas), em centavos. */
  nextMonthCents: number
}

/**
 * Projeção do próximo mês: o que sobra do salário só com as contas fixas
 * (as faturas dos cartões ainda não são conhecidas).
 */
export function ProjectionCard({ nextMonthCents }: ProjectionCardProps) {
  const negative = nextMonthCents < 0
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Projeção próximo mês</p>
          <p className="text-[11px] text-muted">
            salário − contas fixas (antes das faturas)
          </p>
        </div>
        <p
          className={`text-lg font-bold ${
            negative ? 'text-danger' : 'text-brand'
          }`}
        >
          {formatBRL(nextMonthCents)}
        </p>
      </div>
    </Card>
  )
}
