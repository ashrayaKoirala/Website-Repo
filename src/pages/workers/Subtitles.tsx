"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Captions, Upload, FileUp, X, Check, Info, Play, Download, Type, FileType } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { WorkersApi } from "../../lib/api-client"
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import LoadingSpinner from "../../components/LoadingSpinner"
import { API_BASE_URL } from "../../lib/config"
import { logError } from "../../lib/error-utils"

const Subtitles = () => {
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null)
  const [fontStyle, setFontStyle] = useState("default") // Default style
  const [format, setFormat] = useState("srt") // Default format
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
        console.log(`[Subtitles] Selected transcript file: ${file.name}, size: ${file.size} bytes`)
        setTranscriptFile(file)
        setStatus("idle") // Reset status on new file select
        setProcessedFileUrl(null)
      }
    } catch (err) {
      logError("Subtitles.handleFileChange", err)
      showToast("Failed to select transcript file", "error")
    }
  }

  const handleGenerateSubtitles = () => {
    if (!transcriptFile) {
      setErrorDetails({
        title: "Missing File",
        message: "Please upload a transcript file.",
        details: "",
      })
      setIsErrorModalOpen(true)
      return
    }

    setStatus("processing")
    setProcessedFileUrl(null) // Reset previous result
    setErrorDetails({ title: "", message: "", details: "" }) // Clear previous errors

    console.log(`[Subtitles] Generating subtitles from: ${transcriptFile.name} with style=${fontStyle}, format=${format}`)
    WorkersApi.generateSubtitles(transcriptFile, fontStyle, format)
      .then((response) => {
        // NOTE: Adjust response property based on actual API return value
        if (!response || !response.output_file) {
          throw new Error("Invalid response from server")
        }

        const fileUrl = `${API_BASE_URL}/files/${response.output_file}`
        console.log(`[Subtitles] Subtitle file generated successfully: ${fileUrl}`)

        setProcessedFileUrl(fileUrl)
        setStatus("success")
        showToast("Subtitles generated successfully!", "success")
      })
      .catch((err) => {
        logError("Subtitles.handleGenerateSubtitles", err)
        setErrorDetails({
          title: "Subtitle Generation Failed",
          message: err?.message || "An unexpected error occurred while generating subtitles.",
          details: err?.detail || err,
        })
        setIsErrorModalOpen(true)
        setStatus("error")
        showToast("Failed to generate subtitles", "error")
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
        <h1 className="text-3xl font-bold font-mono mb-1">Subtitle Generator</h1>
        <p className="text-gray-600 mb-6">Auto-generate and style captions for your videos.</p>
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
              <Dialog.Title className="text-lg font-medium mb-2">How Subtitle Generator Works</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mb-4">
                Placeholder text: Upload a transcript file (e.g., JSON, VTT, SRT) containing timed text.
                Choose a desired font style (details TBD) and output format (SRT, VTT).
                The worker generates the styled subtitle file based on the transcript timings.
                Download the resulting subtitle file.
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
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Select transcript file"
                >
                  Select File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.vtt,.srt,text/*"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-hidden="true"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="fontStyle" className="block text-sm font-medium mb-1 flex items-center">
                <Type size={14} className="mr-1.5 text-gray-500" /> Font Style
              </label>
              <select
                id="fontStyle"
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black bg-white"
              >
                <option value="default">Default (Clean Sans-serif)</option>
                <option value="impact">Impact (Bold Outline)</option>
                <option value="casual">Casual Script</option>
              </select>
            </div>
            <div>
              <label htmlFor="format" className="block text-sm font-medium mb-1 flex items-center">
                <FileType size={14} className="mr-1.5 text-gray-500" /> Output Format
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black bg-white"
              >
                <option value="srt">SRT (.srt)</option>
                <option value="vtt">VTT (.vtt)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center mb-8">
            {status === 'processing' ? (
              <div className="text-center">
                <LoadingSpinner text="Generating subtitles..." />
              </div>
            ) : (
              <button
                onClick={handleGenerateSubtitles}
                disabled={!transcriptFile || status === 'processing'}
                className={`py-3 px-8 rounded-lg flex items-center ${
                  !transcriptFile || status === 'processing'
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                } transition-colors`}
                aria-disabled={!transcriptFile || status === 'processing'}
              >
                <Captions size={20} className="mr-2" />
                Generate Subtitles
              </button>
            )}
            {status === 'error' && (
              <p className="mt-4 text-center text-red-600">
                Generation failed. Check error details or try again.
              </p>
            )}
          </div>

          {status === 'success' && processedFileUrl && (
            <div className="border border-gray-200 rounded-lg p-4 text-left">
              <div className="flex items-center mb-4">
                <Check size={20} className="text-green-500 mr-2" />
                <h3 className="font-medium">Subtitles Generated Successfully</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your subtitle file is ready for download in {format.toUpperCase()} format.
              </p>
              <a
                href={processedFileUrl}
                download={`subtitles_${transcriptFile?.name || 'output'}.${format}`}
                className="inline-flex items-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} className="mr-2" />
                Download Subtitle File (.{format})
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

export default Subtitles
