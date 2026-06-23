import { Card } from '../../components/ui/Card'
import type { CategorySlice } from '../../domain/budget'
import { formatBRL } from '../../domain/money'
import type { Category } from '../../domain/types'

interface CategoryBreakdownProps {
  slices: CategorySlice[]
  categories: Category[]
}

/**
 * "Para onde vai o dinheiro": barras horizontais com o gasto por categoria
 * no período. Leve, sem biblioteca de gráficos.
 */
export function CategoryBreakdown({
  slices,
  categories,
}: CategoryBreakdownProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  if (slices.length === 0) return null

  return (
    <Card>
      <p className="mb-3 text-sm font-semibold text-muted">
        Para onde vai o dinheiro
      </p>
      <ul className="flex flex-col gap-3">
        {slices.map((slice) => {
          const category = slice.categoryId
            ? categoryById.get(slice.categoryId)
            : null
          const color = category?.color ?? '#94a3b8'
          return (
            <li key={slice.categoryId ?? 'none'}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{category?.icon ?? '📦'}</span>
                  <span>{category?.name ?? 'Outros'}</span>
                </span>
                <span className="font-medium">
                  {formatBRL(slice.spentCents)}
                  <span className="ml-1 text-xs text-muted">
                    {Math.round(slice.ratio * 100)}%
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${Math.max(3, slice.ratio * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
