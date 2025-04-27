/**
 * Configuration for the application
 * Contains environment-specific settings
 */

// API base URL - change this according to your environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

// API endpoints
export const API_ENDPOINTS = {
  // Video processing workers
  workers: {
    cutProfile: "/workers/cut-profile",
    videoCutter: "/workers/video-cutter",
    silenceRemover: "/workers/silence-remover",
    satisfy: "/workers/satisfy",
    renderer: "/workers/renderer",
    subtitles: "/workers/subtitles",
    overlay: "/workers/overlay",
  },

  // Dashboard endpoints
  dashboard: {
    kpis: "/dashboard/kpis",
    finances: "/dashboard/finances",
  },

  // Task management
  tasks: {
    base: "/tasks",
    workSession: "/tasks/work-session",
    content: "/tasks/content",
  },

  // File management
  files: {
    base: "/files",
  },
}

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000
