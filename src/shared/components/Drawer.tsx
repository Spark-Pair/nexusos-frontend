import { Dialog } from '@shared/components/Dialog'
import type { PropsWithChildren } from 'react'
interface DrawerProps extends PropsWithChildren {
  open: boolean
  title: string
  onClose: () => void
}
export function Drawer(props: DrawerProps) {
  return (
    <Dialog {...props} placement="right">
      {props.children}
    </Dialog>
  )
}
