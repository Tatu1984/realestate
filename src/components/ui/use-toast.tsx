"use client"

import * as React from "react"

type ToastType = "default" | "success" | "error" | "warning"

interface Toast {
  id: string
  title?: string
  description?: string
  type?: ToastType
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { ...props, id }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] rounded-lg border p-4 shadow-lg transition-all
            ${toast.type === "success" ? "border-green-200 bg-green-50 text-green-900" : ""}
            ${toast.type === "error" ? "border-red-200 bg-red-50 text-red-900" : ""}
            ${toast.type === "warning" ? "border-yellow-200 bg-yellow-50 text-yellow-900" : ""}
            ${!toast.type || toast.type === "default" ? "border-gray-200 bg-white text-gray-900" : ""}
          `}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              {toast.title && <p className="font-medium">{toast.title}</p>}
              {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    // Return a no-op toast if not wrapped in provider
    return {
      toast: (props: Omit<Toast, "id">) => {
        console.warn("Toast called without ToastProvider:", props)
      },
      dismiss: () => {},
      toasts: [],
    }
  }
  return context
}
