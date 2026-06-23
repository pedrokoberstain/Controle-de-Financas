import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatAmount, formatBRL, parseToCents } from '../../domain/money'
import { monthKey } from '../../domain/period'
import type { InstallmentPurchase } from '../../domain/types'
import type { NewInstallmentPurchase } from '../../data'

interface InstallmentSheetProps {
  /** Quando presente, edita a compra parcelada existente. */
  purchase?: InstallmentPurchase
  onSubmit: (input: NewInstallmentPurchase) => Promise<unknown>
  onDelete?: () => void
  onClose: () => void
}

function parseDay(value: string): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 31) return null
  return n
}

/** Bottom-sheet para lançar uma compra parcelada (12x de R$ X). */
export function InstallmentSheet({
  purchase,
  onSubmit,
  onDelete,
  onClose,
}: InstallmentSheetProps) {
  const editing = Boolean(purchase)
  const [name, setName] = useState(purchase?.name ?? '')
  const [total, setTotal] = useState(
    purchase
      ? formatAmount(purchase.installmentCents * purchase.installments)
      : '',
  )
  const [count, setCount] = useState(
    purchase ? String(purchase.installments) : '12',
  )
  const [startMonth, setStartMonth] = useState(
    purchase?.startMonth ?? monthKey(),
  )
  const [day, setDay] = useState(purchase?.dueDay ? String(purchase.dueDay) : '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalCents = parseToCents(total)
  const n = Number(count)
  const installmentCents =
    totalCents != null && n > 0 ? Math.round(totalCents / n) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || totalCents === null || !Number.isInteger(n) || n < 1) {
      setError('Preencha nome, valor total e número de parcelas.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        installmentCents,
        installments: n,
        startMonth,
        dueDay: day ? parseDay(day) : null,
        paidMonths: purchase?.paidMonths ?? [],
      })
      onClose()
    } catch {
      setError('Não foi possível salvar.')
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      title={editing ? 'Editar parcelamento' : 'Nova compra parcelada'}
      subtitle="Lance uma vez; cada parcela aparece nas contas do mês correspondente."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-muted">Descrição</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Escapamento, Aros pé de galinha..."
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        />

        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-muted">Valor total (R$)</label>
            <input
              inputMode="decimal"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-lg font-semibold outline-none focus:border-brand"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs text-muted">Parcelas</label>
            <input
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-center text-lg font-semibold outline-none focus:border-brand"
            />
          </div>
        </div>

        {installmentCents > 0 && (
          <p className="mb-3 text-sm text-brand">
            = {count}x de {formatBRL(installmentCents)}
          </p>
        )}

        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-muted">1ª parcela</label>
            <input
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
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
