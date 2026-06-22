import { useMemo, useState } from 'react'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { summarizePeriod } from '../../domain/budget'
import { PERIOD_LABELS } from '../../domain/period'
import type { PeriodKey } from '../../domain/types'
import { useFinance } from '../../hooks/useFinance'
import { BalanceCard } from './BalanceCard'
import { BudgetSheet } from './BudgetSheet'
import { StatsRow } from './StatsRow'
import { TransactionForm } from './TransactionForm'
import { TransactionList } from './TransactionList'

const PERIOD_SEGMENTS: { value: PeriodKey; label: string }[] = [
  { value: 'day', label: PERIOD_LABELS.day },
  { value: 'week', label: PERIOD_LABELS.week },
  { value: 'month', label: PERIOD_LABELS.month },
]

export function Dashboard() {
  const {
    transactions,
    categories,
    budget,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    setBudget,
  } = useFinance()

  const [period, setPeriod] = useState<PeriodKey>('day')
  const [showForm, setShowForm] = useState(false)
  const [showBudget, setShowBudget] = useState(false)

  const summary = useMemo(() => {
    if (!budget) return null
    return summarizePeriod(transactions, budget, period)
  }, [transactions, budget, period])

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
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Minhas Finanças</h1>
          <p className="text-sm text-muted">Controle do seu dia a dia</p>
        </div>
        <button
          onClick={() => setShowBudget(true)}
          className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted transition hover:text-text"
        >
          ⚙️ Orçamento
        </button>
      </header>

      <div className="mb-4">
        <SegmentedControl
          segments={PERIOD_SEGMENTS}
          value={period}
          onChange={setPeriod}
        />
      </div>

      {summary && (
        <div className="flex flex-col gap-4">
          <BalanceCard summary={summary} />
          <StatsRow summary={summary} />
        </div>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted">
          Lançamentos recentes
        </h2>
        <TransactionList
          transactions={transactions.slice(0, 30)}
          categories={categories}
          onDelete={(id) => void deleteTransaction(id)}
        />
      </section>

      {/* Botão flutuante de novo lançamento. */}
      <button
        onClick={() => setShowForm(true)}
        aria-label="Novo lançamento"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-3xl text-bg shadow-lg shadow-brand/30 transition active:scale-95"
      >
        +
      </button>

      {showForm && (
        <TransactionForm
          categories={categories}
          onSubmit={addTransaction}
          onClose={() => setShowForm(false)}
        />
      )}

      {showBudget && budget && (
        <BudgetSheet
          budget={budget}
          onSave={setBudget}
          onClose={() => setShowBudget(false)}
        />
      )}
    </div>
  )
}
