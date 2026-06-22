import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatAmount, parseToCents } from '../../domain/money'
import type { Budget } from '../../domain/types'

interface BudgetSheetProps {
  budget: Budget
  onSave: (budget: Budget) => Promise<unknown>
  onClose: () => void
}

/** Bottom-sheet para definir o orçamento mensal global. */
export function BudgetSheet({ budget, onSave, onClose }: BudgetSheetProps) {
  const [value, setValue] = useState(formatAmount(budget.monthlyLimitCents))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const monthlyLimitCents = parseToCents(value)
    if (monthlyLimitCents === null) {
      setError('Informe um valor válido.')
      return
    }
    setSubmitting(true)
    try {
      await onSave({ monthlyLimitCents })
      onClose()
    } catch {
      setError('Não foi possível salvar.')
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      title="Orçamento mensal"
      subtitle="Quanto você planeja gastar por mês. As metas de dia e semana são calculadas a partir disso."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-muted">Limite mensal (R$)</label>
        <input
          autoFocus
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mb-4 w-full rounded-xl border border-border bg-bg px-4 py-3 text-2xl font-semibold outline-none focus:border-brand"
        />

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
