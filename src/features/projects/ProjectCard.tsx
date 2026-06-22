import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatBRL } from '../../domain/money'
import { computeProjectTotals } from '../../domain/project'
import type { Project } from '../../domain/types'
import { useProjectItems } from '../../hooks/useProjects'

interface ProjectCardProps {
  project: Project
  onOpen: (project: Project) => void
}

/** Cartão-resumo de um projeto na listagem. */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const { items } = useProjectItems(project.id)
  const totals = computeProjectTotals(items)

  return (
    <button onClick={() => onOpen(project)} className="w-full text-left">
      <Card className="transition active:scale-[0.99]">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
            style={{ backgroundColor: `${project.color}26` }}
          >
            {project.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{project.name}</p>
            <p className="text-xs text-muted">
              {totals.boughtCount} comprados · {totals.pendingCount} pendentes
            </p>
          </div>
          <span className="shrink-0 text-right">
            <span className="block text-sm font-bold">
              {formatBRL(totals.totalCents)}
            </span>
            <span className="block text-xs text-muted">total</span>
          </span>
        </div>

        <div className="mt-3">
          <ProgressBar value={totals.progress} color={project.color} />
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span className="text-brand">
              Gasto {formatBRL(totals.spentCents)}
            </span>
            <span className="text-warning">
              Falta {formatBRL(totals.pendingCents)}
            </span>
          </div>
        </div>
      </Card>
    </button>
  )
}
