import type { PropsWithChildren } from 'react'
export function Badge({ children }: PropsWithChildren) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-700">
      {children}
    </span>
  )
}
