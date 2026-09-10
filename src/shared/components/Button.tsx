import { forwardRef, type ButtonHTMLAttributes, type PropsWithChildren } from 'react'

interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = '',
    disabled,
    loading = false,
    size = 'md',
    type = 'button',
    variant = 'secondary',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={`button button-${size} button-${variant} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {loading ? 'Please wait' : children}
    </button>
  )
})
