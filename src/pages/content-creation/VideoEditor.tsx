"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ExternalLink, Info, Upload, Play, Pause, SkipForward, SkipBack } from "lucide-react"

const VideoEditor = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate loading OmniClip
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Clean up video URL when component unmounts
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith("video/")) {
        setVideoFile(file)

        // Create URL for the video
        const url = URL.createObjectURL(file)
        setVideoUrl(url)
      } else {
        setError("Please select a valid video file")
      }
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current && videoRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const clickPosition = (e.clientX - rect.left) / rect.width
      const newTime = clickPosition * duration

      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)

    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }

    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = Math.floor(timeInSeconds % 60)

    return [
      hours > 0 ? hours.toString().padStart(2, "0") : null,
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ]
      .filter(Boolean)
      .join(":")
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

  const handleExternalOpen = () => {
    window.open("https://github.com/search?q=OmniClip", "_blank")
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-mono mb-1">OmniClip Editor</h1>
          <p className="text-gray-600">Open source video editing right in your browser.</p>
        </div>

        <button
          onClick={handleExternalOpen}
          className="py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <ExternalLink size={18} className="mr-2" />
          GitHub
        </button>
      </motion.div>

      {/* Video Editor Frame */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Loading OmniClip Editor...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Info size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Failed to load OmniClip</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Video Preview Area */}
            <div className="flex-1 bg-gray-900 relative flex items-center justify-center">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="max-h-full max-w-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
              ) : (
                <div className="text-white text-center p-6">
                  <h3 className="text-xl font-semibold mb-3">OmniClip Video Editor</h3>
                  <p className="mb-4">Upload a video file to start editing</p>
                  <label className="inline-flex items-center p-2 px-4 bg-gray-800 rounded-lg text-sm cursor-pointer hover:bg-gray-700 transition-colors">
                    <Upload size={18} className="mr-2" />
                    <span>Upload Video</span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              )}
            </div>

            {/* Video Controls */}
            {videoUrl && (
              <div className="bg-gray-800 text-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-mono">{formatTime(currentTime)}</div>
                  <div className="flex space-x-2">
                    <button onClick={skipBackward} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
                      <SkipBack size={18} />
                    </button>
                    <button onClick={handlePlayPause} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button onClick={skipForward} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
                      <SkipForward size={18} />
                    </button>
                  </div>
                  <div className="text-sm font-mono">{formatTime(duration)}</div>
                </div>

                {/* Timeline */}
                <div
                  ref={timelineRef}
                  className="h-2 bg-gray-700 rounded-full cursor-pointer mb-2"
                  onClick={handleTimelineClick}
                >
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                {/* Volume Control */}
                <div className="flex items-center">
                  <button onClick={toggleMute} className="p-1 rounded-full hover:bg-gray-700 transition-colors mr-2">
                    {isMuted ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24"
                  />
                </div>
              </div>
            )}

            {/* Timeline Editor */}
            <div className="h-32 border-t border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center mb-2 px-2">
                <button className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-2 hover:bg-gray-300 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </button>
                <button className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-2 hover:bg-gray-300 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-2 hover:bg-gray-300 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </button>
                <div className="flex-1"></div>
                <div className="text-xs font-mono bg-gray-200 rounded-lg px-2 py-1">
                  {videoUrl ? formatTime(currentTime) : "00:00:00"}
                </div>
              </div>

              <div className="h-12 bg-white rounded-lg border border-gray-200 flex items-center px-2 overflow-x-auto">
                {videoUrl ? (
                  <>
                    <div className="w-20 h-8 bg-black rounded mr-1"></div>
                    <div className="w-32 h-8 bg-gray-300 rounded mr-1"></div>
                    <div className="w-48 h-8 bg-gray-400 rounded mr-1"></div>
                    <div className="w-24 h-8 bg-gray-300 rounded mr-1"></div>
                    <ArrowRight className="text-gray-400" size={16} />
                  </>
                ) : (
                  <div className="text-gray-400 text-sm w-full text-center">Upload a video to start editing</div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Information Section */}
      <motion.div variants={item} className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">About OmniClip</h2>
        <p className="text-gray-600 mb-4">
          OmniClip is an open-source video editor designed for creators. It offers powerful editing features directly in
          your browser, eliminating the need for expensive software installations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="font-medium mb-1">Timeline Editing</h3>
            <p className="text-gray-600">Multi-track timeline with drag & drop functionality</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="font-medium mb-1">Effects Library</h3>
            <p className="text-gray-600">Transitions, filters, and text effects</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="font-medium mb-1">Export Options</h3>
            <p className="text-gray-600">Multiple formats and quality settings</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default VideoEditor
