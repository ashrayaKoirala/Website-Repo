"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowUpRight, Film, Mic, Play, Scissors, SmilePlus, Sparkles, Captions } from "lucide-react"

const Workers = () => {
  const tools = [
    {
      id: "cut-profile",
      name: "Cut Profile Generator",
      icon: <Scissors size={24} />,
      description: "Generate smart cut profiles from video and transcript",
      path: "/workers/cut-profile",
    },
    {
      id: "silence-remover",
      name: "Silence Remover",
      icon: <Mic size={24} />,
      description: "Automatically trim silent parts without damaging pacing",
      path: "/workers/silence-remover",
    },
    {
      id: "video-cutter",
      name: "Video Cutter",
      icon: <Play size={24} />,
      description: "Cut videos automatically based on cut profiles",
      path: "/workers/video-cutter",
    },
    {
      id: "satisfy",
      name: "Satisfy Creator",
      icon: <Sparkles size={24} />,
      description: "Create satisfying video montages with effects",
      path: "/workers/satisfy",
    },
    {
      id: "subtitles",
      name: "Subtitle Generator",
      icon: <Captions size={24} />,
      description: "Auto-generate and style video subtitles",
      path: "/workers/subtitles",
    },
    {
      id: "overlay",
      name: "Emoji Overlay",
      icon: <SmilePlus size={24} />,
      description: "Add popping emoji overlays based on transcript",
      path: "/workers/overlay",
    },
    {
      id: "renderer",
      name: "Final Renderer",
      icon: <Film size={24} />,
      description: "Arrange clips and create final video exports",
      path: "/workers/renderer",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
        <h1 className="text-3xl font-bold font-mono mb-1">Video Workers</h1>
        <p className="text-gray-600 mb-6">Powerful tools to streamline your video production.</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <motion.div key={tool.id} variants={item} whileHover={{ y: -4 }} className="relative group">
            <Link
              to={tool.path}
              className="block h-full p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-black opacity-[0.02] group-hover:opacity-[0.03] transition-opacity" />

              {/* Dot Pattern Overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="absolute">
                    {[...Array(10)].map((_, j) => (
                      <div
                        key={`${i}-${j}`}
                        className="absolute rounded-full bg-black"
                        style={{
                          width: "2px",
                          height: "2px",
                          top: i * 10,
                          left: j * 10,
                          opacity: Math.random() * 0.7 + 0.3,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-black bg-opacity-5 flex items-center justify-center">
                  {tool.icon}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              <h3 className="text-lg font-semibold font-mono mb-2">{tool.name}</h3>
              <p className="text-gray-600 text-sm">{tool.description}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default Workers
