"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Film, Upload, FileUp, X, Check, Info, Play, Download, Clapperboard, ListTree, SquareTerminal } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { WorkersApi } from "../../lib/api-client"
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import LoadingSpinner from "../../components/LoadingSpinner"
import { API_BASE_URL } from "../../lib/config"
import { logError } from "../../lib/error-utils"

const Renderer = () => {
  const [introClip, setIntroClip] = useState<File | null>(null)
  const [outroClip, setOutroClip] = useState<File | null>(null)
  const [clips, setClips] = useState<File[]>([])
  const [arrangementJson, setArrangementJson] = useState("{\n  // Placeholder for arrangement JSON structure\n}")
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorDetails, setErrorDetails] = useState({ title: "", message: "", details: "" })
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)

  const introInputRef = useRef<HTMLInputElement>(null)
  const outroInputRef = useRef<HTMLInputElement>(null)
  const clipsInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl)
      }
    }
  }, [processedVideoUrl])

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "intro" | "outro" | "clips",
  ) => {
    try {
      if (e.target.files) {
        if (type === "intro") {
          setIntroClip(e.target.files[0] || null)
        } else if (type === "outro") {
          setOutroClip(e.target.files[0] || null)
        } else if (type === "clips") {
          // Append new clips to existing ones
          setClips((prevClips) => [...prevClips, ...Array.from(e.target.files!)])
        }
        setStatus("idle")
        setProcessedVideoUrl(null)
        // Clear the input value to allow selecting the same file again
        e.target.value = ""
      }
    } catch (err) {
      logError(`Renderer.handleFileChange (${type})`, err)
      showToast(`Failed to select ${type} file(s)`, "error")
    }
  }

  const removeClip = (indexToRemove: number, type: "intro" | "outro" | "clips") => {
    if (type === "intro") {
      setIntroClip(null)
    } else if (type === "outro") {
      setOutroClip(null)
    } else {
      setClips(clips.filter((_, index) => index !== indexToRemove))
    }
  }

  const handleRenderVideo = () => {
    if (clips.length === 0) {
      setErrorDetails({
        title: "Missing Clips",
        message: "Please upload at least one main clip to render.",
        details: "",
      })
      setIsErrorModalOpen(true)
      return
    }

    let arrangement: any = undefined
    try {
      if (arrangementJson.trim() && arrangementJson.trim() !== "{}") {
        arrangement = JSON.parse(arrangementJson)
      }
    } catch (parseError: any) {
      setErrorDetails({
        title: "Invalid Arrangement JSON",
        message: "The arrangement definition is not valid JSON.",
        details: parseError.message,
      })
      setIsErrorModalOpen(true)
      return
    }

    setStatus("processing")
    setProcessedVideoUrl(null)
    setErrorDetails({ title: "", message: "", details: "" })

    console.log(`[Renderer] Rendering video with ${clips.length} clips`)
    WorkersApi.renderVideo(clips, arrangement, introClip || undefined, outroClip || undefined)
      .then((response) => {
        // NOTE: Adjust response property based on actual API return value
        if (!response || !response.output_file) {
          throw new Error("Invalid response from server")
        }

        const videoUrl = `${API_BASE_URL}/files/${response.output_file}`
        console.log(`[Renderer] Video rendered successfully: ${videoUrl}`)

        setProcessedVideoUrl(videoUrl)
        setStatus("success")
        showToast("Video rendered successfully!", "success")
      })
      .catch((err) => {
        logError("Renderer.handleRenderVideo", err)
        setErrorDetails({
          title: "Rendering Failed",
          message: err?.message || "An unexpected error occurred during rendering.",
          details: err?.detail || err,
        })
        setIsErrorModalOpen(true)
        setStatus("error")
        showToast("Failed to render video", "error")
      })
  }

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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold font-mono mb-1">Final Renderer</h1>
        <p className="text-gray-600 mb-6">Arrange clips and render your final video with high quality.</p>
        <Dialog.Root open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
          <Dialog.Trigger asChild>
            <button className="py-1 px-3 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm">
              <Info size={16} className="mr-2" />
              How It Works
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30 data-[state=open]:animate-overlayShow" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white p-6 rounded-lg shadow-lg data-[state=open]:animate-contentShow focus:outline-none z-50">
              <Dialog.Title className="text-lg font-medium mb-2">How Final Renderer Works</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mb-4">
                Placeholder text: Upload your main video clips, and optionally an intro and outro clip.
                Provide an arrangement JSON (placeholder) to define the sequence, timing, transitions, etc.
                The worker combines the clips according to the arrangement and renders the final video.
                Download the completed video.
              </Dialog.Description>
              <div className="flex justify-end">
                <Dialog.Close asChild>
                  <button className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">Close</button>
                </Dialog.Close>
              </div>
              <Dialog.Close asChild>
                <button className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100" aria-label="Close">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2 text-sm text-gray-500">Intro Clip (Optional)</h3>
              {introClip ? (
                <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                  <span className="truncate flex-1 mr-2">{introClip.name}</span>
                  <button
                    onClick={() => removeClip(0, "intro")}
                    className="p-0.5 rounded-full hover:bg-gray-200 text-gray-500"
                    aria-label="Remove intro clip"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => introInputRef.current?.click()}
                    className="py-2 px-4 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full"
                    aria-label="Select intro clip"
                  >
                    <Upload size={16} className="inline mr-2" /> Select Intro
                  </button>
                  <input
                    ref={introInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "intro")}
                    aria-hidden="true"
                  />
                </>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2 text-sm text-gray-500">Main Clips (Required)</h3>
              {clips.length > 0 && (
                <div className="text-left space-y-1 max-h-32 overflow-y-auto mb-2 pr-2">
                  {clips.map((clip, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <span className="truncate flex-1 mr-2">{clip.name}</span>
                      <button
                        onClick={() => removeClip(index, "clips")}
                        className="p-0.5 rounded-full hover:bg-gray-200 text-gray-500"
                        aria-label={`Remove ${clip.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => clipsInputRef.current?.click()}
                className="py-2 px-4 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors w-full"
                aria-label="Add main clips"
              >
                <Upload size={16} className="inline mr-2" /> {clips.length > 0 ? "Add More Clips" : "Add Clips"}
              </button>
              <input
                ref={clipsInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileChange(e, "clips")}
                aria-hidden="true"
              />
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2 text-sm text-gray-500">Outro Clip (Optional)</h3>
              {outroClip ? (
                <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                  <span className="truncate flex-1 mr-2">{outroClip.name}</span>
                  <button
                    onClick={() => removeClip(0, "outro")}
                    className="p-0.5 rounded-full hover:bg-gray-200 text-gray-500"
                    aria-label="Remove outro clip"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => outroInputRef.current?.click()}
                    className="py-2 px-4 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full"
                    aria-label="Select outro clip"
                  >
                    <Upload size={16} className="inline mr-2" /> Select Outro
                  </button>
                  <input
                    ref={outroInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "outro")}
                    aria-hidden="true"
                  />
                </>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="arrangementJson" className="block text-sm font-medium mb-1 flex items-center">
              <ListTree size={14} className="mr-1.5 text-gray-500" /> Arrangement (JSON - Placeholder)
            </label>
            <textarea
              id="arrangementJson"
              rows={8}
              value={arrangementJson}
              onChange={(e) => setArrangementJson(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black font-mono text-xs"
              placeholder='{\n  "sequence": [\n    { "clipIndex": 0, "startTime": 0, "endTime": 10 },\n    { "clipIndex": 1, "startTime": 5, "endTime": 15 }\n  ],\n  "transitions": []\n}'
            />
            <p className="text-xs text-gray-500 mt-1">
              Define the video structure (sequence, timing, etc.) in JSON format. This will likely be replaced by a visual editor.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            {status === 'processing' ? (
              <div className="text-center">
                <LoadingSpinner text="Rendering video..." />
              </div>
            ) : (
              <button
                onClick={handleRenderVideo}
                disabled={clips.length === 0 || status === 'processing'}
                className={`py-3 px-8 rounded-lg flex items-center ${
                  clips.length === 0 || status === 'processing'
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                } transition-colors`}
                aria-disabled={clips.length === 0 || status === 'processing'}
              >
                <Film size={20} className="mr-2" />
                Render Final Video
              </button>
            )}
            {status === 'error' && (
              <p className="mt-4 text-center text-red-600">
                Rendering failed. Check error details or try again.
              </p>
            )}
          </div>

          {status === 'success' && processedVideoUrl && (
            <div className="border border-gray-200 rounded-lg p-4 text-left">
              <div className="flex items-center mb-4">
                <Check size={20} className="text-green-500 mr-2" />
                <h3 className="font-medium">Video Rendered Successfully</h3>
              </div>
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  src={processedVideoUrl}
                  controls
                  className="w-full h-full"
                  onError={(e) => {
                    logError("Renderer.videoPlayback", e)
                    showToast("Error loading rendered video", "error")
                  }}
                />
              </div>
              <a
                href={processedVideoUrl}
                download
                className="inline-flex items-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} className="mr-2" />
                Download Rendered Video
              </a>
            </div>
          )}
        </div>
      </motion.div>
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={errorDetails.title}
        message={errorDetails.message}
        details={errorDetails.details}
      />
    </motion.div>
  )
}

export default Renderer
