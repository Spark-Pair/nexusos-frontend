import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type * as React from 'react'

export interface ProgressStep {
  id: string
  label: string
  description?: string
}

export function StepProgress({
  activeId,
  steps
}: {
  activeId: string
  steps: readonly ProgressStep[]
}) {
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeId)
  )
  return (
    <ol
      className="grid gap-2 sm:grid-cols-[repeat(var(--step-count),minmax(0,1fr))]"
      style={{ '--step-count': steps.length } as React.CSSProperties}
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const completed = index < activeIndex
        const active = index === activeIndex
        return (
          <li
            key={step.id}
            aria-current={active ? 'step' : undefined}
            className={`rounded-[var(--radius-surface)] border p-3 ${active ? 'border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-950' : completed ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-[var(--radius-control)] border text-xs font-bold ${active ? 'border-blue-500 bg-blue-600 text-white' : completed ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-slate-500 dark:border-slate-700'}`}
              >
                {completed ? <Check className="size-4" /> : index + 1}
              </span>
              <span className="text-xs font-bold">{step.label}</span>
            </div>
            {step.description ? (
              <p className="mt-2 text-[11px] leading-4 text-slate-500">{step.description}</p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export function Breadcrumbs({
  items
}: {
  items: readonly { label: string; onClick?: () => void }[]
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index ? <ChevronRight className="size-3.5 text-slate-400" aria-hidden="true" /> : null}
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="rounded-[var(--radius-control)] px-2 py-1.5 font-semibold text-slate-500 hover:bg-slate-100 hover:text-blue-700 dark:hover:bg-slate-800"
              >
                {item.label}
              </button>
            ) : (
              <span
                aria-current="page"
                className="px-2 py-1.5 font-semibold text-slate-900 dark:text-white"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Pagination({
  currentPage,
  onPageChange,
  totalPages
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="pagination-button"
      >
        <ChevronLeft className="size-4" />
        Previous
      </button>
      <div className="hidden items-center gap-1 sm:flex">
        {pages.map((page) => (
          <button
            type="button"
            key={page}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Page ${page}`}
            onClick={() => onPageChange(page)}
            className={`grid size-10 place-items-center rounded-[var(--radius-control)] border text-xs font-semibold ${page === currentPage ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200' : 'border-transparent text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
          >
            {page}
          </button>
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-500 sm:hidden">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="pagination-button"
      >
        Next
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
