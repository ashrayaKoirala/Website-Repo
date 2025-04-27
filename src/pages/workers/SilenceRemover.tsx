"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { VolumeX, Upload, FileUp, X, Check, Info, Play, Download, SlidersHorizontal } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { WorkersApi } from "../../lib/api-client"
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import LoadingSpinner from "../../components/LoadingSpinner"
import { API_BASE_URL } from "../../lib/config"
import { logError } from "../../lib/error-utils"

const SilenceRemover = () => {
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [minSilenceDuration, setMinSilenceDuration] = useState(0.5)
  const [silenceThreshold, setSilenceThreshold] = useState(-40)
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorDetails, setErrorDetails] = useState({ title: "", message: "", details: "" })
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (processedFileUrl) {
        URL.revokeObjectURL(processedFileUrl)
      }
    }
  }, [processedFileUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        console.log(`[SilenceRemover] Selected file: ${file.name}, size: ${file.size} bytes`)
        setMediaFile(file)
        setStatus("idle") // Reset status on new file select
        setProcessedFileUrl(null)
      }
    } catch (err) {
      logError("SilenceRemover.handleFileChange", err)
      showToast("Failed to select file", "error")
    }
  }

  const handleRemoveSilence = () => {
    if (!mediaFile) {
      setErrorDetails({
        title: "Missing File",
        message: "Please upload an audio or video file.",
        details: "",
      })
      setIsErrorModalOpen(true)
      return
    }

    setStatus("processing")
    setProcessedFileUrl(null) // Reset previous result
    setErrorDetails({ title: "", message: "", details: "" }) // Clear previous errors

    console.log(
      `[SilenceRemover] Processing file: ${mediaFile.name} with duration=${minSilenceDuration}, threshold=${silenceThreshold}`,
    )
    WorkersApi.removeSilence(mediaFile, minSilenceDuration, silenceThreshold)
      .then((response) => {
        // NOTE: Adjust response property based on actual API return value
        if (!response || !response.output_file) {
          throw new Error("Invalid response from server")
        }

        const fileUrl = `${API_BASE_URL}/files/${response.output_file}`
        console.log(`[SilenceRemover] File processed successfully: ${fileUrl}`)

        setProcessedFileUrl(fileUrl)
        setStatus("success")
        showToast("Silence removed successfully!", "success")
      })
      .catch((err) => {
        logError("SilenceRemover.handleRemoveSilence", err)
        setErrorDetails({
          title: "Silence Removal Failed",
          message: err?.message || "An unexpected error occurred while removing silence.",
          details: err?.detail || err,
        })
        setIsErrorModalOpen(true)
        setStatus("error")
        showToast("Failed to remove silence", "error")
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
        <h1 className="text-3xl font-bold font-mono mb-1">Silence Remover</h1>
        <p className="text-gray-600 mb-6">Automatically trim silent parts without damaging pacing.</p>
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
              <Dialog.Title className="text-lg font-medium mb-2">How Silence Remover Works</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mb-4">
                Placeholder text: Upload an audio or video file. Adjust the minimum silence duration (in seconds)
                and the silence threshold (in dB). The worker identifies and removes segments quieter than the
                threshold for longer than the specified duration. Download the processed file.
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
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center mb-6">
            {mediaFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <FileUp size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium truncate">{mediaFile.name}</p>
                    <p className="text-xs text-gray-500">{(mediaFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => setMediaFile(null)}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Remove file"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className="text-gray-400" />
                </div>
                <h3 className="font-medium mb-2">Upload Audio or Video</h3>
                <p className="text-sm text-gray-500 mb-4">MP3, WAV, MP4, MOV, etc.</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Select file"
                >
                  Select File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-hidden="true"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="minSilenceDuration" className="block text-sm font-medium mb-1">
                Min Silence Duration (seconds)
              </label>
              <input
                id="minSilenceDuration"
                type="number"
                step="0.1"
                min="0.1"
                value={minSilenceDuration}
                onChange={(e) => setMinSilenceDuration(parseFloat(e.target.value) || 0.1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g., 0.5"
              />
            </div>
            <div>
              <label htmlFor="silenceThreshold" className="block text-sm font-medium mb-1">
                Silence Threshold (dB)
              </label>
              <input
                id="silenceThreshold"
                type="number"
                step="1"
                max="0"
                value={silenceThreshold}
                onChange={(e) => setSilenceThreshold(parseInt(e.target.value) || -40)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g., -40"
              />
            </div>
          </div>

          <div className="flex justify-center mb-8">
            {status === 'processing' ? (
              <div className="text-center">
                <LoadingSpinner text="Removing silence..." />
              </div>
            ) : (
              <button
                onClick={handleRemoveSilence}
                disabled={!mediaFile || status === 'processing'}
                className={`py-3 px-8 rounded-lg flex items-center ${
                  !mediaFile || status === 'processing'
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                } transition-colors`}
                aria-disabled={!mediaFile || status === 'processing'}
              >
                <VolumeX size={20} className="mr-2" />
                Remove Silence
              </button>
            )}
            {status === 'error' && (
              <p className="mt-4 text-center text-red-600">
                Processing failed. Check error details or try again.
              </p>
            )}
          </div>

          {status === 'success' && processedFileUrl && (
            <div className="border border-gray-200 rounded-lg p-4 text-left">
              <div className="flex items-center mb-4">
                <Check size={20} className="text-green-500 mr-2" />
                <h3 className="font-medium">Silence Removed Successfully</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your processed file is ready for download.
              </p>
              <a
                href={processedFileUrl}
                download
                className="inline-flex items-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} className="mr-2" />
                Download Processed File
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

export default SilenceRemover
