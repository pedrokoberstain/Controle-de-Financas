interface Segment<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[]
  value: T
  onChange: (value: T) => void
}

/** Seletor segmentado (tipo "abas") usado para escolher o período. */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
      {segments.map((seg) => {
        const active = seg.value === value
        return (
          <button
            key={seg.value}
            onClick={() => onChange(seg.value)}
            className={`min-h-9 flex-1 rounded-lg px-3 text-sm font-medium transition ${
              active
                ? 'bg-surface text-text shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            {seg.label}
          </button>
        )
      })}
    </div>
  )
}
