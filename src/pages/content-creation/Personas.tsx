"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { CircleAlert, ArrowRight, File, Upload, User, X, Zap, Play, Pause, SkipForward } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface WorkflowStep {
  worker: string
  params: Record<string, any>
  status?: "pending" | "running" | "completed" | "error"
  progress?: number
}

interface Persona {
  id: string
  name: string
  description: string
  workflow: WorkflowStep[]
}

const Personas = () => {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activePersona, setActivePersona] = useState<Persona | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Load personas from localStorage on component mount
  useEffect(() => {
    const savedPersonas = localStorage.getItem("contentObsessed_personas")
    if (savedPersonas) {
      try {
        setPersonas(JSON.parse(savedPersonas))
      } catch (err) {
        console.error("Error loading saved personas:", err)
      }
    }
  }, [])

  // Save personas to localStorage when they change
  useEffect(() => {
    if (personas.length > 0) {
      localStorage.setItem("contentObsessed_personas", JSON.stringify(personas))
    }
  }, [personas])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [])

  const handleFile = useCallback((file: File) => {
    if (file.type !== "application/json") {
      setError("Please upload a JSON file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string
        const persona = JSON.parse(result)

        // Validate persona format
        if (!persona.name || !persona.description) {
          setError("Invalid persona format. Missing name or description.")
          return
        }

        const newPersona: Persona = {
          id: Date.now().toString(),
          name: persona.name,
          description: persona.description,
          workflow: persona.workflow || [],
        }

        setPersonas((prev) => [...prev, newPersona])
        setError(null)
      } catch (err) {
        setError("Invalid JSON format")
      }
    }
    reader.readAsText(file)
  }, [])

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removePersona = (id: string) => {
    setPersonas(personas.filter((persona) => persona.id !== id))
  }

  const executeWorkflow = (persona: Persona) => {
    setActivePersona(persona)
    setIsExecuting(true)
    setExecutionProgress(0)
    setCurrentStep(0)
    setIsPaused(false)

    // Start the execution simulation
    simulateExecution(persona)
  }

  const simulateExecution = (persona: Persona) => {
    if (!persona.workflow || persona.workflow.length === 0) {
      setError("No workflow steps defined for this persona")
      setIsExecuting(false)
      return
    }

    // Reset progress
    setExecutionProgress(0)
    setCurrentStep(0)

    // Start progress simulation
    const totalSteps = persona.workflow.length
    let currentStepIndex = 0

    const interval = setInterval(() => {
      if (isPaused) return

      // Update progress
      setExecutionProgress((prev) => {
        const stepProgress = (prev % (100 / totalSteps)) + (Math.random() * 2 + 1)
        const newProgress = Math.min(currentStepIndex * (100 / totalSteps) + stepProgress, 100)

        // Move to next step if current step is complete
        if (stepProgress >= 100 / totalSteps) {
          currentStepIndex++
          setCurrentStep(currentStepIndex)

          // If we've completed all steps, clear the interval
          if (currentStepIndex >= totalSteps) {
            clearInterval(interval)
            setIsExecuting(false)

            // Navigate to the appropriate worker based on the last step
            const lastStep = persona.workflow[totalSteps - 1]
            if (lastStep && lastStep.worker) {
              const workerPath = getWorkerPath(lastStep.worker)
              if (workerPath) {
                setTimeout(() => {
                  navigate(workerPath)
                }, 1000)
              }
            }
          }
        }

        return newProgress
      })
    }, 200)

    // Cleanup
    return () => clearInterval(interval)
  }

  const getWorkerPath = (workerName: string) => {
    const workerMap: Record<string, string> = {
      cut_profile_generator: "/workers/cut-profile",
      video_cutter: "/workers/video-cutter",
      silence_remover: "/workers/silence-remover",
      satisfy: "/workers/satisfy",
      renderer: "/workers/renderer",
      subtitles: "/workers/subtitles",
      overlay: "/workers/overlay",
    }

    return workerMap[workerName.toLowerCase()] || null
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const skipStep = () => {
    if (activePersona && currentStep < activePersona.workflow.length - 1) {
      setCurrentStep(currentStep + 1)
      setExecutionProgress((currentStep + 1) * (100 / activePersona.workflow.length))
    }
  }

  const cancelExecution = () => {
    setIsExecuting(false)
    setActivePersona(null)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-mono mb-1">Personas</h1>
          <p className="text-gray-600">Create and manage content creation personas with automated workflows.</p>
        </div>
      </motion.div>

      {/* Workflow Execution Modal */}
      {isExecuting && activePersona && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
          >
            <h2 className="text-xl font-semibold mb-4">Executing Workflow: {activePersona.name}</h2>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Step {currentStep + 1} of {activePersona.workflow.length}:
                  {activePersona.workflow[currentStep]?.worker.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-medium">{Math.round(executionProgress)}% Complete</span>
              </div>

              {/* Overall progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${executionProgress}%` }} />
              </div>

              {/* Steps progress */}
              <div className="space-y-3">
                {activePersona.workflow.map((step, index) => {
                  const isCompleted = index < currentStep
                  const isActive = index === currentStep
                  const progress = isCompleted
                    ? 100
                    : isActive
                      ? ((executionProgress % (100 / activePersona.workflow.length)) /
                          (100 / activePersona.workflow.length)) *
                        100
                      : 0

                  return (
                    <div key={index} className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          isCompleted
                            ? "bg-black text-white"
                            : isActive
                              ? "border-2 border-black"
                              : "border-2 border-gray-200"
                        }`}
                      >
                        {isCompleted && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
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
                          <span className="text-sm">{step.worker.replace(/_/g, " ")}</span>
                          <span className="text-xs text-gray-500">
                            {isCompleted ? "100%" : isActive ? `${Math.round(progress)}%` : "0%"}
                          </span>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${isCompleted ? "bg-black" : "bg-gray-400"}`}
                            style={{ width: `${isCompleted ? 100 : isActive ? progress : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={cancelExecution}
                className="py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={togglePause}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>

                <button
                  onClick={skipStep}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={currentStep >= activePersona.workflow.length - 1}
                >
                  <SkipForward size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* File Upload Area */}
      <motion.div
        variants={item}
        className={`border-2 border-dashed rounded-xl p-8 text-center ${dragActive ? "border-black bg-gray-50" : "border-gray-300"} transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileInputChange} className="hidden" />

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <File size={28} className="text-gray-500" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Persona JSON</h3>
            <p className="text-gray-600 mb-4">Drag and drop your persona file here, or click to browse</p>

            <button
              onClick={onButtonClick}
              className="py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Upload size={18} className="inline mr-2" />
              Upload Persona
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={item}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
        >
          <CircleAlert size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-600">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Personas List */}
      {personas.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-xl font-semibold font-mono mb-4">Your Personas</h2>

          <div className="space-y-4">
            {personas.map((persona) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />

                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{persona.name}</h3>
                      <p className="text-gray-600">{persona.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => removePersona(persona.id)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {persona.workflow && persona.workflow.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Workflow</p>

                    <div className="flex flex-wrap items-center gap-2">
                      {persona.workflow.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium">
                            {step.worker.replace(/_/g, " ")}
                          </div>
                          {index < persona.workflow.length - 1 && (
                            <ArrowRight size={16} className="mx-1 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => executeWorkflow(persona)}
                      className="mt-4 py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                    >
                      <Zap size={16} className="mr-2" />
                      Execute Workflow
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Example Persona Format */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold font-mono mb-4">Persona JSON Format</h2>

        <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm overflow-x-auto">
          <pre>{`{
  "name": "Tech Reviewer",
  "description": "Persona for product review videos",
  "workflow": [
    {
      "worker": "cut_profile_generator",
      "params": {
        "file1": "video.mp4",
        "file2": "transcript.txt"
      }
    },
    {
      "worker": "silence_remover",
      "params": {
        "threshold": 0.5
      }
    },
    {
      "worker": "video_cutter",
      "params": {
        "profile": "tech_review_profile.json"
      }
    }
  ]
}`}</pre>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Personas
