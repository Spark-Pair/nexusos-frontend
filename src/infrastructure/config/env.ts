import { z } from 'zod'

const envSchema = z.object({
  VITE_APP_ENV: z.enum(['development', 'test', 'preview', 'production']),
  VITE_API_BASE_URL: z.string().min(1).default('/api'),
  VITE_ENABLE_DEV_TOOLS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  VITE_ENABLE_DEMO_IDENTITY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true')
})

const parsed = envSchema.safeParse({
  ...import.meta.env,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE
})

if (!parsed.success) {
  throw new Error(`Invalid public environment configuration: ${z.prettifyError(parsed.error)}`)
}

export const env = Object.freeze({
  appEnvironment: parsed.data.VITE_APP_ENV,
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  enableDevTools: import.meta.env.DEV && parsed.data.VITE_ENABLE_DEV_TOOLS,
  enableDemoIdentity: import.meta.env.MODE === 'test' || parsed.data.VITE_ENABLE_DEMO_IDENTITY,
  isDevelopment: import.meta.env.DEV
})

export type AppEnvironment = typeof env
