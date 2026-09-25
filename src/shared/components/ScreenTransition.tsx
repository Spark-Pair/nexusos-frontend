import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { PropsWithChildren } from 'react'
import { useLocation } from 'react-router-dom'

export function ScreenTransition({ children }: PropsWithChildren) {
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  const isChatRoute = /^\/app\/chats(?:\/[^/]+)?$/u.test(location.pathname)
  const transitionKey = isChatRoute ? '/app/chats' : location.pathname
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        initial={reducedMotion || isChatRoute ? false : { opacity: 0, y: 6 }}
        {...(isChatRoute ? {} : { animate: { opacity: 1, y: 0 } })}
        {...(reducedMotion || isChatRoute ? {} : { exit: { opacity: 0, y: -4 } })}
        {...(isChatRoute ? {} : { transition: { duration: 0.18, ease: 'easeOut' } })}
        className="min-h-dvh"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
