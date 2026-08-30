import { forwardRef, type ButtonHTMLAttributes, type PropsWithChildren } from 'react'

interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger'
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className = '', variant = 'secondary', ...props },
  ref
) {
  const styles =
    variant === 'primary'
      ? 'bg-slate-950 text-white hover:bg-slate-800'
      : variant === 'danger'
        ? 'bg-rose-700 text-white hover:bg-rose-800'
        : variant === 'quiet'
          ? 'bg-transparent text-slate-700 hover:bg-slate-100'
          : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
  return (
    <button
      ref={ref}
      className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})
