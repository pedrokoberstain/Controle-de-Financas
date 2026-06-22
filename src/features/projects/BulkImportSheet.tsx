import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatBRL } from '../../domain/money'
import { parseProjectItems, type ParsedItem } from '../../domain/parseItems'
import type { ProjectItemStatus } from '../../domain/types'
import type { NewProjectItem } from '../../data'

interface BulkImportSheetProps {
  projectId: string
  onImport: (items: NewProjectItem[]) => Promise<unknown>
  onClose: () => void
}

const PLACEHOLDER = `Cole aqui a lista, ex.:

✅ Peças compradas:
- Carburador (Titan 125): R$ 190,00
- Vela de ignição NGK: R$ 22,00

Pendentes:
- Escapamento
R$ 202,00
https://...`

/**
 * Cola-e-importa: o usuário cola um texto livre (lista do WhatsApp) e o
 * sistema extrai os itens. Mostra uma prévia editável antes de salvar.
 */
export function BulkImportSheet({
  projectId,
  onImport,
  onClose,
}: BulkImportSheetProps) {
  const [text, setText] = useState('')
  const [overrides, setOverrides] = useState<Record<number, ProjectItemStatus>>(
    {},
  )
  const [submitting, setSubmitting] = useState(false)

  const parsed = useMemo<ParsedItem[]>(
    () => (text.trim() ? parseProjectItems(text) : []),
    [text],
  )

  const total = parsed.reduce((acc, it) => acc + it.amountCents, 0)

  function statusOf(index: number, item: ParsedItem): ProjectItemStatus {
    return overrides[index] ?? item.status
  }

  function toggle(index: number, item: ParsedItem) {
    const next = statusOf(index, item) === 'bought' ? 'pending' : 'bought'
    setOverrides((o) => ({ ...o, [index]: next }))
  }

  async function handleImport() {
    if (parsed.length === 0) return
    setSubmitting(true)
    try {
      const inputs: NewProjectItem[] = parsed.map((item, i) => ({
        projectId,
        name: item.name,
        amountCents: item.amountCents,
        status: statusOf(i, item),
        url: item.url,
        store: item.store,
      }))
      await onImport(inputs)
      onClose()
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      title="Importar lista"
      subtitle="Cole o texto e o sistema separa os itens, valores e links. Revise antes de salvar."
      onClose={onClose}
    >
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={6}
        className="mb-4 w-full resize-none rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-brand"
      />

      {parsed.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>
              {parsed.length} {parsed.length === 1 ? 'item' : 'itens'} · toque
              para alternar status
            </span>
            <span className="font-semibold text-text">{formatBRL(total)}</span>
          </div>

          <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {parsed.map((item, i) => {
              const status = statusOf(i, item)
              const bought = status === 'bought'
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-border bg-bg p-2"
                >
                  <button
                    type="button"
                    onClick={() => toggle(i, item)}
                    className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${
                      bought
                        ? 'bg-brand/20 text-brand'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {bought ? '✅' : '🕓'}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.name}</p>
                    {item.store && (
                      <p className="text-xs text-muted">{item.store}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatBRL(item.amountCents)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          className="flex-1"
          onClick={handleImport}
          disabled={submitting || parsed.length === 0}
        >
          {submitting
            ? 'Importando...'
            : `Importar ${parsed.length || ''}`.trim()}
        </Button>
      </div>
    </Sheet>
  )
}
