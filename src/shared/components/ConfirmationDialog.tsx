import { Button } from '@shared/components/Button'
import { Dialog } from '@shared/components/Dialog'
interface ConfirmationDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}
export function ConfirmationDialog({
  confirmLabel,
  description,
  onCancel,
  onConfirm,
  open,
  title
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} title={title} description={description} onClose={onCancel}>
      <div className="flex justify-end gap-3">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
