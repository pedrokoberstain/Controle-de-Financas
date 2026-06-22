import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatAmount, parseToCents } from '../../domain/money'

interface SalarySheetProps {
  salaryCents: number
  onSave: (salaryCents: number) => Promise<unknown>
  onClose: () => void
}

/** Bottom-sheet para definir o salário/renda mensal. */
export function SalarySheet({ salaryCents, onSave, onClose }: SalarySheetProps) {
  const [value, setValue] = useState(
    salaryCents ? formatAmount(salaryCents) : '',
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cents = parseToCents(value)
    if (cents === null) {
      setError('Informe um valor válido.')
      return
    }
    setSubmitting(true)
    try {
      await onSave(cents)
      onClose()
    } catch {
      setError('Não foi possível salvar.')
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      title="Renda mensal"
      subtitle="Seu salário ou renda do mês. É a base do cálculo de quanto sobra."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-muted">Renda (R$)</label>
        <input
          autoFocus
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0,00"
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
