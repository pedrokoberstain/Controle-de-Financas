import { Card as UICard } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { computeCardMargin } from '../../domain/monthly'
import { formatBRL } from '../../domain/money'
import type { Card } from '../../domain/types'

interface CreditCardsSectionProps {
  cards: Card[]
  month: string
  onEdit: (card: Card) => void
}

/**
 * Margem de crédito por cartão: quanto ainda dá pra passar (limite menos a
 * fatura aberta do mês). Toca no cartão para editar limite/fatura.
 */
export function CreditCardsSection({
  cards,
  month,
  onEdit,
}: CreditCardsSectionProps) {
  if (cards.length === 0) return null

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-semibold text-muted">
        Crédito disponível
      </h2>
      <div className="flex flex-col gap-3">
        {cards.map((card) => {
          const m = computeCardMargin(card, month)
          const noLimit = m.limitCents === 0
          const over = m.availableCents < 0
          const accent = over
            ? 'var(--color-danger)'
            : m.usedRatio >= 0.8
              ? 'var(--color-warning)'
              : 'var(--color-brand)'

          return (
            <button
              key={card.id}
              onClick={() => onEdit(card)}
              className="w-full text-left"
            >
              <UICard className="transition active:scale-[0.99]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    💳 {card.name}
                  </span>
                  {noLimit ? (
                    <span className="text-xs text-warning">definir limite</span>
                  ) : (
                    <span className="text-right">
                      <span
                        className="block text-lg font-bold"
                        style={{ color: accent }}
                      >
                        {formatBRL(m.availableCents)}
                      </span>
                      <span className="block text-[11px] text-muted">
                        disponível
                      </span>
                    </span>
                  )}
                </div>

                {!noLimit && (
                  <div className="mt-3">
                    <ProgressBar value={m.usedRatio} color={accent} />
                    <div className="mt-1 flex justify-between text-xs text-muted">
                      <span>Fatura {formatBRL(m.billCents)}</span>
                      <span>Limite {formatBRL(m.limitCents)}</span>
                    </div>
                  </div>
                )}
              </UICard>
            </button>
          )
        })}
      </div>
    </section>
  )
}
