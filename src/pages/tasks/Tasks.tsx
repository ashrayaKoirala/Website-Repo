"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, SquareCheck, Clock, Filter, Plus, Star, Tag, X, Trash, Edit } from "lucide-react"

type Priority = "low" | "medium" | "high"

type Task = {
  id: number
  title: string
  completed: boolean
  priority: Priority
  dueDate: string | null
  tags: string[]
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [filter, setFilter] = useState<"all" | "today" | "week" | "completed">("all")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTag, setNewTag] = useState("")

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("contentObsessed_tasks")
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (err) {
        console.error("Error loading saved tasks:", err)
      }
    } else {
      // Set default tasks if none exist
      const defaultTasks: Task[] = [
        {
          id: 1,
          title: "Edit Q3 Vlog footage",
          completed: false,
          priority: "high",
          dueDate: new Date().toISOString().split("T")[0],
          tags: ["video", "editing"],
        },
        {
          id: 2,
          title: "Record podcast intro",
          completed: false,
          priority: "medium",
          dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
          tags: ["audio", "podcast"],
        },
        {
          id: 3,
          title: "Review channel analytics",
          completed: true,
          priority: "low",
          dueDate: null,
          tags: ["admin"],
        },
      ]
      setTasks(defaultTasks)
      localStorage.setItem("contentObsessed_tasks", JSON.stringify(defaultTasks))
    }
  }, [])

  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem("contentObsessed_tasks", JSON.stringify(tasks))
  }, [tasks])

  const handleToggleComplete = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim() === "") return

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      completed: false,
      priority: "medium",
      dueDate: null,
      tags: [],
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle("")
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    setTasks(tasks.map((task) => (task.id === editingTask.id ? editingTask : task)))

    setEditingTask(null)
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim() !== "" && editingTask) {
      if (!editingTask.tags.includes(newTag.trim())) {
        setEditingTask({
          ...editingTask,
          tags: [...editingTask.tags, newTag.trim()],
        })
      }
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    if (editingTask) {
      setEditingTask({
        ...editingTask,
        tags: editingTask.tags.filter((t) => t !== tag),
      })
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "bg-black"
      case "medium":
        return "bg-gray-500"
      case "low":
        return "bg-gray-300"
    }
  }

  const isToday = (dateString: string | null) => {
    if (!dateString) return false
    const today = new Date().toISOString().split("T")[0]
    return dateString === today
  }

  const isThisWeek = (dateString: string | null) => {
    if (!dateString) return false

    const taskDate = new Date(dateString)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust for Sunday

    const startOfWeek = new Date(today.setDate(diff))
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return taskDate >= startOfWeek && taskDate <= endOfWeek
  }

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case "today":
        return isToday(task.dueDate) && !task.completed
      case "week":
        return isThisWeek(task.dueDate) && !task.completed
      case "completed":
        return task.completed
      default:
        return true
    }
  })

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
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-mono mb-1">Tasks</h1>
          <p className="text-gray-600">Manage your tasks and projects efficiently.</p>
        </div>

        <button
          className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
          onClick={() =>
            setEditingTask({ id: Date.now(), title: "", completed: false, priority: "medium", dueDate: null, tags: [] })
          }
        >
          <Plus size={18} className="mr-2" />
          New Task
        </button>
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <button
          className={`py-1.5 px-3 rounded-lg flex items-center ${filter === "today" ? "bg-black text-white" : "border border-gray-200 hover:bg-gray-50 transition-colors"}`}
          onClick={() => setFilter("today")}
        >
          <Clock size={16} className="mr-2" />
          Today
        </button>
        <button
          className={`py-1.5 px-3 rounded-lg flex items-center ${filter === "week" ? "bg-black text-white" : "border border-gray-200 hover:bg-gray-50 transition-colors"}`}
          onClick={() => setFilter("week")}
        >
          <Calendar size={16} className="mr-2" />
          This Week
        </button>
        <button
          className={`py-1.5 px-3 rounded-lg flex items-center ${filter === "all" ? "bg-black text-white" : "border border-gray-200 hover:bg-gray-50 transition-colors"}`}
          onClick={() => setFilter("all")}
        >
          <SquareCheck size={16} className="mr-2" />
          All Tasks
        </button>
        <button
          className={`py-1.5 px-3 rounded-lg flex items-center ${filter === "completed" ? "bg-black text-white" : "border border-gray-200 hover:bg-gray-50 transition-colors"}`}
          onClick={() => setFilter("completed")}
        >
          <Check size={16} className="mr-2" />
          Completed
        </button>
        <button className="py-1.5 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center ml-auto">
          <Filter size={16} className="mr-2" />
          Filter
        </button>
      </motion.div>

      {/* Add Task Form */}
      <motion.form
        variants={item}
        onSubmit={handleAddTask}
        className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl p-3"
      >
        <button type="submit" className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          <Plus size={18} />
        </button>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-transparent border-none outline-none text-base"
        />
      </motion.form>

      {/* Task List */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                variants={item}
                className="flex items-start p-4 hover:bg-gray-50 transition-colors group"
              >
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border ${task.completed ? "bg-black border-black" : "border-gray-300"} hover:border-black transition-colors mt-1`}
                >
                  {task.completed && <Check size={16} className="text-white" />}
                </button>
                <div className="ml-3 flex-1">
                  <div className="flex items-center mb-1">
                    <span className={`text-base ${task.completed ? "line-through text-gray-400" : ""}`}>
                      {task.title}
                    </span>
                    {task.priority === "high" && <Star size={16} className="ml-2 text-black" fill="black" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {task.dueDate && (
                      <div className="flex items-center text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        {task.dueDate}
                      </div>
                    )}

                    {task.tags.map((tag, idx) => (
                      <div key={idx} className="flex items-center bg-gray-100 px-2 py-0.5 rounded">
                        <Tag size={12} className="mr-1 text-gray-500" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => handleEditTask(task)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              {filter === "all"
                ? "No tasks found. Add a new task to get started!"
                : "No tasks match the current filter."}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              {editingTask.id === Date.now() ? "Add New Task" : "Edit Task"}
            </h2>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <div className="flex space-x-2">
                  {(["low", "medium", "high"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`px-3 py-1 rounded-lg ${editingTask.priority === p ? "bg-black text-white" : "border border-gray-200"}`}
                      onClick={() => setEditingTask({ ...editingTask, priority: p })}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={editingTask.dueDate || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingTask.tags.map((tag, idx) => (
                    <div key={idx} className="flex items-center bg-gray-100 px-2 py-1 rounded">
                      <span className="text-sm">{tag}</span>
                      <button
                        type="button"
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Add tag and press Enter"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                  {editingTask.id === Date.now() ? "Add Task" : "Update Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Helper Check component for completed tasks
const Check = ({ size, className }: { size: number; className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default Tasks
