import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ElementType,
  type PointerEvent,
  type ReactNode
} from 'react'
import { motion, type MotionStyle } from 'framer-motion'
import { haptic } from '@/shared/motion/haptics'

const MotionButton = motion.button as unknown as ElementType

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
  {
    className = '',
    icon,
    label,
    onPointerDown,
    style,
    size = 'md',
    type = 'button',
    variant = 'neutral',
    ...props
  },
  ref
) {
  return (
    <MotionButton
      ref={ref}
      type={type}
      aria-label={label}
      className={`icon-button icon-button-${size} icon-button-${variant} ${className}`}
      whileHover={{ scale: 1.08, rotate: 1 }}
      whileTap={{ scale: 0.86, rotate: -4 }}
      transition={{ type: 'spring', stiffness: 600, damping: 22, mass: 0.5 }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        haptic('light')
        onPointerDown?.(event)
      }}
      style={style as MotionStyle}
      {...props}
    >
      {icon}
    </MotionButton>
  )
})
