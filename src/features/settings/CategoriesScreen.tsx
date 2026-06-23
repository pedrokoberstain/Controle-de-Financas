import { useState } from 'react'
import type { Category } from '../../domain/types'
import { useCategories } from '../../hooks/useCategories'
import { CategoryFormSheet } from './CategoryFormSheet'

interface CategoriesScreenProps {
  onBack: () => void
}

export function CategoriesScreen({ onBack }: CategoriesScreenProps) {
  const { categories, loading, addCategory, updateCategory, deleteCategory } =
    useCategories()
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-28 pt-6">
      <header className="mb-5 flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="rounded-xl bg-surface-2 px-3 py-2 text-sm"
        >
          ←
        </button>
        <h1 className="flex-1 text-lg font-bold">Categorias</h1>
        <button
          onClick={() => setShowNew(true)}
          className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-bg"
        >
          + Nova
        </button>
      </header>

      {loading ? (
        <p className="py-12 text-center text-muted">Carregando...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setEditing(c)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left transition active:scale-[0.99]"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${c.color}26` }}
                >
                  {c.icon}
                </span>
                <span className="flex-1 text-sm font-medium">{c.name}</span>
                <span className="text-xs text-muted">editar</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showNew && (
        <CategoryFormSheet
          onSubmit={addCategory}
          onClose={() => setShowNew(false)}
        />
      )}

      {editing && (
        <CategoryFormSheet
          category={editing}
          onSubmit={(patch) => updateCategory(editing.id, patch)}
          onDelete={() => {
            void deleteCategory(editing.id)
            setEditing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
