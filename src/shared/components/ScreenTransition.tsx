import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRef, type PropsWithChildren } from 'react'
import { useLocation } from 'react-router-dom'

const routeIndex = (pathname: string) => {
  if (pathname.startsWith('/app/chats')) return 0
  if (pathname.endsWith('/lists')) return 1
  if (pathname.endsWith('/compose')) return 2
  if (pathname.endsWith('/history')) return 3
  if (pathname.startsWith('/app/profile')) {
    const section = pathname.split('/')[3]
    const sectionIndex = [
      'profile',
      'privacy',
      'appearance',
      'notifications',
      'business',
      'account'
    ].indexOf(section ?? '')
    return sectionIndex < 0 ? 4 : sectionIndex + 5
  }
  if (pathname.startsWith('/admin/users')) return 0
  if (pathname.startsWith('/admin/moderation')) return 1
  return -1
}

export function ScreenTransition({ children }: PropsWithChildren) {
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  const previousPath = useRef(location.pathname)
  const direction = routeIndex(location.pathname) >= routeIndex(previousPath.current) ? 1 : -1
  previousPath.current = location.pathname
  const isChatRoute = /^\/app\/chats(?:\/[^/]+)?$/u.test(location.pathname)
  const transitionKey = isChatRoute ? '/app/chats' : location.pathname
  return (
    <div className="grid min-h-dvh">
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        <motion.div
          key={transitionKey}
          custom={direction}
          initial={reducedMotion || isChatRoute ? false : 'enter'}
          animate="center"
          {...(reducedMotion ? {} : { exit: 'exit' })}
          variants={{
            enter: (nextDirection: number) => ({
              opacity: reducedMotion ? 1 : 0.985,
              x: reducedMotion ? 0 : 24 * nextDirection
            }),
            center: { opacity: 1, x: 0 },
            exit: (nextDirection: number) => ({
              opacity: reducedMotion ? 1 : 0.985,
              x: reducedMotion ? 0 : -24 * nextDirection
            })
          }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 360, damping: 34, mass: 0.8 }
          }
          className="min-h-dvh w-full"
          style={{ gridArea: '1 / 1' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
