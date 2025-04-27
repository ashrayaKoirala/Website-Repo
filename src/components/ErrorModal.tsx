"use client"

import type React from "react"
import { formatErrorMessage } from "../lib/error-utils"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  details?: string
  error?: unknown // Accept any error type
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, title = "Error", message, details, error }) => {
  // If an error object is provided, format it
  const errorMessage = error ? formatErrorMessage(error) : message

  // If not open, don't render anything
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>{errorMessage || "An unexpected error occurred."}</p>
              {details && (
                <div className="mt-3 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                  <pre className="text-xs">{details}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorModal
