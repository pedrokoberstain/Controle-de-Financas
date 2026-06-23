import { useMemo, useRef, useState } from 'react'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { expensesByCategory, summarizePeriod } from '../../domain/budget'
import { PERIOD_LABELS } from '../../domain/period'
import type { PeriodKey, Transaction } from '../../domain/types'
import type { NewTransaction } from '../../data'
import { useFinance } from '../../hooks/useFinance'
import { describeError, scanReceipt } from '../assistant/scanReceipt'
import { BalanceCard } from './BalanceCard'
import { BudgetSheet } from './BudgetSheet'
import { CategoryBreakdown } from './CategoryBreakdown'
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
    updateTransaction,
    deleteTransaction,
    setBudget,
  } = useFinance()

  const [period, setPeriod] = useState<PeriodKey>('day')
  const [showForm, setShowForm] = useState(false)
  const [showBudget, setShowBudget] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [scanInitial, setScanInitial] = useState<Partial<NewTransaction> | null>(
    null,
  )
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const scanInput = useRef<HTMLInputElement>(null)

  async function handleScan(file: File) {
    setScanning(true)
    setScanError(null)
    try {
      const r = await scanReceipt(file)
      const categoryId =
        categories.find(
          (c) => c.name.toLowerCase() === r.category.toLowerCase(),
        )?.id ?? undefined
      setScanInitial({
        type: 'expense',
        amountCents: r.amountCents,
        description: r.merchant,
        categoryId: categoryId ?? null,
        date: r.date || undefined,
      })
    } catch (err) {
      setScanError(describeError(err))
    } finally {
      setScanning(false)
    }
  }

  const summary = useMemo(() => {
    if (!budget) return null
    return summarizePeriod(transactions, budget, period)
  }, [transactions, budget, period])

  const categorySlices = useMemo(
    () => expensesByCategory(transactions, period),
    [transactions, period],
  )

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
        <div className="flex gap-1">
          <button
            onClick={() => scanInput.current?.click()}
            disabled={scanning}
            aria-label="Escanear nota"
            className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted transition hover:text-text disabled:opacity-50"
          >
            {scanning ? '⏳' : '📷'}
          </button>
          <button
            onClick={() => setShowBudget(true)}
            className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted transition hover:text-text"
          >
            ⚙️
          </button>
        </div>
      </header>

      <input
        ref={scanInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleScan(file)
          e.target.value = ''
        }}
      />

      {scanning && (
        <p className="mb-3 text-center text-sm text-muted">
          📷 Lendo a nota com IA...
        </p>
      )}
      {scanError && (
        <p className="mb-3 text-center text-sm text-danger">{scanError}</p>
      )}

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
          <CategoryBreakdown slices={categorySlices} categories={categories} />
        </div>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted">
          Lançamentos recentes
        </h2>
        <TransactionList
          transactions={transactions.slice(0, 30)}
          categories={categories}
          onEdit={setEditingTx}
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

      {editingTx && (
        <TransactionForm
          categories={categories}
          transaction={editingTx}
          onSubmit={(patch) => updateTransaction(editingTx.id, patch)}
          onDelete={() => {
            void deleteTransaction(editingTx.id)
            setEditingTx(null)
          }}
          onClose={() => setEditingTx(null)}
        />
      )}

      {scanInitial && (
        <TransactionForm
          categories={categories}
          initial={scanInitial}
          onSubmit={addTransaction}
          onClose={() => setScanInitial(null)}
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
