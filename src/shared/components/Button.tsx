import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ElementType,
  type PointerEvent,
  type PropsWithChildren
} from 'react'
import { motion, type MotionStyle } from 'framer-motion'
import { haptic } from '@/shared/motion/haptics'

const MotionButton = motion.button as unknown as ElementType

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
    onPointerDown,
    style,
    ...props
  },
  ref
) {
  return (
    <MotionButton
      ref={ref}
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={`button button-${size} button-${variant} ${className}`}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24, mass: 0.6 }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        haptic('light')
        onPointerDown?.(event)
      }}
      style={style as MotionStyle}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {loading ? 'Please wait' : children}
    </MotionButton>
  )
})
