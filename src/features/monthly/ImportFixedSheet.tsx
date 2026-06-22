import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { formatBRL } from '../../domain/money'
import { parseFixedExpenses, type ParsedFixed } from '../../domain/parseFixed'
import type { NewFixedExpense } from '../../data'

interface ImportFixedSheetProps {
  onImport: (items: NewFixedExpense[]) => Promise<unknown>
  onClose: () => void
}

const PLACEHOLDER = `Cole sua lista, ex.:

Tiger 800 - R$ 1262,92 dia: 21
VIVO R$ 47,00 dia: 18
Netflix R$ 20,90 dia: 15
Spotify R$ 23,90 dia: 13`

/** Cola-e-importa contas fixas a partir de texto livre. */
export function ImportFixedSheet({ onImport, onClose }: ImportFixedSheetProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const parsed = useMemo<ParsedFixed[]>(
    () => (text.trim() ? parseFixedExpenses(text) : []),
    [text],
  )
  const total = parsed.reduce((acc, p) => acc + p.amountCents, 0)

  async function handleImport() {
    if (parsed.length === 0) return
    setSubmitting(true)
    try {
      const inputs: NewFixedExpense[] = parsed.map((p) => ({
        name: p.name,
        amountCents: p.amountCents,
        dueDay: p.dueDay,
        paidMonth: null,
      }))
      await onImport(inputs)
      onClose()
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <Sheet
      title="Importar contas fixas"
      subtitle="Cole a lista e o sistema separa nome, valor e dia de vencimento."
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
              {parsed.length} {parsed.length === 1 ? 'conta' : 'contas'}
            </span>
            <span className="font-semibold text-text">{formatBRL(total)}</span>
          </div>
          <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {parsed.map((p, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-xl border border-border bg-bg p-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.dueDay ? `vence dia ${p.dueDay}` : 'sem vencimento'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {formatBRL(p.amountCents)}
                </span>
              </li>
            ))}
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
          {submitting ? 'Importando...' : `Importar ${parsed.length || ''}`.trim()}
        </Button>
      </div>
    </Sheet>
  )
}
