/**
 * Error handling utilities for consistent error management
 */

// Custom error class for API errors
export class ApiError extends Error {
  status: number
  detail?: any

  constructor(message: string, status = 500, detail?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

// Function to safely parse JSON
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return fallback
  }
}

// Function to handle async errors in components
export async function handleAsyncError<T>(
  promise: Promise<T>,
  errorHandler: (error: Error) => void,
): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    console.error("Async operation failed:", error)
    errorHandler(error instanceof Error ? error : new Error(String(error)))
    return null
  }
}

// Function to format error messages for display
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return `${error.message} (Status: ${error.status})`
  } else if (error instanceof Error) {
    return error.message
  } else {
    return String(error)
  }
}

// Function to log errors with consistent formatting
export function logError(context: string, error: unknown): void {
  const timestamp = new Date().toISOString()
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  console.error(`[${timestamp}] [ERROR] [${context}] ${errorMessage}`)
  if (errorStack) {
    console.error(`Stack trace: ${errorStack}`)
  }
}
