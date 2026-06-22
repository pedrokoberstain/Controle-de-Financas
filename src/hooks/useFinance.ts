import { useCallback, useEffect, useState } from 'react'
import { repository, type NewTransaction } from '../data'
import type { Budget, Category, Transaction } from '../domain/types'

interface FinanceState {
  transactions: Transaction[]
  categories: Category[]
  budget: Budget | null
  loading: boolean
  error: string | null
}

const INITIAL: FinanceState = {
  transactions: [],
  categories: [],
  budget: null,
  loading: true,
  error: null,
}

/**
 * Fonte única de verdade do app: carrega dados do repositório e expõe
 * ações que mutam o estado local após persistir. Atualização otimista
 * fica para depois; por ora recarregamos o necessário.
 */
export function useFinance() {
  const [state, setState] = useState<FinanceState>(INITIAL)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [transactions, categories, budget] = await Promise.all([
        repository.listTransactions(),
        repository.listCategories(),
        repository.getBudget(),
      ])
      setState({
        transactions,
        categories,
        budget,
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro ao carregar dados',
      }))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addTransaction = useCallback(async (input: NewTransaction) => {
    const created = await repository.addTransaction(input)
    setState((s) => ({
      ...s,
      transactions: [created, ...s.transactions],
    }))
    return created
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    await repository.deleteTransaction(id)
    setState((s) => ({
      ...s,
      transactions: s.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  const setBudget = useCallback(async (budget: Budget) => {
    const saved = await repository.setBudget(budget)
    setState((s) => ({ ...s, budget: saved }))
    return saved
  }, [])

  return {
    ...state,
    reload: load,
    addTransaction,
    deleteTransaction,
    setBudget,
  }
}
