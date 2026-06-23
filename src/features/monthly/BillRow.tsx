import { formatBRL } from '../../domain/money'
import type { Bill } from '../../domain/monthly'

interface BillRowProps {
  bill: Bill
  /** Dia de hoje (1-31) para destacar vencimentos próximos. */
  today: number
  onToggle: (bill: Bill) => void
  onEdit: (bill: Bill) => void
}

/** Linha de uma conta a pagar (fixa ou cartão) na lista do mês. */
export function BillRow({ bill, today, onToggle, onEdit }: BillRowProps) {
  const isCard = bill.kind === 'card'
  const icon = bill.kind === 'card' ? '💳' : bill.kind === 'installment' ? '🧾' : '📌'
  const notLaunched = isCard && bill.amountCents === 0
  const dueSoon =
    !bill.paid &&
    bill.dueDay != null &&
    bill.dueDay >= today &&
    bill.dueDay - today <= 3

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <button
        onClick={() => onToggle(bill)}
        aria-label={bill.paid ? 'Marcar como não paga' : 'Marcar como paga'}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition ${
          bill.paid ? 'bg-brand/20 text-brand' : 'bg-surface-2 text-muted'
        }`}
      >
        {bill.paid ? '✓' : '○'}
      </button>

      <button
        onClick={() => onEdit(bill)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <span className="text-lg">{icon}</span>
        <div className="min-w-0">
          <p
            className={`truncate text-sm font-medium ${
              bill.paid ? 'text-muted line-through' : 'text-text'
            }`}
          >
            {bill.name}
          </p>
          <p className="text-xs text-muted">
            {notLaunched ? (
              <span className="text-warning">lançar fatura</span>
            ) : bill.dueDay != null ? (
              <span className={dueSoon ? 'text-warning' : ''}>
                vence dia {bill.dueDay}
                {dueSoon && ' • em breve'}
              </span>
            ) : (
              'sem vencimento'
            )}
          </p>
        </div>
      </button>

      <span
        className={`shrink-0 text-sm font-semibold ${
          notLaunched ? 'text-muted' : ''
        }`}
      >
        {formatBRL(bill.amountCents)}
      </span>
    </li>
  )
}
