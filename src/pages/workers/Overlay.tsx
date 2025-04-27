"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SmilePlus, Upload, FileUp, X, Check, Info, Play, Download, Video } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { WorkersApi } from "../../lib/api-client"
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import LoadingSpinner from "../../components/LoadingSpinner"
import { API_BASE_URL } from "../../lib/config"
import { logError } from "../../lib/error-utils"

const Overlay = () => {
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorDetails, setErrorDetails] = useState({ title: "", message: "", details: "" })
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)

  const transcriptInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
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
    type: "transcript" | "video",
  ) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        console.log(`[Overlay] Selected ${type} file: ${file.name}, size: ${file.size} bytes`)
        if (type === "transcript") {
          setTranscriptFile(file)
        } else {
          setVideoFile(file)
        }
        setStatus("idle") // Reset status on new file select
        setProcessedVideoUrl(null)
      }
    } catch (err) {
      logError(`Overlay.handleFileChange (${type})`, err)
      showToast(`Failed to select ${type} file`, "error")
    }
  }

  const handleCreateOverlay = () => {
    if (!transcriptFile || !videoFile) {
      setErrorDetails({
        title: "Missing Files",
        message: "Please upload both a transcript and a video file.",
        details: "",
      })
      setIsErrorModalOpen(true)
      return
    }

    setStatus("processing")
    setProcessedVideoUrl(null) // Reset previous result
    setErrorDetails({ title: "", message: "", details: "" }) // Clear previous errors

    console.log(`[Overlay] Creating emoji overlay for: ${videoFile.name} using ${transcriptFile.name}`)
    WorkersApi.createEmojiOverlay(transcriptFile, videoFile)
      .then((response) => {
        // NOTE: Adjust response property based on actual API return value
        if (!response || !response.output_file) {
          throw new Error("Invalid response from server")
        }

        const videoUrl = `${API_BASE_URL}/files/${response.output_file}`
        console.log(`[Overlay] Overlay video created successfully: ${videoUrl}`)

        setProcessedVideoUrl(videoUrl)
        setStatus("success")
        showToast("Emoji overlay created successfully!", "success")
      })
      .catch((err) => {
        logError("Overlay.handleCreateOverlay", err)
        setErrorDetails({
          title: "Overlay Creation Failed",
          message: err?.message || "An unexpected error occurred while creating the emoji overlay.",
          details: err?.detail || err,
        })
        setIsErrorModalOpen(true)
        setStatus("error")
        showToast("Failed to create overlay", "error")
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
        <h1 className="text-3xl font-bold font-mono mb-1">Emoji Overlay</h1>
        <p className="text-gray-600 mb-6">Add dynamic emoji overlays based on video transcript.</p>
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
              <Dialog.Title className="text-lg font-medium mb-2">How Emoji Overlay Works</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mb-4">
                Placeholder text: Upload a transcript file (with timing) and the corresponding video file.
                The system analyzes the transcript content (details TBD) to determine relevant emojis
                and timings. These emojis are then rendered onto the video. Download the resulting video
                with the emoji overlay.
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
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              {transcriptFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <FileUp size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium truncate">{transcriptFile.name}</p>
                      <p className="text-xs text-gray-500">{(transcriptFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTranscriptFile(null)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    aria-label="Remove transcript file"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">Upload Transcript File</h3>
                  <p className="text-sm text-gray-500 mb-4">JSON, VTT, SRT, etc.</p>
                  <button
                    onClick={() => transcriptInputRef.current?.click()}
                    className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    aria-label="Select transcript file"
                  >
                    Select Transcript
                  </button>
                  <input
                    ref={transcriptInputRef}
                    type="file"
                    accept=".json,.vtt,.srt,text/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "transcript")}
                    aria-hidden="true"
                  />
                </>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              {videoFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Video size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium truncate">{videoFile.name}</p>
                      <p className="text-xs text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVideoFile(null)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    aria-label="Remove video file"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">Upload Video File</h3>
                  <p className="text-sm text-gray-500 mb-4">MP4, MOV, WebM, etc.</p>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    aria-label="Select video file"
                  >
                    Select Video
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "video")}
                    aria-hidden="true"
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center mb-8">
            {status === 'processing' ? (
              <div className="text-center">
                <LoadingSpinner text="Creating overlay..." />
              </div>
            ) : (
              <button
                onClick={handleCreateOverlay}
                disabled={!transcriptFile || !videoFile || status === 'processing'}
                className={`py-3 px-8 rounded-lg flex items-center ${
                  !transcriptFile || !videoFile || status === 'processing'
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                } transition-colors`}
                aria-disabled={!transcriptFile || !videoFile || status === 'processing'}
              >
                <SmilePlus size={20} className="mr-2" />
                Create Emoji Overlay
              </button>
            )}
            {status === 'error' && (
              <p className="mt-4 text-center text-red-600">
                Overlay creation failed. Check error details or try again.
              </p>
            )}
          </div>

          {status === 'success' && processedVideoUrl && (
            <div className="border border-gray-200 rounded-lg p-4 text-left">
              <div className="flex items-center mb-4">
                <Check size={20} className="text-green-500 mr-2" />
                <h3 className="font-medium">Overlay Video Created Successfully</h3>
              </div>
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  src={processedVideoUrl}
                  controls
                  className="w-full h-full"
                  onError={(e) => {
                    logError("Overlay.videoPlayback", e)
                    showToast("Error loading processed video", "error")
                  }}
                />
              </div>
              <a
                href={processedVideoUrl}
                download={`overlay_${videoFile?.name || 'output'}`}
                className="inline-flex items-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} className="mr-2" />
                Download Overlay Video
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

export default Overlay
