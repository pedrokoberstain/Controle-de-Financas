import { useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatBRL } from '../../domain/money'
import { computeProjectTotals } from '../../domain/project'
import type { Project, ProjectItem } from '../../domain/types'
import { useProjectItems } from '../../hooks/useProjects'
import { BulkImportSheet } from './BulkImportSheet'
import { ItemFormSheet } from './ItemFormSheet'
import { ItemRow } from './ItemRow'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  onDeleteProject: (id: string) => void
}

export function ProjectDetail({
  project,
  onBack,
  onDeleteProject,
}: ProjectDetailProps) {
  const { items, addItem, addItems, updateItem, deleteItem } = useProjectItems(
    project.id,
  )
  const [showItemForm, setShowItemForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null)

  const totals = useMemo(() => computeProjectTotals(items), [items])
  const bought = items.filter((i) => i.status === 'bought')
  const pending = items.filter((i) => i.status === 'pending')

  const toggle = (item: ProjectItem) =>
    void updateItem(item.id, {
      status: item.status === 'bought' ? 'pending' : 'bought',
    })

  function handleDeleteProject() {
    if (confirm(`Excluir o projeto "${project.name}" e todos os seus itens?`)) {
      onDeleteProject(project.id)
      onBack()
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-28 pt-6">
      <header className="mb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="rounded-xl bg-surface-2 px-3 py-2 text-sm"
        >
          ←
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-xl">{project.icon}</span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">{project.name}</h1>
            {project.notes && (
              <p className="truncate text-xs text-muted">{project.notes}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleDeleteProject}
          aria-label="Excluir projeto"
          className="rounded-xl px-2 py-2 text-muted transition hover:text-danger"
        >
          🗑️
        </button>
      </header>

      {/* Resumo de totais */}
      <Card
        className="mb-5"
        // realce sutil com a cor do projeto
      >
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted">Gasto</p>
            <p className="mt-1 text-sm font-bold text-brand">
              {formatBRL(totals.spentCents)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Pendente</p>
            <p className="mt-1 text-sm font-bold text-warning">
              {formatBRL(totals.pendingCents)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Total</p>
            <p className="mt-1 text-sm font-bold">
              {formatBRL(totals.totalCents)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={totals.progress} color={project.color} />
          <p className="mt-2 text-center text-xs text-muted">
            {Math.round(totals.progress * 100)}% concluído
            {project.targetCents != null && (
              <> · meta {formatBRL(project.targetCents)}</>
            )}
          </p>
        </div>
      </Card>

      {/* Ações */}
      <div className="mb-5 grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowImport(true)}
          className="min-h-11 rounded-xl bg-surface-2 text-sm font-medium transition active:scale-95"
        >
          📋 Importar lista
        </button>
        <button
          onClick={() => setShowItemForm(true)}
          className="min-h-11 rounded-xl bg-brand text-sm font-semibold text-bg transition active:scale-95"
        >
          + Adicionar item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-3xl">🧰</p>
          <p className="mt-2 text-sm text-muted">
            Sem itens ainda. Cole sua lista em <strong>Importar lista</strong> ou
            adicione manualmente.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {pending.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-warning">
                🕓 Pendentes ({pending.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {pending.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onToggle={toggle}
                    onEdit={setEditingItem}
                    onDelete={(id) => void deleteItem(id)}
                  />
                ))}
              </ul>
            </section>
          )}

          {bought.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-brand">
                ✅ Comprados ({bought.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {bought.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onToggle={toggle}
                    onEdit={setEditingItem}
                    onDelete={(id) => void deleteItem(id)}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {showItemForm && (
        <ItemFormSheet
          projectId={project.id}
          onSubmit={addItem}
          onClose={() => setShowItemForm(false)}
        />
      )}

      {editingItem && (
        <ItemFormSheet
          projectId={project.id}
          item={editingItem}
          onSubmit={(patch) => updateItem(editingItem.id, patch)}
          onClose={() => setEditingItem(null)}
        />
      )}

      {showImport && (
        <BulkImportSheet
          projectId={project.id}
          onImport={addItems}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  )
}
