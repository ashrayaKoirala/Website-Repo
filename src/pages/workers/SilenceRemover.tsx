"use client"

import { motion } from "framer-motion"
import { Squircle } from "lucide-react"

const SilenceRemover = () => {
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
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-8 text-center"
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Squircle size={28} />
          </div>

          <h2 className="text-xl font-semibold font-mono mb-2">Audio Silence Trimmer</h2>
          <p className="text-gray-600 mb-6">
            Upload your audio or video file to automatically detect and remove silent parts
          </p>

          <button className="py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Upload File
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SilenceRemover
