// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
export const REQUEST_TIMEOUT = 30000 // 30 seconds

// App Configuration
export const APP_NAME = "Content Obsessed"
export const APP_VERSION = "1.0.0"

// Feature Flags
export const FEATURES = {
  KANBAN_BOARD: true,
  WORK_TIMER: true,
  FILE_MANAGEMENT: true,
  NOTIFICATIONS: true,
  SHOW_WATERMARK: import.meta.env.SHOW_WATERMARK === "true",
}

// Theme Configuration
export const THEME = {
  PRIMARY_COLOR: "#000000", // Black
  SECONDARY_COLOR: "#6B7280", // Gray-500
  SUCCESS_COLOR: "#10B981", // Emerald-500
  WARNING_COLOR: "#F59E0B", // Amber-500
  ERROR_COLOR: "#EF4444", // Red-500
  INFO_COLOR: "#3B82F6", // Blue-500
}

// Dashboard Configuration
export const DASHBOARD = {
  DEFAULT_DATE_RANGE: 30, // days
  REFRESH_INTERVAL: 60000, // 1 minute
}

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
  ALLOWED_AUDIO_TYPES: ["audio/mpeg", "audio/wav", "audio/ogg"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "text/plain", "application/json"],
}

// Video Processing Configuration
export const VIDEO_PROCESSING = {
  DEFAULT_SILENCE_THRESHOLD: -40,
  DEFAULT_MIN_SILENCE_DURATION: 0.5,
  DEFAULT_CROSSFADE_DURATION: 0.5,
}
