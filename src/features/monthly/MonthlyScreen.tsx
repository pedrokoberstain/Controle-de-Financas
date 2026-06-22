import { useMemo, useState } from 'react'
import { computeMonthSummary, type Bill } from '../../domain/monthly'
import { monthKey, monthLabel } from '../../domain/period'
import type { Card, FixedExpense } from '../../domain/types'
import { useMonthly } from '../../hooks/useMonthly'
import { BillRow } from './BillRow'
import { CardSheet } from './CardSheet'
import { FixedExpenseSheet } from './FixedExpenseSheet'
import { ImportFixedSheet } from './ImportFixedSheet'
import { MonthSummaryCard } from './MonthSummaryCard'
import { ProjectionCard } from './ProjectionCard'
import { SalarySheet } from './SalarySheet'

export function MonthlyScreen() {
  const {
    salaryCents,
    fixedExpenses,
    cards,
    loading,
    error,
    setSalary,
    addFixed,
    addFixedMany,
    updateFixed,
    deleteFixed,
    addCard,
    updateCard,
    deleteCard,
  } = useMonthly()

  const [showSalary, setShowSalary] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showNewFixed, setShowNewFixed] = useState(false)
  const [showNewCard, setShowNewCard] = useState(false)
  const [editingFixed, setEditingFixed] = useState<FixedExpense | null>(null)
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  const month = monthKey()
  const today = new Date().getDate()

  const summary = useMemo(
    () => computeMonthSummary(salaryCents, fixedExpenses, cards),
    [salaryCents, fixedExpenses, cards],
  )

  function handleToggle(bill: Bill) {
    const paidMonth = bill.paid ? null : month
    if (bill.kind === 'fixed') {
      void updateFixed(bill.id, { paidMonth })
    } else {
      // Garante que o "pago" se refira à fatura do mês corrente.
      void updateCard(bill.id, { paidMonth, billMonth: month })
    }
  }

  function handleEditBill(bill: Bill) {
    if (bill.kind === 'fixed') {
      const found = fixedExpenses.find((f) => f.id === bill.id)
      if (found) setEditingFixed(found)
    } else {
      const found = cards.find((c) => c.id === bill.id)
      if (found) setEditingCard(found)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Carregando...
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-danger">
        {error}
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-28 pt-6">
      <header className="mb-5">
        <h1 className="text-xl font-bold">Mês</h1>
        <p className="text-sm capitalize text-muted">{monthLabel()}</p>
      </header>

      <div className="flex flex-col gap-4">
        <MonthSummaryCard
          summary={summary}
          onEditSalary={() => setShowSalary(true)}
        />
        <ProjectionCard nextMonthCents={summary.nextMonthProjectionCents} />
      </div>

      {/* Ações */}
      <div className="mt-6 mb-3 flex gap-2">
        <button
          onClick={() => setShowNewFixed(true)}
          className="min-h-11 flex-1 rounded-xl bg-surface-2 text-sm font-medium transition active:scale-95"
        >
          + Conta fixa
        </button>
        <button
          onClick={() => setShowImport(true)}
          className="min-h-11 flex-1 rounded-xl bg-surface-2 text-sm font-medium transition active:scale-95"
        >
          📋 Importar
        </button>
        <button
          onClick={() => setShowNewCard(true)}
          className="min-h-11 flex-1 rounded-xl bg-surface-2 text-sm font-medium transition active:scale-95"
        >
          + Cartão
        </button>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">
          Contas a pagar ({summary.bills.length})
        </h2>
        {summary.bills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-3xl">📋</p>
            <p className="mt-2 text-sm text-muted">
              Nenhuma conta ainda. Adicione, cole sua lista em{' '}
              <strong>Importar</strong> ou cadastre um cartão.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {summary.bills.map((bill) => (
              <BillRow
                key={`${bill.kind}-${bill.id}`}
                bill={bill}
                today={today}
                onToggle={handleToggle}
                onEdit={handleEditBill}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Sheets */}
      {showSalary && (
        <SalarySheet
          salaryCents={salaryCents}
          onSave={setSalary}
          onClose={() => setShowSalary(false)}
        />
      )}

      {showImport && (
        <ImportFixedSheet
          onImport={addFixedMany}
          onClose={() => setShowImport(false)}
        />
      )}

      {showNewFixed && (
        <FixedExpenseSheet
          onSubmit={addFixed}
          onClose={() => setShowNewFixed(false)}
        />
      )}

      {editingFixed && (
        <FixedExpenseSheet
          expense={editingFixed}
          onSubmit={(patch) => updateFixed(editingFixed.id, patch)}
          onDelete={() => {
            void deleteFixed(editingFixed.id)
            setEditingFixed(null)
          }}
          onClose={() => setEditingFixed(null)}
        />
      )}

      {showNewCard && (
        <CardSheet
          month={month}
          onSubmit={addCard}
          onClose={() => setShowNewCard(false)}
        />
      )}

      {editingCard && (
        <CardSheet
          card={editingCard}
          month={month}
          onSubmit={(patch) => updateCard(editingCard.id, patch)}
          onDelete={() => {
            void deleteCard(editingCard.id)
            setEditingCard(null)
          }}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  )
}
