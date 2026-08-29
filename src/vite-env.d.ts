/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ENABLE_DEV_TOOLS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}
