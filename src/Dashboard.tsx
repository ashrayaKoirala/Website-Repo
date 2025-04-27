"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, BarChart3, Clock, FileText, PlusCircle } from "lucide-react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  // Sample data for dashboard
  const kpiData = {
    subscribers: "12.4K",
    views: "89.7K",
    revenue: "$1,245",
    growth: "+12%",
  }

  const tasks = [
    { id: 1, title: "Edit weekly vlog", priority: "high", due: "Today" },
    { id: 2, title: "Script podcast episode", priority: "medium", due: "Tomorrow" },
    { id: 3, title: "Record tutorial intro", priority: "low", due: "May 2" },
  ]

  const recentFiles = [
    { id: 1, name: "Podcast_Ep45_Final.mp4", type: "video", date: "Yesterday" },
    { id: 2, name: "Tutorial_Cuts.json", type: "cut-profile", date: "Apr 24" },
    { id: 3, name: "Stream_Highlights.mp4", type: "video", date: "Apr 22" },
  ]

  // Animation variants
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold font-mono mb-1">Dashboard</h1>
          <p className="text-gray-600">Welcome to your content command center.</p>
        </motion.div>
        <motion.div variants={item} className="flex gap-3">
          <Link
            to="/tasks"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <PlusCircle size={18} />
            <span>New Task</span>
          </Link>
          <Link
            to="/tasks/work-timer"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock size={18} />
            <span>Start Timer</span>
          </Link>
        </motion.div>
      </div>

      {/* KPI Section */}
      <motion.section variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -4 }} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Subscribers</h3>
          <p className="text-2xl font-bold font-mono">{kpiData.subscribers}</p>
          <span className="text-xs text-green-600 font-medium">{kpiData.growth} this month</span>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Views</h3>
          <p className="text-2xl font-bold font-mono">{kpiData.views}</p>
          <span className="text-xs text-green-600 font-medium">+8% this month</span>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Revenue</h3>
          <p className="text-2xl font-bold font-mono">{kpiData.revenue}</p>
          <span className="text-xs text-green-600 font-medium">+15% this month</span>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Watch Time</h3>
          <p className="text-2xl font-bold font-mono">4:32</p>
          <span className="text-xs text-green-600 font-medium">+2% this month</span>
        </motion.div>
      </motion.section>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-mono">Today's Tasks</h2>
            <Link to="/tasks" className="text-sm flex items-center hover:underline">
              View all <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.priority === "high"
                        ? "bg-red-500"
                        : task.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  ></div>
                  <span>{task.title}</span>
                </div>
                <span className="text-sm text-gray-500">{task.due}</span>
              </motion.div>
            ))}
            <Link
              to="/tasks"
              className="flex items-center justify-center w-full p-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <PlusCircle size={14} className="mr-2" /> Add task
            </Link>
          </div>
        </motion.section>

        {/* Recent Files */}
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-mono">Recent Files</h2>
            <Link to="/files" className="text-sm flex items-center hover:underline">
              View all <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <motion.div
                key={file.id}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      file.type === "video" ? "bg-blue-100" : "bg-green-100"
                    }`}
                  >
                    <FileText size={14} />
                  </div>
                  <span>{file.name}</span>
                </div>
                <span className="text-sm text-gray-500">{file.date}</span>
              </motion.div>
            ))}
            <Link
              to="/files"
              className="flex items-center justify-center w-full p-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <PlusCircle size={14} className="mr-2" /> Upload file
            </Link>
          </div>
        </motion.section>

        {/* Analytics Preview */}
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-mono">Analytics</h2>
            <Link to="/dashboard/kpis" className="text-sm flex items-center hover:underline">
              Full report <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg h-[150px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <BarChart3 size={32} className="mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">View detailed analytics in the KPI dashboard</p>
            </div>
          </div>
        </motion.section>

        {/* Work Sessions */}
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-mono">Recent Work Sessions</h2>
            <Link to="/dashboard/sessions" className="text-sm flex items-center hover:underline">
              View all <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Video Editing Session</p>
                  <p className="text-sm text-gray-500">2 hours 15 minutes</p>
                </div>
                <span className="text-sm text-gray-500">Today</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Script Writing</p>
                  <p className="text-sm text-gray-500">45 minutes</p>
                </div>
                <span className="text-sm text-gray-500">Yesterday</span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}

export default Dashboard
