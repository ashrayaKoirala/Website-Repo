"use client"

import React from "react"
import { Link, useLocation } from "react-router-dom"

interface SidebarItem {
  name: string
  path: string
  icon: string
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/",
    icon: "dashboard",
    children: [
      { name: "KPIs", path: "/dashboard/kpis", icon: "analytics" },
      { name: "Finances", path: "/dashboard/finances", icon: "attach_money" },
      { name: "Habits", path: "/dashboard/habits", icon: "repeat" },
      { name: "Sessions", path: "/dashboard/sessions", icon: "timer" },
    ],
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: "task",
    children: [
      { name: "Task List", path: "/tasks", icon: "list" },
      { name: "Content Tracker", path: "/tasks/content-tracker", icon: "view_kanban" },
      { name: "Work Timer", path: "/tasks/work-timer", icon: "hourglass_top" },
    ],
  },
  {
    name: "Content Creation",
    path: "/content-creation",
    icon: "movie",
    children: [
      { name: "Video Editor", path: "/content-creation/video-editor", icon: "edit" },
      { name: "Personas", path: "/content-creation/personas", icon: "person" },
      { name: "Workers", path: "/content-creation/workers", icon: "engineering" },
    ],
  },
  {
    name: "Workers",
    path: "/workers",
    icon: "build",
    children: [
      { name: "Cut Profile", path: "/workers/cut-profile", icon: "content_cut" },
      { name: "Video Cutter", path: "/workers/video-cutter", icon: "cut" },
      { name: "Silence Remover", path: "/workers/silence-remover", icon: "volume_off" },
      { name: "Satisfy", path: "/workers/satisfy", icon: "thumb_up" },
      { name: "Renderer", path: "/workers/renderer", icon: "movie_filter" },
      { name: "Subtitles", path: "/workers/subtitles", icon: "closed_caption" },
      { name: "Overlay", path: "/workers/overlay", icon: "layers" },
    ],
  },
  {
    name: "Files",
    path: "/files",
    icon: "folder",
    children: [],
  },
]

const Sidebar: React.FC = () => {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  // Initialize expanded items based on current path
  React.useEffect(() => {
    const currentPath = location.pathname
    const expandedPaths = sidebarItems
      .filter(
        (item) =>
          item.children &&
          item.children.some((child) => currentPath === child.path || currentPath.startsWith(child.path)),
      )
      .map((item) => item.name)

    setExpandedItems(expandedPaths)
  }, [location.pathname])

  const toggleExpand = (itemName: string) => {
    if (expandedItems.includes(itemName)) {
      setExpandedItems(expandedItems.filter((name) => name !== itemName))
    } else {
      setExpandedItems([...expandedItems, itemName])
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  return (
    <div className="bg-gray-800 text-white w-64 flex-shrink-0 h-screen overflow-y-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Content Obsessed</h1>
      </div>
      <nav>
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              {item.children && item.children.length > 0 ? (
                <div>
                  <button
                    className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 ${
                      isActive(item.path) ? "bg-gray-700 text-gray-300" : "text-white"
                    }`}
                    onClick={() => toggleExpand(item.name)}
                  >
                    <span className="material-icons mr-2">{item.icon}</span>
                    <span>{item.name}</span>
                    <span className="material-icons ml-auto">
                      {expandedItems.includes(item.name) ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {expandedItems.includes(item.name) && (
                    <ul className="pl-8 space-y-1 mt-1">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <Link
                            to={child.path}
                            className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-700 ${
                              isActive(child.path) ? "bg-gray-700 text-gray-300" : "text-white"
                            }`}
                          >
                            <span className="material-icons mr-2">{child.icon}</span>
                            <span>{child.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 hover:bg-gray-700 ${
                    isActive(item.path) ? "bg-gray-700 text-gray-300" : "text-white"
                  }`}
                >
                  <span className="material-icons mr-2">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
