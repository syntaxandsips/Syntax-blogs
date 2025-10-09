'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  id?: string
  title?: string
  description: string
  variant?: ToastVariant
  duration?: number
}

interface ToastRecord {
  id: string
  title?: string
  description: string
  variant: ToastVariant
  duration: number
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  success:
    'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-[6px_6px_0px_0px_rgba(16,185,129,0.35)]',
  error:
    'border-red-500 bg-red-50 text-red-900 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.35)]',
  info:
    'border-sky-500 bg-sky-50 text-sky-900 shadow-[6px_6px_0px_0px_rgba(14,165,233,0.35)]',
  warning:
    'border-amber-500 bg-amber-50 text-amber-900 shadow-[6px_6px_0px_0px_rgba(245,158,11,0.35)]',
}

const defaultDuration = 5000

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({
      id,
      title,
      description,
      variant = 'info',
      duration = defaultDuration,
    }: ToastOptions) => {
      const resolvedId =
        id ??
        (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2))

      setToasts((previous) => [
        ...previous,
        {
          id: resolvedId,
          title,
          description,
          variant,
          duration,
        },
      ])

      if (duration > 0) {
        window.setTimeout(() => {
          dismissToast(resolvedId)
        }, duration)
      }

      return resolvedId
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[1000] flex w-full max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6">
        {toasts.map((toast) => {
          const style = variantStyles[toast.variant] ?? variantStyles.info
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto overflow-hidden rounded-lg border-4 border-black bg-white transition-all duration-200 ease-out ${style}`}
            >
              <div className="flex items-start gap-3 p-4">
                <div className="flex-1">
                  {toast.title ? (
                    <p className="text-sm font-black uppercase tracking-wide">{toast.title}</p>
                  ) : null}
                  <p className="mt-1 text-sm font-semibold leading-snug">{toast.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-black bg-white text-black transition hover:-translate-y-0.5"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
