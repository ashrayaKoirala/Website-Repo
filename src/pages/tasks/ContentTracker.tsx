"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChartIcon as ChartBar, Film, Plus, Search, Tag, Trash, Edit, Calendar, ArrowRight, GripVertical, Info, X } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { TasksApi } from "../../lib/api-client"
import { useToast } from "../../components/Toast"
import ErrorModal from "../../components/ErrorModal"
import LoadingSpinner from "../../components/LoadingSpinner"

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

const ContentTracker: React.FC = () => {
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
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorDetails, setErrorDetails] = useState({ title: "", message: "", details: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [newItemTitle, setNewItemTitle] = useState("") // State for the new item input in Idea column
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<ContentItem | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [isAddingCardToColumn, setIsAddingCardToColumn] = useState<string | null>(null) // Track which column is adding card
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)

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
        setErrorDetails({
          title: "Failed to Load Content",
          message: "Could not fetch content items from the server.",
          details: err.message || JSON.stringify(err),
        })
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
    // Ensure style is reset even if drop fails
    if (dragNode.current) {
      dragNode.current.style.opacity = "1"
    }
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
      // Ensure state is reset after drop attempt
      setDraggedItem(null)
      setDragOverColumn(null)
      // Note: Do NOT reset columns here, keep the optimistic update unless API fails explicitly
      // If API call fails, we might need to revert the state, which adds complexity.
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
        // Add other default fields if required by backend/UI
        status: "in-progress",
        progress: 0,
        tags: [],
        description: "",
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
        setIsAddingCardToColumn(null) // Close input form
        showToast("New content item created", "success")
      }
    } catch (err: any) {
      console.error("Error creating content item:", err)
      showToast("Failed to create content item", "error")
      setErrorDetails({
        title: "Creation Failed",
        message: "Could not create the new content item.",
        details: err.message || JSON.stringify(err),
      })
      setShowErrorModal(true)
    }
  }

  // Handle editing a content item
  const handleUpdateItem = async () => {
    if (!editingItem) return

    // Ensure editingItem has the necessary fields for the API call
    const updateData = {
      title: editingItem.title,
      description: editingItem.description || "",
      stage: editingItem.stage,
      platform: editingItem.tags.join(", "), // Assuming tags map to platform for now
      target_release_date: editingItem.dueDate || null,
      // Add other fields as needed by the API
    }

    try {
      // Optimistic UI update (optional but improves UX)
      const updatedColumns = columns.map((col) => ({
        ...col,
        items: col.items.map((item) => (item.id === editingItem.id ? editingItem : item)),
      }))
      setColumns(updatedColumns)

      // Actual API call
      await TasksApi.updateTask(editingItem.id, updateData)

      showToast("Content item updated", "success")
      setIsEditingModalOpen(false) // Close modal on success
      setEditingItem(null) // Clear editing state
    } catch (err: any) {
      console.error("Error updating item:", err)
      showToast("Failed to update item", "error")
      setErrorDetails({
        title: "Update Failed",
        message: "Could not save changes to the content item.",
        details: err.message || JSON.stringify(err),
      })
      setShowErrorModal(true)
      // Optionally revert optimistic update here if needed
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
      setErrorDetails({
        title: "Deletion Failed",
        message: "Could not delete the content item.",
        details: err.message || JSON.stringify(err),
      })
      setShowErrorModal(true)
    }
  }

  // Open Edit Modal
  const openEditModal = (item: ContentItem) => {
    setEditingItem({ ...item }) // Clone item to avoid modifying state directly before save
    setIsEditingModalOpen(true)
  }

  // Handle changes in Edit Modal form
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingItem) return
    const { name, value } = e.target
    setEditingItem((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  // Filter items based on search term
  const filteredColumns = columns.map((col) => ({
    ...col,
    items: col.items.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase())),
  }))

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariant = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner text="Loading Content Tracker..." />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={itemVariant} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold font-mono mb-1">Content Tracker</h1>
            <p className="text-gray-600">Manage your content workflow visually.</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog.Root open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
              <Dialog.Trigger asChild>
                <button className="py-2 px-3 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm">
                  <Info size={16} className="mr-2" />
                  How It Works
                </button>
              </Dialog.Trigger>
              {/* How It Works Dialog Portal */}
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30 data-[state=open]:animate-overlayShow z-40" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white p-6 rounded-lg shadow-lg data-[state=open]:animate-contentShow focus:outline-none z-50">
                  <Dialog.Title className="text-lg font-medium mb-2">How Content Tracker Works</Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-600 mb-4">
                    This board helps visualize your content production pipeline.
                    Drag and drop cards between columns (Idea, Script, Record, Edit, Upload, Analyze)
                    to update their status. Add new content ideas in the 'Idea' column.
                    Click on a card to edit its details or delete it.
                  </Dialog.Description>
                  <div className="flex justify-end">
                    <Dialog.Close asChild>
                      <button className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">Close</button>
                    </Dialog.Close>
                  </div>
                  <Dialog.Close asChild>
                    <button className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100" aria-label="Close">
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </motion.div>

        {/* Kanban Board Columns */}
        <motion.div
          variants={itemVariant}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 overflow-x-auto pb-4"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(280px, 1fr))` }} // Ensure columns don't shrink too much
        >
          {filteredColumns.map((column) => (
            <div
              key={column.id}
              className={`bg-gray-50 rounded-xl p-4 h-full flex flex-col ${dragOverColumn === column.id ? "outline outline-2 outline-black outline-dashed" : ""}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragLeave={() => setDragOverColumn(null)} // Reset when leaving column area
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="font-semibold font-mono text-lg flex items-center">
                  {column.title}
                  <span className="ml-2 text-sm font-normal bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                    {column.items.length}
                  </span>
                </h2>
                {/* Add button only for Idea column */}
                {column.id === "idea" && (
                  <button
                    onClick={() => setIsAddingCardToColumn("idea")}
                    className="p-1 text-gray-500 hover:text-black hover:bg-gray-200 rounded-full"
                    aria-label="Add new idea"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>

              {/* Column Body - Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1 -mr-1" style={{ maxHeight: "calc(100vh - 250px)" }}>
                {column.items.map((card) => (
                  <motion.div
                    key={card.id}
                    layout // Animate layout changes
                    variants={itemVariant}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, column.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing ${draggedItem?.id === card.id ? "opacity-40 border-black" : "hover:shadow-md"}`}
                    title="Drag to move to another stage"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium flex-1 mr-2 break-words">{card.title}</h3>
                      {/* Basic Edit/Delete - consider dropdown later */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => openEditModal(card)}
                          className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded"
                          aria-label="Edit item"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(card.id, column.id)} // Consider adding confirmation
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          aria-label="Delete item"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    {card.description && <p className="text-sm text-gray-600 mb-2 break-words">{card.description}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {card.dueDate && (
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {new Date(card.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {card.tags && card.tags.length > 0 && (
                        <span className="flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                          <Tag size={12} className="mr-1" />
                          {card.tags.join(", ")}
                        </span>
                      )}
                    </div>
                    {/* Progress Bar - can be customized */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-black h-1 rounded-full"
                          style={{ width: `${card.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add New Card Form */}
                {column.id === "idea" && isAddingCardToColumn === "idea" && (
                  <motion.div layout variants={itemVariant} className="bg-white p-3 rounded-lg border border-gray-300 mt-3">
                    <textarea
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      placeholder="Enter new idea title..."
                      rows={2}
                      className="w-full text-sm p-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-black mb-2"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsAddingCardToColumn(null)}
                        className="py-1 px-3 text-xs border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddItem}
                        className="py-1 px-3 text-xs bg-black text-white rounded-md hover:bg-gray-800"
                      >
                        Add Idea
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Empty column placeholder */}
                {column.items.length === 0 && isAddingCardToColumn !== column.id && (
                  <div className="text-center text-sm text-gray-400 py-4">
                    Drag cards here or add new ideas.
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Editing Modal */}
        <AnimatePresence>
          {isEditingModalOpen && editingItem && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/30 data-[state=open]:animate-overlayShow z-40" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-white p-6 rounded-lg shadow-lg data-[state=open]:animate-contentShow focus:outline-none z-50">
                <Dialog.Title className="text-lg font-medium mb-4">Edit Content Item</Dialog.Title>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium mb-1">Title</label>
                    <input
                      id="edit-title"
                      name="title" // Important for handleEditFormChange
                      value={editingItem.title}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      id="edit-description"
                      name="description" // Important for handleEditFormChange
                      value={editingItem.description || ""}
                      onChange={handleEditFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-dueDate" className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      id="edit-dueDate"
                      name="dueDate" // Important for handleEditFormChange
                      type="date"
                      value={editingItem.dueDate ? editingItem.dueDate.split('T')[0] : ''} // Format for date input
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  {/* Add inputs for tags, etc. if needed */}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <Dialog.Close asChild>
                    <button
                      onClick={() => { setEditingItem(null); setIsEditingModalOpen(false); }}
                      className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={handleUpdateItem}
                    className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    Save Changes
                  </button>
                </div>
                <Dialog.Close asChild>
                  <button
                    onClick={() => { setEditingItem(null); setIsEditingModalOpen(false); }}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100" aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>

        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => { setShowErrorModal(false); setErrorDetails({ title: "", message: "", details: "" }); }}
          title={errorDetails.title || "Error"}
          message={errorDetails.message}
          details={errorDetails.details}
        />
      </motion.div>
    </div>
  )
}

export default ContentTracker
