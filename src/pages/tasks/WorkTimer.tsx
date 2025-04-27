"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Pause, Play, RotateCcw, Save } from "lucide-react"

const WorkTimer = () => {
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [sessionName, setSessionName] = useState("")

  // Session history
  const [sessions, setSessions] = useState([
    { id: 1, name: "Video Editing", duration: "01:45:30", date: "Today" },
    { id: 2, name: "Script Writing", duration: "00:50:15", date: "Yesterday" },
    { id: 3, name: "Recording", duration: "02:15:00", date: "2 days ago" },
  ])

  useEffect(() => {
    let interval = null

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1)
      }, 1000)
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isActive, seconds])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setSeconds(0)
    setIsActive(false)
  }

  const saveSession = () => {
    const newSession = {
      id: Date.now(),
      name: sessionName || "Unnamed Session",
      duration: formatTime(seconds),
      date: "Today",
    }

    setSessions([newSession, ...sessions])
    resetTimer()
    setSessionName("")
  }

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":")
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
        <h1 className="text-3xl font-bold font-mono mb-1">Work Timer</h1>
        <p className="text-gray-600 mb-6">Track your work sessions and stay productive.</p>
      </motion.div>

      {/* Timer Display */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />

        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={28} />
        </div>

        <div className="text-5xl font-mono font-bold mb-6">{formatTime(seconds)}</div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Session Name"
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <div className="flex gap-3">
            <button
              onClick={toggleTimer}
              className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={resetTimer}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={seconds === 0}
            >
              <RotateCcw size={20} />
            </button>

            <button
              onClick={saveSession}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={seconds === 0}
            >
              <Save size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Session History */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold font-mono mb-4">Session History</h2>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{session.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono">{session.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{session.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WorkTimer
