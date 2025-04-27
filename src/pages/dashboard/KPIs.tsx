"use client"

import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const KPIs = () => {
  // Mock data
  const viewsData = [
    { name: "Jan", views: 4000, engagement: 2400 },
    { name: "Feb", views: 3000, engagement: 1398 },
    { name: "Mar", views: 2000, engagement: 9800 },
    { name: "Apr", views: 2780, engagement: 3908 },
    { name: "May", views: 1890, engagement: 4800 },
    { name: "Jun", views: 2390, engagement: 3800 },
    { name: "Jul", views: 3490, engagement: 4300 },
  ]

  const revenueData = [
    { name: "Jan", adsense: 1400, sponsors: 2400, merch: 1240 },
    { name: "Feb", adsense: 1300, sponsors: 4398, merch: 2210 },
    { name: "Mar", adsense: 1200, sponsors: 3000, merch: 5290 },
    { name: "Apr", adsense: 1780, sponsors: 4908, merch: 2300 },
    { name: "May", adsense: 890, sponsors: 3800, merch: 2500 },
    { name: "Jun", adsense: 1390, sponsors: 3300, merch: 3200 },
    { name: "Jul", adsense: 1490, sponsors: 4300, merch: 3400 },
  ]

  const audienceData = [
    { name: "18-24", value: 35 },
    { name: "25-34", value: 45 },
    { name: "35-44", value: 15 },
    { name: "45+", value: 5 },
  ]

  const COLORS = ["#000000", "#333333", "#666666", "#999999"]

  const trafficSourceData = [
    { name: "Search", value: 40 },
    { name: "Direct", value: 30 },
    { name: "Social", value: 20 },
    { name: "Referral", value: 10 },
  ]

  const videoPerformanceData = [
    { name: "Video 1", views: 4500, likes: 350, comments: 120 },
    { name: "Video 2", views: 3800, likes: 280, comments: 95 },
    { name: "Video 3", views: 6200, likes: 540, comments: 185 },
    { name: "Video 4", views: 2900, likes: 210, comments: 65 },
    { name: "Video 5", views: 5100, likes: 420, comments: 140 },
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
        <h1 className="text-3xl font-bold font-mono mb-1">KPI Metrics</h1>
        <p className="text-gray-600 mb-6">Track your key performance indicators and growth metrics.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Growth */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4">Channel Growth</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#000" fill="#000" fillOpacity={0.1} />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#777"
                  fill="#777"
                  fillOpacity={0.1}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Streams */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4">Revenue Streams</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Bar dataKey="adsense" fill="#000" />
                <Bar dataKey="sponsors" fill="#555" />
                <Bar dataKey="merch" fill="#999" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Audience Demographics */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4">Audience Demographics</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audienceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {audienceData.map((entry, index) => (
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

        {/* Traffic Sources */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4">Traffic Sources</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trafficSourceData} cx="50%" cy="50%" innerRadius={0} outerRadius={90} dataKey="value">
                  {trafficSourceData.map((entry, index) => (
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

        {/* Video Performance */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden lg:col-span-2"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4">Video Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={videoPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Bar dataKey="views" fill="#000" />
                <Bar dataKey="likes" fill="#555" />
                <Bar dataKey="comments" fill="#999" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default KPIs
