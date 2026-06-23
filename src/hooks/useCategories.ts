import { useCallback, useEffect, useState } from 'react'
import { repository, type NewCategory } from '../data'
import type { Category } from '../domain/types'

/** Carrega e gerencia as categorias (CRUD). */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setCategories(await repository.listCategories())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addCategory = useCallback(async (input: NewCategory) => {
    const created = await repository.addCategory(input)
    setCategories((c) => [...c, created])
    return created
  }, [])

  const updateCategory = useCallback(
    async (id: string, patch: Partial<NewCategory>) => {
      const updated = await repository.updateCategory(id, patch)
      setCategories((c) => c.map((cat) => (cat.id === id ? updated : cat)))
      return updated
    },
    [],
  )

  const deleteCategory = useCallback(async (id: string) => {
    await repository.deleteCategory(id)
    setCategories((c) => c.filter((cat) => cat.id !== id))
  }, [])

  return { categories, loading, addCategory, updateCategory, deleteCategory }
}
