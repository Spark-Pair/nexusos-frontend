import { AuthenticationFrame } from '@shared/components/LayoutFrames'
import { ThemeToggle } from '@shared/components/ThemeToggle'
import type { PropsWithChildren, ReactNode } from 'react'

export function AuthenticationScreen({
  children,
  description,
  eyebrow,
  footer,
  title
}: PropsWithChildren<{ title: string; description: string; eyebrow: string; footer?: ReactNode }>) {
  return (
    <main className="app-canvas grid min-h-dvh place-items-center p-2 sm:p-6 lg:p-8">
      <AuthenticationFrame toolbar={<ThemeToggle />}>
        <div className="grid gap-6">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-300">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-[2rem]">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </header>
          {children}
          {footer ? (
            <footer className="border-t border-slate-200 pt-5 dark:border-slate-700">
              {footer}
            </footer>
          ) : null}
        </div>
      </AuthenticationFrame>
    </main>
  )
}
