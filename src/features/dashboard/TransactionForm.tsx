import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatAmount, parseToCents } from '../../domain/money'
import { todayISO } from '../../domain/period'
import type {
  Category,
  Transaction,
  TransactionType,
} from '../../domain/types'
import type { NewTransaction } from '../../data'

interface TransactionFormProps {
  categories: Category[]
  /** Quando presente, o formulário edita a transação existente. */
  transaction?: Transaction
  /** Valores iniciais para um novo lançamento (ex.: vindo do scan de nota). */
  initial?: Partial<NewTransaction>
  onSubmit: (input: NewTransaction) => Promise<unknown>
  onDelete?: () => void
  onClose: () => void
}

/** Bottom-sheet para registrar ou editar um gasto/receita. */
export function TransactionForm({
  categories,
  transaction,
  initial,
  onSubmit,
  onDelete,
  onClose,
}: TransactionFormProps) {
  const editing = Boolean(transaction)
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? initial?.type ?? 'expense',
  )
  const [amount, setAmount] = useState(
    transaction
      ? formatAmount(transaction.amountCents)
      : initial?.amountCents
        ? formatAmount(initial.amountCents)
        : '',
  )
  const [description, setDescription] = useState(
    transaction && transaction.description !== 'Sem descrição'
      ? transaction.description
      : (initial?.description ?? ''),
  )
  const [categoryId, setCategoryId] = useState<string>(
    transaction?.categoryId ?? initial?.categoryId ?? categories[0]?.id ?? '',
  )
  const [date, setDate] = useState(
    transaction?.date ?? initial?.date ?? todayISO(),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amountCents = parseToCents(amount)
    if (amountCents === null || amountCents === 0) {
      setError('Informe um valor válido.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        type,
        amountCents,
        description: description.trim() || 'Sem descrição',
        categoryId: categoryId || null,
        date,
      })
      onClose()
    } catch {
      setError('Não foi possível salvar. Tente de novo.')
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      title={editing ? 'Editar lançamento' : 'Novo lançamento'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
          {(['expense', 'income'] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`min-h-10 rounded-lg text-sm font-medium transition ${
                type === t
                  ? t === 'expense'
                    ? 'bg-danger/20 text-danger'
                    : 'bg-brand/20 text-brand'
                  : 'text-muted'
              }`}
            >
              {t === 'expense' ? 'Saída' : 'Entrada'}
            </button>
          ))}
        </div>

        <label className="block text-xs text-muted">Valor (R$)</label>
        <input
          autoFocus
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 text-2xl font-semibold outline-none focus:border-brand"
        />

        <label className="block text-xs text-muted">Descrição</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: Almoço, Uber, Salário..."
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        />

        <label className="block text-xs text-muted">Categoria</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <label className="block text-xs text-muted">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-4 w-full rounded-xl border border-border bg-bg px-4 py-3 outline-none focus:border-brand"
        />

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
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
