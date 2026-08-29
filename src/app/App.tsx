import { AppErrorBoundary } from '@app/errors/AppErrorBoundary'
import { LoadingScreen } from '@shared/components/LoadingScreen'
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router'

const FoundationScreen = lazy(async () => import('@app/shell/FoundationScreen'))

export function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="*" element={<FoundationScreen />} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  )
}
