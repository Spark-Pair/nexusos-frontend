import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type DataColumn } from './DataTable'

interface Row {
  id: string
  name: string
}
const columns: DataColumn<Row>[] = [
  { id: 'name', header: 'Name', sortable: true, cell: (row) => row.name }
]

describe('DataTable', () => {
  it('supports selection, sorting and row opening', () => {
    const onSelectionChange = vi.fn()
    const onSort = vi.fn()
    const onRowOpen = vi.fn()
    const row = { id: 'one', name: 'Ayesha' }
    render(
      <DataTable
        caption="Customers"
        columns={columns}
        rows={[row]}
        onSelectionChange={onSelectionChange}
        onSort={onSort}
        onRowOpen={onRowOpen}
      />
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row one' }))
    fireEvent.click(screen.getByRole('button', { name: /name/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Ayesha' }))
    expect(onSelectionChange).toHaveBeenCalledWith(['one'])
    expect(onSort).toHaveBeenCalledWith('name', 'asc')
    expect(onRowOpen).toHaveBeenCalledWith(row)
  })
})
