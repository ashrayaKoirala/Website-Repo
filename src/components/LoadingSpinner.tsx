import type React from "react"

interface LoadingSpinnerProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} rounded-full border-gray-300 border-t-black animate-spin`}
        role="status"
        aria-label="loading"
      ></div>
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
