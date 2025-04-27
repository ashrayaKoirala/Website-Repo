"use client"

import { motion } from "framer-motion"
import { ChartBar as BarChartIcon, ChartPie as PieChartIcon, Calendar, Clock } from "lucide-react"
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const Sessions = () => {
  // Mock data
  const weeklyData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3.2 },
    { day: "Wed", hours: 1.8 },
    { day: "Thu", hours: 4.0 },
    { day: "Fri", hours: 3.5 },
    { day: "Sat", hours: 1.2 },
    { day: "Sun", hours: 0.5 },
  ]

  const activityData = [
    { name: "Editing", value: 45 },
    { name: "Recording", value: 25 },
    { name: "Research", value: 20 },
    { name: "Planning", value: 10 },
  ]

  const COLORS = ["#000000", "#333333", "#666666", "#999999"]

  const sessionHistory = [
    { id: 1, date: "Today", time: "09:30 - 11:45", duration: "2h 15m", activity: "Video Editing" },
    { id: 2, date: "Today", time: "14:00 - 15:30", duration: "1h 30m", activity: "Script Writing" },
    { id: 3, date: "Yesterday", time: "10:15 - 12:45", duration: "2h 30m", activity: "Recording" },
    { id: 4, date: "Yesterday", time: "15:30 - 17:00", duration: "1h 30m", activity: "Thumbnail Design" },
    { id: 5, date: "2 days ago", time: "09:00 - 13:00", duration: "4h 00m", activity: "Batch Recording" },
  ]

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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold font-mono mb-1">Work Sessions</h1>
        <p className="text-gray-600 mb-6">Track your productivity and work patterns.</p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold mt-1">3h 45m</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold mt-1">16h 30m</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Avg. Session</p>
              <p className="text-2xl font-bold mt-1">2h 12m</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Streak</p>
              <p className="text-2xl font-bold mt-1">5 days</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Calendar size={20} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Hours */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4 flex items-center">
            <BarChartIcon size={20} className="mr-2" />
            Weekly Hours
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                  }}
                />
                <Bar dataKey="hours" fill="#000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Breakdown */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4 flex items-center">
            <PieChartIcon size={20} className="mr-2" />
            Activity Breakdown
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <motion.div variants={item}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-mono">Recent Sessions</h2>
          <button className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Start Session
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessionHistory.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{session.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{session.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{session.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{session.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Sessions
