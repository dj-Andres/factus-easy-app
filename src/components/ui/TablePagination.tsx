interface PaginationProps {
  page: number
  lastPage: number
  onPageChange: (page: number) => void
}

function getPageRange(current: number, last: number): (number | '…')[] {
  const pages: (number | '…')[] = []
  const siblings = 1
  const start = Math.max(2, current - siblings)
  const end = Math.min(last - 1, current + siblings)

  pages.push(1)
  if (start > 2) pages.push('…')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < last - 1) pages.push('…')
  if (last > 1) pages.push(last)

  return pages
}

export default function TablePagination({ page, lastPage, onPageChange }: PaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-border-warm px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[12px] text-faint">
        Página {page} de {lastPage}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-border-warm px-2.5 py-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ‹ Anterior
        </button>
        {getPageRange(page, lastPage).map((p, i) =>
          p === '…' ? (
            <span key={`e-${i}`} className="px-1.5 text-[13px] text-faint">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              disabled={p === page}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                p === page
                  ? 'cursor-default border border-accent bg-accent text-white'
                  : 'border border-border-warm text-muted hover:bg-surface-2'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-border-warm px-2.5 py-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente ›
        </button>
      </div>
    </div>
  )
}
