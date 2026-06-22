import { formatBRL } from '../../domain/money'
import type { Category, Transaction } from '../../domain/types'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

/** Lista das transações recentes, agrupada visualmente por item. */
export function TransactionList({
  transactions,
  categories,
  onDelete,
}: TransactionListProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-3xl">🧾</p>
        <p className="mt-2 text-sm text-muted">
          Nenhum lançamento ainda. Toque em <strong>+</strong> para registrar o
          primeiro.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {transactions.map((t) => {
        const category = t.categoryId ? categoryById.get(t.categoryId) : null
        const isExpense = t.type === 'expense'
        return (
          <li
            key={t.id}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: `${category?.color ?? '#334155'}26` }}
            >
              {category?.icon ?? '📦'}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.description}</p>
              <p className="text-xs text-muted">
                {category?.name ?? 'Outros'} · {formatDate(t.date)}
              </p>
            </div>

            <span
              className={`shrink-0 text-sm font-semibold ${
                isExpense ? 'text-text' : 'text-brand'
              }`}
            >
              {isExpense ? '-' : '+'}
              {formatBRL(t.amountCents)}
            </span>

            <button
              onClick={() => onDelete(t.id)}
              aria-label="Excluir lançamento"
              className="shrink-0 rounded-lg px-2 py-1 text-muted opacity-60 transition hover:text-danger hover:opacity-100"
            >
              ✕
            </button>
          </li>
        )
      })}
    </ul>
  )
}
