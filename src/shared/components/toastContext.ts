import { createContext, useContext } from 'react'
import type { ToastTone } from './Toast'

export interface ToastMessage {
  title: string
  description?: string
  tone?: ToastTone
}
export const ToastContext = createContext<(message: ToastMessage) => void>(() => undefined)
export const useToast = () => useContext(ToastContext)
