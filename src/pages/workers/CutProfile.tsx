"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Squircle, Check, ChevronDown, FileText, Info, Play, Scissors, Upload, X, Download } from "lucide-react"

// Update the CutProfile component to connect with the backend API
// Import the necessary components and hooks
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import { WorkersApi } from "../../lib/api-client"

const CutProfile = () => {
  const [dragActive, setDragActive] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [contentType, setContentType] = useState("vlog")
  const [targetDuration, setTargetDuration] = useState("3-5 minutes")
  const [cutStrategy, setCutStrategy] = useState("Keep key points only")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [generatedProfile, setGeneratedProfile] = useState<any>(null)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const transcriptInputRef = useRef<HTMLInputElement>(null)

  // Add these state variables inside the component
  const { showToast } = useToast()
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorDetails, setErrorDetails] = useState({ title: "", message: "", details: "" })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Process file
      const file = e.dataTransfer.files[0]
      if (file.type.includes("video")) {
        setVideoFile(file)
      } else if (file.type.includes("text") || file.name.endsWith(".srt") || file.name.endsWith(".vtt")) {
        setTranscriptFile(file)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "video" | "transcript") => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      if (type === "video") {
        setVideoFile(e.target.files[0])
      } else {
        setTranscriptFile(e.target.files[0])
      }
    }
  }

  // Replace the processWithGemini function with this implementation
  const processWithGemini = () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    // Create a progress simulation
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + (Math.random() * 5 + 1)
      })
    }, 200)

    // Make the actual API call
    if (videoFile && transcriptFile) {
      WorkersApi.generateCutProfile(videoFile, transcriptFile)
        .then((response) => {
          clearInterval(interval)
          setProcessingProgress(100)

          // Set the generated profile from the API response
          setGeneratedProfile(response.cut_profile)

          // Move to review tab
          setActiveTab("review")

          showToast("Cut profile generated successfully!", "success")
        })
        .catch((error) => {
          clearInterval(interval)
          setIsProcessing(false)

          setErrorDetails({
            title: "Cut Profile Generation Failed",
            message: "There was an error generating the cut profile.",
            details: error.message || "Unknown error occurred",
          })
          setIsErrorModalOpen(true)
        })
    } else {
      clearInterval(interval)
      setIsProcessing(false)

      setErrorDetails({
        title: "Missing Files",
        message: "Please upload both video and transcript files.",
        details: "",
      })
      setIsErrorModalOpen(true)
    }
  }

  const generateMockCutProfile = () => {
    // Create a realistic mock cut profile based on the selected options
    const mockProfile = {
      metadata: {
        contentType,
        targetDuration,
        cutStrategy,
        originalDuration: "12:34",
        processedDate: new Date().toISOString(),
      },
      cuts: [
        { startTime: "00:00:15", endTime: "00:01:23", reason: "Introduction" },
        { startTime: "00:02:47", endTime: "00:03:12", reason: "Filler content" },
        { startTime: "00:04:18", endTime: "00:04:52", reason: "Repetitive explanation" },
        { startTime: "00:07:33", endTime: "00:08:05", reason: "Off-topic discussion" },
        { startTime: "00:10:22", endTime: "00:11:47", reason: "Silence and pauses" },
      ],
      keypoints: [
        { time: "00:01:30", description: "Main topic introduction" },
        { time: "00:03:45", description: "Key insight #1" },
        { time: "00:06:12", description: "Important demonstration" },
        { time: "00:09:20", description: "Conclusion and summary" },
      ],
      estimatedFinalDuration: "08:15",
    }

    return mockProfile
  }

  const downloadCutProfile = () => {
    if (!generatedProfile) return

    const profileJson = JSON.stringify(generatedProfile, null, 2)
    const blob = new Blob([profileJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `cut_profile_${new Date().getTime()}.json`
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
      <motion.div variants={item} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono mb-1">Cut Profile Generator</h1>
          <p className="text-gray-600">Create smart cut profiles using Gemini API analysis.</p>
        </div>

        <div className="flex">
          <button className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center">
            <Info size={18} className="mr-2" />
            How It Works
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "upload" ? "bg-black text-white" : "hover:bg-gray-50"}`}
          >
            <div className="flex items-center justify-center">
              <Upload size={18} className="mr-2" />
              Upload Files
            </div>
          </button>
          <button
            onClick={() => (videoFile && transcriptFile ? setActiveTab("process") : null)}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "process" ? "bg-black text-white" : "hover:bg-gray-50"} ${!videoFile || !transcriptFile ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!videoFile || !transcriptFile}
          >
            <div className="flex items-center justify-center">
              <Scissors size={18} className="mr-2" />
              Generate Profile
            </div>
          </button>
          <button
            onClick={() => (generatedProfile ? setActiveTab("review") : null)}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "review" ? "bg-black text-white" : "hover:bg-gray-50"} ${!generatedProfile ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!generatedProfile}
          >
            <div className="flex items-center justify-center">
              <Play size={18} className="mr-2" />
              Review &amp; Export
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "upload" && (
            <div className="space-y-6">
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Video File</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? "border-black bg-gray-50" : "border-gray-300"} transition-colors`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {videoFile ? (
                    <div className="flex items-center justify-center space-x-3">
                      <Play size={20} />
                      <div className="flex-1 truncate">{videoFile.name}</div>
                      <button onClick={() => setVideoFile(null)} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Upload size={24} className="text-gray-500" />
                        </div>
                      </div>
                      <div className="text-gray-600">
                        <p className="font-medium">Drag and drop video file here</p>
                        <p className="text-sm text-gray-500">or</p>
                        <label className="mt-2 inline-block py-2 px-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm font-medium">
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "video")}
                          />
                          Browse Files
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Transcript File</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? "border-black bg-gray-50" : "border-gray-300"} transition-colors`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {transcriptFile ? (
                    <div className="flex items-center justify-center space-x-3">
                      <FileText size={20} />
                      <div className="flex-1 truncate">{transcriptFile.name}</div>
                      <button onClick={() => setTranscriptFile(null)} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <FileText size={24} className="text-gray-500" />
                        </div>
                      </div>
                      <div className="text-gray-600">
                        <p className="font-medium">Drag and drop transcript file here</p>
                        <p className="text-sm text-gray-500">or</p>
                        <label className="mt-2 inline-block py-2 px-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm font-medium">
                          <input
                            ref={transcriptInputRef}
                            type="file"
                            accept=".txt,.srt,.vtt,text/plain"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "transcript")}
                          />
                          Browse Files
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hints */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
                <div className="mt-0.5">
                  <Info size={18} className="text-gray-600" />
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Tips for best results:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Upload MP4, MOV, or WebM video formats</li>
                    <li>Include timestamped transcript (SRT or VTT preferred)</li>
                    <li>Larger files will take longer to process</li>
                  </ul>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-end">
                <button
                  className={`py-2 px-6 rounded-lg font-medium ${videoFile && transcriptFile ? "bg-black text-white hover:bg-gray-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"} transition-colors`}
                  disabled={!videoFile || !transcriptFile}
                  onClick={() => setActiveTab("process")}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {activeTab === "process" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <Check size={18} className="text-green-500" />
                <span className="font-medium">Files ready for processing</span>
              </div>

              {/* AI Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold font-mono">Gemini AI Settings</h3>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Content Type</label>
                  <div className="relative">
                    <select
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg appearance-none bg-white pr-10"
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                    >
                      <option value="vlog">Vlog</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="interview">Interview</option>
                      <option value="product_review">Product Review</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Target Duration</label>
                  <div className="relative">
                    <select
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg appearance-none bg-white pr-10"
                      value={targetDuration}
                      onChange={(e) => setTargetDuration(e.target.value)}
                    >
                      <option value="under_1_minute">Under 1 minute</option>
                      <option value="1-3_minutes">1-3 minutes</option>
                      <option value="3-5_minutes">3-5 minutes</option>
                      <option value="5-10_minutes">5-10 minutes</option>
                      <option value="maintain_original">Maintain original length</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Cut Strategy</label>
                  <div className="relative">
                    <select
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg appearance-none bg-white pr-10"
                      value={cutStrategy}
                      onChange={(e) => setCutStrategy(e.target.value)}
                    >
                      <option value="keep_key_points">Keep key points only</option>
                      <option value="remove_hesitations">Remove hesitations and pauses</option>
                      <option value="highlight_reel">Create highlight reel</option>
                      <option value="trailer">Generate trailer/teaser</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {isProcessing && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Processing with Gemini AI</span>
                    <span>{Math.round(processingProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {!isProcessing && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start space-x-3">
                  <div className="mt-0.5">
                    <Squircle size={18} className="text-yellow-500" />
                  </div>
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">This feature requires API connectivity</p>
                    <p>In the mock version, we'll simulate the AI processing with sample data.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  className="py-2 px-4 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveTab("upload")}
                  disabled={isProcessing}
                >
                  Back
                </button>
                <button
                  className="py-2 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  onClick={processWithGemini}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Process with Gemini"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "review" && generatedProfile && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <Check size={18} className="text-green-500" />
                <span className="font-medium">Cut profile generated successfully</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Cut Profile Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Content Type:</span>
                    <span className="font-medium">{generatedProfile.metadata.contentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Duration:</span>
                    <span className="font-medium">{generatedProfile.metadata.originalDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Final Duration:</span>
                    <span className="font-medium">{generatedProfile.estimatedFinalDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cuts:</span>
                    <span className="font-medium">{generatedProfile.cuts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Key Points:</span>
                    <span className="font-medium">{generatedProfile.keypoints.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Suggested Cuts</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {generatedProfile.cuts.map((cut: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{cut.startTime}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{cut.endTime}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{cut.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Key Points</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {generatedProfile.keypoints.map((keypoint: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{keypoint.time}</td>
                          <td className="px-4 py-2 text-sm">{keypoint.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  className="py-2 px-4 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveTab("process")}
                >
                  Back
                </button>
                <div className="flex space-x-3">
                  <button
                    className="py-2 px-4 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
                    onClick={downloadCutProfile}
                  >
                    <Download size={18} className="mr-2" />
                    Download JSON
                  </button>
                  <button
                    className="py-2 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    onClick={() => (window.location.href = "/workers/video-cutter")}
                  >
                    Continue to Video Cutter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      {/* Error Modal */}
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

export default CutProfile
