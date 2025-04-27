"use client"

import { motion } from "framer-motion"
import { Play, Sparkles, Upload } from "lucide-react"

const Satisfy = () => {
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
      </motion.div>

      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-8 text-center"
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={28} />
          </div>

          <h2 className="text-xl font-semibold font-mono mb-2">Create Satisfying Montages</h2>
          <p className="text-gray-600 mb-6">
            Transform your videos into engaging, satisfying content with visual effects
          </p>

          <div className="flex space-x-4 justify-center">
            <button className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center">
              <Upload size={18} className="mr-2" />
              Upload Media
            </button>
            <button className="py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
              <Play size={18} className="mr-2" />
              View Templates
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Satisfy
