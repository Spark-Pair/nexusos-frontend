export type LogContext = Readonly<Record<string, boolean | number | string | null>>

export interface Logger {
  error(message: string, error?: unknown, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
}

class ConsoleLogger implements Logger {
  public error(message: string, error?: unknown, context?: LogContext): void {
    console.error(message, error instanceof Error ? error : undefined, context)
  }

  public info(message: string, context?: LogContext): void {
    console.info(message, context)
  }

  public warn(message: string, context?: LogContext): void {
    console.warn(message, context)
  }
}

class SilentLogger implements Logger {
  public error(): void {
    return undefined
  }
  public info(): void {
    return undefined
  }
  public warn(): void {
    return undefined
  }
}

// Raw browser errors may contain sensitive values. A redacting remote adapter can replace this
// production no-op when observability is introduced; development keeps actionable console output.
export const logger: Logger = import.meta.env.DEV ? new ConsoleLogger() : new SilentLogger()
