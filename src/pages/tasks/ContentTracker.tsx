"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { BarChartIcon as ChartBar, Film, Plus, Search, Tag, Trash, Edit, Calendar, ArrowRight } from "lucide-react"
import { TasksApi } from "../../lib/api-client"
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import LoadingSpinner from "../../components/LoadingSpinner"
import type { FC } from "react"
import Layout from "../../components/Layout"

// Define content item type
interface ContentItem {
  id: number
  title: string
  description?: string
  status: string
  stage: string
  progress: number
  dueDate?: string
  tags: string[]
}

// Define column type
interface Column {
  id: string
  title: string
  items: ContentItem[]
}

// Define types for our Kanban board
interface KanbanCard {
  id: number
  title: string
  description: string
  due_date?: string
  priority: "low" | "medium" | "high"
  assignee?: string
  tags: string[]
}

interface KanbanColumn {
  id: number
  title: string
  cards: KanbanCard[]
}

interface KanbanBoard {
  id: number
  title: string
  columns: KanbanColumn[]
}

const ContentTracker: FC = () => {
  const [columns, setColumns] = useState<Column[]>([
    { id: "idea", title: "Idea", items: [] },
    { id: "script", title: "Script", items: [] },
    { id: "record", title: "Record", items: [] },
    { id: "edit", title: "Edit", items: [] },
    { id: "upload", title: "Upload", items: [] },
    { id: "analyze", title: "Analyze", items: [] },
  ])

  const [board, setBoard] = useState<KanbanBoard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorDetails, setErrorDetails] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [newItemTitle, setNewItemTitle] = useState("")
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [draggedItem, setDraggedItem] = useState<ContentItem | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [newCardTitle, setNewCardTitle] = useState<string>("")
  const [newCardColumn, setNewCardColumn] = useState<number | null>(null)
  const [showNewCardForm, setShowNewCardForm] = useState<boolean>(false)

  const { showToast } = useToast()
  const dragNode = useRef<HTMLDivElement | null>(null)

  // Fetch content items from API
  useEffect(() => {
    const fetchContentItems = async () => {
      try {
        setLoading(true)
        const data = await TasksApi.getContentItems()

        // Distribute items to columns based on their stage
        const newColumns = [...columns]

        data.forEach((item) => {
          const stage = item.stage.toLowerCase()
          const columnIndex = newColumns.findIndex((col) => col.id === stage)

          if (columnIndex !== -1) {
            newColumns[columnIndex].items.push({
              id: item.id,
              title: item.title,
              description: item.description,
              status: item.stage === "Analyze" ? "completed" : "in-progress",
              stage: item.stage,
              progress: getProgressForStage(item.stage),
              dueDate: item.target_release_date,
              tags: item.platform ? [item.platform] : [],
            })
          }
        })

        setColumns(newColumns)
      } catch (err: any) {
        console.error("Error fetching content items:", err)
        setError("Failed to load content items")
        setErrorDetails(err.message || JSON.stringify(err))
        setShowErrorModal(true)
      } finally {
        setLoading(false)
      }
    }

    fetchContentItems()
  }, [])

  // Helper function to get progress percentage based on stage
  const getProgressForStage = (stage: string): number => {
    const stages = ["Idea", "Script", "Record", "Edit", "Upload", "Analyze"]
    const index = stages.indexOf(stage)
    return Math.round(((index + 1) / stages.length) * 100)
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: ContentItem, columnId: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ item, columnId }))
    setDraggedItem(item)

    // Add styling to the dragged element
    if (e.currentTarget) {
      setTimeout(() => {
        if (e.currentTarget) {
          e.currentTarget.style.opacity = "0.4"
          dragNode.current = e.currentTarget as HTMLDivElement
        }
      }, 0)
    }
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (dragNode.current) {
      dragNode.current.style.opacity = "1"
      dragNode.current = null
    }

    setDraggedItem(null)
    setDragOverColumn(null)
  }

  // Handle drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault()

    try {
      const data = e.dataTransfer.getData("text/plain")
      const { item, columnId } = JSON.parse(data)

      if (columnId === targetColumnId) return

      // Update columns state
      const newColumns = [...columns]
      const sourceColumnIndex = newColumns.findIndex((col) => col.id === columnId)
      const targetColumnIndex = newColumns.findIndex((col) => col.id === targetColumnId)

      if (sourceColumnIndex !== -1 && targetColumnIndex !== -1) {
        // Remove item from source column
        const itemIndex = newColumns[sourceColumnIndex].items.findIndex((i) => i.id === item.id)
        if (itemIndex !== -1) {
          const [movedItem] = newColumns[sourceColumnIndex].items.splice(itemIndex, 1)

          // Update item stage and progress
          movedItem.stage = newColumns[targetColumnIndex].title
          movedItem.progress = getProgressForStage(movedItem.stage)
          movedItem.status = movedItem.stage === "Analyze" ? "completed" : "in-progress"

          // Add item to target column
          newColumns[targetColumnIndex].items.push(movedItem)

          setColumns(newColumns)

          // Update item in the backend
          await TasksApi.updateContentStage(item.id, newColumns[targetColumnIndex].title)
          showToast(`Moved "${item.title}" to ${newColumns[targetColumnIndex].title} stage`, "success")
        }
      }
    } catch (err: any) {
      console.error("Error moving item:", err)
      showToast("Failed to move item", "error")
    } finally {
      if (dragNode.current) {
        dragNode.current.style.opacity = "1"
        dragNode.current = null
      }
      setDraggedItem(null)
      setDragOverColumn(null)
    }
  }

  // Handle adding a new content item
  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return

    try {
      const newItem = {
        title: newItemTitle,
        description: "",
        stage: "Idea",
        platform: "",
        target_release_date: new Date().toISOString().split("T")[0],
      }

      const response = await TasksApi.createContentItem(newItem)

      // Add new item to the Idea column
      const newColumns = [...columns]
      const ideaColumnIndex = newColumns.findIndex((col) => col.id === "idea")

      if (ideaColumnIndex !== -1) {
        newColumns[ideaColumnIndex].items.push({
          id: response.id,
          title: response.title,
          description: response.description,
          status: "in-progress",
          stage: response.stage,
          progress: getProgressForStage(response.stage),
          dueDate: response.target_release_date,
          tags: response.platform ? [response.platform] : [],
        })

        setColumns(newColumns)
        setNewItemTitle("")
        showToast("New content item created", "success")
      }
    } catch (err: any) {
      console.error("Error creating content item:", err)
      showToast("Failed to create content item", "error")
      setErrorDetails(err.message || JSON.stringify(err))
      setShowErrorModal(true)
    }
  }

  // Handle editing a content item
  const handleUpdateItem = async () => {
    if (!editingItem) return

    try {
      await TasksApi.updateContentStage(editingItem.id, editingItem.stage)

      // Update item in columns
      const newColumns = [...columns]
      const columnIndex = newColumns.findIndex((col) => col.id === editingItem.stage.toLowerCase())

      if (columnIndex !== -1) {
        // Remove item from all columns first
        newColumns.forEach((col) => {
          col.items = col.items.filter((item) => item.id !== editingItem.id)
        })

        // Add updated item to the correct column
        newColumns[columnIndex].items.push({
          ...editingItem,
          progress: getProgressForStage(editingItem.stage),
          status: editingItem.stage === "Analyze" ? "completed" : "in-progress",
        })

        setColumns(newColumns)
        setEditingItem(null)
        showToast("Content item updated", "success")
      }
    } catch (err: any) {
      console.error("Error updating content item:", err)
      showToast("Failed to update content item", "error")
      setErrorDetails(err.message || JSON.stringify(err))
      setShowErrorModal(true)
    }
  }

  // Handle deleting a content item
  const handleDeleteItem = async (itemId: number, columnId: string) => {
    try {
      // In a real implementation, you would call an API to delete the item
      // For now, we'll just update the UI
      const newColumns = [...columns]
      const columnIndex = newColumns.findIndex((col) => col.id === columnId)

      if (columnIndex !== -1) {
        newColumns[columnIndex].items = newColumns[columnIndex].items.filter((item) => item.id !== itemId)
        setColumns(newColumns)
        showToast("Content item deleted", "success")
      }
    } catch (err: any) {
      console.error("Error deleting content item:", err)
      showToast("Failed to delete content item", "error")
    }
  }

  // Filter items based on search term
  const filteredColumns = columns.map((column) => ({
    ...column,
    items: column.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
    ),
  }))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-1 bg-black text-white text-xs rounded-full">Completed</span>
      case "in-progress":
        return <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded-full">In Progress</span>
      case "planning":
        return <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">Planning</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
    }
  }

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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-mono mb-1">Content Tracker</h1>
            <p className="text-gray-600">Track your content production workflow with this Kanban board.</p>
          </div>

          <button
            onClick={() =>
              setEditingItem({
                id: 0,
                title: "",
                description: "",
                status: "in-progress",
                stage: "Idea",
                progress: 0,
                tags: [],
              })
            }
            className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
          >
            <Plus size={18} className="mr-2" />
            New Content
          </button>
        </motion.div>

        {/* Search */}
        <motion.div variants={item} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
        </motion.div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner text="Loading content items..." />
          </div>
        ) : (
          <motion.div
            variants={item}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto"
          >
            {filteredColumns.map((column) => (
              <div
                key={column.id}
                className={`bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-300px)] min-w-[280px] ${
                  dragOverColumn === column.id ? "border-black" : "border-gray-200"
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold">{column.title}</h3>
                  <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">{column.items.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {column.items.map((contentItem) => (
                    <div
                      key={contentItem.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab"
                      draggable
                      onDragStart={(e) => handleDragStart(e, contentItem, column.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{contentItem.title}</h4>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingItem(contentItem)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(contentItem.id, column.id)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>

                      {contentItem.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{contentItem.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-2">
                        {contentItem.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded flex items-center">
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        {contentItem.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {contentItem.dueDate}
                          </span>
                        )}
                        {getStatusBadge(contentItem.status)}
                      </div>

                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
                        <div className="bg-black h-1 rounded-full" style={{ width: `${contentItem.progress}%` }} />
                      </div>
                    </div>
                  ))}

                  {column.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                      <Film size={24} className="mb-2" />
                      <p>No items</p>
                      <p>Drop content here</p>
                    </div>
                  )}
                </div>

                {column.id === "idea" && (
                  <div className="p-2 border-t border-gray-200">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Add new content..."
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddItem()
                        }}
                      />
                      <button
                        onClick={handleAddItem}
                        className="bg-black text-white px-3 py-2 rounded-r-lg hover:bg-gray-800 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Content Insights */}
        <motion.div variants={item}>
          <div className="flex items-center mb-4">
            <ChartBar size={20} className="mr-2" />
            <h2 className="text-xl font-semibold font-mono">Content Insights</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Content Pipeline</h3>
                <p className="text-2xl font-semibold">
                  {columns.reduce((total, column) => total + column.items.length, 0)} Projects
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">
                    {columns.find((col) => col.id === "edit")?.items.length || 0} In editing
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Production Stage</h3>
                <div className="flex items-center space-x-1 mt-2">
                  {columns.map((column, index) => (
                    <div key={column.id} className="flex flex-col items-center">
                      <div
                        className={`h-16 w-4 rounded-sm ${column.items.length > 0 ? "bg-black" : "bg-gray-200"}`}
                        style={{
                          height: `${Math.min(column.items.length * 8 + 16, 64)}px`,
                        }}
                      />
                      <span className="text-xs mt-1 text-gray-500">{column.title.charAt(0)}</span>
                      {index < columns.length - 1 && <ArrowRight size={12} className="text-gray-300 mx-1" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Completed This Month</h3>
                <p className="text-2xl font-semibold">
                  {columns.find((col) => col.id === "analyze")?.items.length || 0} Projects
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">
                    {columns.find((col) => col.id === "upload")?.items.length || 0} Ready to publish
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Content Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingItem.id === 0 ? "Add New Content" : "Edit Content"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter content title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingItem.description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    value={editingItem.stage}
                    onChange={(e) => setEditingItem({ ...editingItem, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Script">Script</option>
                    <option value="Record">Record</option>
                    <option value="Edit">Edit</option>
                    <option value="Upload">Upload</option>
                    <option value="Analyze">Analyze</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editingItem.dueDate || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editingItem.tags.join(", ")}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="youtube, tutorial, review"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingItem.id === 0 ? handleAddItem : handleUpdateItem}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  {editingItem.id === 0 ? "Add Content" : "Update Content"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Error Modal */}
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error Loading Content"
          message={error || "An error occurred while loading content items."}
          details={errorDetails}
        />
      </motion.div>
    </Layout>
  )
}

export default ContentTracker
