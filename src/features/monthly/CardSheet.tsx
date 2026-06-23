import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatAmount, parseToCents } from '../../domain/money'
import type { Card } from '../../domain/types'
import type { NewCard } from '../../data'

interface CardSheetProps {
  /** Quando presente, edita o cartão existente. */
  card?: Card
  /** Mês corrente "YYYY-MM" ao qual a fatura lançada se refere. */
  month: string
  onSubmit: (input: NewCard) => Promise<unknown>
  onDelete?: () => void
  onClose: () => void
}

function parseDay(value: string): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 31) return null
  return n
}

/** Bottom-sheet para adicionar/editar um cartão e lançar a fatura do mês. */
export function CardSheet({
  card,
  month,
  onSubmit,
  onDelete,
  onClose,
}: CardSheetProps) {
  const editing = Boolean(card)
  const [name, setName] = useState(card?.name ?? '')
  const [day, setDay] = useState(card?.dueDay ? String(card.dueDay) : '')
  const [limit, setLimit] = useState(
    card?.limitCents ? formatAmount(card.limitCents) : '',
  )
  // Só pré-preenche a fatura se ela for do mês corrente.
  const [bill, setBill] = useState(
    card && card.billMonth === month ? formatAmount(card.billCents) : '',
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Dê um nome ao cartão.')
      return
    }
    const billCents = bill ? parseToCents(bill) : 0
    if (billCents === null) {
      setError('Valor da fatura inválido.')
      return
    }
    const limitCents = limit ? parseToCents(limit) : 0
    if (limitCents === null) {
      setError('Limite inválido.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        limitCents,
        dueDay: day ? parseDay(day) : null,
        billCents,
        billMonth: billCents > 0 ? month : (card?.billMonth ?? null),
        // Se a fatura mudou de mês, zera o "pago".
        paidMonth: card?.billMonth === month ? card.paidMonth : null,
      })
      onClose()
    } catch {
      setError('Não foi possível salvar.')
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      title={editing ? 'Cartão' : 'Novo cartão'}
      subtitle="Lance quanto deve na fatura deste mês. O valor zera no próximo mês."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-muted">Nome</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Inter, Mercado Pago"
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs text-muted">Dia venc.</label>
            <input
              inputMode="numeric"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="—"
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-center outline-none focus:border-brand"
            />
          </div>
        </div>

        <label className="block text-xs text-muted">
          Limite do cartão (R$)
        </label>
        <input
          inputMode="decimal"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="0,00"
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 text-lg font-semibold outline-none focus:border-brand"
        />

        <label className="block text-xs text-muted">
          Fatura deste mês (R$)
        </label>
        <input
          inputMode="decimal"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
          placeholder="0,00"
          className="mb-4 w-full rounded-xl border border-border bg-bg px-4 py-3 text-2xl font-semibold outline-none focus:border-brand"
        />

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          {editing && onDelete ? (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              aria-label="Excluir cartão"
            >
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
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
