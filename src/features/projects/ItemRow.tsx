import { formatBRL } from '../../domain/money'
import type { ProjectItem } from '../../domain/types'

interface ItemRowProps {
  item: ProjectItem
  onToggle: (item: ProjectItem) => void
  onEdit: (item: ProjectItem) => void
  onDelete: (id: string) => void
}

/** Linha de um item de projeto, com toggle de status, edição e link. */
export function ItemRow({ item, onToggle, onEdit, onDelete }: ItemRowProps) {
  const bought = item.status === 'bought'
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <button
        onClick={() => onToggle(item)}
        aria-label={bought ? 'Marcar como pendente' : 'Marcar como comprado'}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition ${
          bought ? 'bg-brand/20 text-brand' : 'bg-surface-2 text-muted'
        }`}
      >
        {bought ? '✓' : '○'}
      </button>

      <div
        onClick={() => onEdit(item)}
        className="min-w-0 flex-1 cursor-pointer"
      >
        <p
          className={`truncate text-sm font-medium ${
            bought ? 'text-muted line-through' : 'text-text'
          }`}
        >
          {item.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted">
          {item.store && <span>{item.store}</span>}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-brand hover:underline"
            >
              abrir link ↗
            </a>
          )}
        </div>
      </div>

      <span className="shrink-0 text-sm font-semibold">
        {formatBRL(item.amountCents)}
      </span>

      <button
        onClick={() => onDelete(item.id)}
        aria-label="Excluir item"
        className="shrink-0 rounded-lg px-1 text-muted opacity-60 transition hover:text-danger hover:opacity-100"
      >
        ✕
      </button>
    </li>
  )
}
