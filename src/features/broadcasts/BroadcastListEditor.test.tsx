import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BroadcastListEditor } from './BroadcastListEditor'

describe('BroadcastListEditor', () => {
  it('submits once, keeps input after rejection, and allows retry', async () => {
    let rejectSave: (error: Error) => void = () => undefined
    const onSave = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((_resolve, reject) => {
            rejectSave = reject
          })
      )
      .mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(
      <BroadcastListEditor
        list={null}
        customers={[]}
        customerError=""
        onRetry={vi.fn()}
        onClose={onClose}
        onSave={onSave}
      />
    )
    fireEvent.change(screen.getByLabelText('List name'), {
      target: { value: '  Regular customers  ' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create list' }))
    expect(onSave).toHaveBeenCalledWith('Regular customers', [])
    const pendingButton = screen.getByRole('button', { name: 'Please wait' })
    expect(pendingButton).toBeDisabled()
    fireEvent.click(pendingButton)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
    await act(async () => {
      rejectSave(new Error('Connection lost. Please retry.'))
      await Promise.resolve()
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Connection lost')
    expect(screen.getByLabelText('List name')).toHaveValue('  Regular customers  ')
    fireEvent.click(screen.getByRole('button', { name: 'Create list' }))
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2))
  })
})
