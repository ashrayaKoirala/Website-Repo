"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Scissors, Upload, FileText, X, Check, ArrowRight } from "lucide-react"
import { WorkersApi } from "../../lib/api-client"
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import LoadingSpinner from "../../components/LoadingSpinner"
import { API_BASE_URL } from "../../lib/config"
import Layout from "../../components/Layout"
import { logError } from "../../lib/error-utils"

const VideoCutter: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [cutProfileFile, setCutProfileFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<unknown | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl)
      }
    }
  }, [processedVideoUrl])

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        console.log(`[VideoCutter] Selected video file: ${file.name}, size: ${file.size} bytes`)
        setVideoFile(file)
      }
    } catch (err) {
      logError("VideoCutter.handleVideoChange", err)
      showToast("Failed to select video file", "error")
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        console.log(`[VideoCutter] Selected cut profile file: ${file.name}, size: ${file.size} bytes`)
        setCutProfileFile(file)
      }
    } catch (err) {
      logError("VideoCutter.handleProfileChange", err)
      showToast("Failed to select cut profile file", "error")
    }
  }

  const handleProcessVideo = async () => {
    if (!videoFile || !cutProfileFile) {
      setError(new Error("Please upload both video and cut profile files"))
      setShowErrorModal(true)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      console.log(`[VideoCutter] Processing video: ${videoFile.name} with profile: ${cutProfileFile.name}`)
      const response = await WorkersApi.cutVideo(videoFile, cutProfileFile)

      if (!response || !response.output_file) {
        throw new Error("Invalid response from server")
      }

      const videoUrl = `${API_BASE_URL}/files/${response.output_file}`
      console.log(`[VideoCutter] Video processed successfully: ${videoUrl}`)

      setProcessedVideoUrl(videoUrl)
      showToast("Video processed successfully!", "success")
    } catch (err) {
      logError("VideoCutter.handleProcessVideo", err)
      setError(err)
      setShowErrorModal(true)
      showToast("Failed to process video", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-mono mb-1">Video Cutter</h1>
          <p className="text-gray-600 mb-6">Cut video automatically based on Gemini generated cut-profiles.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Video Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                {videoFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <video className="w-6 h-6" />
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
                    <h3 className="font-medium mb-2">Upload Video</h3>
                    <p className="text-sm text-gray-500 mb-4">MP4, MOV, or WebM format</p>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      aria-label="Select video file"
                    >
                      Select Video
                    </button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoChange}
                      aria-hidden="true"
                    />
                  </>
                )}
              </div>

              {/* Cut Profile Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                {cutProfileFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium truncate">{cutProfileFile.name}</p>
                        <p className="text-xs text-gray-500">{(cutProfileFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCutProfileFile(null)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      aria-label="Remove cut profile file"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText size={24} className="text-gray-400" />
                    </div>
                    <h3 className="font-medium mb-2">Upload Cut Profile</h3>
                    <p className="text-sm text-gray-500 mb-4">JSON file from Cut Profile Generator</p>
                    <button
                      onClick={() => profileInputRef.current?.click()}
                      className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      aria-label="Select cut profile file"
                    >
                      Select Cut Profile
                    </button>
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={handleProfileChange}
                      aria-hidden="true"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Process Button */}
            <div className="flex justify-center mb-8">
              {isProcessing ? (
                <div className="text-center">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-600">Processing your video...</p>
                </div>
              ) : (
                <button
                  onClick={handleProcessVideo}
                  disabled={!videoFile || !cutProfileFile}
                  className={`py-3 px-8 rounded-lg flex items-center ${
                    !videoFile || !cutProfileFile
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  } transition-colors`}
                  aria-disabled={!videoFile || !cutProfileFile}
                >
                  <Scissors size={20} className="mr-2" />
                  Process Video
                </button>
              )}
            </div>

            {/* Result Preview */}
            {processedVideoUrl && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <Check size={20} className="text-green-500 mr-2" />
                  <h3 className="font-medium">Video Processed Successfully</h3>
                </div>

                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    src={processedVideoUrl}
                    controls
                    className="w-full h-full"
                    onError={(e) => {
                      logError("VideoCutter.videoPlayback", e)
                      showToast("Error loading processed video", "error")
                    }}
                  />
                </div>

                <div className="flex justify-end">
                  <a
                    href={processedVideoUrl}
                    download
                    className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                  >
                    Download Video
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium mb-2">Remove Silence</h3>
              <p className="text-sm text-gray-600 mb-4">Further optimize your video by removing silent parts</p>
              <a href="/workers/silence-remover" className="text-black font-medium flex items-center hover:underline">
                Go to Silence Remover <ArrowRight size={16} className="ml-1" />
              </a>
            </div>

            <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium mb-2">Add Subtitles</h3>
              <p className="text-sm text-gray-600 mb-4">Generate and add subtitles to your video</p>
              <a href="/workers/subtitles" className="text-black font-medium flex items-center hover:underline">
                Go to Subtitle Generator <ArrowRight size={16} className="ml-1" />
              </a>
            </div>

            <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium mb-2">Final Render</h3>
              <p className="text-sm text-gray-600 mb-4">Combine clips and render your final video</p>
              <a href="/workers/renderer" className="text-black font-medium flex items-center hover:underline">
                Go to Final Renderer <ArrowRight size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Error Modal */}
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error Processing Video"
          error={error}
        />
      </div>
    </Layout>
  )
}

export default VideoCutter
