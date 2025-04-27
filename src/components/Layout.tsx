"use client"

import { useState, useEffect } from "react"
import { Outlet, NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChartIcon as ChartBar,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderOpen,
  HomeIcon as House,
  Menu,
  Settings,
  SquareCheck,
  Users,
  Video,
  X,
  Calendar,
  FileText,
} from "lucide-react"

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768)
  const [dotGridPattern, setDotGridPattern] = useState<JSX.Element[]>([])
  const [contentCreationOpen, setContentCreationOpen] = useState(false)
  const [tasksOpen, setTasksOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Generate dot grid pattern
    const generateDots = () => {
      const dots = []
      const gridSize = 20
      const rows = Math.ceil(window.innerHeight / gridSize)
      const cols = Math.ceil(window.innerWidth / gridSize)

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const opacity = Math.random() * 0.5 + 0.1
          const size = Math.random() * 1.2 + 0.8

          dots.push(
            <div
              key={`${i}-${j}`}
              className="absolute rounded-full bg-black dark:bg-white transition-all duration-300"
              style={{
                top: `${i * gridSize}px`,
                left: `${j * gridSize}px`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: opacity,
              }}
            />,
          )
        }
      }
      return dots
    }

    setDotGridPattern(generateDots())

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
      setDotGridPattern(generateDots())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Toggle content creation submenu
  const toggleContentCreation = () => {
    setContentCreationOpen(!contentCreationOpen)
  }

  // Toggle tasks submenu
  const toggleTasks = () => {
    setTasksOpen(!tasksOpen)
  }

  // Check if current location is in content creation or tasks section
  useEffect(() => {
    if (location.pathname.includes("content-creation")) {
      setContentCreationOpen(true)
    }
    if (location.pathname.includes("tasks")) {
      setTasksOpen(true)
    }
  }, [location])

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black">
      {/* Dot Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">{dotGridPattern}</div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-full p-2 shadow-lg"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed md:relative z-40 h-full w-64 bg-black border-r border-gray-800 shadow-lg md:shadow-none flex flex-col"
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h1 className="text-2xl font-bold tracking-tight font-mono text-white">
                <span>Content</span>
                <span>Obsessed</span>
              </h1>
              <button onClick={toggleSidebar} className="md:hidden p-1 rounded-full hover:bg-gray-800 text-white">
                <X size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive ? "text-gray-400" : "text-white hover:bg-gray-800"
                  }`
                }
              >
                <House size={18} className="mr-3" />
                <span className="font-medium">Dashboard</span>
              </NavLink>

              {/* Content Creation Section with Dropdown */}
              <div className="space-y-1">
                <button
                  onClick={toggleContentCreation}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    location.pathname.includes("content-creation") ? "text-gray-400" : "text-white hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center">
                    <Folder size={18} className="mr-3" />
                    <span className="font-medium">Content Creation</span>
                  </div>
                  {contentCreationOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {contentCreationOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-6"
                    >
                      <NavLink
                        to="/content-creation/workers"
                        className={({ isActive }) =>
                          `flex items-center p-3 rounded-lg transition-all ${
                            isActive ? "text-gray-400" : "text-white hover:bg-gray-800"
                          }`
                        }
                      >
                        <Video size={18} className="mr-3" />
                        <span className="font-medium">Workers</span>
                      </NavLink>

                      <NavLink
                        to="/content-creation/personas"
                        className={({ isActive }) =>
                          `flex items-center p-3 rounded-lg transition-all ${
                            isActive ? "text-gray-400" : "text-white hover:bg-gray-800"
                          }`
                        }
                      >
                        <Users size={18} className="mr-3" />
                        <span className="font-medium">Personas</span>
                      </NavLink>

                      <NavLink
                        to="/content-creation/video-editor"
                        className={({ isActive }) =>
                          `flex items-center p-3 rounded-lg transition-all ${
                            isActive ? "text-gray-400" : "text-white hover:bg-gray-800"
                          }`
                        }
                      >
                        <Video size={18} className="mr-3" />
                        <span className="font-medium">Video Editor</span>
                      </NavLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink
                to="/dashboard/kpis"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive ? "text-gray-400" : "text-white hover:bg-gray-800"
                  }`
                }
              >
                <ChartBar size={18} className="mr-3" />
                <span className="font-medium">Analytics</span>
              </NavLink>

              {/* Tasks Section with Dropdown */}
              <div className="space-y-1">
                <button
                  onClick={toggleTasks}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    location.pathname.includes("tasks") ? "text-gray-400" : "text-white hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center">
                    <SquareCheck size={18} className="mr-3" />
                    <span className="font-medium">Tasks</span>
                  </div>
                  {tasksOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {tasksOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-6"
                    >
                      <NavLink
                        to="/tasks"
                        end
                        className={({ isActive }) =>
                          `flex items-center p-3 rounded-lg transition-all ${
                            isActive ? "text-gray-400" : "text-white hover:bg-gray-800"
                          }`
                        }
                      >
                        <FileText size={18} className="mr-3" />
                        <span className="font-medium">Task List</span>
                      </NavLink>

                      <NavLink
                        to="/tasks/work-timer"
                        className={({ isActive }) =>
                          `flex items-center p-3 rounded-lg transition-all ${
                            isActive ? "text-gray-400" : "text-white hover:bg-gray-800"
                          }`
                        }
                      >
                        <Calendar size={18} className="mr-3" />
                        <span className="font-medium">Work Timer</span>
                      </NavLink>

                      <NavLink
                        to="/tasks/content-tracker"
                        className={({ isActive }) =>
                          `flex items-center p-3 rounded-lg transition-all ${
                            isActive ? "text-gray-400" : "text-white hover:bg-gray-800"
                          }`
                        }
                      >
                        <Video size={18} className="mr-3" />
                        <span className="font-medium">Content Tracker</span>
                      </NavLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink
                to="/files"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-all ${
                    isActive ? "text-gray-400" : "text-white hover:bg-gray-800"
                  }`
                }
              >
                <FolderOpen size={18} className="mr-3" />
                <span className="font-medium">Files</span>
              </NavLink>
            </nav>

            {/* Settings & Profile */}
            <div className="p-4 border-t border-gray-800">
              <button className="flex items-center w-full p-3 rounded-lg text-white hover:bg-gray-800 transition-all">
                <Settings size={18} className="mr-3" />
                <span className="font-medium">Settings</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        <motion.div
          className="min-h-screen p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}

export default Layout
