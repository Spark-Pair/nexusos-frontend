import { useCallback, useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePwaLifecycle() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent>()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker
  } = useRegisterSW()

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', capturePrompt)
    const clearPrompt = () => setInstallPrompt(undefined)
    window.addEventListener('appinstalled', clearPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt)
      window.removeEventListener('appinstalled', clearPrompt)
    }
  }, [])

  const install = useCallback(async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(undefined)
  }, [installPrompt])

  const update = useCallback(async () => {
    setNeedRefresh(false)
    await updateServiceWorker(true)
  }, [setNeedRefresh, updateServiceWorker])

  const dismissOfflineReady = useCallback(() => setOfflineReady(false), [setOfflineReady])
  const dismissUpdate = useCallback(() => setNeedRefresh(false), [setNeedRefresh])

  return {
    canInstall: Boolean(installPrompt),
    dismissOfflineReady,
    dismissUpdate,
    install,
    needRefresh,
    offlineReady,
    update
  }
}
