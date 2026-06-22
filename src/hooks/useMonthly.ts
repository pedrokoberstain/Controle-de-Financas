import { useCallback, useEffect, useState } from 'react'
import {
  repository,
  type NewCard,
  type NewFixedExpense,
} from '../data'
import type { Card, FixedExpense } from '../domain/types'

interface MonthlyState {
  salaryCents: number
  fixedExpenses: FixedExpense[]
  cards: Card[]
  loading: boolean
  error: string | null
}

const INITIAL: MonthlyState = {
  salaryCents: 0,
  fixedExpenses: [],
  cards: [],
  loading: true,
  error: null,
}

/** Carrega e gerencia salário, contas fixas e cartões do mês. */
export function useMonthly() {
  const [state, setState] = useState<MonthlyState>(INITIAL)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [settings, fixedExpenses, cards] = await Promise.all([
        repository.getMonthlySettings(),
        repository.listFixedExpenses(),
        repository.listCards(),
      ])
      setState({
        salaryCents: settings.salaryCents,
        fixedExpenses,
        cards,
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro ao carregar',
      }))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setSalary = useCallback(async (salaryCents: number) => {
    await repository.setMonthlySettings({ salaryCents })
    setState((s) => ({ ...s, salaryCents }))
  }, [])

  // ----- Contas fixas
  const addFixed = useCallback(async (input: NewFixedExpense) => {
    const created = await repository.addFixedExpense(input)
    setState((s) => ({ ...s, fixedExpenses: [...s.fixedExpenses, created] }))
    return created
  }, [])

  const addFixedMany = useCallback(async (inputs: NewFixedExpense[]) => {
    const created = await repository.addFixedExpenses(inputs)
    setState((s) => ({ ...s, fixedExpenses: [...s.fixedExpenses, ...created] }))
    return created
  }, [])

  const updateFixed = useCallback(
    async (id: string, patch: Partial<NewFixedExpense>) => {
      const updated = await repository.updateFixedExpense(id, patch)
      setState((s) => ({
        ...s,
        fixedExpenses: s.fixedExpenses.map((f) => (f.id === id ? updated : f)),
      }))
      return updated
    },
    [],
  )

  const deleteFixed = useCallback(async (id: string) => {
    await repository.deleteFixedExpense(id)
    setState((s) => ({
      ...s,
      fixedExpenses: s.fixedExpenses.filter((f) => f.id !== id),
    }))
  }, [])

  // ----- Cartões
  const addCard = useCallback(async (input: NewCard) => {
    const created = await repository.addCard(input)
    setState((s) => ({ ...s, cards: [...s.cards, created] }))
    return created
  }, [])

  const updateCard = useCallback(
    async (id: string, patch: Partial<NewCard>) => {
      const updated = await repository.updateCard(id, patch)
      setState((s) => ({
        ...s,
        cards: s.cards.map((c) => (c.id === id ? updated : c)),
      }))
      return updated
    },
    [],
  )

  const deleteCard = useCallback(async (id: string) => {
    await repository.deleteCard(id)
    setState((s) => ({ ...s, cards: s.cards.filter((c) => c.id !== id) }))
  }, [])

  return {
    ...state,
    reload: load,
    setSalary,
    addFixed,
    addFixedMany,
    updateFixed,
    deleteFixed,
    addCard,
    updateCard,
    deleteCard,
  }
}
