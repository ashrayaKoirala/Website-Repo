"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType) => void
  hideToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [counter, setCounter] = useState(0)

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = counter
      setCounter((prev) => prev + 1)

      console.log(`[Toast] ${type.toUpperCase()}: ${message}`)

      setToasts((prevToasts) => [...prevToasts, { id, message, type }])

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        hideToast(id)
      }, 5000)
    },
    [counter],
  )

  const hideToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg flex items-start justify-between max-w-md transform transition-all duration-300 ease-in-out ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                  ? "bg-red-500 text-white"
                  : toast.type === "warning"
                    ? "bg-yellow-500 text-white"
                    : "bg-blue-500 text-white"
            }`}
          >
            <p className="flex-1">{toast.message}</p>
            <button
              onClick={() => hideToast(toast.id)}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
