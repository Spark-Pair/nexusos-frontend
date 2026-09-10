import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import type { ReactNode } from 'react'

export interface DataColumn<Row> {
  id: string
  header: string
  cell: (row: Row) => ReactNode
  sortable?: boolean
  className?: string
}

export type SortDirection = 'asc' | 'desc'

export function DataTable<Row extends { id: string }>({
  caption,
  columns,
  emptyMessage = 'No records found',
  onRowOpen,
  onSelectionChange,
  onSort,
  rows,
  selectedIds = [],
  sort
}: {
  caption: string
  columns: readonly DataColumn<Row>[]
  rows: readonly Row[]
  emptyMessage?: string
  selectedIds?: readonly string[]
  sort?: { columnId: string; direction: SortDirection } | null
  onSort?: (columnId: string, direction: SortDirection) => void
  onSelectionChange?: (ids: string[]) => void
  onRowOpen?: (row: Row) => void
}) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id))
  const toggleAll = () => onSelectionChange?.(allSelected ? [] : rows.map((row) => row.id))
  const toggle = (id: string) =>
    onSelectionChange?.(
      selectedIds.includes(id)
        ? selectedIds.filter((selected) => selected !== id)
        : [...selectedIds, id]
    )
  return (
    <div className="data-table-frame">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-slate-300 dark:border-slate-700">
              {onSelectionChange ? (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="size-4 accent-blue-600"
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 ${column.className ?? ''}`}
                >
                  {column.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSort(
                          column.id,
                          sort?.columnId === column.id && sort.direction === 'asc' ? 'desc' : 'asc'
                        )
                      }
                      className="inline-flex items-center gap-1.5"
                    >
                      {column.header}
                      {sort?.columnId === column.id ? (
                        sort.direction === 'asc' ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 text-slate-400" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-200 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
              >
                {onSelectionChange ? (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select row ${row.id}`}
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggle(row.id)}
                      className="size-4 accent-blue-600"
                    />
                  </td>
                ) : null}
                {columns.map((column, index) => (
                  <td key={column.id} className={`px-4 py-3 text-sm ${column.className ?? ''}`}>
                    {index === 0 && onRowOpen ? (
                      <button
                        type="button"
                        onClick={() => onRowOpen(row)}
                        className="font-semibold text-slate-950 hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
                      >
                        {column.cell(row)}
                      </button>
                    ) : (
                      column.cell(row)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <div className="grid min-h-44 place-items-center border-t border-slate-300 px-6 text-center text-sm text-slate-500 dark:border-slate-700">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  )
}
