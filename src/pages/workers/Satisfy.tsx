"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Upload, FileUp, X, Check, Info, Play, Download, Clapperboard, Film, Timer, Blend } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { WorkersApi } from "../../lib/api-client"
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import LoadingSpinner from "../../components/LoadingSpinner"
import { API_BASE_URL } from "../../lib/config"
import { logError } from "../../lib/error-utils"

const Satisfy = () => {
  const [introClip, setIntroClip] = useState<File | null>(null)
  const [clips, setClips] = useState<File[]>([])
  const [duration, setDuration] = useState(60) // Default 60 seconds
  const [crossfadeDuration, setCrossfadeDuration] = useState(0.5) // Default 0.5 seconds
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorDetails, setErrorDetails] = useState({ title: "", message: "", details: "" })
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)

  const introInputRef = useRef<HTMLInputElement>(null)
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

  const handleIntroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        setIntroClip(e.target.files[0])
        setStatus("idle")
        setProcessedVideoUrl(null)
      }
    } catch (err) {
      logError("Satisfy.handleIntroChange", err)
      showToast("Failed to select intro clip", "error")
    }
  }

  const handleClipsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        setClips(Array.from(e.target.files))
        setStatus("idle")
        setProcessedVideoUrl(null)
      }
    } catch (err) {
      logError("Satisfy.handleClipsChange", err)
      showToast("Failed to select clips", "error")
    }
  }

  const removeClip = (indexToRemove: number) => {
    setClips(clips.filter((_, index) => index !== indexToRemove))
  }

  const handleCreateSatisfyVideo = () => {
    if (!introClip || clips.length === 0) {
      setErrorDetails({
        title: "Missing Files",
        message: "Please upload an intro clip and at least one main clip.",
        details: "",
      })
      setIsErrorModalOpen(true)
      return
    }

    setStatus("processing")
    setProcessedVideoUrl(null)
    setErrorDetails({ title: "", message: "", details: "" })

    console.log(
      `[Satisfy] Creating video with ${clips.length} clips, duration=${duration}, crossfade=${crossfadeDuration}`,
    )
    WorkersApi.createSatisfyVideo(introClip, clips, duration, crossfadeDuration)
      .then((response) => {
        // NOTE: Adjust response property based on actual API return value
        if (!response || !response.output_file) {
          throw new Error("Invalid response from server")
        }

        const videoUrl = `${API_BASE_URL}/files/${response.output_file}`
        console.log(`[Satisfy] Video created successfully: ${videoUrl}`)

        setProcessedVideoUrl(videoUrl)
        setStatus("success")
        showToast("Satisfying video created successfully!", "success")
      })
      .catch((err) => {
        logError("Satisfy.handleCreateSatisfyVideo", err)
        setErrorDetails({
          title: "Video Creation Failed",
          message: err?.message || "An unexpected error occurred while creating the video.",
          details: err?.detail || err,
        })
        setIsErrorModalOpen(true)
        setStatus("error")
        showToast("Failed to create video", "error")
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
        <h1 className="text-3xl font-bold font-mono mb-1">Satisfy Creator</h1>
        <p className="text-gray-600 mb-6">Create satisfying video montages with engaging effects.</p>
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
              <Dialog.Title className="text-lg font-medium mb-2">How Satisfy Creator Works</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mb-4">
                Placeholder text: Upload an introductory clip and multiple main video clips.
                Set the target duration for the final video and the crossfade duration between clips.
                The worker will arrange the clips, apply crossfades, and potentially add effects
                (details TBD) to create a satisfying montage. Download the result.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              {introClip ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Clapperboard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium truncate">{introClip.name}</p>
                      <p className="text-xs text-gray-500">{(introClip.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIntroClip(null)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    aria-label="Remove intro clip"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clapperboard size={24} className="text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">Upload Intro Clip</h3>
                  <p className="text-sm text-gray-500 mb-4">Video file (MP4, MOV, etc.)</p>
                  <button
                    onClick={() => introInputRef.current?.click()}
                    className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    aria-label="Select intro clip"
                  >
                    Select Intro
                  </button>
                  <input
                    ref={introInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleIntroChange}
                    aria-hidden="true"
                  />
                </>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              {clips.length > 0 ? (
                <div className="text-left space-y-2 max-h-40 overflow-y-auto mb-4 pr-2">
                  <p className="font-medium mb-2">Selected Clips ({clips.length})</p>
                  {clips.map((clip, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <span className="truncate flex-1 mr-2">{clip.name}</span>
                      <button
                        onClick={() => removeClip(index)}
                        className="p-0.5 rounded-full hover:bg-gray-200 text-gray-500"
                        aria-label={`Remove ${clip.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Film size={24} className="text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">Upload Main Clips</h3>
                  <p className="text-sm text-gray-500 mb-4">Select one or more video files</p>
                </>
              )}
              <button
                onClick={() => clipsInputRef.current?.click()}
                className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Select main clips"
              >
                {clips.length > 0 ? "Select More Clips" : "Select Clips"}
              </button>
              <input
                ref={clipsInputRef}
                type="file"
                accept="video/*"
                multiple // Allow multiple file selection
                className="hidden"
                onChange={handleClipsChange}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1 flex items-center">
                <Timer size={14} className="mr-1.5 text-gray-500" /> Target Duration (seconds)
              </label>
              <input
                id="duration"
                type="number"
                step="1"
                min="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g., 60"
              />
            </div>
            <div>
              <label htmlFor="crossfadeDuration" className="block text-sm font-medium mb-1 flex items-center">
                <Blend size={14} className="mr-1.5 text-gray-500" /> Crossfade Duration (seconds)
              </label>
              <input
                id="crossfadeDuration"
                type="number"
                step="0.1"
                min="0"
                value={crossfadeDuration}
                onChange={(e) => setCrossfadeDuration(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g., 0.5"
              />
            </div>
          </div>

          <div className="flex justify-center mb-8">
            {status === 'processing' ? (
              <div className="text-center">
                <LoadingSpinner text="Creating video..." />
                {/* Add progress bar if backend provides progress updates */}
              </div>
            ) : (
              <button
                onClick={handleCreateSatisfyVideo}
                disabled={!introClip || clips.length === 0 || status === 'processing'}
                className={`py-3 px-8 rounded-lg flex items-center ${
                  !introClip || clips.length === 0 || status === 'processing'
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                } transition-colors`}
                aria-disabled={!introClip || clips.length === 0 || status === 'processing'}
              >
                <Sparkles size={20} className="mr-2" />
                Create Satisfying Video
              </button>
            )}
            {status === 'error' && (
              <p className="mt-4 text-center text-red-600">
                Video creation failed. Check error details or try again.
              </p>
            )}
          </div>

          {status === 'success' && processedVideoUrl && (
            <div className="border border-gray-200 rounded-lg p-4 text-left">
              <div className="flex items-center mb-4">
                <Check size={20} className="text-green-500 mr-2" />
                <h3 className="font-medium">Video Created Successfully</h3>
              </div>
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  src={processedVideoUrl}
                  controls
                  className="w-full h-full"
                  onError={(e) => {
                    logError("Satisfy.videoPlayback", e)
                    showToast("Error loading processed video", "error")
                  }}
                />
              </div>
              <a
                href={processedVideoUrl}
                download
                className="inline-flex items-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} className="mr-2" />
                Download Video
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

export default Satisfy
