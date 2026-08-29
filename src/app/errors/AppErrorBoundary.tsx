import { logger } from '@infrastructure/logging/logger'
import { ErrorState } from '@shared/components/states/ErrorState'
import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'

interface State {
  hasError: boolean
}

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  public state: State = { hasError: false }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('React render failed', error, { componentStack: info.componentStack ?? '' })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="NexusOS could not load"
          description="Your local data is still on this device. Reload the application to try again."
          actionLabel="Reload application"
          onAction={() => window.location.reload()}
        />
      )
    }

    return this.props.children
  }
}
