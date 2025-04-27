import axios, { type AxiosError } from "axios"
import { API_BASE_URL, REQUEST_TIMEOUT } from "./config"
import { ApiError, logError } from "./error-utils"

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    logError("API Request Interceptor", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
    return response
  },
  (error) => {
    logError("API Response Interceptor", error)
    return Promise.reject(error)
  },
)

/**
 * Generic API request function with improved error handling
 */ \
export const apiRequest = async <T>(config: AxiosRequestConfig)
: Promise<T> =>
{
  try {
    const response = await apiClient(config)
    return response.data
  } catch (error) {
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      const status = axiosError.response?.status || 500
      const message = axiosError.response?.data?.message || axiosError.message || "API request failed"
      const detail = axiosError.response?.data || {}

      logError(`API Request to ${config.url}`, {
        status,
        message,
        detail,
        config: axiosError.config,
      })

      throw new ApiError(message, status, detail)
    }

    // Handle other errors
    logError(`API Request to ${config.url}`, error)
    throw error instanceof Error ? error : new Error(`Unknown error occurred: ${String(error)}`)
  }
}

/**
 * API function to upload files with FormData
 */
export const uploadFiles = async <T>(
  url: string,
  files: Record<string, File | Blob>,
  additionalData?: Record<string, any>
)
: Promise<T> =>
{
  try {
    const formData = new FormData()

    // Append files to FormData
    Object.entries(files).forEach(([key, file]) => {
      if (file instanceof File) {
        formData.append(key, file, file.name)
      } else {
        formData.append(key, file)
      }
    })

    // Append additional data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null && !(value instanceof Blob) && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value))
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })
    }

    console.log(`[File Upload] Uploading to ${url} with ${Object.keys(files).length} files`)

    // Let axios set the Content-Type header automatically for FormData
    return apiRequest<T>({
      url,
      method: "POST",
      data: formData,
    })
  } catch (error) {
    logError(`File Upload to ${url}`, error)
    throw error instanceof Error ? error : new Error(`File upload failed: ${String(error)}`)
  }
}

/**
 * API functions for video processing workers
 */
export const WorkersApi = {
  generateCutProfile: (video: File, transcript: File) => {
    console.log(`[Worker API] Generating cut profile with video: ${video.name}, transcript: ${transcript.name}`)
    return uploadFiles("/workers/cut-profile", { video, transcript })
  },

  cutVideo: (video: File, cutProfile: File) => {
    console.log(`[Worker API] Cutting video: ${video.name} with profile: ${cutProfile.name}`)
    return uploadFiles("/workers/video-cutter", { video, cut_profile: cutProfile })
  },

  removeSilence: (media: File, minSilenceDuration = 0.5, silenceThreshold = -40) => {
    console.log(`[Worker API] Removing silence from: ${media.name}`)
    return uploadFiles(
      "/workers/silence-remover",
      { media },
      { min_silence_duration: minSilenceDuration, silence_threshold: silenceThreshold },
    )
  },

  createSatisfyVideo: (introClip: File, clips: File[], duration = 60, crossfadeDuration = 0.5) => {
    console.log(`[Worker API] Creating satisfy video with ${clips.length} clips`)
    const files: Record<string, File> = { intro_clip: introClip }
    clips.forEach((clip, index) => {
      files[`clips[${index}]`] = clip
    })
    return uploadFiles("/workers/satisfy", files, { duration, crossfade_duration: crossfadeDuration })
  },

  renderVideo: (clips: File[], arrangement?: any, introClip?: File, outroClip?: File) => {
    console.log(`[Worker API] Rendering video with ${clips.length} clips`)
    const files: Record<string, File> = {}
    clips.forEach((clip, index) => {
      files[`clips[${index}]`] = clip
    })
    if (introClip) files.intro_clip = introClip
    if (outroClip) files.outro_clip = outroClip

    return uploadFiles("/workers/renderer", files, { arrangement })
  },

  generateSubtitles: (transcript: File, fontStyle = "default", format = "srt") => {
    console.log(`[Worker API] Generating subtitles from: ${transcript.name}`)
    return uploadFiles("/workers/subtitles", { transcript }, { font_style: fontStyle, format })
  },

  createEmojiOverlay: (transcript: File, video: File) => {
    console.log(`[Worker API] Creating emoji overlay for: ${video.name}`)
    return uploadFiles("/workers/overlay", { transcript, video })
  },
}

/**
 * API functions for dashboard data
 */
export const DashboardApi = {
  getKPIs: () => {
    console.log("[Dashboard API] Getting KPIs")
    return apiRequest<any[]>({ url: "/dashboard/kpis", method: "GET" })
  },

  createKPI: (data: any) => {
    console.log("[Dashboard API] Creating KPI")
    return apiRequest<any>({ url: "/dashboard/kpis", method: "POST", data })
  },

  getFinances: () => {
    console.log("[Dashboard API] Getting finances")
    return apiRequest<any[]>({ url: "/dashboard/finances", method: "GET" })
  },

  createFinance: (data: any) => {
    console.log("[Dashboard API] Creating finance record")
    return apiRequest<any>({ url: "/dashboard/finances", method: "POST", data })
  },

  getHabits: () => {
    console.log("[Dashboard API] Getting habits")
    return apiRequest<any[]>({ url: "/dashboard/habits", method: "GET" })
  },

  createHabit: (data: any) => {
    console.log("[Dashboard API] Creating habit")
    return apiRequest<any>({ url: "/dashboard/habits", method: "POST", data })
  },

  updateHabit: (id: number | string, data: any) => {
    console.log(`[Dashboard API] Updating habit: ${id}`)
    return apiRequest<any>({
      url: `/dashboard/habits/${id}`,
      method: "PUT",
      data,
    })
  },

  getSessions: () => {
    console.log("[Dashboard API] Getting sessions")
    return apiRequest<any[]>({ url: "/dashboard/sessions", method: "GET" })
  },

  createSession: (data: any) => {
    console.log("[Dashboard API] Creating session")
    return apiRequest<any>({ url: "/dashboard/sessions", method: "POST", data })
  },
}

/**
 * API functions for task management
 */
export const TasksApi = {
  getTasks: (filters?: { dueFilter?: string }) => {
    console.log(`[Tasks API] Getting tasks with filters: ${JSON.stringify(filters || {})}`)
    return apiRequest<any[]>({
      url: "/tasks",
      method: "GET",
      params: filters,
    })
  },

  createTask: (data: any) => {
    console.log("[Tasks API] Creating task")
    return apiRequest<any>({
      url: "/tasks",
      method: "POST",
      data,
    })
  },

  updateTask: (id: number | string, data: any) => {
    console.log(`[Tasks API] Updating task: ${id}`)
    return apiRequest<any>({
      url: `/tasks/${id}`,
      method: "PUT",
      data,
    })
  },

  deleteTask: (id: number | string) => {
    console.log(`[Tasks API] Deleting task: ${id}`)
    return apiRequest<any>({
      url: `/tasks/${id}`,
      method: "DELETE",
    })
  },

  getWorkSessions: () => {
    console.log("[Tasks API] Getting work sessions")
    return apiRequest<any[]>({ url: "/tasks/work-session", method: "GET" })
  },

  createWorkSession: (data: any) => {
    console.log("[Tasks API] Creating work session")
    return apiRequest<any>({ url: "/tasks/work-session", method: "POST", data })
  },

  getContentItems: () => {
    console.log("[Tasks API] Getting content items")
    return apiRequest<any[]>({ url: "/tasks/content", method: "GET" })
  },

  createContentItem: (data: any) => {
    console.log("[Tasks API] Creating content item")
    return apiRequest<any>({ url: "/tasks/content", method: "POST", data })
  },

  updateContentStage: (contentId: number | string, stage: string) => {
    console.log(`[Tasks API] Updating content stage: ${contentId} to ${stage}`)
    return apiRequest<any>({
      url: `/tasks/content/${contentId}`,
      method: "PUT",
      data: { stage },
    })
  },
}

/**
 * API functions for Kanban board
 */
export const KanbanApi = {
  getBoards: () => {
    console.log("[Kanban API] Getting boards")
    return apiRequest<any[]>({ url: "/kanban/boards", method: "GET" })
  },

  createBoard: (data: any) => {
    console.log("[Kanban API] Creating board")
    return apiRequest<any>({ url: "/kanban/boards", method: "POST", data })
  },

  getColumns: (boardId: number | string) => {
    console.log(`[Kanban API] Getting columns for board: ${boardId}`)
    return apiRequest<any[]>({
      url: "/kanban/columns",
      method: "GET",
      params: { board_id: boardId },
    })
  },

  createColumn: (data: any) => {
    console.log("[Kanban API] Creating column")
    return apiRequest<any>({ url: "/kanban/columns", method: "POST", data })
  },

  getCards: (columnId: number | string) => {
    console.log(`[Kanban API] Getting cards for column: ${columnId}`)
    return apiRequest<any[]>({
      url: "/kanban/cards",
      method: "GET",
      params: { column_id: columnId },
    })
  },

  createCard: (data: any) => {
    console.log("[Kanban API] Creating card")
    return apiRequest<any>({ url: "/kanban/cards", method: "POST", data })
  },

  updateCard: (cardId: number | string, data: any) => {
    console.log(`[Kanban API] Updating card: ${cardId}`)
    return apiRequest<any>({
      url: `/kanban/cards/${cardId}`,
      method: "PUT",
      data,
    })
  },

  moveCard: (data: any) => {
    console.log(`[Kanban API] Moving card: ${data.card_id}`)
    return apiRequest<any>({ url: "/kanban/cards/move", method: "POST", data })
  },
}

/**
 * API functions for file management
 */
export const FilesApi = {
  getFiles: (fileType?: string) => {
    console.log(`[Files API] Getting files with type: ${fileType || "all"}`)
    return apiRequest<any>({
      url: "/files",
      method: "GET",
      params: { file_type: fileType },
    })
  },

  getFile: (filename: string): string => {
    console.log(`[Files API] Getting file URL: ${filename}`)
    return `${API_BASE_URL}/files/${filename}`
  },

  deleteFile: (filename: string) => {
    console.log(`[Files API] Deleting file: ${filename}`)
    return apiRequest<any>({
      url: `/files/${filename}`,
      method: "DELETE",
    })
  },
}

// Export all API services
export default {
  WorkersApi,
  DashboardApi,
  TasksApi,
  KanbanApi,
  FilesApi,
}
