import { useState } from 'react'
import { useProjects } from '../../hooks/useProjects'
import { ProjectCard } from './ProjectCard'
import { ProjectDetail } from './ProjectDetail'
import { ProjectFormSheet } from './ProjectFormSheet'

export function ProjectsScreen() {
  const { projects, loading, error, addProject, deleteProject } = useProjects()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const selected = projects.find((p) => p.id === selectedId) ?? null

  if (selected) {
    return (
      <ProjectDetail
        project={selected}
        onBack={() => setSelectedId(null)}
        onDeleteProject={deleteProject}
      />
    )
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-28 pt-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Projetos</h1>
          <p className="text-sm text-muted">Metas e listas de gastos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-bg"
        >
          + Novo
        </button>
      </header>

      {loading ? (
        <p className="py-12 text-center text-muted">Carregando...</p>
      ) : error ? (
        <p className="py-12 text-center text-danger">{error}</p>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl">🎯</p>
          <p className="mt-2 text-sm text-muted">
            Nenhum projeto ainda. Crie um para a sua moto, viagem, reforma — e
            cole sua lista de itens.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={(p) => setSelectedId(p.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ProjectFormSheet
          onSubmit={addProject}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
