"use client"

import { motion } from "framer-motion"
import { Calendar, Check, Clock, Target, Zap } from "lucide-react"

const Habits = () => {
  // Mocked habit data
  const habits = [
    { id: 1, name: "Record Videos", frequency: "Daily", streak: 12, lastCompleted: "Today" },
    { id: 2, name: "Content Research", frequency: "Weekly", streak: 8, lastCompleted: "Yesterday" },
    { id: 3, name: "Engage with Audience", frequency: "Daily", streak: 18, lastCompleted: "Today" },
    { id: 4, name: "Learn New Skills", frequency: "Weekly", streak: 4, lastCompleted: "3 days ago" },
    { id: 5, name: "SEO Optimization", frequency: "Weekly", streak: 6, lastCompleted: "Last week" },
  ]

  const stats = [
    { name: "Current Streak", value: "18 days", icon: <Zap size={20} /> },
    { name: "Completion Rate", value: "87%", icon: <Target size={20} /> },
    { name: "Tracked Since", value: "May 15", icon: <Calendar size={20} /> },
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
        <h1 className="text-3xl font-bold font-mono mb-1">Habit Tracker</h1>
        <p className="text-gray-600 mb-6">Build consistency with your content creation habits.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
            <div className="mr-4 p-3 bg-gray-50 rounded-lg">{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Habits List */}
      <motion.div variants={item}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-mono">Tracked Habits</h2>
          <button className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            New Habit
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {habits.map((habit) => (
              <div key={habit.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mr-3">
                      <Check size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium">{habit.name}</h3>
                      <p className="text-sm text-gray-500">{habit.frequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Zap size={16} className="mr-1 text-yellow-500" />
                      <span className="font-medium">{habit.streak} streak</span>
                    </div>
                    <p className="text-xs text-gray-500">Last: {habit.lastCompleted}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Weekly Calendar */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold font-mono mb-4">Weekly Progress</h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={i} className="text-center">
                <p className="text-sm text-gray-500 mb-2">{day}</p>
                <div
                  className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${i < 4 ? "bg-black text-white" : i === 4 ? "border-2 border-black" : "bg-gray-100"}`}
                >
                  {i < 5 ? <Check size={18} /> : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Upcoming */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold font-mono mb-4">Today's Habits</h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3">
                  <Clock size={16} />
                </div>
                <span className="font-medium">Record Videos</span>
              </div>
              <button className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors">
                <Check size={18} />
              </button>
            </div>

            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3">
                  <Clock size={16} />
                </div>
                <span className="font-medium">Engage with Audience</span>
              </div>
              <button className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors">
                <Check size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Habits
