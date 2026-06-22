import { useCallback, useEffect, useState } from 'react'
import {
  repository,
  type NewProject,
  type NewProjectItem,
} from '../data'
import type { Project, ProjectItem } from '../domain/types'

/** Carrega e gerencia a lista de projetos. */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProjects(await repository.listProjects())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addProject = useCallback(async (input: NewProject) => {
    const created = await repository.addProject(input)
    setProjects((p) => [created, ...p])
    return created
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    await repository.deleteProject(id)
    setProjects((p) => p.filter((proj) => proj.id !== id))
  }, [])

  return { projects, loading, error, reload: load, addProject, deleteProject }
}

/** Carrega e gerencia os itens de um projeto específico. */
export function useProjectItems(projectId: string) {
  const [items, setItems] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await repository.listProjectItems(projectId))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  const addItem = useCallback(async (input: NewProjectItem) => {
    const created = await repository.addProjectItem(input)
    setItems((i) => [...i, created])
    return created
  }, [])

  const addItems = useCallback(async (inputs: NewProjectItem[]) => {
    const created = await repository.addProjectItems(inputs)
    setItems((i) => [...i, ...created])
    return created
  }, [])

  const updateItem = useCallback(
    async (id: string, patch: Partial<NewProjectItem>) => {
      const updated = await repository.updateProjectItem(id, patch)
      setItems((i) => i.map((it) => (it.id === id ? updated : it)))
      return updated
    },
    [],
  )

  const deleteItem = useCallback(async (id: string) => {
    await repository.deleteProjectItem(id)
    setItems((i) => i.filter((it) => it.id !== id))
  }, [])

  return { items, loading, addItem, addItems, updateItem, deleteItem }
}
