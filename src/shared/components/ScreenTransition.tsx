import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { PropsWithChildren } from 'react'
import { useLocation } from 'react-router-dom'

export function ScreenTransition({ children }: PropsWithChildren) {
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        {...(reducedMotion ? {} : { exit: { opacity: 0, y: -4 } })}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="min-h-dvh"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
