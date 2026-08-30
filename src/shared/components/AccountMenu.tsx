import { useAuth } from '@app/auth/useAuth'
import { Button } from '@shared/components/Button'
import { ConfirmationDialog } from '@shared/components/ConfirmationDialog'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { DevelopmentIdentitySwitcher } from '@/features/authentication/DevelopmentIdentitySwitcher'

export function AccountMenu() {
  const { session, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        event.preventDefault()
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', closeWithKeyboard)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', closeWithKeyboard)
    }
  }, [open])
  if (!session.account) return <DevelopmentIdentitySwitcher />
  return (
    <div className="relative" ref={container}>
      <Button
        ref={trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {session.account.displayName}
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border bg-white p-3 shadow-xl"
        >
          <p className="px-2 text-xs uppercase tracking-wide text-slate-500">
            {session.identityKey.replaceAll('_', ' ')}
          </p>
          {session.workspace && (
            <p className="px-2 py-2 text-sm font-semibold">{session.workspace.name}</p>
          )}
          <DevelopmentIdentitySwitcher />
          <Button
            className="mt-3 w-full"
            variant="quiet"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              setConfirm(true)
            }}
          >
            Sign out
          </Button>
        </div>
      )}
      <ConfirmationDialog
        open={confirm}
        title="Sign out of NexusOS?"
        description="This development sign-out changes only the simulated identity. Unsynchronized IndexedDB mutations are preserved."
        confirmLabel="Sign out"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false)
          signOut()
          void navigate('/sign-in', { replace: true })
        }}
      />
    </div>
  )
}
