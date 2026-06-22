import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatAmount, parseToCents } from '../../domain/money'
import type { FixedExpense } from '../../domain/types'
import type { NewFixedExpense } from '../../data'

interface FixedExpenseSheetProps {
  /** Quando presente, edita a conta existente. */
  expense?: FixedExpense
  onSubmit: (input: NewFixedExpense) => Promise<unknown>
  onDelete?: () => void
  onClose: () => void
}

function parseDay(value: string): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 31) return null
  return n
}

/** Bottom-sheet para adicionar/editar uma conta fixa mensal. */
export function FixedExpenseSheet({
  expense,
  onSubmit,
  onDelete,
  onClose,
}: FixedExpenseSheetProps) {
  const editing = Boolean(expense)
  const [name, setName] = useState(expense?.name ?? '')
  const [amount, setAmount] = useState(
    expense ? formatAmount(expense.amountCents) : '',
  )
  const [day, setDay] = useState(expense?.dueDay ? String(expense.dueDay) : '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amountCents = parseToCents(amount)
    if (!name.trim() || amountCents === null) {
      setError('Preencha nome e valor.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        amountCents,
        dueDay: day ? parseDay(day) : null,
        paidMonth: expense?.paidMonth ?? null,
      })
      onClose()
    } catch {
      setError('Não foi possível salvar.')
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      title={editing ? 'Editar conta fixa' : 'Nova conta fixa'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-muted">Nome</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Netflix, Vivo, financiamento..."
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        />

        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-muted">Valor (R$)</label>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-xl font-semibold outline-none focus:border-brand"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs text-muted">Dia venc.</label>
            <input
              inputMode="numeric"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="—"
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-center text-xl font-semibold outline-none focus:border-brand"
            />
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          {editing && onDelete ? (
            <Button type="button" variant="danger" onClick={onDelete}>
              Excluir
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
