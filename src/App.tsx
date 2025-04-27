"use client"

import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/Layout"
import { ToastProvider } from "./components/Toast"

// Pages
import Dashboard from "./Dashboard"
import Workers from "./pages/content-creation/Workers"
import CutProfile from "./pages/workers/CutProfile"
import VideoCutter from "./pages/workers/VideoCutter"
import SilenceRemover from "./pages/workers/SilenceRemover"
import Satisfy from "./pages/workers/Satisfy"
import Renderer from "./pages/workers/Renderer"
import Subtitles from "./pages/workers/Subtitles"
import Overlay from "./pages/workers/Overlay"
import Personas from "./pages/content-creation/Personas"
import VideoEditor from "./pages/content-creation/VideoEditor"
import DashboardKPIs from "./pages/dashboard/KPIs"
import DashboardFinances from "./pages/dashboard/Finances"
import DashboardHabits from "./pages/dashboard/Habits"
import DashboardSessions from "./pages/dashboard/Sessions"
import Tasks from "./pages/tasks/Tasks"
import WorkTimer from "./pages/tasks/WorkTimer"
import ContentTracker from "./pages/tasks/ContentTracker"
import Files from "./pages/files/Files"
import "./index.css"

function App() {
  useEffect(() => {
    const link = document.createElement("link")
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)

    document.title = "Content Obsessed"

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />

            {/* Content Creation Routes */}
            <Route path="content-creation">
              <Route index element={<Navigate to="/content-creation/workers" replace />} />
              <Route path="workers" element={<Workers />} />
              <Route path="personas" element={<Personas />} />
              <Route path="video-editor" element={<VideoEditor />} />
            </Route>

            {/* Worker Routes */}
            <Route path="workers">
              <Route path="cut-profile" element={<CutProfile />} />
              <Route path="video-cutter" element={<VideoCutter />} />
              <Route path="silence-remover" element={<SilenceRemover />} />
              <Route path="satisfy" element={<Satisfy />} />
              <Route path="renderer" element={<Renderer />} />
              <Route path="subtitles" element={<Subtitles />} />
              <Route path="overlay" element={<Overlay />} />
            </Route>

            {/* Dashboard Routes */}
            <Route path="dashboard">
              <Route index element={<Dashboard />} />
              <Route path="kpis" element={<DashboardKPIs />} />
              <Route path="finances" element={<DashboardFinances />} />
              <Route path="habits" element={<DashboardHabits />} />
              <Route path="sessions" element={<DashboardSessions />} />
            </Route>

            {/* Task Routes */}
            <Route path="tasks">
              <Route index element={<Tasks />} />
              <Route path="work-timer" element={<WorkTimer />} />
              <Route path="content-tracker" element={<ContentTracker />} />
            </Route>

            {/* Files Route */}
            <Route path="files" element={<Files />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
