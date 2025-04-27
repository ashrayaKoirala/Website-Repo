"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Squircle, Pause, Play, SkipForward } from "lucide-react"

interface WorkflowStep {
  worker: string
  params: Record<string, any>
  status?: "pending" | "running" | "completed" | "error"
  progress?: number
}

interface PersonaWorkflowPlayerProps {
  workflow: WorkflowStep[]
  onComplete: () => void
  onCancel: () => void
}

const PersonaWorkflowPlayer: React.FC<PersonaWorkflowPlayerProps> = ({ workflow, onComplete, onCancel }) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize steps with status
    const initialSteps = workflow.map((step) => ({
      ...step,
      status: "pending",
      progress: 0,
    }))

    setSteps(initialSteps)

    // Set first step to running
    if (initialSteps.length > 0) {
      const updatedSteps = [...initialSteps]
      updatedSteps[0].status = "running"
      setSteps(updatedSteps)

      // Start progress simulation for first step
      simulateStepProgress(0)
    }
  }, [workflow])

  const simulateStepProgress = (stepIndex: number) => {
    if (stepIndex >= workflow.length) {
      setIsComplete(true)
      onComplete()
      return
    }

    let progress = 0
    const interval = setInterval(() => {
      if (isPaused) return

      progress += Math.random() * 5 + 2 // Random progress between 2-7%

      if (progress >= 100) {
        clearInterval(interval)
        progress = 100

        // Mark current step as completed
        const updatedSteps = [...steps]
        updatedSteps[stepIndex].status = "completed"
        updatedSteps[stepIndex].progress = 100

        // Set next step to running
        if (stepIndex + 1 < updatedSteps.length) {
          updatedSteps[stepIndex + 1].status = "running"
          setSteps(updatedSteps)
          setCurrentStep(stepIndex + 1)

          // Start next step
          setTimeout(() => {
            simulateStepProgress(stepIndex + 1)
          }, 500)
        } else {
          setSteps(updatedSteps)
          setIsComplete(true)
          onComplete()
        }
      } else {
        // Update progress
        const updatedSteps = [...steps]
        updatedSteps[stepIndex].progress = progress
        setSteps(updatedSteps)
      }
    }, 200)

    // Cleanup
    return () => clearInterval(interval)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const skipStep = () => {
    if (currentStep < steps.length - 1) {
      const updatedSteps = [...steps]
      updatedSteps[currentStep].status = "completed"
      updatedSteps[currentStep].progress = 100
      updatedSteps[currentStep + 1].status = "running"

      setSteps(updatedSteps)
      setCurrentStep(currentStep + 1)

      // Start next step
      simulateStepProgress(currentStep + 1)
    }
  }

  const getCurrentStepName = () => {
    if (steps.length === 0 || currentStep >= steps.length) {
      return "No steps"
    }

    const step = steps[currentStep]
    return step.worker
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getOverallProgress = () => {
    if (steps.length === 0) return 0

    const totalProgress = steps.reduce((acc, step) => acc + (step.progress || 0), 0)
    return Math.round(totalProgress / steps.length)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Workflow Execution</h3>
        <p className="text-gray-600">Running {steps.length} workflow steps</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start space-x-3 mb-4">
          <Squircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-600">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm font-medium">{getCurrentStepName()}</span>
              </div>
              <div>
                <span className="text-sm font-medium">{getOverallProgress()}% Complete</span>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${getOverallProgress()}%` }} />
            </div>

            {/* Steps progress */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      step.status === "completed"
                        ? "bg-black text-white"
                        : step.status === "running"
                          ? "border-2 border-black"
                          : "border-2 border-gray-200"
                    }`}
                  >
                    {step.status === "completed" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{step.worker}</span>
                      <span className="text-xs text-gray-500">
                        {step.status === "completed"
                          ? "100%"
                          : step.status === "running"
                            ? `${Math.round(step.progress || 0)}%`
                            : "0%"}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${step.status === "completed" ? "bg-black" : "bg-gray-400"}`}
                        style={{ width: `${step.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={onCancel}
              className="py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>

            <div className="flex space-x-2">
              <button
                onClick={togglePause}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isComplete}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
              </button>

              <button
                onClick={skipStep}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isComplete || currentStep >= steps.length - 1}
              >
                <SkipForward size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default PersonaWorkflowPlayer
