import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BroadcastCard, ImageAttachment, MessageComposer } from './Messaging'

describe('messaging components', () => {
  it('retains text after a failed asynchronous send and allows retry', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Storage unavailable'))
      .mockResolvedValueOnce(undefined)
    render(<MessageComposer onSubmit={onSubmit} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), {
      target: { value: 'Keep this message' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Storage unavailable')
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('Keep this message')
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(''))
  })
  it('submits a local message intent and clears the composer', () => {
    const onSubmit = vi.fn()
    render(<MessageComposer onSubmit={onSubmit} quickReplies={['Do you offer COD?']} />)
    fireEvent.click(screen.getByRole('button', { name: 'Do you offer COD?' }))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(onSubmit).toHaveBeenCalledWith('Do you offer COD?', [])
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('')
  })

  it('labels attachment and broadcast states without implying delivery', () => {
    render(
      <>
        <ImageAttachment name="photo.jpg" state="local" />
        <BroadcastCard business="Studio One" body="New collection" kind="new-arrival" time="Now" />
      </>
    )
    expect(screen.getByText('Saved locally')).toBeInTheDocument()
    expect(screen.getByText('New arrival')).toBeInTheDocument()
    expect(screen.queryByText(/delivered/i)).not.toBeInTheDocument()
  })
})
