import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> {
  label: string
  icon: ReactNode
  variant?: 'neutral' | 'brand' | 'danger' | 'quiet'
  size?: 'sm' | 'md' | 'lg'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className = '', icon, label, size = 'md', type = 'button', variant = 'neutral', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={`icon-button icon-button-${size} icon-button-${variant} ${className}`}
      {...props}
    >
      {icon}
    </button>
  )
})
