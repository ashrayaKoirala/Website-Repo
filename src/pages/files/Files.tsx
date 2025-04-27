"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FilePlus,
  FileText,
  FolderOpen,
  Grid2x2,
  ImageIcon,
  List,
  Search,
  Video,
  Download,
  Eye,
  Trash,
  Music,
  File,
  X,
} from "lucide-react"
import { FilesApi } from "../../lib/api-client"
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import LoadingSpinner from "../../components/LoadingSpinner"

// Define file type
interface FileItem {
  name: string
  path: string
  size: number
  modified: number
  directory: string
}

const Files: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [fileTypeFilter, setFileTypeFilter] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { showToast } = useToast()

  // Fetch files from API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true)
        const response = await FilesApi.getFiles(fileTypeFilter || undefined)
        setFiles(response.files)
      } catch (err: any) {
        console.error("Error fetching files:", err)
        setError("Failed to load files")
        setShowErrorModal(true)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [fileTypeFilter])

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    try {
      setUploading(true)

      // In a real implementation, you would call an API to upload the file
      // For now, we'll simulate it
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Add the uploaded file to the list
      const newFile = {
        name: e.target.files[0].name,
        path: `/uploads/${e.target.files[0].name}`,
        size: e.target.files[0].size,
        modified: Date.now(),
        directory: "uploads",
      }

      setFiles([newFile, ...files])
      showToast(`File "${e.target.files[0].name}" uploaded successfully`, "success")
    } catch (err: any) {
      console.error("Error uploading file:", err)
      showToast("Failed to upload file", "error")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  // Handle file deletion
  const handleDeleteFile = async (file: FileItem) => {
    try {
      // In a real implementation, you would call an API to delete the file
      // For now, we'll just update the UI
      setFiles(files.filter((f) => f.name !== file.name))
      showToast(`File "${file.name}" deleted successfully`, "success")
    } catch (err: any) {
      console.error("Error deleting file:", err)
      showToast("Failed to delete file", "error")
    }
  }

  // Get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (["mp4", "mov", "avi", "webm"].includes(extension || "")) {
      return <Video size={viewMode === "grid" ? 24 : 20} />
    } else if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension || "")) {
      return <ImageIcon size={viewMode === "grid" ? 24 : 20} />
    } else if (["mp3", "wav", "ogg"].includes(extension || "")) {
      return <Music size={viewMode === "grid" ? 24 : 20} />
    } else if (["txt", "srt", "vtt", "json"].includes(extension || "")) {
      return <FileText size={viewMode === "grid" ? 24 : 20} />
    } else {
      return <File size={viewMode === "grid" ? 24 : 20} />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  // Filter files based on search term
  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Check if file is previewable
  const isPreviewable = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "mp4", "webm", "mp3", "wav", "txt", "json"].includes(extension || "")
  }

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
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-mono mb-1">File Vault</h1>
          <p className="text-gray-600">Access and manage all your files and assets.</p>
        </div>

        <label className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center cursor-pointer">
          <FilePlus size={18} className="mr-2" />
          Upload Files
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
      </motion.div>

      {/* Search and View Toggle */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex-1 py-2 px-4 ${
              viewMode === "grid" ? "bg-black text-white" : "hover:bg-gray-50"
            } transition-colors flex items-center justify-center`}
          >
            <Grid2x2 size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 py-2 px-4 ${
              viewMode === "list" ? "bg-black text-white" : "hover:bg-gray-50"
            } transition-colors flex items-center justify-center`}
          >
            <List size={18} />
          </button>
        </div>
      </motion.div>

      {/* File Type Filters */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        <button
          onClick={() => setFileTypeFilter(null)}
          className={`py-1.5 px-3 rounded-lg flex items-center ${
            fileTypeFilter === null ? "bg-black text-white" : "border border-gray-200 hover:bg-gray-50"
          } transition-colors`}
        >
          All Files
        </button>
        <button
          onClick={() => setFileTypeFilter("video")}
          className={`py-1.5 px-3 rounded-lg flex items-center ${
            fileTypeFilter === "video" ? "bg-black text-white" : "border border-gray-200 hover:bg-gray-50"
          } transition-colors`}
        >
          <Video size={16} className="mr-2" />
          Videos
        </button>
        <button
          onClick={() => setFileTypeFilter("image")}
          className={`py-1.5 px-3 rounded-lg flex items-center ${
            fileTypeFilter === "image" ? "bg-black text-white" : "border border-gray-200 hover:bg-gray-50"
          } transition-colors`}
        >
          <ImageIcon size={16} className="mr-2" />
          Images
        </button>
        <button
          onClick={() => setFileTypeFilter("audio")}
          className={`py-1.5 px-3 rounded-lg flex items-center ${
            fileTypeFilter === "audio" ? "bg-black text-white" : "border border-gray-200 hover:bg-gray-50"
          } transition-colors`}
        >
          <Music size={16} className="mr-2" />
          Audio
        </button>
        <button
          onClick={() => setFileTypeFilter("document")}
          className={`py-1.5 px-3 rounded-lg flex items-center ${
            fileTypeFilter === "document" ? "bg-black text-white" : "border border-gray-200 hover:bg-gray-50"
          } transition-colors`}
        >
          <FileText size={16} className="mr-2" />
          Documents
        </button>
      </motion.div>

      {/* Folders */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <FolderOpen size={20} />
          </div>
          <h3 className="font-medium">Videos</h3>
          <p className="text-sm text-gray-500">12 files</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <FolderOpen size={20} />
          </div>
          <h3 className="font-medium">Cut Profiles</h3>
          <p className="text-sm text-gray-500">8 files</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <FolderOpen size={20} />
          </div>
          <h3 className="font-medium">Transcripts</h3>
          <p className="text-sm text-gray-500">15 files</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <FolderOpen size={20} />
          </div>
          <h3 className="font-medium">Graphics</h3>
          <p className="text-sm text-gray-500">9 files</p>
        </div>
      </motion.div>

      {/* Files */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold font-mono mb-4">Files</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner text="Loading files..." />
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.name}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="flex space-x-1">
                    {isPreviewable(file.name) && (
                      <button
                        onClick={() => {
                          setSelectedFile(file)
                          setShowPreview(true)
                        }}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <a
                      href={FilesApi.getFile(file.name)}
                      download
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Download"
                    >
                      <Download size={14} />
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-sm truncate" title={file.name}>
                  {file.name}
                </h3>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                <p className="text-xs text-gray-500">{formatDate(file.modified)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFiles.map((file) => (
                    <tr key={file.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 flex items-center">
                        <div className="mr-3 text-gray-500">{getFileIcon(file.name)}</div>
                        <span className="truncate max-w-xs">{file.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatFileSize(file.size)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(file.modified)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-1">
                          {isPreviewable(file.name) && (
                            <button
                              onClick={() => {
                                setSelectedFile(file)
                                setShowPreview(true)
                              }}
                              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Preview"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <a
                            href={FilesApi.getFile(file.name)}
                            download
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Delete"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* File Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] shadow-xl flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedFile.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {selectedFile.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={FilesApi.getFile(selectedFile.name) || "/placeholder.svg"}
                  alt={selectedFile.name}
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              ) : selectedFile.name.match(/\.(mp4|webm)$/i) ? (
                <video src={FilesApi.getFile(selectedFile.name)} controls className="max-w-full max-h-[70vh] mx-auto" />
              ) : selectedFile.name.match(/\.(mp3|wav)$/i) ? (
                <audio src={FilesApi.getFile(selectedFile.name)} controls className="w-full mt-8" />
              ) : selectedFile.name.match(/\.(txt|json|srt|vtt)$/i) ? (
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[70vh]">
                  {/* In a real implementation, you would fetch and display the file content */}
                  {`This is a preview of ${selectedFile.name}.
In a real implementation, the actual content would be displayed here.`}
                </pre>
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                  <p>Preview not available for this file type.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <a
                href={FilesApi.getFile(selectedFile.name)}
                download
                className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              >
                <Download size={18} className="mr-2" />
                Download
              </a>
            </div>
          </motion.div>
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error Loading Files"
        message={error || "An error occurred while loading files."}
      />
    </motion.div>
  )
}

export default Files
